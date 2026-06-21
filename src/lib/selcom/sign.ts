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
    // Selcom's API gateway rejects requests with HTTP 406 "Not Acceptable" when
    // these content-negotiation/identity headers are absent. Node's fetch does
    // not send them by default, so set them explicitly.
    Accept: "application/json",
    "User-Agent": "ICAFoW-2026/1.0",
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

export type WebhookSignatureCheck = "valid" | "invalid" | "unverifiable";

/**
 * Best-effort verification of an incoming Selcom webhook signature.
 *
 * IMPORTANT: this is advisory only. Settlement NEVER trusts the webhook body —
 * the webhook is purely a trigger to re-query the authoritative order-status
 * endpoint (which we authenticate with our own signed request). We therefore
 * return a tri-state result for logging and never let "unverifiable" masquerade
 * as "valid".
 *
 * TODO: confirm the exact digest construction against the current Selcom
 * webhook spec; the signed-request algorithm in `buildSelcomHeaders` is used as
 * a best guess here (timestamp-prefixed, &-joined field list).
 */
export function verifyWebhookSignature(
  payload: Record<string, string | number>,
  providedDigest?: string,
  signedFields?: string[],
  timestamp?: string
): WebhookSignatureCheck {
  if (!selcomConfig.apiSecret || !providedDigest) return "unverifiable";
  const fields = signedFields ?? Object.keys(payload);
  let signData = timestamp ? `timestamp=${timestamp}` : "";
  for (const f of fields) {
    signData += `${signData ? "&" : ""}${f}=${payload[f]}`;
  }
  const expected = crypto
    .createHmac("sha256", selcomConfig.apiSecret)
    .update(signData)
    .digest("base64");
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(providedDigest);
    if (a.length !== b.length) return "invalid";
    return crypto.timingSafeEqual(a, b) ? "valid" : "invalid";
  } catch {
    return "invalid";
  }
}
