import type { Metadata } from "next";
import { AttendeeForm } from "@/components/forms/attendee-form";

export const metadata: Metadata = {
  title: "Attendee & Author Registration",
  description:
    "Register for ICAFoW 2026 — choose your pass, submit a paper, and pay securely via Selcom.",
};

export default async function AttendeeRegisterPage(props: {
  searchParams: Promise<{ pass?: string }>;
}) {
  const { pass } = await props.searchParams;
  return <AttendeeForm initialPass={pass} />;
}
