export type Division = "engineering" | "asset-management";
export const divisions: Division[] = ["engineering", "asset-management"];
export const pages = [
  "about",
  "approach",
  "services",
  "sectors",
  "projects",
  "insights",
  "contact",
  "standards",
] as const;
export type PageName = (typeof pages)[number];
export const names = {
  engineering: "Engineering",
  "asset-management": "Asset Management",
};
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://dreniak.com";
export const engineeringServices = [
  {
    name: "Site assessment",
    description: "Understand the site before the first decision is made.",
    includes: ["Site assessment", "Planning and regulatory compliance"],
    value: "A considered foundation for project delivery.",
  },
  {
    name: "Design integration",
    description:
      "Connect the design intent with the practical demands of delivery.",
    includes: ["Design integration", "Engineering standards"],
    value: "Engineering considered as one connected process.",
  },
  {
    name: "Construction management",
    description: "Coordinate physical delivery throughout construction.",
    includes: [
      "Construction logistics",
      "Progress monitoring",
      "Safety, quality and engineering standards",
    ],
    value: "Build. Connect. Deliver.",
  },
  {
    name: "Post-construction support",
    description: "Support infrastructure beyond completion.",
    includes: [
      "Documentation",
      "Compliance reporting",
      "Asset management handover",
      "Infrastructure maintenance",
    ],
    value: "A considered transition from construction to operation.",
  },
];
export const pageTitles: Record<PageName, string> = {
  about: "Our story",
  approach: "Our approach",
  services: "Our services",
  sectors: "Sectors we serve",
  projects: "Projects",
  insights: "Insights",
  contact: "Start a conversation",
  standards: "Standards & governance",
};
export interface Insight {
  slug: string;
  title: string;
  category: "Industry insights" | "Project updates" | "Industry papers";
  date: string;
  summary: string;
  body: string[];
  externalUrl?: string;
  author: string;
}
export const insights: Insight[] = [];
export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}
export const testimonials: Testimonial[] = [];
export const socialLinks = [
  { name: "Instagram", href: "https://www.instagram.com/dreniak_limited/" },
  { name: "Facebook", href: "https://www.facebook.com/dreniak_limited/" },
];
