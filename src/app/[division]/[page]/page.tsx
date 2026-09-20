import { engineering } from "@/content/engineering";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DivisionPage, AssessmentPage } from "@/components/division-pages";
import { Breadcrumb, CTA } from "@/components/shared";
import {
  divisions,
  getPages,
  pageTitles,
  names,
  type Division,
  type PageName,
} from "@/lib/site";
export const dynamicParams = false;
export function generateStaticParams() {
  return [
    ...divisions.flatMap((division) =>
      getPages(division).map((page) => ({ division, page })),
    ),
    { division: "asset-management", page: "assessment" },
  ];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ division: string; page: string }>;
}): Promise<Metadata> {
  const { division, page } = await params;
  if (!divisions.includes(division as Division)) return {};
  const title = `${page === "assessment" ? "Asset Management Maturity Assessment" : pageTitles[page as PageName] || "Page"} — ${names[division as Division]}`;
  const description =
    division === "engineering"
      ? engineering.description
      : `${title}. Infrastructure asset management, lifecycle planning and economic value for organisations across East Africa and the UK.`;
  return {
    title,
    description,
    ...(division === "engineering" ? { keywords: engineering.keywords } : {}),
    alternates: { canonical: `/${division}/${page}` },
    openGraph: { title, description, images: [`/og/${division}`] },
    twitter: { images: [`/og/${division}`] },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ division: string; page: string }>;
}) {
  const { division, page } = await params;
  if (
    !divisions.includes(division as Division) ||
    (!getPages(division as Division).includes(page as PageName) &&
      !(division === "asset-management" && page === "assessment"))
  )
    notFound();
  return (
    <main id="main">
      <div className="page-container">
        <Breadcrumb
          division={division as Division}
          label={
            page === "assessment"
              ? "Maturity assessment"
              : pageTitles[page as PageName]
          }
        />
        {page === "assessment" ? (
          <AssessmentPage />
        ) : (
          <DivisionPage
            division={division as Division}
            page={page as PageName}
          />
        )}
      </div>
      {page !== "contact" && page !== "consultation" && (
        <CTA division={division as Division} />
      )}
    </main>
  );
}
