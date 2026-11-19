import Link from "next/link";
import { notFound } from "next/navigation";
import { divisions, type Division } from "@/lib/site";
import { Breadcrumb } from "@/components/shared";
import { publishedInsights } from "@/lib/public-content";
import { ArticleStructuredData, BreadcrumbStructuredData } from "@/components/seo";
import { siteUrl } from "@/lib/site";
import { decodedArticle } from "@/content/decoded-01";
import {
  DecodedArticle,
  decodedSocialImage,
} from "@/components/decoded-article";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const databaseParams = (await Promise.all(
    divisions.map(async (division) => {
      try {
        const insights = await publishedInsights(division);
        return insights
          .filter(
            (item) =>
              division !== "asset-management" ||
              item.slug !== decodedArticle.slug,
          )
          .map((item) => ({ division, slug: item.slug }));
      } catch {
        return [];
      }
    }),
  )).flat();
  return [
    ...databaseParams,
    { division: "asset-management", slug: decodedArticle.slug },
  ];
}

export const dynamicParams = true;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; division: string }>;
}): Promise<Metadata> {
  const { slug, division } = await params;
  if (
    division === "asset-management" &&
    slug === decodedArticle.slug
  ) {
    const url = `${siteUrl}/asset-management/insights/${decodedArticle.slug}`;
    return {
      title: decodedArticle.title,
      description: decodedArticle.metaDescription,
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        title: decodedArticle.title,
        description: decodedArticle.metaDescription,
        url,
        siteName: "Dreniak",
        publishedTime: "2026-11",
        authors: ["Dreniak Limited"],
        images: [
          {
            url: decodedSocialImage,
            width: 1200,
            height: 630,
            alt: decodedArticle.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: decodedArticle.title,
        description: decodedArticle.metaDescription,
        images: [{ url: decodedSocialImage, alt: decodedArticle.title }],
      },
      ...(process.env.VERCEL_ENV === "preview"
        ? { robots: { index: false, follow: false } }
        : {}),
    };
  }
  if (!divisions.includes(division as Division)) return {};
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
  if (
    division === "asset-management" &&
    slug === decodedArticle.slug
  ) {
    return (
      <>
        <BreadcrumbStructuredData
          division="asset-management"
          label="Insights"
        />
        <ArticleStructuredData
          headline={decodedArticle.title}
          description={decodedArticle.metaDescription}
          url={`${siteUrl}/asset-management/insights/${decodedArticle.slug}`}
          datePublished="2026-11"
          author="Dreniak Limited"
          authorType="Organization"
          image={`${siteUrl}${decodedSocialImage}`}
        />
        <DecodedArticle />
      </>
    );
  }
  if (!divisions.includes(division as Division)) notFound();
  const databaseItems = await publishedInsights(division as Division);
  const item = databaseItems.find((i) => i.slug === slug);
  if (!item || !divisions.includes(division as Division)) notFound();
  return (
    <>
      <BreadcrumbStructuredData
        division={division as Division}
        label="Insights"
      />
      <ArticleStructuredData
        headline={item.title}
        description={item.summary}
        url={`${siteUrl}/${division}/insights/${slug}`}
        datePublished={item.date}
        author={item.author}
      />
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
    </>
  );
}
