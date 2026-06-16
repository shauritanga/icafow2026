/**
 * Client-safe USD→TZS display rate (for showing approximate charge amounts).
 * The authoritative rate used for the actual Selcom charge lives in
 * SELCOM/USD_TO_TZS_RATE (server-only). Keep NEXT_PUBLIC_USD_TO_TZS in sync.
 */
export const USD_TO_TZS_DISPLAY = Number(
  process.env.NEXT_PUBLIC_USD_TO_TZS || "2600"
);

export function approxTZS(amountUSD: number) {
  return Math.round(amountUSD * USD_TO_TZS_DISPLAY);
}
