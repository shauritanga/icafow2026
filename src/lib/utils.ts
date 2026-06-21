import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as a currency string (whole units, for the public site). */
export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Currency with exact cents (two decimals) — used in the admin dashboard so the
 * real amount is visible (e.g. $0.50, $1.00) instead of being rounded to whole
 * units. The public site keeps `formatCurrency` (whole units).
 */
export function formatCurrencyExact(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Generate a unique, human-readable reference code (e.g. ICA-7F3K9Q). */
export function generateReference(prefix = "ICA") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${code}`;
}

export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...opts,
  }).format(new Date(date));
}

/** Convert uppercase string to title case (e.g., SPEAKER -> Speaker) */
export function formatEnum(val: string) {
  if (!val) return "";
  return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
}
