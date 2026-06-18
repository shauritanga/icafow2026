/** About content — verbatim from the source document. */

export const aboutIntro =
  "The International Conference on AI & the Future of Work (ICAFoW) is a pioneering initiative that harmonizes the dynamic landscape of the future of work with the cutting-edge advancements in Artificial Intelligence. It provides a unique platform to explore, deliberate and strategize the intersection of AI, technology and the evolving nature of work, fostering insightful discussions, showcasing practical applications and catalyzing collaborative efforts to shape a progressive and sustainable future.";

export interface Objective {
  title: string;
  objective: string;
  action: string;
  icon: string;
}

export const objectives: Objective[] = [
  {
    title: "Knowledge Exchange & Exploration",
    objective:
      "Facilitate the exchange of knowledge and ideas among experts in AI and diverse industries.",
    action:
      "Engage in presentations, discussions and workshops to enhance understanding of AI's implications on the future of work.",
    icon: "BookOpen",
  },
  {
    title: "Innovation & Practical Applications",
    objective:
      "Encourage innovation and highlight practical AI applications shaping the future work landscape.",
    action:
      "Showcase case studies, technological innovations and successful AI implementations for automation, performance and cost optimization.",
    icon: "Lightbulb",
  },
  {
    title: "Networking & Collaboration",
    objective:
      "Foster collaboration among thought leaders, decision-makers and technology innovators.",
    action:
      "Facilitate networking opportunities to connect, share experiences and form partnerships that drive innovation.",
    icon: "Network",
  },
  {
    title: "Event Tour",
    objective:
      "Provide participants with a tour to further engage and explore relevant facilities or locations.",
    action:
      "Organize an insightful event tour on the final day, deepening understanding of AI applications in practical settings.",
    icon: "MapPin",
  },
];

export const outcomes = {
  shortTerm: [
    "Enhanced understanding of AI's impact on the future of work",
    "Networking and collaboration opportunities among participants",
    "Identification of potential areas for AI integration in various sectors",
  ],
  longTerm: [
    "Encouraged development and adoption of AI technologies in workplaces and industries",
    "Establishment of long-lasting partnerships and collaborations among stakeholders",
    "Contribution to shaping policies and strategies for responsible AI integration",
  ],
};

/** The six conference thematic areas — verbatim from the source document. */
export interface ThematicArea {
  numeral: string;
  title: string;
  description: string;
  icon: string;
}

export const thematicAreas: ThematicArea[] = [
  {
    numeral: "i",
    title: "AI Integration in Diverse Sectors",
    description:
      "Explore AI applications and advancements in key sectors such as finance, retail, agriculture, healthcare, education, and more.",
    icon: "Network",
  },
  {
    numeral: "ii",
    title: "Data-Driven Insights and Ethics",
    description:
      "Delve into the role of data and ethics in AI, ensuring responsible and transparent data-driven decision-making.",
    icon: "Database",
  },
  {
    numeral: "iii",
    title: "Technological Innovations and Use Cases",
    description:
      "Showcase emerging technologies and their applications through real-world use cases presented by industry pioneers.",
    icon: "Lightbulb",
  },
  {
    numeral: "iv",
    title: "Policy, Regulation, and Governance",
    description:
      "Discuss the need for informed policies and regulations to guide the responsible adoption of AI technologies.",
    icon: "Scale",
  },
  {
    numeral: "v",
    title: "Gig Economy, Diversity, and Inclusion",
    description:
      "Explore AI's impact on the gig economy, workplace diversity, and digital inclusion to create equitable opportunities.",
    icon: "Users",
  },
  {
    numeral: "vi",
    title: "Remote Work, Cybersecurity, and the Future of Work",
    description:
      "Discover how AI shapes remote work, cybersecurity measures, and the future job landscape in a rapidly evolving world.",
    icon: "ShieldCheck",
  },
];

/** "Why Attend?" benefits — verbatim from the source document. */
export interface AttendBenefit {
  title: string;
  description: string;
  icon: string;
}

export const whyAttend: AttendBenefit[] = [
  {
    title: "Meet Masters in AI",
    description:
      "Actively engage with leading global experts and visionary innovators in the dynamic and evolving field of Artificial Intelligence.",
    icon: "Users",
  },
  {
    title: "Stay Ahead of the Curve",
    description:
      "Learn about the latest technological trends and cutting-edge advancements in AI to keep your skills relevant and up-to-date.",
    icon: "TrendingUp",
  },
  {
    title: "Global Networking Opportunities",
    description:
      "Connect with international speakers and attendees for potential collaborations.",
    icon: "Globe",
  },
];
