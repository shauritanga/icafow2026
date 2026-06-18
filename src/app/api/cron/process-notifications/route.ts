import { NextResponse } from "next/server";
import { processNotificationQueue } from "@/lib/queueProcessor";

export async function POST(req: Request) {
  // Optional Security: Verify an authorization token
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const result = await processNotificationQueue();
    return NextResponse.json({ 
      success: true, 
      processed: result.processed, 
      total: result.total 
    });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  return POST(req);
}
