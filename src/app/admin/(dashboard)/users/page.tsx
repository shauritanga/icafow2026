import * as React from "react";
import { prisma } from "@/lib/prisma";
import { UsersClient } from "./users-client";

export const metadata = {
  title: "Admin Users | ICAFoW Dashboard",
};

export default async function AdminUsersPage() {
  const users = await prisma.adminUser.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return <UsersClient initialData={users} />;
}
