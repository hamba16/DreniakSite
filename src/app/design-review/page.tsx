import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeadershipCard } from "@/components/leadership-card";
import { ProjectLabel } from "@/components/project-label";
import { leaders } from "@/content/leadership";
import { assetManagementFeaturedProjects } from "@/content/project-case-studies";
import styles from "./review.module.css";

export const metadata: Metadata = {
  title: "Leadership & project accents — design review",
  robots: { index: false, follow: false },
};

export default function DesignReview() {
  // Approval samples are available locally only, never in a production build.
  if (process.env.NODE_ENV !== "development") notFound();
  const study = assetManagementFeaturedProjects[0];
  return (
    <main id="main" className={styles.review}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>DRENIAK · DESIGN REVIEW</p>
        <h1>The people.<br />The finer details.</h1>
        <p>Two subtle portrait directions and two approaches to project status. The site uses B, the center-light vignette, with quiet status dots; both alternatives remain here for comparison.</p>
        <nav aria-label="Review sections"><a href="#portraits">Portraits</a><a href="#team">Team & placement</a><a href="#tags">Project labels</a></nav>
      </header>

      <section id="portraits" className={styles.section}>
        <p className={styles.eyebrow}>01 / PORTRAIT BACKDROPS</p>
        <h2>Texture, quietly in the background.</h2>
        <div className={styles.comparison}>
          {(["flat", "vignette"] as const).map((backdrop, i) => (
            <div key={backdrop} className={styles.direction}>
              <h3>{i === 0 ? "A — Flat subtle tile" : "B — Center-light vignette"}</h3>
              <p>{i === 0 ? "An even 5% motif wash on warm off-white." : "A 6% motif at the edges, fading away behind the subject."}</p>
              <div className={styles.pair}>
                {leaders.slice(0, 2).map((leader) => <LeadershipCard key={leader.id} leader={leader} backdrop={backdrop} />)}
              </div>
            </div>
          ))}
        </div>
        <p className={styles.note}>Both reuse the existing Dreniak mirrored-arc motif. Future portraits fit the same frame; a transparent cutout lets the digital backdrop remain visible behind the person.</p>
      </section>

      <section id="team" className={styles.section}>
        <p className={styles.eyebrow}>02 / SHARED LEADERSHIP</p>
        <h2>Four people. One shared story.</h2>
        <p className={styles.intro}>The shared /story team uses Sample B. Division pages show the relevant members listed below.</p>
        <div className={styles.team}>
          {leaders.map((leader) => <LeadershipCard key={leader.id} leader={leader} backdrop="vignette" context="company" />)}
        </div>
        <div className={styles.placement}>
          <div><h3>/story</h3><p>All four people, their exact titles, scope and supplied contact details. Tania appears here only.</p></div>
          <div><h3>/engineering/about</h3><p>Darren, Derrick and Jude. Darren has a lighter card linking to his full story-page entry.</p></div>
          <div><h3>/asset-management/about</h3><p>Darren, with a lighter card linking to his full story-page entry.</p></div>
        </div>
        <p className={styles.note}>Derrick’s confirmed number, +256 704 175 005, appears on his story-page card. No contacts are shown for Tania or Jude.</p>
      </section>

      <section id="tags" className={styles.section}>
        <p className={styles.eyebrow}>03 / PROJECT LABELS</p>
        <h2>Categories in color. Metadata with restraint.</h2>
        <p className={styles.intro}>Compare the same card with quiet and tinted status. Engineering examples below are color proofs using the existing case study, not new Engineering project claims.</p>
        {(["asset-management", "engineering"] as const).map((division) => (
          <div key={division} className={styles.context} data-division={division}>
            <h3>{division === "engineering" ? "Engineering · red color proof" : "Asset Management · indigo"}</h3>
            <div className={styles.comparison}>
              {(["quiet", "tinted"] as const).map((tone, i) => (
                <div key={tone}>
                  <p className={styles.option}>{i === 0 ? "1 — Quiet status / colored dot" : "2 — Tinted status / soft color fill"}</p>
                  <article className={styles.project}>
                    <div className={styles.topline}><ProjectLabel kind="location">{study.location}</ProjectLabel><ProjectLabel kind="status" statusTone={tone}>{study.status}</ProjectLabel></div>
                    <h4>{study.title}</h4>
                    <p>{study.summary}</p>
                    <div className={styles.labels}>{study.serviceLinks?.slice(0, 2).map((link) => <ProjectLabel key={link.label} kind="category">{link.label}</ProjectLabel>)}</div>
                  </article>
                  <div className={styles.detail}>
                    <p className={styles.eyebrow}>CASE-STUDY DETAIL TREATMENT</p>
                    <div className={styles.labels}><ProjectLabel kind="category" href={study.sectorLink}>{study.sector}</ProjectLabel><ProjectLabel kind="location">{study.location}</ProjectLabel><ProjectLabel kind="status" statusTone={tone}>{study.status}</ProjectLabel><ProjectLabel kind="status" statusTone={tone}>3 Years</ProjectLabel></div>
                    <blockquote>{study.opening}</blockquote>
                    <div className={styles.labels}>{study.serviceLinks?.map((link) => <ProjectLabel kind="category" href={link.href} key={link.label}>{link.label}</ProjectLabel>)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
