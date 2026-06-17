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

// "Get Involved" links point to the on-page sections whose CTAs open the
// registration modals (forms are modals now, not separate pages).
export const registrationRoutes = [
  { type: "attendee", label: "Attendee / Author", href: "#registration" },
  { type: "sponsor", label: "Sponsor", href: "#sponsorship" },
  { type: "exhibitor", label: "Exhibitor", href: "#exhibition" },
  { type: "partner", label: "Partner", href: "#partners" },
  { type: "speaker", label: "Speaker", href: "#speakers" },
  { type: "pitch", label: "Pitch Competition", href: "#pitch" },
] as const;
