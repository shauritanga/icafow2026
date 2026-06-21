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

/** Build the unique per-attempt order_id we send to Selcom. */
function buildSelcomOrderId(reference: string, attempt: number): string {
  return `${reference}-A${attempt}`;
}

/**
 * Create (or reuse) a payment for a registration and initiate the Selcom
 * checkout. Each attempt gets a fresh, unique gateway order_id so retries after
 * a failed/cancelled attempt don't collide on Selcom's side. Returns the
 * checkout URL to redirect the buyer to.
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

  // One payment row per registration: reuse any non-settled attempt (PENDING /
  // PROCESSING / FAILED / CANCELLED) instead of creating a duplicate that would
  // collide on the unique `reference`.
  const reusable = registration.payments.find((p) => p.status !== "PAID");
  if (registration.payments.some((p) => p.status === "PAID")) {
    return { ok: false as const, error: "This registration is already paid" };
  }

  const payment =
    reusable ??
    (await prisma.payment.create({
      data: {
        reference: registration.reference, // stable page/lookup key
        registrationId: registration.id,
        amount: registration.amount,
        currency: registration.currency,
        method: method ? methodMap[method] : "UNSET",
        status: "PENDING",
        attempt: 0, // bumped to 1 below on the first attempt
      },
    }));

  const attempt = payment.attempt + 1;
  const selcomOrderId = buildSelcomOrderId(registration.reference, attempt);
  const chargeTZS = usdToCharge(registration.amount);

  // Snapshot the exact charge + this attempt's order_id BEFORE calling Selcom so
  // the webhook/callback can resolve the payment and we can verify the amount.
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "PROCESSING",
      method: method ? methodMap[method] : payment.method,
      attempt,
      selcomOrderId,
      chargeAmount: chargeTZS,
      chargeCurrency: "TZS",
      failureReason: null,
    },
  });

  const order = await createOrder({
    orderId: selcomOrderId,
    pageReference: registration.reference,
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
      checkoutUrl: order.checkoutUrl,
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

/** Resolve a payment (with registration) from the per-attempt Selcom order_id. */
export async function findPaymentBySelcomOrderId(orderId: string) {
  return prisma.payment.findUnique({
    where: { selcomOrderId: orderId },
    include: { registration: true },
  });
}

/**
 * Apply a resolved gateway status to a payment + its registration.
 * The settle is atomic and guarded so a settled (PAID) payment is never
 * downgraded by a racing webhook/callback/poll.
 */
export async function applyPaymentStatus(
  reference: string,
  status: PaymentStatus,
  opts: { transId?: string; reason?: string; payload?: unknown } = {}
) {
  // Guarded conditional update: only transition rows that aren't already PAID
  // (a refund is the one allowed post-PAID transition).
  const guard: Prisma.PaymentWhereInput =
    status === "REFUNDED" ? { reference } : { reference, status: { not: "PAID" } };

  const data: Prisma.PaymentUpdateManyMutationInput = {
    status,
    ...(opts.transId ? { selcomTransId: opts.transId } : {}),
    ...(opts.reason ? { failureReason: opts.reason } : {}),
    ...(status === "PAID" ? { paidAt: new Date() } : {}),
    ...(opts.payload != null
      ? { gatewayPayload: opts.payload as Prisma.InputJsonValue }
      : {}),
  };

  const { count } = await prisma.payment.updateMany({ where: guard, data });

  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: { registration: true },
  });
  if (!payment) return { ok: false as const, error: "Payment not found" };

  // No row changed → it was already settled (idempotent no-op).
  if (count === 0) {
    return { ok: true as const, payment, alreadySettled: true };
  }

  if (status === "PAID") {
    await prisma.registration.update({
      where: { id: payment.registrationId },
      data: { status: "CONFIRMED" },
    });
  }
  // FAILED / CANCELLED: keep the registration PENDING so the buyer can retry.

  return { ok: true as const, payment };
}

/**
 * Query Selcom for the authoritative status of a payment and reconcile locally.
 * This is the ONLY path that can mark a payment PAID — webhook/callback bodies
 * are never trusted directly. Before settling PAID we verify the gateway-reported
 * amount + currency against the snapshot taken at order creation.
 */
export async function verifyPayment(reference: string) {
  const payment = await prisma.payment.findUnique({ where: { reference } });
  if (!payment || !payment.selcomOrderId) {
    return { ok: false as const, status: payment?.status ?? "PENDING" };
  }

  const result = await getOrderStatus(payment.selcomOrderId);

  if (result.status === "PAID") {
    const amountOk =
      payment.chargeAmount != null &&
      result.amount != null &&
      Math.round(result.amount) === payment.chargeAmount;
    const currencyOk =
      !result.currency ||
      !payment.chargeCurrency ||
      result.currency.toUpperCase() === payment.chargeCurrency;

    if (!amountOk || !currencyOk) {
      // Settling would over/under-charge — refuse and flag for manual review.
      console.error("[selcom] amount/currency mismatch on PAID", {
        reference,
        expected: payment.chargeAmount,
        got: result.amount,
        expectedCurrency: payment.chargeCurrency,
        gotCurrency: result.currency,
      });
      await applyPaymentStatus(reference, "PROCESSING", {
        reason: `Amount/currency mismatch: expected ${payment.chargeAmount} ${payment.chargeCurrency}, got ${result.amount} ${result.currency}`,
        payload: result.raw,
      });
      return { ok: false as const, status: "PROCESSING" as const, mismatch: true };
    }

    await applyPaymentStatus(reference, "PAID", {
      transId: result.transId,
      payload: result.raw,
    });
  } else if (result.status === "FAILED" || result.status === "CANCELLED") {
    await applyPaymentStatus(reference, result.status, { payload: result.raw });
  }

  return { ok: true as const, status: result.status };
}
