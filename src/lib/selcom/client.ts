import {
  selcomConfig,
  assertSelcomConfigured,
  SELCOM_TIMEOUT_MS,
} from "./config";
import { buildSelcomHeaders } from "./sign";
import {
  type CreateOrderParams,
  type CreateOrderResult,
  type OrderStatusResult,
  mapSelcomStatus,
} from "./types";

const CREATE_ORDER_PATH = "/v1/checkout/create-order-minimal";
const ORDER_STATUS_PATH = "/v1/checkout/order-status";

/**
 * Selcom returns `payment_gateway_url` either as a plain URL or base64-encoded.
 * Decode it when it isn't already an http(s) URL, otherwise return as-is.
 */
function decodeGatewayUrl(value?: string): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  try {
    const decoded = Buffer.from(value, "base64").toString("utf8");
    return /^https?:\/\//i.test(decoded) ? decoded : value;
  } catch {
    return value;
  }
}

/**
 * Reduce a string to plain ASCII for Selcom text fields. Selcom rejects requests
 * containing non-ASCII characters (e.g. an em-dash "—" or accented letters in a
 * buyer's name) with HTTP 406 "Not Acceptable". We decompose accents, map common
 * Unicode dashes to a hyphen, then drop anything outside printable ASCII.
 */
export function toSelcomAscii(value: string): string {
  return (value || "")
    .normalize("NFKD")
    .replace(/[‐-―]/g, "-") // hyphen, figure/en/em dashes → "-"
    .replace(/[^\x20-\x7E]/g, "") // strip remaining non-ASCII
    .trim();
}

/** Normalize a Tanzanian phone number to 255XXXXXXXXX. */
export function normalizePhone(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.startsWith("255")) return digits;
  if (digits.startsWith("0")) return "255" + digits.slice(1);
  if (digits.length === 9) return "255" + digits;
  return digits;
}

/**
 * fetch with an abort timeout and one retry-with-backoff on network/5xx errors.
 * Selcom create-order/order-status are safe to retry: create-order is keyed by a
 * unique order_id (Selcom dedupes), order-status is a read.
 */
async function selcomFetch(
  url: string,
  init: RequestInit,
  attempts = 2
): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SELCOM_TIMEOUT_MS);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      // Retry only transient upstream failures.
      if (res.status >= 500 && i < attempts - 1) {
        lastErr = new Error(`Selcom ${res.status}`);
      } else {
        return res;
      }
    } catch (err) {
      lastErr = err;
    } finally {
      clearTimeout(timer);
    }
    await new Promise((r) => setTimeout(r, 500 * (i + 1)));
  }
  throw lastErr instanceof Error ? lastErr : new Error("Selcom request failed");
}

/** Create a Selcom checkout order and return the hosted-checkout URL. */
export async function createOrder(
  params: CreateOrderParams
): Promise<CreateOrderResult> {
  assertSelcomConfigured();
  const currency = params.currency || selcomConfig.currency;

  // NOTE: /checkout/create-order-minimal only accepts these core fields.
  // redirect_url / cancel_url / webhook are NOT supported by the minimal
  // endpoint and cause Selcom to reject the request with HTTP 406 "Not
  // Acceptable". The redirect and webhook URLs are configured at the vendor
  // level in the Selcom Huduma portal instead; settlement is reconciled via the
  // order-status endpoint (see getOrderStatus / verifyPayment).
  // Field order matters for the signature.
  const payload: Record<string, string | number> = {
    vendor: selcomConfig.vendorId,
    order_id: params.orderId,
    buyer_email: params.buyerEmail,
    buyer_name: toSelcomAscii(params.buyerName),
    buyer_phone: normalizePhone(params.buyerPhone),
    amount: Math.round(params.amount),
    currency,
    buyer_remarks: toSelcomAscii(params.remarks || "ICAFoW 2026 registration"),
    merchant_remarks: "ICAFoW 2026",
    no_of_items: 1,
  };

  try {
    const res = await selcomFetch(`${selcomConfig.baseUrl}${CREATE_ORDER_PATH}`, {
      method: "POST",
      headers: buildSelcomHeaders(payload),
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const rawText = await res.text();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let raw: any = {};
    try {
      raw = rawText ? JSON.parse(rawText) : {};
    } catch {
      raw = {};
    }

    // Selcom returns result_code "000" on success and data[0].payment_token /
    // data[0].payment_gateway_url for the hosted checkout.
    const ok = raw?.result === "SUCCESS" || raw?.resultcode === "000";
    const data = Array.isArray(raw?.data) ? raw.data[0] : raw?.data;
    const token = data?.payment_token;
    const gatewayUrl =
      decodeGatewayUrl(data?.payment_gateway_url) ||
      (token
        ? `${selcomConfig.baseUrl}/v1/checkout/payment-link?token=${encodeURIComponent(
            token
          )}`
        : undefined);

    if (!ok || !gatewayUrl) {
      console.error("[selcom] create-order failed", {
        orderId: params.orderId,
        httpStatus: res.status,
        resultcode: raw?.resultcode,
        message: raw?.message,
        body: rawText?.slice(0, 500),
      });
      return {
        success: false,
        orderId: params.orderId,
        message: raw?.message || "Failed to create Selcom order",
        raw,
      };
    }

    return {
      success: true,
      orderId: params.orderId,
      checkoutUrl: gatewayUrl,
      paymentToken: token,
      reference: data?.reference,
      raw,
    };
  } catch (err) {
    console.error("[selcom] create-order error", params.orderId, err);
    return {
      success: false,
      orderId: params.orderId,
      message:
        err instanceof Error ? err.message : "Network error contacting Selcom",
    };
  }
}

/** Query the live status of a Selcom order (used by verify + callback). */
export async function getOrderStatus(
  orderId: string
): Promise<OrderStatusResult> {
  assertSelcomConfigured();

  const payload: Record<string, string | number> = {
    order_id: orderId,
  };

  try {
    const url = `${selcomConfig.baseUrl}${ORDER_STATUS_PATH}?order_id=${encodeURIComponent(
      orderId
    )}`;
    const res = await selcomFetch(url, {
      method: "GET",
      headers: buildSelcomHeaders(payload),
      cache: "no-store",
    });
    const raw = await res.json().catch(() => ({}));
    const data = Array.isArray(raw?.data) ? raw.data[0] : raw?.data;
    const status = mapSelcomStatus(data?.payment_status);

    return {
      success: raw?.result === "SUCCESS" || raw?.resultcode === "000",
      orderId,
      status,
      transId: data?.transid,
      reference: data?.reference,
      amount: data?.amount != null ? Number(data.amount) : undefined,
      currency: data?.currency,
      message: raw?.message,
      raw,
    };
  } catch (err) {
    console.error("[selcom] order-status error", orderId, err);
    return {
      success: false,
      orderId,
      status: "PENDING",
      message: err instanceof Error ? err.message : "Network error",
    };
  }
}
