import { NextRequest, NextResponse } from "next/server";
import { findPaymentBySelcomOrderId, verifyPayment } from "@/lib/payments";
import { verifyWebhookSignature } from "@/lib/selcom/sign";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-to-server payment notification from Selcom.
 *
 * The webhook body is treated as an UNTRUSTED trigger only: we resolve the
 * payment from the order_id and then settle strictly from the authoritative
 * order-status endpoint (see verifyPayment). A forged POST therefore cannot
 * move money — the worst it can do is trigger an extra status query.
 */
export async function POST(req: NextRequest) {
  let payload: Record<string, string> = {};
  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else {
      const form = await req.formData();
      form.forEach((v, k) => (payload[k] = String(v)));
    }
  } catch {
    return NextResponse.json({ result: "FAIL", message: "Invalid body" }, { status: 400 });
  }

  const orderId =
    payload.order_id || payload.orderid || payload.reference || payload.order;
  if (!orderId) {
    return NextResponse.json({ result: "FAIL", message: "Missing order id" }, { status: 400 });
  }

  // Advisory signature check — logged, never used to settle.
  const digest = req.headers.get("digest") || payload.digest;
  const signedFields = (req.headers.get("signed-fields") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const sigCheck = verifyWebhookSignature(
    payload,
    digest ?? undefined,
    signedFields.length ? signedFields : undefined,
    req.headers.get("timestamp") ?? undefined
  );
  if (sigCheck === "invalid") {
    console.warn("[selcom] webhook signature invalid", { orderId });
  }

  // Resolve our payment from the per-attempt order_id.
  const payment = await findPaymentBySelcomOrderId(orderId).catch(() => null);
  if (!payment) {
    // Ack so Selcom doesn't retry forever, but record the miss.
    console.warn("[selcom] webhook for unknown order_id", { orderId });
    return NextResponse.json({ result: "SUCCESS" });
  }

  // Settle from the authoritative order-status endpoint only.
  await verifyPayment(payment.reference).catch((err) =>
    console.error("[selcom] webhook verifyPayment failed", payment.reference, err)
  );

  return NextResponse.json({ result: "SUCCESS" });
}
