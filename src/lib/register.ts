import { prisma } from "@/lib/prisma";
import { generateReference } from "@/lib/utils";
import { getPass } from "@/lib/content/passes";
import { getBooth } from "@/lib/content/booths";
import { getSponsorTier } from "@/lib/content/sponsors";
import { processNotificationQueue } from "@/lib/queueProcessor";
import {
  registrationSchemas,
  type RegistrationTypeKey,
} from "@/lib/validations/registration";
import type { RegistrationType, Prisma } from "@prisma/client";
import { sendRegistrationConfirmation, sendAdminAlert } from "@/lib/email";
import { sendPushNotification } from "@/lib/fcm";

const typeEnum: Record<RegistrationTypeKey, RegistrationType> = {
  attendee: "ATTENDEE",
  sponsor: "SPONSOR",
  exhibitor: "EXHIBITOR",
  partner: "PARTNER",
  speaker: "SPEAKER",
  pitch: "PITCH",
};

interface BuildResult {
  ok: boolean;
  reference?: string;
  requiresPayment?: boolean;
  amount?: number;
  error?: string;
  issues?: unknown;
}

/**
 * Validate + persist a registration of any audience type.
 * Returns the reference and whether a Selcom payment is required next.
 */
export async function createRegistration(
  type: RegistrationTypeKey,
  body: unknown
): Promise<BuildResult> {
  const schema = registrationSchemas[type];
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: "Validation failed", issues: parsed.error.flatten() };
  }
  const data = parsed.data as Record<string, unknown>;
  const reference = generateReference();

  let amount = 0;
  let packageId: string | null = null;
  let packageLabel: string | null = null;
  let requiresPayment = false;

  // Common contact fields differ slightly per form; normalize them.
  const fullName =
    (data.fullName as string) ||
    (data.contactName as string) ||
    (data.founderName as string) ||
    "";
  const email = data.email as string;
  const phone = (data.phone as string) || null;
  const organization =
    (data.organization as string) || (data.startupName as string) || null;
  const jobTitle = (data.jobTitle as string) || null;
  const country = (data.country as string) || null;

  if (type === "attendee") {
    const pass = getPass(data.passId as never);
    if (!pass) return { ok: false, error: "Invalid pass" };
    amount = pass.priceUSD;
    packageId = pass.id;
    packageLabel = pass.name;
    requiresPayment = amount > 0;
  } else if (type === "sponsor") {
    const tier = getSponsorTier(data.tierId as never);
    if (!tier) return { ok: false, error: "Invalid tier" };
    amount = tier.priceUSD ?? 0;
    packageId = tier.id;
    packageLabel = tier.name;
    requiresPayment = amount > 0; // "by negotiation" tiers → follow-up, no instant payment
  } else if (type === "exhibitor") {
    const booth = getBooth(data.boothId as never);
    if (!booth) return { ok: false, error: "Invalid booth" };
    amount = booth.priceUSD;
    packageId = booth.id;
    packageLabel = `${booth.name} (${booth.size})`;
    requiresPayment = true;
  } else {
    // partner / speaker / pitch are submission-only applications
    requiresPayment = false;
    packageLabel =
      type === "partner"
        ? "Partnership Application"
        : type === "speaker"
        ? "Speaker Application"
        : "Pitch Competition Application";
  }

  const registration = await prisma.registration.create({
    data: {
      reference,
      type: typeEnum[type],
      status: "PENDING",
      fullName,
      email,
      phone,
      organization,
      jobTitle,
      country,
      packageId,
      packageLabel,
      amount,
      currency: "USD",
      details: data as Prisma.InputJsonValue,
    },
  });

  // Attach a Paper for researcher-pass attendees.
  if (type === "attendee" && data.passId === "researcher" && data.paperTitle) {
    await prisma.paper.create({
      data: {
        registrationId: registration.id,
        title: data.paperTitle as string,
        abstract: (data.paperAbstract as string) || "",
        track: (data.paperTrack as string) || null,
        keywords: (data.paperKeywords as string) || null,
        authors: [{ name: fullName, email, affiliation: organization }] as Prisma.InputJsonValue,
      },
    });
  }

  // ─── OUTBOX PATTERN: Guaranteed Delivery ───
  // Instead of dispatching emails directly, we save the jobs to the database queue.
  const typeLabelStr = packageLabel || typeEnum[type];
  
  // Map registration types to admin dashboard routes
  const urlMap: Record<RegistrationTypeKey, string> = {
    attendee: "/admin/attendees",
    sponsor: "/admin/sponsors",
    exhibitor: "/admin/exhibitors",
    partner: "/admin/partners",
    speaker: "/admin/speakers",
    pitch: "/admin/pitch",
  };
  const targetUrl = urlMap[type] || "/admin";

  await prisma.notificationJob.createMany({
    data: [
      {
        type: "EMAIL",
        payload: { action: "USER_CONFIRMATION", to: email, name: fullName, typeLabel: typeLabelStr },
      },
      {
        type: "EMAIL",
        payload: { action: "ADMIN_ALERT", name: fullName, email: email, typeLabel: typeLabelStr, reference },
      },
      {
        type: "PUSH",
        payload: { title: `New ${typeLabelStr} Registration`, body: `${fullName} has just registered. Reference: ${reference}`, url: targetUrl },
      },
      {
        type: "IN_APP",
        payload: { title: `New ${typeLabelStr} Registration`, body: `${fullName} has just registered. Reference: ${reference}`, url: targetUrl },
      }
    ]
  });

  // Trigger processor instantly internally (Environment-Agnostic!)
  // This removes the need for a complicated fetch call and works locally or on production instantly.
  processNotificationQueue().catch((err) => console.error("Internal queue processor failed:", err));

  return { ok: true, reference, requiresPayment, amount };
}
