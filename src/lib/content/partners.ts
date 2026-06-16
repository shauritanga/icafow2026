/**
 * Partners & sponsors — real logos extracted from the embedded images in
 * "ICAFoW 2026_Web Contents.docx" (LIST OF OUR PARTNERS / LIST OF OUR SPONSORS).
 */

export interface OrgLogo {
  name: string;
  logo: string;
}

export const organizer = {
  name: "Africa Research Institute For AI (ARIFA)",
  role: "Host & Organizer",
  description:
    "ARIFA is a pan-African think tank united by a shared commitment to advancing impactful research, training and advisory. Focused on the African continent, ARIFA fosters innovation, facilitates knowledge exchange and drives evidence-based policymaking to tackle the challenges posed by rapid advancements in technology.",
  logo: "/assets/logo-arifa.png",
};

/** Confirmed partners (logos from the source document). */
export const partnerLogos: OrgLogo[] = [
  { name: "ICT Commission", logo: "/assets/partners/ict-commission.png" },
  { name: "Rice Council of Tanzania", logo: "/assets/partners/rice-council-tz.png" },
  { name: "ATER — Association Tunisienne des Énergies Renouvelables", logo: "/assets/partners/ater.png" },
  { name: "Strathmore University", logo: "/assets/partners/strathmore-university.png" },
  { name: "Clouds Media Group", logo: "/assets/partners/clouds-media-group.png" },
  { name: "Elsewedy University of Technology", logo: "/assets/partners/elsewedy-university.png" },
  { name: "TV Koncept", logo: "/assets/partners/tv-koncept.png" },
  { name: "Mtawala Radio", logo: "/assets/partners/mtawala-radio.png" },
  { name: "IEEE Tanzania Subsection", logo: "/assets/partners/ieee-tanzania.png" },
];

/** Confirmed sponsors (logos from the source document). */
export const sponsorLogos: OrgLogo[] = [
  { name: "ARIFA — Africa Research Institute For AI", logo: "/assets/logo-arifa.png" },
  { name: "Devoted (TZ) Co. Ltd", logo: "/assets/partners/devoted-tz.png" },
  { name: "UTT AMIS — Asset Management and Investor Services", logo: "/assets/partners/utt-amis.png" },
  { name: "TTCL Corporation", logo: "/assets/partners/ttcl.png" },
];

export const partnerReasons = [
  "Connect with senior government officials, industry leaders, researchers and innovators",
  "Showcase your commitment to AI, innovation and workforce transformation",
  "Build strategic partnerships across Africa and globally",
  "Increase visibility among key stakeholders and decision-makers",
  "Support the development of responsible and inclusive AI ecosystems",
  "Engage with emerging talent, startups and future leaders",
];
