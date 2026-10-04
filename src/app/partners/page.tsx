import type { Metadata } from "next";
import Image from "next/image";
import { ArrowDown, ArrowUpRight, Mail, Phone } from "lucide-react";
import { Header } from "@/components/interactions";
import { Footer } from "@/components/shared";
import { Mark } from "@/components/brand";
import { partnerCategoryDefaults, partnerIntroduction, withApprovedPartners } from "@/content/partners";
import { publishedPartners, type PublishedPartner } from "@/lib/public-content";
import { PartnerEmblem } from "./partner-emblem";
import styles from "./partners.module.css";

export const metadata: Metadata = {
  title: "Partners",
  description: "Discover Dreniak’s collaborators, service providers and community partners across both company divisions.",
  alternates: { canonical: "/partners" },
};

function safeWebsite(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : undefined;
  } catch { return undefined; }
}

export default async function PartnersPage() {
  let partners: PublishedPartner[] = [];
  let unavailable = false;
  try { partners = await publishedPartners(); } catch { unavailable = true; }
  partners = withApprovedPartners(partners);
  const emptyCategories = partnerCategoryDefaults.filter(category =>
    !partners.some(partner => partner.category.trim().toLowerCase() === category.toLowerCase()),
  );

  return (
    <>
      <Header />
      <main id="main" className={styles.page}>
        <div className={styles.container}>
          <header className={styles.hero}>
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}>ONE COMPANY · SHARED WORK</span>
              <h1>Partners<span className={styles.titleDot}>.</span></h1>
              <p data-editorial-status={partnerIntroduction.editorialStatus}>{partnerIntroduction.text}</p>
            </div>
            <a className={styles.heroLink} href="#partner-catalogue">
              <span>Good company.<br />Shared possibilities.</span>
              <span className={styles.downArrow}><ArrowDown size={22} aria-hidden="true" /></span>
              <span className={styles.srOnly}>Explore the partner catalogue</span>
            </a>
          </header>
          <section id="partner-catalogue" className={styles.catalogue} aria-label="Partner catalogue">
            <div className={styles.catalogueIntro}>
              <span className={styles.eyebrow}>THE DRENIAK COLLECTIVE</span>
              <span>Individual expertise. A connected outlook.</span>
            </div>
            <ol className={styles.flow}>
              {partners.map((partner, index) => {
                const website = safeWebsite(partner.link);
                const number = String(index + 1).padStart(2, "0");
                return (
                  <li key={partner.id} className={styles.flowItem}>
                    <article className={styles.partner} aria-labelledby={`partner-${index}`}>
                      <span className={styles.flowNumber} aria-hidden="true">{number}</span>
                      <div className={styles.emblemStage}>
                        <div className={styles.emblemArtwork}><PartnerEmblem name={partner.name} id={partner.id} /></div>
                        <span className={styles.emblemCaption} aria-hidden="true">DRENIAK COLLECTION <span>/{number}</span></span>
                      </div>
                      <div className={styles.partnerContent}>
                        {partner.category && <span className={styles.category}>{partner.category}</span>}
                        <h2 id={`partner-${index}`}>{website ? <a href={website} target="_blank" rel="noopener noreferrer">{partner.name}<ArrowUpRight aria-hidden="true" /></a> : partner.name}</h2>
                        <span className={styles.nameRule} aria-hidden="true" />
                        {partner.description && <p>{partner.description}</p>}
                        {partner.logo && <Image className={styles.partnerLogo} src={partner.logo.src} alt={partner.logo.alt} width={140} height={70} sizes="140px" />}
                        {website && <a className={styles.visitLink} href={website} target="_blank" rel="noopener noreferrer">Visit website <ArrowUpRight size={15} aria-hidden="true" /><span className={styles.srOnly}> for {partner.name} (opens in a new tab)</span></a>}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
            {emptyCategories.length > 0 && <div className={styles.directoryNote}>
              <span>{emptyCategories.join(" · ")}</span>
              <p>{unavailable ? "Further partner information is temporarily unavailable. Please check again later." : "More collaborators will appear here as their details are ready."}</p>
            </div>}
          </section>
          <section className={styles.cta} aria-labelledby="partners-cta-title">
            <div className={styles.ctaArtwork} aria-hidden="true">
              <span className={styles.ctaOrbit} /><span className={styles.ctaOrbitInner} />
              <div className={styles.ctaSculpture}><Mark /><Mark stroke /><Mark stroke /></div>
              <span className={styles.ctaArtLabel}>A SHARED<br />POINT OF VIEW.</span><span className={styles.ctaPlus}>+</span>
            </div>
            <div className={styles.ctaContent}>
              <span className={styles.ctaEyebrow}><span /> THE NEXT CONNECTION</span>
              <h2 id="partners-cta-title">Work alongside<br /><span>Dreniak.</span></h2>
              <p>If your organisation offers specialist services or delivery expertise, contact our team to explore a conversation.</p>
              <div className={styles.ctaActions}>
                <a className={styles.ctaPrimary} href="mailto:info@dreniak.com?subject=Partnership%20enquiry"><Mail size={17} aria-hidden="true" /><span>Let’s start a conversation</span><ArrowUpRight size={22} aria-hidden="true" /></a>
                <a className={styles.ctaPhone} href="tel:+447789063938"><Phone size={14} aria-hidden="true" /> +44 7789 063938</a>
              </div>
            </div>
            <div className={styles.ctaFooter}><span>DRENIAK / BETTER, TOGETHER.</span><span>Engineering <span aria-hidden="true">↗</span> Asset Management</span></div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
