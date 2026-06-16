import type { Metadata } from "next";
import { PartnerForm } from "@/components/forms/partner-form";

export const metadata: Metadata = {
  title: "Partner with ICAFoW 2026",
  description: "Submit a partnership application and help build Africa's AI-powered future.",
};

export default function PartnerRegisterPage() {
  return <PartnerForm />;
}
