/**
 * Normalize the configured base URL: drop any trailing slash and a trailing
 * `/v1` segment, because our request paths already include `/v1/...`. This keeps
 * the integration working whether SELCOM_BASE_URL is set with or without `/v1`.
 */
function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "").replace(/\/v1$/i, "");
}

/** Selcom gateway configuration, read from environment. */
export const selcomConfig = {
  // Live gateway by default; point at the test gateway via SELCOM_BASE_URL in
  // non-production environments.
  baseUrl: normalizeBaseUrl(
    process.env.SELCOM_BASE_URL || "https://apigw.selcommobile.com"
  ),
  apiKey: process.env.SELCOM_API_KEY || "",
  apiSecret: process.env.SELCOM_API_SECRET || "",
  vendorId: process.env.SELCOM_VENDOR_ID || "",
  currency: process.env.SELCOM_CURRENCY || "TZS",
  usdToTzs: Number(process.env.USD_TO_TZS_RATE || "2600"),
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "",
};

/** How long to wait on any single Selcom HTTP call before aborting. */
export const SELCOM_TIMEOUT_MS = Number(process.env.SELCOM_TIMEOUT_MS || "15000");

/**
 * Fail fast (with a clear message) when the gateway is not fully configured.
 * Called at the top of every outbound Selcom call so a misconfigured deploy
 * surfaces an explicit error instead of silently mis-charging or hanging.
 */
export function assertSelcomConfigured(): void {
  const missing: string[] = [];
  if (!selcomConfig.apiKey) missing.push("SELCOM_API_KEY");
  if (!selcomConfig.apiSecret) missing.push("SELCOM_API_SECRET");
  if (!selcomConfig.vendorId) missing.push("SELCOM_VENDOR_ID");
  if (!selcomConfig.appUrl) missing.push("NEXT_PUBLIC_APP_URL");
  if (missing.length) {
    throw new Error(
      `Selcom is not configured — missing env: ${missing.join(", ")}`
    );
  }
}

/** Convert a USD amount to the integer whole-unit Selcom charge (TZS). */
export function usdToCharge(amountUSD: number): number {
  return Math.round(amountUSD * selcomConfig.usdToTzs);
}
