import type { Metadata } from "next";
import { SpeakerForm } from "@/components/forms/speaker-form";

export const metadata: Metadata = {
  title: "Call for Speakers",
  description: "Apply to speak at ICAFoW 2026 and share your expertise on AI and the future of work.",
};

export default function SpeakerRegisterPage() {
  return <SpeakerForm />;
}
