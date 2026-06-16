export interface NavItem {
  label: string;
  href: string;
}

/** Anchor navigation — mirrors the 8 sections of the source content document. */
export const navItems: NavItem[] = [
  { label: "About", href: "#about" },
  { label: "Register", href: "#registration" },
  { label: "Exhibit", href: "#exhibition" },
  { label: "Sponsors", href: "#sponsorship" },
  { label: "Partners", href: "#partners" },
  { label: "Speakers", href: "#speakers" },
  { label: "Pitch", href: "#pitch" },
  { label: "Contact", href: "#contact" },
];

export const registrationRoutes = [
  { type: "attendee", label: "Attendee / Author", href: "/register/attendee" },
  { type: "sponsor", label: "Sponsor", href: "/register/sponsor" },
  { type: "exhibitor", label: "Exhibitor", href: "/register/exhibitor" },
  { type: "partner", label: "Partner", href: "/register/partner" },
  { type: "speaker", label: "Speaker", href: "/register/speaker" },
  { type: "pitch", label: "Pitch Competition", href: "/register/pitch" },
] as const;
