"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { verifyVerifyToken } from "@/lib/verify-token";
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
 * Mark an attendee as checked in at the gate. Staff-only (any logged-in admin
 * user). The signed token from the scanned QR is re-verified server-side so the
 * caller can't check in an arbitrary id. Idempotent: a second scan reports the
 * existing check-in instead of overwriting it.
 */
export async function markCheckedIn(token: string, path: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const registrationId = verifyVerifyToken(token);
  if (!registrationId) return { ok: false as const, error: "Invalid code" };

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
  });
  if (!registration) return { ok: false as const, error: "Not found" };
  if (registration.status !== "CONFIRMED") {
    return { ok: false as const, error: "Registration is not valid (unpaid/unconfirmed)" };
  }

  if (registration.checkedInAt) {
    return {
      ok: true as const,
      alreadyCheckedIn: true,
      checkedInAt: registration.checkedInAt.toISOString(),
    };
  }

  // Guarded write so a concurrent scan can't double-check-in.
  const { count } = await prisma.registration.updateMany({
    where: { id: registrationId, checkedInAt: null },
    data: { checkedInAt: new Date(), checkedInBy: session.user.email },
  });

  const fresh = await prisma.registration.findUnique({
    where: { id: registrationId },
    select: { checkedInAt: true },
  });
  const checkedInAt = (fresh?.checkedInAt ?? new Date()).toISOString();

  revalidatePath(path);
  revalidatePath("/admin/checkin");
  return {
    ok: true as const,
    alreadyCheckedIn: count === 0, // lost the race → already checked in
    checkedInAt,
  };
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

export async function updateRegistration(id: string, data: { fullName: string; email: string; phone?: string; organization?: string }, path: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  await prisma.registration.update({
    where: { id },
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      organization: data.organization || null,
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
