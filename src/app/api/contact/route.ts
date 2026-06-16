import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations/contact";

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
  // TODO(client): also send an email notification (e.g. Resend / SMTP).
  return NextResponse.json({ ok: true });
}
