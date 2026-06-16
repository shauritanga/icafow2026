import type { Metadata } from "next";
import { SponsorForm } from "@/components/forms/sponsor-form";

export const metadata: Metadata = {
  title: "Sponsorship Registration",
  description: "Become a sponsor of ICAFoW 2026 and reach decision-makers across Africa's AI ecosystem.",
};

export default async function SponsorRegisterPage(props: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const { tier } = await props.searchParams;
  return <SponsorForm initialTier={tier} />;
}
