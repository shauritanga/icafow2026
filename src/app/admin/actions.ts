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
