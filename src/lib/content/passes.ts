/**
 * Conference registration passes — prices & benefits extracted verbatim from
 * the pass artwork (Delegate/Researcher/VIP/VVIP/Safari PNGs).
 */

export type PassId =
  | "virtual"
  | "delegate"
  | "researcher"
  | "vip"
  | "vvip"
  | "safari";

export interface Pass {
  id: PassId;
  name: string;
  subtitle: string;
  priceUSD: number;
  tagline: string;
  badge?: string;
  highlight?: boolean;
  accent: "maroon" | "green" | "gold";
  ctaLabel: string;
  image: string;
  /** Whether this is the standalone add-on (safari) vs a conference pass. */
  standalone?: boolean;
  features: string[];
}

export const passes: Pass[] = [
  {
    id: "virtual",
    name: "Virtual Pass",
    subtitle: "Online Conference Access",
    priceUSD: 0.5,
    tagline: "Ideal for students and professionals looking to participate in the conference virtually from anywhere.",
    accent: "green",
    ctaLabel: "Register Now",
    image: "/assets/pass-delegate.png", // Fallback to delegate image
    features: [
      "Access to live streams of main conference sessions",
      "Digital conference materials",
      "Virtual networking opportunities",
      "E-Certificate of Participation",
    ],
  },
  {
    id: "delegate",
    name: "Delegate Pass",
    subtitle: "Access the Main Conference",
    priceUSD: 200,
    tagline: "Full access to the three-day conference programme.",
    accent: "maroon",
    ctaLabel: "Register Now",
    image: "/assets/pass-delegate.png",
    features: [
      "Full access to all conference sessions",
      "Keynote presentations and panel discussions",
      "Industry case studies and exhibitions",
      "Conference materials and delegate kit",
      "Networking opportunities",
      "Refreshments and lunch",
      "Certificate of Participation",
    ],
  },
  {
    id: "researcher",
    name: "Researcher Pass",
    subtitle: "Delegate Pass + Paper Presentation & Publication",
    priceUSD: 300,
    tagline:
      "Ideal for researchers, academics, students and practitioners presenting and publishing papers.",
    badge: "Most Popular",
    highlight: true,
    accent: "green",
    ctaLabel: "Register Now",
    image: "/assets/pass-researcher.png",
    features: [
      "All Delegate Pass benefits",
      "Present an accepted paper at ICAFoW 2026",
      "Peer review process for submitted papers",
      "Publication fee included for accepted papers",
      "Publication in the International Journal of Artificial Intelligence and Technology (IJAIT)",
      "Conference Presentation Certificate",
      "Enhanced visibility among researchers and industry stakeholders",
    ],
  },
  {
    id: "vip",
    name: "VIP Business Pass",
    subtitle: "Delegate Pass + AI for Business Growth Training",
    priceUSD: 400,
    tagline:
      "Designed for entrepreneurs, executives, managers and consultants leveraging AI for business growth.",
    accent: "maroon",
    ctaLabel: "Register Now",
    image: "/assets/pass-vip.png",
    features: [
      "All Delegate Pass benefits",
      "Participation in AI for Business Growth Training",
      "Practical AI tools and demonstrations",
      "Business transformation and productivity strategies",
      "Industry case studies",
      "Training resources and materials",
      "Training Certificate",
    ],
  },
  {
    id: "vvip",
    name: "VVIP Executive Leadership Pass",
    subtitle: "Delegate Pass + AI for Leaders Masterclass",
    priceUSD: 700,
    tagline:
      "An exclusive package for CEOs, directors, board members, senior government officials, policymakers and diplomats.",
    badge: "Premium",
    accent: "gold",
    ctaLabel: "Register Now",
    image: "/assets/pass-vvip.png",
    features: [
      "All Delegate Pass benefits",
      "Exclusive participation in AI for Leaders Masterclass",
      "AI Strategy, Governance & Policy Frameworks",
      "Executive-level networking opportunities",
      "Priority seating during conference sessions",
      "Access to exclusive leadership discussions and engagements",
      "Executive Leadership Certificate",
    ],
  },
  {
    id: "safari",
    name: "Safari Experience Pass",
    subtitle: "Optional Standalone Package",
    priceUSD: 450,
    tagline:
      "Experience Tanzania's world-renowned wildlife and natural beauty on an unforgettable safari adventure.",
    badge: "Add-on",
    accent: "green",
    standalone: true,
    ctaLabel: "Book Safari",
    image: "/assets/pass-safari.png",
    features: [
      "Return transportation from Dar es Salaam",
      "National park entrance fees",
      "Professional tour guide services",
      "Refreshments and lunch",
      "Wildlife viewing and photography opportunities",
      "Networking with fellow conference participants in an informal setting",
    ],
  },
];

export const getPass = (id: PassId) => passes.find((p) => p.id === id);
