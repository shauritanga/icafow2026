import { NextRequest, NextResponse } from "next/server";
import { createRegistration } from "@/lib/register";
import type { RegistrationTypeKey } from "@/lib/validations/registration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID = ["attendee", "sponsor", "exhibitor", "partner", "speaker", "pitch"];

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ type: string }> }
) {
  const { type } = await ctx.params;
  if (!VALID.includes(type)) {
    return NextResponse.json({ error: "Unknown registration type" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const result = await createRegistration(type as RegistrationTypeKey, body);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, issues: result.issues },
        { status: 422 }
      );
    }

    return NextResponse.json({
      reference: result.reference,
      requiresPayment: result.requiresPayment,
      amount: result.amount,
    });
  } catch (err) {
    // Never let an unhandled error return an HTML page — the client can only
    // parse JSON, so it would otherwise surface as a generic failure with no
    // way to diagnose. Log the real cause and return structured JSON.
    console.error(`[register/${type}] registration failed:`, err);
    return NextResponse.json(
      { error: "We couldn't complete your registration. Please try again." },
      { status: 500 }
    );
  }
}
