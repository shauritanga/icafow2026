/**
 * Exhibition booth packages — extracted verbatim from the ICAFoW 2026
 * exhibition content (docx) and Booth Registration artwork.
 */

export type BoothId = "innovation" | "leadership";

export interface Booth {
  id: BoothId;
  name: string;
  size: string;
  priceUSD: number;
  priceTZS: number;
  audience: string;
  highlight?: boolean;
  features: string[];
}

export const booths: Booth[] = [
  {
    id: "innovation",
    name: "Innovation Booth",
    size: "3m × 3m",
    priceUSD: 1500,
    priceTZS: 4_000_000,
    audience:
      "Perfect for startups, SMEs, universities, research institutions and organizations showcasing innovative AI solutions.",
    features: [
      "3m × 3m shell exhibition booth",
      "Branded fascia board",
      "1 table and 2 chairs",
      "Spotlights and power socket",
      "Company profile listed on the ICAFoW 2026 website",
      "2 Delegate Passes for company representatives",
      "Direct engagement with policymakers, investors and industry leaders",
      "Opportunity to showcase AI solutions, products and innovations",
    ],
  },
  {
    id: "leadership",
    name: "Leadership Booth",
    size: "3m × 6m",
    priceUSD: 2300,
    priceTZS: 6_000_000,
    audience:
      "Designed for established organizations, technology providers, corporations and development partners seeking maximum visibility.",
    highlight: true,
    features: [
      "3m × 6m shell exhibition booth in a premium location",
      "Branded fascia board",
      "2 tables and 4 chairs",
      "Spotlights and power sockets",
      "65-inch display screen",
      "Premium logo placement on the ICAFoW 2026 website",
      "4 Delegate Passes for company representatives",
      "Featured exhibitor recognition during the conference",
      "Opportunity for product demonstrations and live showcases",
      "3 dedicated social media mentions across ICAFoW platforms",
      "Company profile featured in the official conference programme",
      "Enhanced networking with investors, policymakers and partners",
    ],
  },
];

export const exhibitBenefits = [
  { title: "Showcase your AI solutions and innovations", icon: "Sparkles" },
  { title: "Connect with potential clients, partners and investors", icon: "Handshake" },
  { title: "Increase brand visibility and thought leadership", icon: "TrendingUp" },
  { title: "Demonstrate cutting-edge technologies and products", icon: "Cpu" },
  { title: "Engage with policymakers, industry leaders and researchers", icon: "Users" },
  { title: "Generate new business and collaboration opportunities", icon: "Briefcase" },
];

export const getBooth = (id: BoothId) => booths.find((b) => b.id === id);
