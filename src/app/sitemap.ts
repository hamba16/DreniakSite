import type { MetadataRoute } from "next";
import { divisions, getPages, siteUrl } from "@/lib/site";
import { publishedInsights, publishedCaseStudies } from "@/lib/public-content";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const databaseInsights = (await Promise.all(divisions.map(async (division) => {
    try {
      return (await publishedInsights(division)).map((item) => `/${division}/insights/${item.slug}`);
    } catch {
      return [];
    }
  }))).flat();
  const projects = await publishedCaseStudies("asset-management");
  return [
    "",
    "/story",
    "/privacy",
    "/asset-management/assessment",
    ...projects.map(project => `/asset-management/projects/${project.slug}`),
    ...divisions.flatMap((d) => [
      `/${d}`,
      ...getPages(d).map((p) => `/${d}/${p}`),
      ...databaseInsights.filter((path) => path.startsWith(`/${d}/`)),
    ]),
  ].map((p) => ({
    url: `${siteUrl}${p}`,
    changeFrequency: p.includes("insights") ? "monthly" : "yearly",
    priority: p === "" ? 1 : p.split("/").length === 2 ? 0.9 : 0.7,
  }));
}
