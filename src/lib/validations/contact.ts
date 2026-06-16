import { z } from "zod";
import { nameField, emailField, phoneField } from "./common";

export const contactSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField.optional().or(z.literal("")),
  organization: z.string().max(160).optional().or(z.literal("")),
  subject: z.string().min(3, "Please enter a subject").max(160),
  message: z.string().min(10, "Please enter at least 10 characters").max(2000),
});

export type ContactInput = z.infer<typeof contactSchema>;
