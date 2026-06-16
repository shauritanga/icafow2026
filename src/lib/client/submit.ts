"use client";

import type { PaymentMethod } from "@/lib/validations/common";

export interface SubmitResult {
  reference: string;
  requiresPayment: boolean;
  amount?: number;
}

/** POST a registration of the given type. */
export async function submitRegistration(
  type: string,
  data: unknown
): Promise<SubmitResult> {
  const res = await fetch(`/api/register/${type}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Registration failed. Please try again.");
  }
  return res.json();
}

/** Kick off a Selcom payment and redirect the browser to the checkout. */
export async function startPayment(reference: string, method?: PaymentMethod) {
  const res = await fetch("/api/payments/selcom/initiate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference, method }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not start payment. Please try again.");
  }
  const { checkoutUrl } = await res.json();
  if (checkoutUrl) window.location.href = checkoutUrl;
  return checkoutUrl as string;
}
