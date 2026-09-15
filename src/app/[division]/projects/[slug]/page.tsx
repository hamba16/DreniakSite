import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/shared";
import { assetManagementFeaturedProjects } from "@/content/project-case-studies";
import { publishedCaseStudies } from "@/lib/public-content";
import { divisions, type Division } from "@/lib/site";

export function generateStaticParams() {
  return divisions.flatMap((division) =>
    division === "asset-management"
      ? assetManagementFeaturedProjects.map((study) => ({
          division,
          slug: study.slug,
        }))
      : [],
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ division: string; slug: string }>;
}): Promise<Metadata> {
  const { division, slug } = await params;
  if (!divisions.includes(division as Division)) return {};

  const study = (await publishedCaseStudies(division as Division)).find(
    (item) => item.slug === slug,
  );

  if (!study) return {};

  return {
    title: study.title,
    description: study.summary,
    alternates: { canonical: `/${division}/projects/${slug}` },
  };
}

export default async function ProjectCaseStudyPage({
  params,
}: {
  params: Promise<{ division: string; slug: string }>;
}) {
  const { division, slug } = await params;
  const allowedDivision = division as Division;

  if (!divisions.includes(allowedDivision) || allowedDivision !== "asset-management") {
    notFound();
  }

  const studies = await publishedCaseStudies(allowedDivision);
  const study = studies.find((item) => item.slug === slug);

  if (!study) notFound();

  return (
    <main id="main" className="page-container">
      <Breadcrumb division={allowedDivision} label="Projects" />
      <article className="case-study-article">
        <div className="case-study-meta-top">
          <span className="eyebrow">
            {study.sector} · {study.location}
          </span>
          {study.status && <span className="eyebrow">{study.status}</span>}
        </div>
        <h1>{study.title}</h1>
        <p className="case-study-subtitle">{study.subtitle}</p>
        {study.client && <p className="case-study-client">{study.client}</p>}
        {study.role && <p className="case-study-role">{study.role}</p>}
        {study.capability && (
          <p className="case-study-capability">{study.capability}</p>
        )}
        {study.sectorLink ? (
          <div className="case-study-tags">
            <Link href={study.sectorLink} className="text-link">
              {study.sector}
            </Link>
            <span>{study.location}</span>
          </div>
        ) : (
          <div className="case-study-tags">
            <span>{study.sector}</span>
            <span>{study.location}</span>
          </div>
        )}
        <p className="case-study-opening">“{study.opening}”</p>

        {study.serviceLinks && study.serviceLinks.length > 0 && (
          <div className="case-study-links">
            {study.serviceLinks.map((item) => (
              <Link key={item.label} href={item.href} className="text-link">
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {study.sections.map((section) => (
          <section key={section.id} className="case-study-section">
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph, index) => (
              <p key={`${section.id}-${index}`}>{paragraph}</p>
            ))}
            {section.subsections && (
              <div className="case-study-subsections">
                {section.subsections.map((subsection) => (
                  <div key={subsection.heading} className="case-study-subsection">
                    <h3>{subsection.heading}</h3>
                    {subsection.paragraphs.map((paragraph, index) => (
                      <p key={`${subsection.heading}-${index}`}>{paragraph}</p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </article>
      <div className="case-study-backlink">
        <Link href="/asset-management/projects" className="text-link">
          ← Back to projects
        </Link>
      </div>
    </main>
  );
}
