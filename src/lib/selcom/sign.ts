import crypto from "crypto";
import { selcomConfig } from "./config";

/**
 * Selcom request signing.
 *
 * Selcom authenticates each request with an HMAC-SHA256 digest over the
 * request payload, using the documented algorithm:
 *
 *   signData = "timestamp=" + timestamp
 *   for each field in signedFields (in order):
 *       signData += "&" + field + "=" + value
 *   digest = base64( HMAC_SHA256(signData, apiSecret) )
 *
 * Headers sent with every request:
 *   Authorization: "SELCOM " + base64(apiKey)
 *   Digest-Method: HS256
 *   Digest:        <digest>
 *   Timestamp:     <ISO-8601 timestamp>
 *   Signed-Fields: <comma-separated field names>
 */
export function buildSelcomHeaders(
  payload: Record<string, string | number>,
  timestamp = new Date().toISOString()
) {
  const signedFields = Object.keys(payload);

  let signData = `timestamp=${timestamp}`;
  for (const field of signedFields) {
    signData += `&${field}=${payload[field]}`;
  }

  const digest = crypto
    .createHmac("sha256", selcomConfig.apiSecret)
    .update(signData)
    .digest("base64");

  const authToken = Buffer.from(selcomConfig.apiKey).toString("base64");

  return {
    "Content-Type": "application/json",
    Authorization: `SELCOM ${authToken}`,
    "Digest-Method": "HS256",
    Digest: digest,
    Timestamp: timestamp,
    "Signed-Fields": signedFields.join(","),
  } as Record<string, string>;
}

/** Encode a URL the way Selcom expects redirect/webhook URLs (base64). */
export function encodeUrl(url: string) {
  return Buffer.from(url).toString("base64");
}

/**
 * Verify an incoming Selcom webhook signature (best-effort).
 * Selcom posts a `digest`/`signature` computed over the payload fields. If a
 * shared secret is configured we recompute and compare; otherwise we accept
 * (mock mode / unconfigured) and rely on order-status verification instead.
 */
export function verifyWebhookSignature(
  payload: Record<string, string | number>,
  providedDigest?: string,
  signedFields?: string[]
): boolean {
  if (!selcomConfig.apiSecret || !providedDigest) return true; // can't verify → fall back to status check
  const fields = signedFields ?? Object.keys(payload);
  let signData = "";
  for (const f of fields) signData += `${f}=${payload[f]}&`;
  signData = signData.replace(/&$/, "");
  const expected = crypto
    .createHmac("sha256", selcomConfig.apiSecret)
    .update(signData)
    .digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(providedDigest));
  } catch {
    return false;
  }
}
