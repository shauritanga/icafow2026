import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations/contact";
import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const parsed = contactSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 422 });
  }
  const { name, email, phone, organization, subject, message } = parsed.data;
  await prisma.contactMessage.create({
    data: {
      name,
      email,
      phone: phone || null,
      organization: organization || null,
      subject,
      message,
    },
  });

  // Create in-app notification for all admins
  const admins = await prisma.adminUser.findMany({ select: { id: true } });
  if (admins.length > 0) {
    await prisma.inAppNotification.createMany({
      data: admins.map((admin) => ({
        adminId: admin.id,
        title: "New Contact Message",
        body: `From: ${name} (${email})\nSubject: ${subject}`,
        url: "/admin/messages",
      })),
    });
  }

  // Send email notification
  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
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
        to: process.env.SMTP_FROM, // Send it to the admin's inbox
        replyTo: email,
        subject: `[ICAFoW] New Message: ${subject}`,
        text: `You have received a new message from the ICAFoW website contact form.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nOrganization: ${organization || 'N/A'}\n\nMessage:\n${message}`,
      });
    }
  } catch (err) {
    console.error("Failed to send email notification", err);
  }

  return NextResponse.json({ ok: true });
}
