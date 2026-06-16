import { z } from "zod";

export const nameField = z
  .string()
  .min(2, "Please enter at least 2 characters")
  .max(120, "Too long");

export const emailField = z
  .string()
  .min(1, "Email is required")
  .email("Enter a valid email address");

export const phoneField = z
  .string()
  .min(7, "Enter a valid phone number")
  .max(20, "Too long")
  .regex(/^[+]?[\d\s()-]+$/, "Enter a valid phone number");

export const requiredString = (label = "This field") =>
  z.string().min(1, `${label} is required`);

export const countries = [
  "Tanzania", "Kenya", "Uganda", "Rwanda", "Burundi", "South Sudan",
  "Ethiopia", "Nigeria", "Ghana", "South Africa", "Egypt", "Morocco",
  "Zambia", "Zimbabwe", "Malawi", "Mozambique", "Botswana", "Namibia",
  "Senegal", "Côte d'Ivoire", "Cameroon", "DR Congo", "Angola",
  "United Kingdom", "United States", "Canada", "Germany", "France",
  "Netherlands", "India", "China", "United Arab Emirates", "Other",
] as const;

export const paymentMethods = [
  { value: "card", label: "Visa / Mastercard" },
  { value: "tigopesa", label: "Tigo Pesa" },
  { value: "mpesa", label: "M-Pesa" },
  { value: "airtelmoney", label: "Airtel Money" },
] as const;

export type PaymentMethod = (typeof paymentMethods)[number]["value"];
