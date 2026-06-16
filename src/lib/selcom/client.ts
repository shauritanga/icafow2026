import { selcomConfig, isSelcomMock } from "./config";
import { buildSelcomHeaders, encodeUrl } from "./sign";
import {
  type CreateOrderParams,
  type CreateOrderResult,
  type OrderStatusResult,
  mapSelcomStatus,
} from "./types";

const CREATE_ORDER_PATH = "/v1/checkout/create-order-minimal";
const ORDER_STATUS_PATH = "/v1/checkout/order-status";

/** Normalize a Tanzanian phone number to 255XXXXXXXXX. */
export function normalizePhone(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.startsWith("255")) return digits;
  if (digits.startsWith("0")) return "255" + digits.slice(1);
  if (digits.length === 9) return "255" + digits;
  return digits;
}

/**
 * Create a Selcom checkout order. In mock mode this returns a local checkout
 * URL handled by /payment/[ref] so the flow works without credentials.
 */
export async function createOrder(
  params: CreateOrderParams
): Promise<CreateOrderResult> {
  const currency = params.currency || selcomConfig.currency;

  if (isSelcomMock) {
    return {
      success: true,
      orderId: params.orderId,
      checkoutUrl: `${selcomConfig.appUrl}/payment/${params.orderId}?mock=1`,
      paymentToken: `MOCK-${params.orderId}`,
      reference: `MOCK-${params.orderId}`,
      message: "Mock order created",
    };
  }

  const redirectUrl = `${selcomConfig.appUrl}/api/payments/selcom/callback?order=${params.orderId}`;
  const cancelUrl = `${selcomConfig.appUrl}/payment/${params.orderId}?cancelled=1`;
  const webhookUrl = `${selcomConfig.appUrl}/api/payments/selcom/webhook`;

  // Field order matters for the signature.
  const payload: Record<string, string | number> = {
    vendor: selcomConfig.vendorId,
    order_id: params.orderId,
    buyer_email: params.buyerEmail,
    buyer_name: params.buyerName,
    buyer_phone: normalizePhone(params.buyerPhone),
    amount: Math.round(params.amount),
    currency,
    redirect_url: encodeUrl(redirectUrl),
    cancel_url: encodeUrl(cancelUrl),
    webhook: encodeUrl(webhookUrl),
    buyer_remarks: params.remarks || "ICAFoW 2026 registration",
    merchant_remarks: "ICAFoW 2026",
    no_of_items: 1,
  };

  try {
    const res = await fetch(`${selcomConfig.baseUrl}${CREATE_ORDER_PATH}`, {
      method: "POST",
      headers: buildSelcomHeaders(payload),
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const raw = await res.json().catch(() => ({}));

    // Selcom returns result_code "000" on success and data[0].payment_token /
    // data[0].payment_gateway_url for the hosted checkout.
    const ok = raw?.result === "SUCCESS" || raw?.resultcode === "000";
    const data = Array.isArray(raw?.data) ? raw.data[0] : raw?.data;
    const token = data?.payment_token;
    const gatewayUrl =
      data?.payment_gateway_url ||
      (token
        ? `${selcomConfig.baseUrl}/v1/checkout/payment-link?token=${encodeURIComponent(
            token
          )}`
        : undefined);

    if (!ok || !gatewayUrl) {
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
    return {
      success: false,
      orderId: params.orderId,
      message: err instanceof Error ? err.message : "Network error contacting Selcom",
    };
  }
}

/** Query the live status of a Selcom order (used by verify + callback). */
export async function getOrderStatus(
  orderId: string
): Promise<OrderStatusResult> {
  if (isSelcomMock) {
    // In mock mode, status transitions are driven by the mock webhook /
    // confirmation in the payment page, so report PENDING here.
    return { success: true, orderId, status: "PENDING", message: "Mock status" };
  }

  const payload: Record<string, string | number> = {
    order_id: orderId,
  };

  try {
    const url = `${selcomConfig.baseUrl}${ORDER_STATUS_PATH}?order_id=${encodeURIComponent(
      orderId
    )}`;
    const res = await fetch(url, {
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
      amount: data?.amount ? Number(data.amount) : undefined,
      message: raw?.message,
      raw,
    };
  } catch (err) {
    return {
      success: false,
      orderId,
      status: "PENDING",
      message: err instanceof Error ? err.message : "Network error",
    };
  }
}
