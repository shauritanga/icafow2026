import type { Metadata } from "next";
import { PitchForm } from "@/components/forms/pitch-form";

export const metadata: Metadata = {
  title: "Pitch Competition",
  description: "Apply for the ICAFoW 2026 Pitch Competition and compete for the Future of Work Innovation Award.",
};

export default function PitchRegisterPage() {
  return <PitchForm />;
}
