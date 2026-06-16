/**
 * Program overview.
 * PLACEHOLDER CONTENT: high-level three-day structure derived from the stated
 * objectives and event tour. Detailed agenda to be confirmed — ASSUMPTIONS.md.
 */

export interface ProgramDay {
  day: string;
  date: string;
  theme: string;
  highlights: { time: string; title: string; type: "keynote" | "session" | "break" | "networking" | "special" }[];
}

export const program: ProgramDay[] = [
  {
    day: "Day 1",
    date: "24 September 2026",
    theme: "Opening & Foundations of AI in Africa",
    highlights: [
      { time: "08:00", title: "Registration & welcome coffee", type: "break" },
      { time: "09:30", title: "Opening ceremony & ministerial keynote", type: "keynote" },
      { time: "11:00", title: "Plenary: AI & the Future of Work", type: "session" },
      { time: "13:00", title: "Networking lunch & exhibition", type: "networking" },
      { time: "14:30", title: "Parallel track sessions", type: "session" },
      { time: "17:00", title: "Welcome reception", type: "networking" },
    ],
  },
  {
    day: "Day 2",
    date: "25 September 2026",
    theme: "Innovation, Industry & Investment",
    highlights: [
      { time: "09:00", title: "Keynote: Generative AI in the enterprise", type: "keynote" },
      { time: "10:30", title: "Parallel track sessions & workshops", type: "session" },
      { time: "13:00", title: "Networking lunch & exhibition", type: "networking" },
      { time: "14:30", title: "AI for Business & Leaders masterclasses", type: "special" },
      { time: "16:00", title: "Pitch Competition semi-finals", type: "special" },
      { time: "19:00", title: "Gala dinner & awards", type: "networking" },
    ],
  },
  {
    day: "Day 3",
    date: "26 September 2026",
    theme: "Impact, Policy & Event Tour",
    highlights: [
      { time: "09:00", title: "Keynote: AI governance & policy", type: "keynote" },
      { time: "10:30", title: "Research paper presentations", type: "session" },
      { time: "12:00", title: "Pitch Competition grand finale & Innovation Award", type: "special" },
      { time: "13:30", title: "Closing ceremony & resolutions", type: "keynote" },
      { time: "15:00", title: "Event tour", type: "special" },
    ],
  },
];
