import type { MetadataRoute } from "next";
import { divisions, getPages, siteUrl, insights } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/story",
    "/privacy",
    "/asset-management/assessment",
    ...divisions.flatMap((d) => [
      `/${d}`,
      ...getPages(d).map((p) => `/${d}/${p}`),
      ...insights.map((i) => `/${d}/insights/${i.slug}`),
    ]),
  ].map((p) => ({
    url: `${siteUrl}${p}`,
    changeFrequency: p.includes("insights") ? "monthly" : "yearly",
    priority: p === "" ? 1 : p.split("/").length === 2 ? 0.9 : 0.7,
  }));
}
