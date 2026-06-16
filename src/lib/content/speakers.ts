/**
 * Speakers & keynote guests.
 * PLACEHOLDER CONTENT: the source does not include speaker names or photos.
 * The names and photos below are illustrative/fictional samples (no real
 * persons) to demonstrate the section. Replace with confirmed speakers — see
 * ASSUMPTIONS.md.
 * `image` uses generic professional portraits from Unsplash as placeholders;
 * swap for real speaker photos once confirmed.
 */

/** Unsplash professional-portrait placeholders (cropped to portrait, ~600px). */
const portrait = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&h=800&q=80`;

export interface Speaker {
  id: string;
  name: string;
  role: string;
  organization: string;
  country: string;
  keynote?: boolean;
  image?: string | null;
  topic?: string;
}

export const speakers: Speaker[] = [
  {
    id: "spk-1",
    name: "Dr. Amani Mwakalinga",
    role: "Minister",
    organization: "Ministry of Information, Communication & IT",
    country: "Tanzania",
    keynote: true,
    image: portrait("photo-1560250097-0b93528c311a"),
    topic: "National AI Strategy & the Future of Work",
  },
  {
    id: "spk-2",
    name: "Prof. Nadia Okonkwo",
    role: "Director",
    organization: "Africa Research Institute For AI (ARIFA)",
    country: "Pan-Africa",
    keynote: true,
    image: portrait("photo-1573496359142-b8d87734a5a2"),
    topic: "Building Africa's Responsible AI Ecosystem",
  },
  {
    id: "spk-3",
    name: "Brian Otieno",
    role: "Chief AI Officer",
    organization: "Global Technology Partner",
    country: "Kenya",
    image: portrait("photo-1507003211169-0a1dd7228f2d"),
    topic: "Generative AI in the Enterprise",
  },
  {
    id: "spk-4",
    name: "Prof. Thandiwe Nkosi",
    role: "Professor of Computer Science",
    organization: "Leading African University",
    country: "South Africa",
    image: portrait("photo-1438761681033-6461ffad8d80"),
    topic: "AI Talent & Skills Development",
  },
  {
    id: "spk-5",
    name: "Chidi Okeke",
    role: "Founder & CEO",
    organization: "AI Startup",
    country: "Nigeria",
    image: portrait("photo-1500648767791-00dcc994a43e"),
    topic: "Scaling AI Ventures in Africa",
  },
  {
    id: "spk-6",
    name: "Aline Uwase",
    role: "Policy Lead",
    organization: "International Development Partner",
    country: "Rwanda",
    image: portrait("photo-1494790108377-be9c29b29330"),
    topic: "AI Governance & Policy Frameworks",
  },
  {
    id: "spk-7",
    name: "Kwame Mensah",
    role: "Head of Data Science",
    organization: "Pan-African Bank",
    country: "Ghana",
    image: portrait("photo-1519085360753-af0119f7cbe7"),
    topic: "AI in Finance & Digital Inclusion",
  },
  {
    id: "spk-8",
    name: "Sarah Nakato",
    role: "Innovation Director",
    organization: "Health-Tech Organization",
    country: "Uganda",
    image: portrait("photo-1580489944761-15a19d654956"),
    topic: "AI for Healthcare Delivery",
  },
];

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
