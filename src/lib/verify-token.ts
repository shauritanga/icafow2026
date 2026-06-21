import crypto from "crypto";

/**
 * Entrance-verification tokens for the scannable receipt QR.
 *
 * The token is a stateless, forgery-proof handle for a registration:
 *
 *   token = base64url(registrationId) + "." + base64url(HMAC_SHA256(registrationId, secret))
 *
 * The QR on the receipt encodes `${APP_URL}/verify/<token>`. The verify page
 * recomputes the HMAC and, only if it matches (constant-time), looks up the
 * registration and shows its live VALID/INVALID status. Because the signature
 * covers the id, a receipt cannot be forged or its id swapped without the
 * server secret. There is no expiry — receipts are long-lived.
 */

/** Secret used to sign tokens. Reuses the NextAuth secret (already required). */
function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "NEXTAUTH_SECRET is not set — required to sign entrance-verification tokens"
    );
  }
  return secret;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function hmac(value: string): Buffer {
  return crypto.createHmac("sha256", getSecret()).update(value).digest();
}

/** Build the signed token for a registration id (the value encoded in the QR). */
export function signVerifyToken(registrationId: string): string {
  return `${base64url(registrationId)}.${base64url(hmac(registrationId))}`;
}

/**
 * Validate a token and return the registration id it attests to, or null if the
 * token is malformed or the signature does not match. Constant-time compare.
 */
export function verifyVerifyToken(token: string): string | null {
  if (!token || typeof token !== "string") return null;
  const [idPart, sigPart] = token.split(".");
  if (!idPart || !sigPart) return null;

  let registrationId: string;
  try {
    registrationId = Buffer.from(
      idPart.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString("utf8");
  } catch {
    return null;
  }
  if (!registrationId) return null;

  const expected = base64url(hmac(registrationId));
  const a = Buffer.from(expected);
  const b = Buffer.from(sigPart);
  if (a.length !== b.length) return null;
  return crypto.timingSafeEqual(a, b) ? registrationId : null;
}
