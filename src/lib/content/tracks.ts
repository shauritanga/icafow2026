/**
 * Conference themes & tracks.
 * PLACEHOLDER CONTENT: the source states "10 Tracks" but does not name them.
 * The ten tracks below are professionally themed around AI & the Future of Work
 * and are documented in ASSUMPTIONS.md for the client to confirm/replace.
 */

export interface Track {
  id: string;
  title: string;
  icon: string; // lucide icon name
  description: string;
}

export const tracks: Track[] = [
  {
    id: "future-of-work",
    title: "AI & the Future of Work",
    icon: "Briefcase",
    description:
      "Reskilling, job transformation, human–AI collaboration and the changing nature of employment.",
  },
  {
    id: "governance-policy",
    title: "AI Governance, Policy & Ethics",
    icon: "Scale",
    description:
      "Responsible AI, regulation, data sovereignty and policy frameworks for the African context.",
  },
  {
    id: "generative-ai",
    title: "Generative AI & Large Language Models",
    icon: "Sparkles",
    description:
      "Foundation models, applied LLMs, multimodal AI and productivity in the workplace.",
  },
  {
    id: "healthcare",
    title: "AI in Healthcare & Life Sciences",
    icon: "HeartPulse",
    description:
      "Diagnostics, public health, telemedicine and AI-driven healthcare delivery.",
  },
  {
    id: "agriculture",
    title: "AI for Agriculture & Food Security",
    icon: "Sprout",
    description:
      "Precision agriculture, climate resilience and smart food systems across the continent.",
  },
  {
    id: "fintech",
    title: "AI in Finance & Digital Economy",
    icon: "Landmark",
    description:
      "Fintech, financial inclusion, fraud detection and the AI-powered digital economy.",
  },
  {
    id: "education",
    title: "AI in Education & Skills Development",
    icon: "GraduationCap",
    description:
      "Personalized learning, edtech, workforce training and building Africa's AI talent.",
  },
  {
    id: "smart-cities",
    title: "Smart Cities, Industry & Infrastructure",
    icon: "Building2",
    description:
      "Automation, IoT, manufacturing, energy, mobility and resilient infrastructure.",
  },
  {
    id: "data-infrastructure",
    title: "Data, Cloud & AI Infrastructure",
    icon: "Database",
    description:
      "Data ecosystems, compute, MLOps and the foundations for scalable AI in Africa.",
  },
  {
    id: "startups-innovation",
    title: "Startups, Innovation & Investment",
    icon: "Rocket",
    description:
      "Entrepreneurship, venture funding, scaling AI ventures and the innovation ecosystem.",
  },
];
