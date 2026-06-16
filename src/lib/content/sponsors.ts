/**
 * Sponsorship tiers.
 * PLACEHOLDER CONTENT: the source document describes tailored sponsorship but
 * does not enumerate tiers or prices. Structure & pricing below are reasonable
 * professional defaults — see ASSUMPTIONS.md. Client to confirm before launch.
 */

export type SponsorTierId =
  | "platinum"
  | "gold"
  | "silver"
  | "bronze"
  | "strategic";

export interface SponsorTier {
  id: SponsorTierId;
  name: string;
  priceUSD: number | null; // null = "by negotiation"
  accent: "gold" | "maroon" | "green";
  highlight?: boolean;
  summary: string;
  benefits: string[];
  slots?: string;
}

export const sponsorTiers: SponsorTier[] = [
  {
    id: "strategic",
    name: "Strategic Partner",
    priceUSD: null,
    accent: "maroon",
    summary:
      "Co-host level partnership with headline branding and a shaping role in the conference agenda.",
    slots: "Limited — by invitation",
    benefits: [
      "Headline “In partnership with” branding across all event assets",
      "Keynote speaking slot on the main stage",
      "Seat on the ICAFoW 2026 advisory committee",
      "Premium 3m × 6m exhibition booth",
      "10 VVIP Executive passes",
      "Dedicated press release and media coverage",
      "Year-round visibility on ARIFA platforms",
    ],
  },
  {
    id: "platinum",
    name: "Platinum Sponsor",
    priceUSD: 30000,
    accent: "gold",
    highlight: true,
    summary:
      "Maximum visibility and thought-leadership positioning before, during and after the conference.",
    slots: "3 available",
    benefits: [
      "Premium logo placement on stage backdrop & website hero",
      "Panel or plenary speaking opportunity",
      "Leadership exhibition booth (3m × 6m)",
      "6 VVIP Executive passes",
      "Full-page profile in the conference programme",
      "5 social media features across ICAFoW platforms",
      "Branded delegate kit insert",
    ],
  },
  {
    id: "gold",
    name: "Gold Sponsor",
    priceUSD: 18000,
    accent: "maroon",
    summary:
      "High-impact brand presence with strong networking and exhibition benefits.",
    slots: "5 available",
    benefits: [
      "Logo on website, programme and event signage",
      "Breakout session speaking opportunity",
      "Innovation exhibition booth (3m × 3m)",
      "4 VIP Business passes",
      "Half-page profile in the conference programme",
      "3 social media features",
    ],
  },
  {
    id: "silver",
    name: "Silver Sponsor",
    priceUSD: 9000,
    accent: "green",
    summary: "Solid brand visibility and access to a high-value audience.",
    slots: "8 available",
    benefits: [
      "Logo on website and event signage",
      "2 Delegate passes",
      "Quarter-page profile in the conference programme",
      "2 social media features",
      "Access to networking sessions",
    ],
  },
  {
    id: "bronze",
    name: "Bronze Sponsor",
    priceUSD: 4500,
    accent: "green",
    summary: "An accessible entry point to associate your brand with ICAFoW 2026.",
    benefits: [
      "Logo on website sponsors page",
      "1 Delegate pass",
      "Listing in the conference programme",
      "1 social media mention",
    ],
  },
];

export const sponsorReasons = [
  "Connect with senior government officials, industry leaders, researchers and innovators",
  "Showcase your commitment to AI, innovation and workforce transformation",
  "Build strategic partnerships across Africa and globally",
  "Increase visibility among key stakeholders and decision-makers",
  "Support the development of responsible and inclusive AI ecosystems",
  "Engage with emerging talent, startups and future leaders",
];

export const getSponsorTier = (id: SponsorTierId) =>
  sponsorTiers.find((t) => t.id === id);
