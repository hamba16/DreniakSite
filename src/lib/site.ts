import { engineering } from "@/content/engineering";
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
export const engineeringPages = ["careers", "consultation"] as const;
export type PageName =
  (typeof pages)[number] | (typeof engineeringPages)[number];
export function getPages(division: Division): PageName[] {
  return division === "engineering"
    ? [...pages, ...engineeringPages]
    : [...pages];
}
export const names = {
  engineering: "Engineering",
  "asset-management": "Asset Management",
};
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://dreniak.com";
export const engineeringServices = engineering.services;
export const pageTitles: Record<PageName, string> = {
  careers: "Careers",
  consultation: "Book a Consultation",
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
  category:
    | "Industry insights"
    | "Project updates"
    | "Industry papers"
    | (typeof engineering.insightCategories)[number];
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
