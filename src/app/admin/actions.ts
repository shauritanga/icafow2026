"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { verifyVerifyToken } from "@/lib/verify-token";
import { verifyPayment } from "@/lib/payments";
import type { Prisma } from "@prisma/client";
import nodemailer from "nodemailer";

export async function updateProfile(data: { name?: string; phone?: string; avatarData?: string | null }) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  await prisma.adminUser.update({
    where: { email: session.user.email },
    data: {
      name: data.name,
      phone: data.phone,
      ...(data.avatarData !== undefined && { avatarData: data.avatarData }),
    },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateSiteSettings(data: any) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  await prisma.siteSetting.upsert({
    where: { id: "global" },
    update: { data },
    create: { id: "global", data },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteRegistration(id: string, path: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  await prisma.registration.delete({ where: { id } });
  revalidatePath(path);
  revalidatePath("/");
  return { success: true };
}

/**
 * Check one more person of a registration in at the gate (N-of-M). Staff-only.
 * The signed token from the scanned QR is re-verified server-side so the caller
 * can't check in an arbitrary id. Increments `checkedInCount` up to `seats`
 * using a guarded write, so concurrent scans can't over-count past the bundle.
 */
export async function markCheckedIn(token: string, path: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const registrationId = verifyVerifyToken(token);
  if (!registrationId) return { ok: false as const, error: "Invalid code" };

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    select: { status: true, seats: true, checkedInCount: true, checkedInAt: true },
  });
  if (!registration) return { ok: false as const, error: "Not found" };
  if (registration.status !== "CONFIRMED") {
    return { ok: false as const, error: "Registration is not valid (unpaid/unconfirmed)" };
  }

  // Guarded increment: only updates while there are seats left, so a concurrent
  // scan that fills the last seat makes this one a no-op (count === 0).
  const isFirst = registration.checkedInAt === null;
  const { count } = await prisma.registration.updateMany({
    where: { id: registrationId, checkedInCount: { lt: registration.seats } },
    data: {
      checkedInCount: { increment: 1 },
      checkedInBy: session.user.email,
      ...(isFirst ? { checkedInAt: new Date() } : {}),
    },
  });

  const fresh = await prisma.registration.findUnique({
    where: { id: registrationId },
    select: { seats: true, checkedInCount: true },
  });
  const seats = fresh?.seats ?? registration.seats;
  const checkedInCount = fresh?.checkedInCount ?? registration.checkedInCount;

  revalidatePath(path);
  revalidatePath("/admin/checkin");
  return {
    ok: true as const,
    incremented: count > 0,
    full: checkedInCount >= seats, // all bundled people are now in
    checkedInCount,
    seats,
  };
}

/**
 * Manually re-query Selcom for a payment's authoritative status and reconcile it.
 * Staff-only ops tool for stuck/disputed payments. Settlement still goes through
 * verifyPayment (amount-checked, idempotent); this just triggers it on demand.
 */
export async function reverifyPayment(reference: string, path: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const result = await verifyPayment(reference, "MANUAL");
  revalidatePath(path);
  return { ok: true as const, status: result.status };
}

export async function updateRegistrationStatus(id: string, status: "PENDING" | "CONFIRMED" | "CANCELLED" | "WAITLISTED", path: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  await prisma.registration.update({
    where: { id },
    data: { status },
  });
  revalidatePath(path);
  revalidatePath("/");
  return { success: true };
}

export async function updateRegistration(
  id: string,
  data: {
    fullName: string;
    email: string;
    phone?: string;
    organization?: string;
    jobTitle?: string;
    // When provided, these are merged into the registration's `details` JSON
    // without clobbering the rest of the application responses. Used to let
    // admins edit a speaker's profile photo (details.photoData) and talk
    // topic (details.topic), both of which the public speakers section
    // renders directly.
    photoData?: string;
    topic?: string;
  },
  path: string
) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  // Collect any details.* fields the caller wants to update, then merge them
  // into the existing JSON in a single read so we never drop other responses.
  const detailPatch: Record<string, unknown> = {};
  if (typeof data.photoData === "string" && data.photoData.length > 0) {
    detailPatch.photoData = data.photoData;
  }
  if (data.topic !== undefined) {
    detailPatch.topic = data.topic;
  }

  let details: Prisma.InputJsonValue | undefined;
  if (Object.keys(detailPatch).length > 0) {
    const existing = await prisma.registration.findUnique({
      where: { id },
      select: { details: true },
    });
    if (!existing) throw new Error("Registration not found");
    const base =
      existing.details && typeof existing.details === "object" && !Array.isArray(existing.details)
        ? (existing.details as Record<string, unknown>)
        : {};
    details = { ...base, ...detailPatch } as Prisma.InputJsonValue;
  }

  await prisma.registration.update({
    where: { id },
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      organization: data.organization || null,
      ...(data.jobTitle !== undefined ? { jobTitle: data.jobTitle || null } : {}),
      ...(details !== undefined ? { details } : {}),
    },
  });
  revalidatePath(path);
  revalidatePath("/");
  return { success: true };
}

export async function deleteContactMessage(id: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
  return { success: true };
}

export async function replyToContactMessage(id: string, text: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) throw new Error("Message not found");

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP configuration is missing");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: message.email,
    subject: `Re: ${message.subject}`,
    text: text,
  });

  return { success: true };
}

export async function updatePaperStatus(id: string, status: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const paper = await prisma.paper.update({
    where: { id },
    data: { status },
    include: { registration: true },
  });

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: { rejectUnauthorized: false },
      });

      let subject = "";
      let body = "";

      switch (status) {
        case "under_review":
          subject = `Your Paper "${paper.title}" is Under Review`;
          body = `Dear ${paper.registration.fullName},\n\nWe are writing to inform you that your paper submission titled "${paper.title}" is now officially under review by our committee.\n\nWe will notify you once a final decision has been made.\n\nBest regards,\nThe ICAFoW 2026 Team`;
          break;
        case "accepted":
          subject = `Congratulations! Your Paper "${paper.title}" has been Accepted`;
          body = `Dear ${paper.registration.fullName},\n\nCongratulations! We are thrilled to inform you that your paper titled "${paper.title}" has been accepted for presentation at ICAFoW 2026.\n\nOur team will be in touch shortly with further details regarding the schedule and next steps.\n\nBest regards,\nThe ICAFoW 2026 Team`;
          break;
        case "rejected":
          subject = `Decision on your Paper Submission: "${paper.title}"`;
          body = `Dear ${paper.registration.fullName},\n\nThank you for submitting your paper titled "${paper.title}" to ICAFoW 2026.\n\nAfter careful consideration by our review committee, we regret to inform you that we are unable to accept your paper for presentation at this year's conference.\n\nWe received many excellent submissions and the selection process was highly competitive. We appreciate your interest and encourage you to submit your future work.\n\nBest regards,\nThe ICAFoW 2026 Team`;
          break;
      }

      if (subject && body) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: paper.registration.email,
          subject,
          text: body,
        });
      }
    } catch (error) {
      console.error("Failed to send paper status email:", error);
    }
  }

  revalidatePath("/admin/papers");
  return { success: true };
}
