/**
 * Global site configuration and conference facts.
 * Extracted from "ICAFoW 2026_Web Contents.docx". Values not present in the
 * source (e.g. contact email/phone) are placeholders — see ASSUMPTIONS.md.
 */

export const siteConfig = {
  name: "ICAFoW 2026",
  longName: "International Conference on AI & the Future of Work",
  tagline: "Where AI Meets the Future of Work in Africa",
  description:
    "ICAFoW 2026 is a pioneering pan-African conference harmonizing the future of work with cutting-edge advancements in Artificial Intelligence. 24–26 September 2026, JNICC, Dar es Salaam, Tanzania.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://icafow.org",
  host: "Africa Research Institute For AI (ARIFA)",
  hostShort: "ARIFA",

  dates: {
    label: "24 – 26 September 2026",
    start: "2026-09-24",
    end: "2026-09-26",
    startISO: "2026-09-24T08:00:00+03:00",
    endISO: "2026-09-26T18:00:00+03:00",
  },

  venue: {
    name: "Julius Nyerere International Convention Centre (JNICC)",
    short: "JNICC",
    city: "Dar es Salaam",
    country: "Tanzania",
    address: "Shaaban Robert Street, Dar es Salaam, Tanzania",
  },

  // Contact details from the source document. Note: the doc states the office
  // address moved from "YMCA Building, Upanga Road" to "Brown Close, Old
  // Bagamoyo Road"; the P.O. Box, phone and email remain as below.
  contact: {
    organization: "Africa Research Institute For AI (ARIFA)",
    address: "Brown Close, Old Bagamoyo Road, Dar es Salaam, Tanzania",
    poBox: "P.O. Box 2512, Dar es Salaam, Tanzania",
    email: "conference@arifa.org",
    phone: "+255 794 755 650",
    whatsapp: "+255 794 755 650",
    hours: "Mon – Fri: 8:00 AM – 5:00 PM",
    // Google Maps embed (no API key required) — ARIFA, Old Bagamoyo Road, Dar es Salaam.
    mapEmbedUrl:
      "https://www.google.com/maps?q=Africa+Research+Institute+For+AI+ARIFA+Old+Bagamoyo+Road+Dar+es+Salaam&output=embed",
  },

  socials: {
    twitter: "https://twitter.com/arifa_ai",
    linkedin: "https://www.linkedin.com/company/arifa-ai",
    facebook: "https://facebook.com/arifa.ai",
    instagram: "https://instagram.com/arifa.ai",
    youtube: "https://youtube.com/@arifa-ai",
    tiktok: "https://www.tiktok.com/ARIFA_AI",
  },

  stats: [
    { value: "100+", label: "Speakers" },
    { value: "50+", label: "Corporate Partners" },
    { value: "10", label: "Tracks" },
    { value: "1000+", label: "Attendees" },
    { value: "50+", label: "Exhibitors" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
