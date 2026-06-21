import { prisma } from "@/lib/prisma";
import { verifyPayment, applyPaymentStatus } from "@/lib/payments";

/**
 * Background payment reconciliation — the real-money safety net.
 *
 * The browser redirect and the Selcom webhook are both best-effort. This sweep
 * makes correctness independent of them: it periodically re-asks Selcom for the
 * authoritative status of every unresolved payment and settles it (via
 * verifyPayment, which is the only path allowed to mark PAID and which verifies
 * amount + currency first). It also expires genuinely-abandoned checkouts.
 *
 * Safe by construction:
 *  - Never marks PAID without the gateway + amount check (verifyPayment).
 *  - Only expires to CANCELLED AFTER a fresh order-status shows not-paid.
 *  - CANCELLED → PAID is still allowed downstream, so a late settle is never
 *    lost; we also keep re-checking recently-cancelled rows for a grace window.
 *  - Idempotent and rate-limited per row.
 */

/** Don't re-hit Selcom for a row checked within this window (ms). */
const POLL_INTERVAL_MS = 90_000;
/** Keep re-checking cancelled rows this long, in case a late payment lands. */
const CANCELLED_GRACE_MS = 24 * 60 * 60 * 1000;
/** Mark an unpaid checkout abandoned (CANCELLED) after this many minutes. */
const ABANDON_MINUTES = Number(process.env.PAYMENT_ABANDON_MINUTES || "60");

export async function reconcilePayments() {
  const now = Date.now();
  const staleBefore = new Date(now - POLL_INTERVAL_MS);
  const cancelledSince = new Date(now - CANCELLED_GRACE_MS);

  // Non-terminal rows that haven't been checked recently, plus recently
  // cancelled rows (to catch a late payment). Bounded batch.
  const candidates = await prisma.payment.findMany({
    where: {
      selcomOrderId: { not: null },
      updatedAt: { lt: staleBefore },
      OR: [
        { status: { in: ["PENDING", "PROCESSING"] } },
        { status: "CANCELLED", updatedAt: { gt: cancelledSince } },
      ],
    },
    orderBy: { updatedAt: "asc" },
    take: 100,
    select: { reference: true, status: true, createdAt: true },
  });

  const stats = { checked: 0, paid: 0, failed: 0, cancelled: 0, mismatches: 0, expired: 0 };

  for (const c of candidates) {
    stats.checked++;
    // Authoritative re-check against Selcom (safely settles PAID/FAILED/CANCELLED).
    const res = await verifyPayment(c.reference, "RECONCILE").catch((err) => {
      console.error("[reconcile] verifyPayment failed", c.reference, err);
      return null;
    });
    if (!res) continue;

    if (res.status === "PAID") stats.paid++;
    else if (res.status === "FAILED") stats.failed++;
    else if (res.status === "CANCELLED") stats.cancelled++;

    if ("mismatch" in res && res.mismatch) {
      stats.mismatches++;
      await alertMismatch(c.reference).catch(() => {});
      continue; // leave for manual review; do not expire
    }

    // Abandon expiry: gateway just confirmed not-paid AND it's older than TTL.
    const stillOpen = res.status === "PENDING" || res.status === "PROCESSING";
    const ageMs = now - new Date(c.createdAt).getTime();
    if (stillOpen && ageMs > ABANDON_MINUTES * 60_000) {
      await applyPaymentStatus(c.reference, "CANCELLED", {
        reason: `Abandoned — gateway not paid after ${ABANDON_MINUTES}m`,
        source: "RECONCILE",
      }).catch((err) => console.error("[reconcile] expire failed", c.reference, err));
      stats.expired++;
    }
  }

  return stats;
}

/**
 * Enqueue a one-off admin alert for an amount/currency mismatch (potential
 * misconfig or fraud). Deduped: skip if we already alerted for this reference
 * in the recent past. Reuses the notification outbox.
 */
async function alertMismatch(reference: string) {
  const since = new Date(Date.now() - CANCELLED_GRACE_MS);
  const existing = await prisma.notificationJob.findFirst({
    where: {
      type: "IN_APP",
      createdAt: { gt: since },
      // payload->>'reference' match is overkill here; dedupe on a tagged title.
      payload: { path: ["reference"], equals: reference },
    },
  });
  if (existing) return;

  await prisma.notificationJob.createMany({
    data: [
      {
        type: "IN_APP",
        payload: {
          title: "Payment needs review",
          body: `Payment ${reference} reported PAID by Selcom but the amount/currency did not match. Re-verify before confirming.`,
          url: "/admin/payments",
          reference,
        },
      },
      {
        type: "PUSH",
        payload: {
          title: "Payment needs review",
          body: `Payment ${reference} has an amount/currency mismatch.`,
          url: "/admin/payments",
          reference,
        },
      },
    ],
  });
}
