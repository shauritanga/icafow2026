import type { Metadata } from "next";
import { ExhibitorForm } from "@/components/forms/exhibitor-form";

export const metadata: Metadata = {
  title: "Exhibitor Registration",
  description: "Reserve your exhibition booth at ICAFoW 2026 and showcase your AI solutions.",
};

export default async function ExhibitorRegisterPage(props: {
  searchParams: Promise<{ booth?: string }>;
}) {
  const { booth } = await props.searchParams;
  return <ExhibitorForm initialBooth={booth} />;
}
