import { NextRequest, NextResponse } from "next/server";
import { applyPaymentStatus, verifyPayment } from "@/lib/payments";
import { mapSelcomStatus } from "@/lib/selcom/types";
import { verifyWebhookSignature } from "@/lib/selcom/sign";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-to-server payment notification from Selcom.
 * Selcom POSTs the order result here (the `webhook` URL we registered at order
 * creation). We verify the signature where possible, then reconcile against the
 * authoritative order-status endpoint before settling the payment.
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

  // Best-effort signature verification (header `Digest` + Signed-Fields).
  const digest = req.headers.get("digest") || payload.digest;
  const signedFields = (req.headers.get("signed-fields") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  verifyWebhookSignature(payload, digest ?? undefined, signedFields.length ? signedFields : undefined);

  // Trust but verify: confirm with Selcom's order-status before settling.
  const verified = await verifyPayment(orderId).catch(() => null);

  // Fall back to the webhook-reported status if verification was inconclusive.
  if (!verified || verified.status === "PENDING") {
    const reported = mapSelcomStatus(payload.payment_status || payload.result);
    if (reported === "PAID") {
      await applyPaymentStatus(orderId, "PAID", { transId: payload.transid, payload });
    } else if (reported === "FAILED" || reported === "CANCELLED") {
      await applyPaymentStatus(orderId, reported, { payload });
    }
  }

  // Selcom expects an acknowledgement.
  return NextResponse.json({ result: "SUCCESS" });
}
