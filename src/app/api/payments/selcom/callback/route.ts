import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/payments";
import { selcomConfig } from "@/lib/selcom/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Browser redirect target after the buyer completes (or abandons) the Selcom
 * hosted checkout. We verify the order status server-side, then redirect the
 * buyer to the friendly payment status page.
 */
export async function GET(req: NextRequest) {
  const order =
    req.nextUrl.searchParams.get("order") ||
    req.nextUrl.searchParams.get("order_id") ||
    req.nextUrl.searchParams.get("reference");

  if (!order) {
    return NextResponse.redirect(new URL("/", selcomConfig.appUrl));
  }

  await verifyPayment(order).catch(() => null);

  return NextResponse.redirect(
    new URL(`/payment/${encodeURIComponent(order)}`, selcomConfig.appUrl)
  );
}
