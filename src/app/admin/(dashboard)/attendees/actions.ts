"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/** Verify (approve) a pending registration. Useful for speakers, partners, etc. */
export async function verifyRegistration(id: string, formData?: FormData) {
  try {
    await prisma.registration.update({
      where: { id },
      data: { status: "CONFIRMED" },
    });
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
