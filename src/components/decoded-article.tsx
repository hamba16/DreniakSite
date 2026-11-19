import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { Newsletter } from "@/components/forms";
import { Breadcrumb } from "@/components/shared";
import {
  decodedArticle,
  decodedCitations,
  decodedSourceBacklinks,
} from "@/content/decoded-01";
import type { ReactNode } from "react";
import { DecodedChoiceAnchor } from "./decoded-choice-anchor";
import { DecodedDecisionTabs } from "./decoded-decision-tabs";
import { DecodedEnergyInteraction } from "./decoded-energy-interaction";
import { DecodedGraphic } from "./decoded-graphics";
import { DecodedReadingChrome } from "./decoded-reading-chrome";
import styles from "./decoded-article.module.css";

const heroPath = "/images/insights/after-the-connection-hero.jpg";
const ogPath = "/images/insights/after-the-connection-og.jpg";
const publicPath = path.join(process.cwd(), "public");
export const decodedSocialImage = existsSync(
  path.join(publicPath, ogPath.slice(1)),
)
  ? ogPath
  : "/og/parent";

function countText(value: unknown): number {
  if (typeof value === "string") {
    return value.trim().split(/\s+/).filter(Boolean).length;
  }
  if (Array.isArray(value)) {
    return value.reduce((total, item) => total + countText(item), 0);
  }
  if (value && typeof value === "object") {
    return Object.values(value).reduce(
      (total, item) => total + countText(item),
      0,
    );
  }
  return 0;
}

const readingWordCount = countText([
  decodedArticle.quickRead,
  decodedArticle.decision,
  decodedArticle.howWeWork,
  decodedArticle.questions,
  decodedArticle.research,
  decodedArticle.sources,
]);
const readingTime = Math.max(1, Math.ceil(readingWordCount / 200));

function Citation({
  id,
  sources,
  range = false,
}: {
  id: string;
  sources: readonly number[];
  range?: boolean;
}) {
  return (
    <sup
      id={id}
      className={styles.citation}
      aria-label={`Sources ${sources.join(", ")}`}
    >
      {range ? (
        <>
          [
          <a href={`#source-${sources[0]}`} aria-label={`Source ${sources[0]}`}>
            {sources[0]}
          </a>
          –
          {sources.slice(1, -1).map((source) => (
            <a
              key={source}
              className={styles.rangeSource}
              href={`#source-${source}`}
              aria-label={`Source ${source}`}
            >
              {source}
            </a>
          ))}
          <a
            href={`#source-${sources[sources.length - 1]}`}
            aria-label={`Source ${sources[sources.length - 1]}`}
          >
            {sources[sources.length - 1]}
          </a>
          ]
        </>
      ) : (
        <>
          [
          {sources.map((source, index) => (
            <span key={source}>
              {index > 0 ? ", " : ""}
              <a href={`#source-${source}`} aria-label={`Source ${source}`}>
                {source}
              </a>
            </span>
          ))}
          ]
        </>
      )}
    </sup>
  );
}

function SourceNote({
  children,
  citation,
}: {
  children: ReactNode;
  citation: ReactNode;
}) {
  return (
    <p>
      {children} {citation}
    </p>
  );
}

