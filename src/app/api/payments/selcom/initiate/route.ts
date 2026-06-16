import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { initiatePayment } from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  reference: z.string().min(3),
  method: z.enum(["card", "tigopesa", "mpesa", "airtelmoney"]).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 422 });
  }

  const result = await initiatePayment(parsed.data.reference, parsed.data.method);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({
    checkoutUrl: result.checkoutUrl,
    reference: result.reference,
  });
}
