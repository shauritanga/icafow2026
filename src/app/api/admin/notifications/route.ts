import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find the admin user ID by email if session.user.id is missing somehow,
  // or use session.user.id directly.
  let adminId = (session.user as any).id;
  if (!adminId) {
    const admin = await prisma.adminUser.findUnique({ where: { email: session.user.email } });
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    adminId = admin.id;
  }

  try {
    const notifications = await prisma.inAppNotification.findMany({
      where: { adminId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let adminId = (session.user as any).id;
  if (!adminId) {
    const admin = await prisma.adminUser.findUnique({ where: { email: session.user.email } });
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    adminId = admin.id;
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      await prisma.inAppNotification.updateMany({
        where: { adminId, read: false },
        data: { read: true },
      });
    } else if (notificationId) {
      await prisma.inAppNotification.updateMany({
        where: { id: notificationId, adminId },
        data: { read: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to mark notification read:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let adminId = (session.user as any).id;
  if (!adminId) {
    const admin = await prisma.adminUser.findUnique({ where: { email: session.user.email } });
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    adminId = admin.id;
  }

  try {
    // Delete all read notifications for this admin
    await prisma.inAppNotification.deleteMany({
      where: { adminId, read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to clear notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
