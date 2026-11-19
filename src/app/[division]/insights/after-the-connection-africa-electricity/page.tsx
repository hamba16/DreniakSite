import { ArticleStructuredData, BreadcrumbStructuredData } from "@/components/seo";
import {
  DecodedArticle,
  decodedSocialImage,
} from "@/components/decoded-article";
import { decodedArticle } from "@/content/decoded-01";
import { siteUrl } from "@/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const articleUrl = `${siteUrl}/asset-management/insights/${decodedArticle.slug}`;

export function generateStaticParams() {
  return [{ division: "asset-management" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ division: string }>;
}): Promise<Metadata> {
  const { division } = await params;
  if (division !== "asset-management") return {};

  return {
    title: decodedArticle.title,
    description: decodedArticle.metaDescription,
    alternates: { canonical: articleUrl },
    openGraph: {
      type: "article",
      title: decodedArticle.title,
      description: decodedArticle.metaDescription,
      url: articleUrl,
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

export default async function DecodedInsightPage({
  params,
}: {
  params: Promise<{ division: string }>;
}) {
  const { division } = await params;
  if (division !== "asset-management") notFound();

  return (
    <>
      <BreadcrumbStructuredData
        division="asset-management"
        label="Insights"
      />
      <ArticleStructuredData
        headline={decodedArticle.title}
        description={decodedArticle.metaDescription}
        url={articleUrl}
        datePublished="2026-11"
        author="Dreniak Limited"
        authorType="Organization"
        image={`${siteUrl}${decodedSocialImage}`}
      />
      <DecodedArticle />
    </>
  );
}
