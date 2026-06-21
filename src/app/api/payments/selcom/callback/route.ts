import { NextRequest, NextResponse } from "next/server";
import { findPaymentBySelcomOrderId, verifyPayment } from "@/lib/payments";
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

  await verifyPayment(payment.reference).catch(() => null);

  return NextResponse.redirect(
    new URL(`/payment/${encodeURIComponent(payment.reference)}`, selcomConfig.appUrl)
  );
}
