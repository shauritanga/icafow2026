import { prisma } from "@/lib/prisma";
import { createOrder, getOrderStatus } from "@/lib/selcom/client";
import { usdToCharge, selcomConfig } from "@/lib/selcom/config";
import type { PaymentMethod as FormPaymentMethod } from "@/lib/validations/common";
import type { PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";

const methodMap: Record<FormPaymentMethod, PaymentMethod> = {
  card: "CARD",
  tigopesa: "TIGOPESA",
  mpesa: "MPESA",
  airtelmoney: "AIRTELMONEY",
};

/**
 * Create (or reuse) a pending payment for a registration and initiate the
 * Selcom checkout. Returns the checkout URL to redirect the buyer to.
 */
export async function initiatePayment(
  registrationReference: string,
  method?: FormPaymentMethod
) {
  const registration = await prisma.registration.findUnique({
    where: { reference: registrationReference },
    include: { payments: true },
  });
  if (!registration) {
    return { ok: false as const, error: "Registration not found" };
  }
  if (registration.amount <= 0) {
    return { ok: false as const, error: "This registration has no payable amount" };
  }

  // Reuse an existing pending payment, or create a fresh one (retry).
  const existingPending = registration.payments.find(
    (p) => p.status === "PENDING" || p.status === "PROCESSING"
  );

  const payment =
    existingPending ??
    (await prisma.payment.create({
      data: {
        reference: registration.reference, // 1:1 order reference for the gateway
        registrationId: registration.id,
        amount: registration.amount,
        currency: registration.currency,
        method: method ? methodMap[method] : "UNSET",
        status: "PENDING",
      },
    }));

  const chargeTZS = usdToCharge(registration.amount);

  const order = await createOrder({
    orderId: payment.reference,
    amount: chargeTZS,
    buyerName: registration.fullName,
    buyerEmail: registration.email,
    buyerPhone: registration.phone || "",
    currency: selcomConfig.currency,
    remarks: `ICAFoW 2026 — ${registration.packageLabel ?? registration.type}`,
  });

  if (!order.success || !order.checkoutUrl) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        failureReason: order.message ?? "Failed to initiate payment",
        gatewayPayload: order.raw as Prisma.InputJsonValue,
      },
    });
    return { ok: false as const, error: order.message ?? "Payment initiation failed" };
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "PROCESSING",
      method: method ? methodMap[method] : payment.method,
      checkoutUrl: order.checkoutUrl,
      selcomOrderId: order.orderId,
      selcomPaymentToken: order.paymentToken,
      selcomReference: order.reference,
      gatewayPayload: (order.raw ?? {}) as Prisma.InputJsonValue,
    },
  });

  return {
    ok: true as const,
    checkoutUrl: order.checkoutUrl,
    reference: payment.reference,
  };
}

/** Apply a resolved gateway status to a payment + its registration. */
export async function applyPaymentStatus(
  reference: string,
  status: PaymentStatus,
  opts: { transId?: string; reason?: string; payload?: unknown } = {}
) {
  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: { registration: true },
  });
  if (!payment) return { ok: false as const, error: "Payment not found" };

  // Idempotency: never downgrade a settled payment.
  if (payment.status === "PAID" && status !== "REFUNDED") {
    return { ok: true as const, payment, alreadySettled: true };
  }

  const updated = await prisma.payment.update({
    where: { reference },
    data: {
      status,
      selcomTransId: opts.transId ?? payment.selcomTransId,
      failureReason: opts.reason ?? payment.failureReason,
      paidAt: status === "PAID" ? new Date() : payment.paidAt,
      gatewayPayload: (opts.payload ?? payment.gatewayPayload ?? {}) as Prisma.InputJsonValue,
    },
    include: { registration: true },
  });

  // Sync the registration status.
  if (status === "PAID") {
    await prisma.registration.update({
      where: { id: updated.registrationId },
      data: { status: "CONFIRMED" },
    });
  } else if (status === "FAILED" || status === "CANCELLED") {
    // keep registration PENDING so the buyer can retry
  }

  return { ok: true as const, payment: updated };
}

/** Query Selcom and reconcile the local payment record. */
export async function verifyPayment(reference: string) {
  const result = await getOrderStatus(reference);
  if (result.status === "PAID") {
    await applyPaymentStatus(reference, "PAID", {
      transId: result.transId,
      payload: result.raw,
    });
  } else if (result.status === "FAILED" || result.status === "CANCELLED") {
    await applyPaymentStatus(reference, result.status, { payload: result.raw });
  }
  return result;
}
