/** Selcom gateway configuration, read from environment. */
export const selcomConfig = {
  baseUrl: process.env.SELCOM_BASE_URL || "https://apigwtest2.selcommobile.com",
  apiKey: process.env.SELCOM_API_KEY || "",
  apiSecret: process.env.SELCOM_API_SECRET || "",
  vendorId: process.env.SELCOM_VENDOR_ID || "",
  currency: process.env.SELCOM_CURRENCY || "TZS",
  usdToTzs: Number(process.env.USD_TO_TZS_RATE || "2600"),
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

/**
 * Use the built-in mock gateway when SELCOM_MOCK is truthy OR when credentials
 * are missing. This lets the entire payment flow run end-to-end in development
 * without real Selcom keys.
 */
export const isSelcomMock =
  process.env.SELCOM_MOCK === "true" ||
  !selcomConfig.apiKey ||
  !selcomConfig.apiSecret ||
  !selcomConfig.vendorId;

/** Convert a USD amount to the integer minor-unit Selcom charge (TZS). */
export function usdToCharge(amountUSD: number): number {
  return Math.round(amountUSD * selcomConfig.usdToTzs);
}
