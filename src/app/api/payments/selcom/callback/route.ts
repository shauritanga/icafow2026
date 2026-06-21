import { NextRequest, NextResponse } from "next/server";
import { findPaymentBySelcomOrderId, verifyPayment, applyPaymentStatus } from "@/lib/payments";
import { selcomConfig } from "@/lib/selcom/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Browser redirect target after the buyer completes (or abandons) the Selcom
 * hosted checkout. The `order` param is the per-attempt Selcom order_id. We
 * verify status server-side, then redirect to the friendly payment status page
 * keyed by the stable registration reference.
 */
export async function GET(req: NextRequest) {
  const order =
    req.nextUrl.searchParams.get("order") ||
    req.nextUrl.searchParams.get("order_id") ||
    req.nextUrl.searchParams.get("reference");

  if (!order) {
    return NextResponse.redirect(new URL("/", selcomConfig.appUrl));
  }

  const payment = await findPaymentBySelcomOrderId(order).catch(() => null);
  if (!payment) {
    return NextResponse.redirect(new URL("/", selcomConfig.appUrl));
  }

  // Authoritative re-check against Selcom (settles PAID/FAILED/CANCELLED safely).
  const result = await verifyPayment(payment.reference, "REDIRECT").catch(() => null);

  // Explicit cancel: if the gateway confirms it isn't paid, mark CANCELLED so the
  // buyer immediately sees a clear "cancelled — retry" screen instead of a
  // lingering "processing". verifyPayment already guards against touching a PAID
  // row, and PAID is never reached here since result.status wasn't PAID.
  const cancelled = req.nextUrl.searchParams.get("cancel") === "1";
  if (cancelled && result && result.status !== "PAID") {
    await applyPaymentStatus(payment.reference, "CANCELLED", {
      reason: "Cancelled by buyer on the Selcom checkout",
      source: "REDIRECT",
    }).catch(() => null);
  }

  return NextResponse.redirect(
    new URL(`/payment/${encodeURIComponent(payment.reference)}`, selcomConfig.appUrl)
  );
}
