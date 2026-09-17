import Link from "next/link";
import { notFound } from "next/navigation";
import { divisions, type Division } from "@/lib/site";
import { Breadcrumb } from "@/components/shared";
import { publishedInsights } from "@/lib/public-content";

export async function generateStaticParams() {
  return (await Promise.all(
    divisions.map(async (division) => {
      const insights = await publishedInsights(division);
      return insights.map((item) => ({ division, slug: item.slug }));
    }),
  )).flat();
}

export const dynamicParams = true;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; division: string }>;
}) {
  const { slug, division } = await params;
  const databaseItems = await publishedInsights(division as Division);
  const item = databaseItems.find((i) => i.slug === slug);
  return item
    ? {
        title: item.title,
        description: item.summary,
        alternates: { canonical: `/${division}/insights/${slug}` },
      }
    : {};
}
export default async function Insight({
  params,
}: {
  params: Promise<{ slug: string; division: string }>;
}) {
  const { slug, division } = await params;
  const databaseItems = await publishedInsights(division as Division);
  const item = databaseItems.find((i) => i.slug === slug);
  if (!item || !divisions.includes(division as Division)) notFound();
  return (
    <main id="main" className="page-container">
      <Breadcrumb division={division as Division} label="Insights" />
      <article className="insight-article">
        <span className="eyebrow">
          {item.category} · {item.date}
        </span>
        <h1>{item.title}</h1>
        <p>By {item.author}</p>
        <p className="story-lead">{item.summary}</p>
        {item.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {item.externalUrl && (
          <a
            className="text-link"
            href={item.externalUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Read the original paper ↗
          </a>
        )}
      </article>
      <Link href={`/${division}/insights`} className="text-link">
        ← Back to insights
      </Link>
    </main>
  );
}
