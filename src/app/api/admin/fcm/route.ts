import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });
    const adminEmail = session.user.email;

    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return new NextResponse("Invalid token", { status: 400 });
    }

    // Upsert the token into the admin's record safely
    // Since we don't have atomic array operations easily in SQLite/Postgres without raw, 
    // we fetch first or use a Set.
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: adminEmail }
    });

    if (!adminUser) {
      return new NextResponse("Admin not found", { status: 404 });
    }

    // Add token if it doesn't already exist in the array
    if (!adminUser.fcmTokens.includes(token)) {
      await prisma.adminUser.update({
        where: { email: adminEmail },
        data: {
          fcmTokens: {
            push: token
          }
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
