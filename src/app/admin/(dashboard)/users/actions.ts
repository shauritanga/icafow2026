"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { processNotificationQueue } from "@/lib/queueProcessor";

export async function addAdminUser(data: { name: string; email: string; passwordHash: string; role: string }) {
  try {
    const existingUser = await prisma.adminUser.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return { ok: false, error: "An administrator with this email already exists." };
    }

    // Since the passwordHash in data is actually plain text right now (sent from the client for us to hash securely on server),
    // we hash it here securely.
    const hashed = await bcrypt.hash(data.passwordHash, 10);

    await prisma.adminUser.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: hashed,
        role: data.role,
      },
    });

    // Enqueue the welcome email
    await prisma.notificationJob.create({
      data: {
        type: "EMAIL",
        payload: {
          action: "ADMIN_WELCOME",
          to: data.email.toLowerCase(),
          name: data.name || "Administrator",
          tempPassword: data.passwordHash, // Send the original plaintext password they typed in the form
        }
      }
    });

    // Process instantly so they receive it right away
    processNotificationQueue().catch(err => console.error("Admin welcome email queue failed:", err));

    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err: any) {
    console.error("Failed to add admin user:", err);
    return { ok: false, error: "An unexpected error occurred while adding the administrator." };
  }
}

export async function deleteAdminUser(id: string) {
  try {
    // Prevent deleting the very last admin
    const adminCount = await prisma.adminUser.count();
    if (adminCount <= 1) {
      return { ok: false, error: "Cannot delete the last remaining administrator." };
    }

    await prisma.adminUser.delete({
      where: { id },
    });

    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err: any) {
    console.error("Failed to delete admin user:", err);
    return { ok: false, error: "Failed to delete the administrator." };
  }
}
