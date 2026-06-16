/**
 * Important dates.
 * Pitch competition dates are from the source document (verbatim).
 * Call-for-papers dates are PLACEHOLDERS (not provided) — see ASSUMPTIONS.md.
 */

export interface ImportantDate {
  date: string; // human label
  iso: string;
  title: string;
  description: string;
  category: "papers" | "registration" | "event" | "pitch";
  done?: boolean;
}

export const importantDates: ImportantDate[] = [
  {
    date: "1 March 2026",
    iso: "2026-03-01",
    title: "Call for Papers Opens",
    description: "Submission portal opens for abstracts and full papers.",
    category: "papers",
  },
  {
    date: "31 May 2026",
    iso: "2026-05-31",
    title: "Abstract Submission Deadline",
    description: "Final date to submit abstracts for peer review.",
    category: "papers",
  },
  {
    date: "30 June 2026",
    iso: "2026-06-30",
    title: "Acceptance Notifications",
    description: "Authors notified of abstract acceptance decisions.",
    category: "papers",
  },
  {
    date: "31 July 2026",
    iso: "2026-07-31",
    title: "Full Paper & Camera-Ready Deadline",
    description: "Final accepted papers due for publication in IJAIT.",
    category: "papers",
  },
  {
    date: "31 August 2026",
    iso: "2026-08-31",
    title: "Early-Bird Registration Closes",
    description: "Last day for discounted registration rates.",
    category: "registration",
  },
  {
    date: "24 – 26 September 2026",
    iso: "2026-09-24",
    title: "ICAFoW 2026 Conference",
    description: "Three days of keynotes, tracks, exhibition and networking at JNICC.",
    category: "event",
  },
];

/** Pitch competition timeline — verbatim from source document. */
export const pitchTimeline: ImportantDate[] = [
  {
    date: "20 June 2026",
    iso: "2026-06-20",
    title: "Applications Open",
    description: "Startup applications open for the ICAFoW Pitch Competition.",
    category: "pitch",
  },
  {
    date: "30 July 2026",
    iso: "2026-07-30",
    title: "Application Deadline",
    description: "Final date to submit your startup application.",
    category: "pitch",
  },
  {
    date: "15 August 2026",
    iso: "2026-08-15",
    title: "Startup Shortlisting",
    description: "Shortlisted startups announced.",
    category: "pitch",
  },
  {
    date: "1 September 2026",
    iso: "2026-09-01",
    title: "Pitch Competition Semi-Finals",
    description: "Semi-final live pitches before the judging panel.",
    category: "pitch",
  },
  {
    date: "25 September 2026",
    iso: "2026-09-25",
    title: "Grand Finale",
    description: "Finalists compete on the main stage for the Innovation Award.",
    category: "pitch",
  },
];
