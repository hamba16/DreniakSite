import { ImageCollection } from "@/components/image-collection";
import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowUpRight,
  Building2,
  Mail,
  Network,
  Phone,
  Wrench,
} from "lucide-react";
import { Header } from "@/components/interactions";
import { Footer } from "@/components/shared";
import { Mark, Motif } from "@/components/brand";
import { ProjectLabel } from "@/components/project-label";
import {
  partnerCategoryDefaults,
  partnerIntroduction,
  withApprovedPartners,
} from "@/content/partners";
import { publishedPartners, type PublishedPartner } from "@/lib/public-content";
import styles from "./partners.module.css";

export const metadata: Metadata = {
  title: "Partners",
  description:
    "Dreniak’s partner directory, structured for service providers and contractors across both company divisions.",
  alternates: { canonical: "/partners" },
};

function categoryKey(value: string) {
  return value.trim().toLocaleLowerCase();
}

function categoryId(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const categoryIcons: Record<string, typeof Wrench> = {
  "service providers": Wrench,
  contractors: Building2,
};

function safeWebsite(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

function PartnerCard({ partner }: { partner: PublishedPartner }) {
  const website = safeWebsite(partner.link);
  const Icon = categoryIcons[categoryKey(partner.category)] ?? Network;

  return (
    <article className={styles.partnerCard}>
      {partner.logo && (
        <div className={styles.partnerLogo}>
          <Image
            src={partner.logo.src}
            alt={partner.logo.alt}
            width={180}
            height={96}
            sizes="(max-width: 760px) 80vw, 32vw"
          />
        </div>
      )}
      {partner.category && <ProjectLabel kind="category">
        <Icon size={13} aria-hidden="true" />
        {partner.category}
      </ProjectLabel>}
      <h3>
        {website ? (
          <a href={website} target="_blank" rel="noopener noreferrer">
            {partner.name} <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        ) : (
          partner.name
        )}
      </h3>
      {partner.description && <p>{partner.description}</p>}
    </article>
  );
}

export default async function PartnersPage() {
  let partners: PublishedPartner[] = [];
  let unavailable = false;
  try {
    partners = await publishedPartners();
  } catch {
    unavailable = true;
  }
  partners = withApprovedPartners(partners);

  const categories: string[] = [...partnerCategoryDefaults];
  for (const partner of partners) {
    const category = partner.category.trim() || "Partners";
    if (
      category &&
      !categories.some((existing) => categoryKey(existing) === categoryKey(category))
    ) {
      categories.push(category);
    }
  }

  return (
    <>
      <Header />
      <main id="main" className={styles.page}>
        <div className={styles.container}>
          <section className={styles.hero} aria-labelledby="partners-title">
            <Motif flow density={180} className={styles.heroMotif} />
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}>ONE COMPANY · SHARED WORK</span>
              <h1 id="partners-title">Partners</h1>
              <p data-editorial-status={partnerIntroduction.editorialStatus}>
                {partnerIntroduction.text}
              </p>
            </div>
          </section>

          <div className={styles.groups}>
            {categories.map((category) => {
              const Icon = categoryIcons[categoryKey(category)] ?? Network;
              const items = partners.filter(
                (partner) => categoryKey(partner.category || "Partners") === categoryKey(category),
              );

              return (
                <section
                  className={styles.category}
                  key={category}
                  aria-labelledby={`partners-${categoryId(category)}`}
                >
                  <div className={styles.categoryHeading}>
                    <Icon size={20} aria-hidden="true" />
                    <h2 id={`partners-${categoryId(category)}`}>{category}</h2>
                  </div>
                  {items.length ? (
                    <ImageCollection label={category} className={styles.partnerGrid} items={items.map(partner => ({
                      label: partner.name,
                      image: partner.logo?.src,
                      imageAlt: partner.logo?.alt || `${partner.name} logo`,
                      summary: partner.description || partner.category,
                      href: safeWebsite(partner.link),
                      hrefLabel: "Visit partner website",
                    }))}>
                      {items.map((partner) => (
                        <PartnerCard key={partner.id} partner={partner} />
                      ))}
                    </ImageCollection>
                  ) : (
                    <div className={styles.emptyState}>
                      <Motif flow density={160} className={styles.emptyMotif} />
                      <div className={styles.emptyContent}>
                        <span className={styles.eyebrow}>
                          {unavailable
                            ? "CONTENT CURRENTLY UNAVAILABLE"
                            : "PARTNER DIRECTORY IN PROGRESS"}
                        </span>
                        <h3>
                          {unavailable
                            ? "Partner information is temporarily unavailable."
                            : "Partner details coming soon."}
                        </h3>
                        <p>
                          {unavailable
                            ? "Please check again later."
                            : `Confirmed ${category.toLowerCase()} will appear here as details are ready.`}
                        </p>
                      </div>
                      <Mark flow className={styles.emptyMark} />
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          <section className={styles.cta} aria-labelledby="partners-cta-title">
            <Motif flow density={190} />
            <div className={styles.ctaContent}>
              <span className={styles.ctaEyebrow}>START A CONVERSATION</span>
              <h2 id="partners-cta-title">Work alongside Dreniak.</h2>
              <p>
                If your organisation offers specialist services or delivery
                expertise, contact our team to explore a conversation.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <a
                className={styles.ctaPrimary}
                href="mailto:info@dreniak.com?subject=Partnership%20enquiry"
              >
                <Mail size={15} aria-hidden="true" />
                Email Dreniak <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <a href="tel:+447789063938">
                <Phone size={14} aria-hidden="true" /> +44 7789 063938
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
