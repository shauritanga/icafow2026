import { NextResponse } from "next/server";
import { reconcilePayments } from "@/lib/payments-reconcile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Scheduled payment reconciliation. Hit by the production crontab every couple
 * of minutes. Authenticated with CRON_SECRET so it can't be triggered publicly.
 */
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const stats = await reconcilePayments();
    return NextResponse.json({ success: true, ...stats });
  } catch (error) {
    console.error("[reconcile] sweep failed", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  return POST(req);
}
