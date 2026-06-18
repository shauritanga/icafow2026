import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/admin/login");

  const dbUser = await prisma.adminUser.findUnique({
    where: { email: session.user.email },
  });

  return (
    <AdminShell userEmail={session.user.email} userAvatar={dbUser?.avatarData || null}>
      {children}
    </AdminShell>
  );
}
