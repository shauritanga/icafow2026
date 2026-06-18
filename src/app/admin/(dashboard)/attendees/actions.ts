"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { processNotificationQueue } from "@/lib/queueProcessor";

/** Verify (approve) a pending registration. Useful for speakers, partners, etc. */
export async function verifyRegistration(id: string, formData?: FormData) {
  try {
    const reg = await prisma.registration.findUnique({ where: { id } });
    if (!reg) throw new Error("Registration not found");

    await prisma.registration.update({
      where: { id },
      data: { status: "CONFIRMED" },
    });

    // Create approval notification job
    await prisma.notificationJob.create({
      data: {
        type: "EMAIL",
        payload: {
          to: reg.email,
          name: reg.fullName,
          action: "APPROVAL_NOTIFICATION",
          typeLabel: reg.type.toLowerCase().replace(/^\w/, c => c.toUpperCase()),
        }
      }
    });

    // Kick queue in the background
    processNotificationQueue().catch(err => console.error("Approval email queue failed:", err));

    // Revalidate public pages where this might show up (e.g. Speakers section)
    revalidatePath("/");
    // Revalidate admin dashboards
    revalidatePath("/admin");
    revalidatePath("/admin/registrations");
  } catch (error) {
    console.error("Failed to verify registration:", error);
    throw new Error("Failed to verify registration");
  }
}
