import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayment } from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Poll/refresh a payment status (called by the payment status page). */
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  // Reconcile with the gateway (no-op in mock mode), then read local truth.
  await verifyPayment(reference).catch(() => null);

  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: { registration: true },
  });
  if (!payment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    reference: payment.reference,
    status: payment.status,
    amount: payment.amount,
    currency: payment.currency,
    registration: {
      reference: payment.registration.reference,
      fullName: payment.registration.fullName,
      packageLabel: payment.registration.packageLabel,
      type: payment.registration.type,
    },
  });
}
