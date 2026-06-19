import { z } from "zod";
import { nameField, emailField, phoneField } from "./common";

const passIds = ["virtual", "delegate", "researcher", "vip", "vvip", "safari"] as const;
const boothIds = ["innovation", "leadership"] as const;
const tierIds = ["strategic", "platinum", "gold", "silver", "bronze"] as const;
const methods = ["card", "tigopesa", "mpesa", "airtelmoney"] as const;

const consent = z.literal(true, {
  error: "You must accept the terms to continue",
});

/* ── Attendee / Author ─────────────────────────────────────── */
export const attendeeSchema = z
  .object({
    passId: z.enum(passIds, { error: "Select a pass" }),
    fullName: nameField,
    email: emailField,
    phone: phoneField,
    organization: z.string().max(160).optional().or(z.literal("")),
    jobTitle: z.string().max(120).optional().or(z.literal("")),
    country: z.string().min(2, "Select your country"),
    dietary: z.string().max(200).optional().or(z.literal("")),
    method: z.enum(methods).optional(),
    consent,

    // Paper fields — required only for the researcher pass.
    paperTitle: z.string().max(250).optional().or(z.literal("")),
    paperAbstract: z.string().max(3000).optional().or(z.literal("")),
    paperTrack: z.string().max(120).optional().or(z.literal("")),
    paperKeywords: z.string().max(250).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.passId === "researcher") {
      if (!data.paperTitle || data.paperTitle.trim().length < 5) {
        ctx.addIssue({ code: "custom", path: ["paperTitle"], message: "Paper title is required for the Researcher Pass" });
      }
      if (!data.paperAbstract || data.paperAbstract.trim().length < 30) {
        ctx.addIssue({ code: "custom", path: ["paperAbstract"], message: "Please provide an abstract (min 30 characters)" });
      }
      if (!data.paperTrack) {
        ctx.addIssue({ code: "custom", path: ["paperTrack"], message: "Select a track for your paper" });
      }
    }
  });
export type AttendeeInput = z.infer<typeof attendeeSchema>;

/* ── Sponsor ───────────────────────────────────────────────── */
export const sponsorSchema = z.object({
  tierId: z.enum(tierIds, { error: "Select a sponsorship tier" }),
  organization: z.string().min(2, "Organization name is required").max(160),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  contactName: nameField,
  email: emailField,
  phone: phoneField,
  jobTitle: z.string().max(120).optional().or(z.literal("")),
  country: z.string().min(2, "Select your country"),
  objectives: z.string().max(1500).optional().or(z.literal("")),
  logoUrl: z
    .string()
    .min(1, "Logo is required")
    .refine((val) => {
      if (val.startsWith("data:")) return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, "Must be a valid URL or image file"),
  method: z.enum(methods).optional(),
  consent,
});
export type SponsorInput = z.infer<typeof sponsorSchema>;

/* ── Exhibitor ─────────────────────────────────────────────── */
export const exhibitorSchema = z.object({
  boothId: z.enum(boothIds, { error: "Select a booth package" }),
  organization: z.string().min(2, "Organization name is required").max(160),
  contactName: nameField,
  jobTitle: z.string().max(120).optional().or(z.literal("")),
  email: emailField,
  phone: phoneField,
  country: z.string().min(2, "Select your country"),
  profile: z.string().min(20, "Please describe your organization (min 20 characters)").max(1500),
  products: z.string().max(1000).optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
  method: z.enum(methods).optional(),
  consentInfo: consent,
  consentTerms: consent,
});
export type ExhibitorInput = z.infer<typeof exhibitorSchema>;

/* ── Partner (application only) ────────────────────────────── */
export const partnerSchema = z.object({
  fullName: nameField,
  jobTitle: z.string().max(120).optional().or(z.literal("")),
  organization: z.string().min(2, "Organization is required").max(160),
  email: emailField,
  phone: phoneField,
  logoUrl: z
    .string()
    .min(1, "Logo is required")
    .refine((val) => {
      if (val.startsWith("data:")) return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, "Must be a valid URL or image file"),
  summary: z.string().min(20, "Tell us why you'd like to partner (min 20 characters)").max(1500),
  consent,
});
export type PartnerInput = z.infer<typeof partnerSchema>;

/* ── Speaker (call for speakers) ───────────────────────────── */
export const speakerSchema = z.object({
  fullName: nameField,
  email: emailField,
  phone: phoneField,
  jobTitle: z.string().min(2, "Job title is required").max(120),
  organization: z.string().min(2, "Organization is required").max(160),
  country: z.string().min(2, "Select your country"),
  topic: z.string().min(5, "Proposed talk topic is required").max(200),
  track: z.string().max(120).optional().or(z.literal("")),
  bio: z.string().min(30, "Please share a short bio (min 30 characters)").max(1500),
  linkedin: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  photoData: z.string().min(1, "A profile photo is required"),
  consent,
});
export type SpeakerInput = z.infer<typeof speakerSchema>;

/* ── Pitch competition ─────────────────────────────────────── */
export const pitchSchema = z.object({
  startupName: z.string().min(2, "Startup name is required").max(160),
  founderName: nameField,
  email: emailField,
  phone: phoneField,
  country: z.string().min(2, "Select your country"),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  sector: z.string().min(2, "Sector is required").max(120),
  stage: z.enum(["idea", "mvp", "early-revenue", "growth"], {
    error: "Select your stage",
  }),
  pitch: z.string().min(50, "Describe your solution (min 50 characters)").max(2000),
  consent,
});
export type PitchInput = z.infer<typeof pitchSchema>;

export const registrationSchemas = {
  attendee: attendeeSchema,
  sponsor: sponsorSchema,
  exhibitor: exhibitorSchema,
  partner: partnerSchema,
  speaker: speakerSchema,
  pitch: pitchSchema,
} as const;

export type RegistrationTypeKey = keyof typeof registrationSchemas;
