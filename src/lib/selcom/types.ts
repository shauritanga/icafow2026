export interface CreateOrderParams {
  orderId: string;
  amount: number; // integer, in TZS
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string; // 255XXXXXXXXX
  currency?: string;
  remarks?: string;
}

export interface CreateOrderResult {
  success: boolean;
  orderId: string;
  /** URL to redirect the buyer to Selcom's hosted checkout. */
  checkoutUrl?: string;
  paymentToken?: string;
  reference?: string;
  message?: string;
  raw?: unknown;
}

export type SelcomPaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED";

export interface OrderStatusResult {
  success: boolean;
  orderId: string;
  status: SelcomPaymentStatus;
  transId?: string;
  reference?: string;
  amount?: number;
  message?: string;
  raw?: unknown;
}

/** Normalize Selcom's textual payment_status into our enum. */
export function mapSelcomStatus(value?: string): SelcomPaymentStatus {
  switch ((value || "").toUpperCase()) {
    case "COMPLETED":
    case "PAID":
    case "SUCCESS":
      return "PAID";
    case "PROCESSING":
    case "INPROGRESS":
    case "IN_PROGRESS":
      return "PROCESSING";
    case "CANCELLED":
    case "CANCELED":
      return "CANCELLED";
    case "FAILED":
    case "REJECTED":
    case "USERCANCELLED":
      return "FAILED";
    default:
      return "PENDING";
  }
}
