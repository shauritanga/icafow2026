"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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