function DataTable({
  caption,
  headers,
  rows,
  note,
  className = "",
  interactiveEnergyRows = false,
}: {
  caption: string;
  headers: readonly string[];
  rows: readonly (readonly string[])[];
  note?: ReactNode;
  className?: string;
  interactiveEnergyRows?: boolean;
}) {
  const energyRowKeys: Record<string, string> = {
    "Energy purchased": "purchased",
    "Energy sold": "sold",
    "Purchase–sales gap": "gap",
  };

  return (
    <div
      className={`${styles.tableScroller} ${className}`}
      role="region"
      aria-label={`${caption} table`}
      tabIndex={0}
    >
      <table className={styles.dataTable}>
        <caption>
          {caption} {note}
        </caption>
        <thead>
          <tr>
            {headers.map((header) => (
              <th scope="col" key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              aria-selected={
                interactiveEnergyRows && energyRowKeys[row[0]] ? false : undefined
              }
              data-energy-row={
                interactiveEnergyRows ? energyRowKeys[row[0]] : undefined
              }
              key={row.join("|")}
              tabIndex={
                interactiveEnergyRows && energyRowKeys[row[0]] ? -1 : undefined
              }
            >
              {row.map((cell, index) => (
                <td key={`${index}-${cell}`} data-label={headers[index]}>
                  <span className={styles.cellLabel} aria-hidden="true">
                    {headers[index]}
                  </span>
                  <span>{cell}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SeriesLabel() {
  return (
    <span className={styles.seriesIdentity} aria-label="Dreniak Decoded">
      <strong>Dreniak Limited</strong>
      <Image src="/brand/decoded/wordmark.svg" alt="Decoded" width={126} height={28} />
    </span>
  );
}

function energyValues(row: readonly string[]) {
  return row.slice(1, 3).map((value) => {
    const parsed = Number(value.replace(/[^\d]/g, ""));
    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
      throw new Error(`Invalid energy chart value: ${value}`);
    }
    return parsed;
  });
}

function EnergyChart({
  purchasedValues,
  soldValues,
}: {
  purchasedValues: readonly number[];
  soldValues: readonly number[];
}) {
  return (
    <figure className={styles.chartFigure}>
      <div className={styles.chartScroller} role="region" aria-label="Electricity access and distribution performance chart" tabIndex={0}>
        <DecodedGraphic name="energy-chart" />
      </div>
      <DecodedEnergyInteraction
        purchasedValues={purchasedValues}
        soldValues={soldValues}
      />
      <figcaption>Energy purchased and sold, 2024–2025. Indigo: purchased; red: sold. On small screens, scroll to explore the chart.</figcaption>
    </figure>
  );
}

function ProcessDiagram() {
  return (
    <figure className={styles.kitFigure}>
      <DecodedGraphic name="process" />
      <figcaption>Map equipment and service records; Compare causes and options; Baseline outcomes before work starts.</figcaption>
    </figure>
  );
}

function HeroPanel() {
  return (
    <figure className={styles.heroFigure}>
      <div className={styles.heroFrame}>
        <Image src={heroPath}
          alt="Illustration: overhead distribution lines and a pole-mounted transformer beside a red earth road in a Ugandan trading centre at late afternoon."
          width={1600} height={900} loading="eager" fetchPriority="high"
          className={styles.heroImage} sizes="(max-width: 760px) 100vw, 680px" />
        <span className={styles.heroCaption}>Infrastructure &amp; Asset Management</span>
      </div>
      <figcaption>Illustration</figcaption>
    </figure>
  );
}

export function DecodedInsightCard() {
  return (
    <article className={`insight-card ${styles.featuredCard}`}>
      <Link
        href={`/asset-management/insights/${decodedArticle.slug}`}
        className={styles.cardImage}
        aria-label={`Read ${decodedArticle.title}`}
      >
        <Image
          src="/images/insights/after-the-connection-thumb.jpg"
          alt="Illustration: a transformer and distribution lines beside a Ugandan trading centre."
          width={640} height={360} sizes="(max-width: 760px) 100vw, 480px" />
        <span className={styles.thumbnailCaption}>Illustration</span>
      </Link>
      <div className={styles.cardCopy}>
        <SeriesLabel />
        <span className="eyebrow">
          {decodedArticle.date} · {readingTime} min read
        </span>
        <h2>
          <Link href={`/asset-management/insights/${decodedArticle.slug}`}>
            {decodedArticle.title}
          </Link>
        </h2>
        <p>{decodedArticle.listingExcerpt}</p>
      </div>
    </article>
  );
}

export function DecodedArticle() {
  const section6 = decodedArticle.research.sections[5];
  const firstTable = decodedArticle.research.sections[2].energyTable;
  const purchasedValues = firstTable ? energyValues(firstTable.rows[0]) : [];
  const soldValues = firstTable ? energyValues(firstTable.rows[1]) : [];

  return (
    <div className={styles.articleLayout}>
      <DecodedReadingChrome />
      <main id="main" className={`page-container ${styles.page}`}>
        <Breadcrumb division="asset-management" label="Insights" />
        <article className={styles.article}>
        <header className={styles.articleHeader}>
          <div className={styles.seriesLine}>
            <SeriesLabel />
            <span className={styles.issueLine}><Image src="/brand/decoded/issue-chip.svg" alt="Issue 01" width={91} height={28} />{decodedArticle.date}</span>
          </div>
          <h1>{decodedArticle.title}</h1>
          <p className={styles.standfirst}>{decodedArticle.standfirst}</p>
          <p className={styles.secondaryStandfirst}>
            {decodedArticle.secondaryStandfirst}
          </p>
          <p className={styles.readingTime}>{readingTime} min read</p>
          <HeroPanel />
        </header>

        <nav className={styles.contents} aria-label="In this article">
          <details>
            <summary>On this page</summary>
            <ul>
              <li>
                <a href="#quick-read">Quick read</a>
              </li>
              <li>
                <a href="#your-decision">Your decision</a>
              </li>
              <li>
                <a href="#how-we-work">How Dreniak would work</a>
              </li>
              <li>
                <a href="#research-brief">Research brief</a>
              </li>
              <li>
                <a href="#sources">Sources</a>
              </li>
            </ul>
          </details>
        </nav>

        <p className={styles.partLabel}>PART ONE</p>
        <section id="quick-read" className={styles.section}>
          <h2>Quick read</h2>
          <p>{decodedArticle.quickRead.opening}</p>
          <p>{decodedArticle.quickRead.introduction}</p>
          <h3>{decodedArticle.quickRead.ugandaHeading}</h3>
          <SourceNote
            citation={
              <Citation
                id={decodedCitations.readerMission.id}
                sources={decodedCitations.readerMission.sources}
                range
              />
            }
          >
            {decodedArticle.quickRead.uganda}
          </SourceNote>
          <aside className={styles.statCard} aria-label="Distribution loss rate">
            <DecodedGraphic name="stat-card" className={styles.statGraphic} />
            <span>{decodedArticle.quickRead.statCaption}</span>
            <p>{decodedArticle.quickRead.statSupport}</p>
            <Citation
              id={decodedCitations.readerLoss.id}
              sources={decodedCitations.readerLoss.sources}
            />
          </aside>
          <p>{decodedArticle.quickRead.statAfter}</p>
        </section>

        <section id="your-decision" className={styles.section}>
          <h2>{decodedArticle.decision.scenarioHeading}</h2>
          <h3>{decodedArticle.decision.promptHeading}</h3>
          <p>{decodedArticle.decision.scenario}</p>
          <figure className={styles.kitFigure}>
            <DecodedGraphic name="decision" />
          </figure>
          <DecodedDecisionTabs
            choices={decodedArticle.decision.choices}
            label={decodedArticle.decision.promptHeading}
          />
          <p className={styles.decisionClosing}>
            {decodedArticle.decision.closing}
          </p>
        </section>

        <section id="how-we-work" className={styles.section}>
          <h2>{decodedArticle.howWeWork.heading}</h2>
          <p>{decodedArticle.howWeWork.introduction}</p>
          <div className={styles.processOverview}>
            <DataTable
              caption={decodedArticle.howWeWork.table.caption}
              headers={decodedArticle.howWeWork.table.headers}
              rows={decodedArticle.howWeWork.table.rows}
              className={styles.workTable}
            />
            <ProcessDiagram />
          </div>
          <h3>{decodedArticle.howWeWork.investmentHeading}</h3>
          <p>{decodedArticle.howWeWork.investment}</p>
          <h3>{decodedArticle.howWeWork.startHeading}</h3>
          <p>{decodedArticle.howWeWork.start}</p>
          <Link className={styles.primaryLink} href="/asset-management/contact">
            Talk to Dreniak about an asset performance review →
          </Link>
        </section>

        <section className={styles.section}>
          <h2>{decodedArticle.questions.heading}</h2>
          <ol className={styles.questions}>
            {decodedArticle.questions.items.map((item) => (
              <li key={item.question}>
                <input
                  aria-label={item.question}
                  className={styles.questionCheckbox}
                  type="checkbox"
                />
                <strong>{item.question}</strong>
                <p>{item.answer}</p>
              </li>
            ))}
          </ol>
          <div aria-hidden="true" className={styles.questionProgress}>
            <span />
            <span />
            <span />
          </div>
        </section>

        <p className={styles.transition}>
          Want the evidence behind this? The full research brief follows.
        </p>

        <Image className={styles.sectionDivider} src="/brand/decoded/section-divider.svg" alt="" width={680} height={40} />
        <p className={styles.partLabel}>PART TWO</p>
        <section id="research-brief" className={styles.section}>
          <h2>{decodedArticle.research.heading}</h2>
          <figure className={styles.researchPlate}>
            <Image src="/images/insights/after-the-connection-research.jpg"
              alt="Illustration: electricity feeders, nodes and a grid fading into indigo dusk."
              width={1200} height={480} sizes="(max-width: 760px) 100vw, 680px" />
            <figcaption>Illustration</figcaption>
          </figure>
          <h3>Abstract</h3>
          <p>{decodedArticle.research.abstract}</p>
          {decodedArticle.research.sections.map((section, index) => (
            <section
              className={styles.researchSection}
              key={section.heading}
              aria-labelledby={`decoded-section-${index + 1}`}
            >
              <h2 id={`decoded-section-${index + 1}`}>{section.heading}</h2>
              {section.paragraphs.map((paragraph, paragraphIndex) => {
                if (index === 0 && paragraphIndex === 1) {
                  return (
                    <SourceNote
                      key={paragraph}
                      citation={
                        <Citation
                          id={decodedCitations.briefIntroduction.id}
                          sources={decodedCitations.briefIntroduction.sources}
                          range
                        />
                      }
                    >
                      {paragraph}
                    </SourceNote>
                  );
                }
                if (index === 1) {
                  return (
                    <SourceNote
                      key={paragraph}
                      citation={
                        <Citation
                          id={decodedCitations.briefMethod.id}
                          sources={decodedCitations.briefMethod.sources}
                        />
                      }
                    >
                      {paragraph}
                    </SourceNote>
                  );
                }
                if (index === 2) {
                  return (
                    <SourceNote
                      key={paragraph}
                      citation={
                        <Citation
                          id={decodedCitations.briefResults.id}
                          sources={decodedCitations.briefResults.sources}
                        />
                      }
                    >
                      {paragraph}
                    </SourceNote>
                  );
                }
                if (index === 3 && paragraphIndex === 1) {
                  return (
                    <SourceNote
                      key={paragraph}
                      citation={
                        <Citation
                          id={decodedCitations.briefExplainer.id}
                          sources={decodedCitations.briefExplainer.sources}
                        />
                      }
                    >
                      {paragraph}
                    </SourceNote>
                  );
                }
                return <p key={paragraph}>{paragraph}</p>;
              })}
              {index === 2 && firstTable && (
                <>
                  <DataTable
                    caption={firstTable.caption}
                    headers={firstTable.headers}
                    rows={firstTable.rows}
                    note={
                      <Citation
                        id={decodedCitations.briefTable.id}
                        sources={decodedCitations.briefTable.sources}
                      />
                    }
                    className={`${styles.researchTable} ${styles.energyTable}`}
                    interactiveEnergyRows
                  />
                  <EnergyChart
                    purchasedValues={purchasedValues}
                    soldValues={soldValues}
                  />
                </>
              )}
              {index === 5 && section6 && (
                <DataTable
                  caption={decodedArticle.howWeWork.serviceObjectives.caption}
                  headers={decodedArticle.howWeWork.serviceObjectives.headers}
                  rows={decodedArticle.howWeWork.serviceObjectives.rows}
                  className={styles.researchTable}
                />
              )}
              {index === 5 && (
                <p>{decodedArticle.howWeWork.verification}</p>
              )}
            </section>
          ))}
        </section>

        <section id="sources" className={styles.section}>
          <h2>Sources</h2>
          <ol className={styles.sources}>
            {decodedArticle.sources.map((source, index) => {
              const number = index + 1;
              return (
                <li id={`source-${number}`} key={source}>
                  <span>{source}</span>
                  <span className={styles.sourceBacklinks}>
                    {decodedSourceBacklinks[number]?.map((citationId) => (
                      <a
                        key={citationId}
                        href={`#${citationId}`}
                        aria-label={`Back to citation for source ${number}`}
                      >
                        ↑
                      </a>
                    ))}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        <section className={`${styles.newsletter} inline-newsletter`}>
          <Newsletter
            source="insights-after-the-connection"
            description="Get Dreniak Decoded in your inbox, once a month."
          />
        </section>

        <section className={styles.nextInSeries}>
          <h2>Next in the series</h2>
          <p>
            Next in Dreniak Decoded: a decision from the Engineering side. Tell
            us which question you would like decoded.
          </p>
          <Link className={styles.primaryLink} href="/asset-management/contact">
            Tell us what you’d like decoded →
          </Link>
        </section>
        <Link
          href="/asset-management/insights"
          className={styles.backToInsights}
        >
          ← Back to insights
        </Link>
        </article>
        <DecodedChoiceAnchor />
      </main>
    </div>
  );
}
