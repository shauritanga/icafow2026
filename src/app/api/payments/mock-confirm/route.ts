import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { applyPaymentStatus } from "@/lib/payments";
import { isSelcomMock } from "@/lib/selcom/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  reference: z.string().min(3),
  outcome: z.enum(["success", "fail"]).default("success"),
});

/**
 * Mock-only endpoint: simulates the Selcom result for a payment so the full
 * flow (initiate → settle → receipt) can be exercised without real credentials.
 * Disabled automatically when real Selcom keys are configured.
 */
export async function POST(req: NextRequest) {
  if (!isSelcomMock) {
    return NextResponse.json({ error: "Mock disabled" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 422 });
  }
  const { reference, outcome } = parsed.data;
  const result = await applyPaymentStatus(
    reference,
    outcome === "success" ? "PAID" : "FAILED",
    {
      transId: `MOCK-TX-${Date.now()}`,
      reason: outcome === "fail" ? "Simulated failure (mock mode)" : undefined,
      payload: { mock: true, outcome },
    }
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }
  return NextResponse.json({ status: outcome === "success" ? "PAID" : "FAILED" });
}
