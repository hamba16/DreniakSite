import Link from "next/link";
import {
  ArrowUpRight,
  HardHat,
  Route,
  DraftingCompass,
  Waves,
  ClipboardList,
  Mountain,
} from "lucide-react";
import { engineering, engineeringOpenings } from "@/content/engineering";
import { Mark } from "./brand";
import { LeadershipSection } from "./leadership-section";
import { ConvergenceDiagram } from "./convergence-diagram";
import { Reveal } from "./interactions";
import { PageIntro, Standards } from "./shared";
import { ConceptualImage } from "./conceptual-image";
import { engineeringSectorImages } from "@/content/visual-assets";
import { ConstructionPhotograph } from "./construction-photograph";

const sectorIcons = [Route, DraftingCompass, Waves, ClipboardList, Mountain];

export function EngineeringSectors({ imagery = false }: { imagery?: boolean }) {
  return (
    <div className="engineering-sectors">
      <div className="sector-featured engineering-sector-lead">
        <article>
          <div className="sector-top">
            <HardHat size={36} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <span className="eyebrow">OUR LEAD FOCUS</span>
          <h2>{engineering.featuredSector}</h2>
          <p>
            Construction Engineering is our predominant focus, supported by the
            areas of expertise below.
          </p>
          <Link
            className="text-link"
            href="/engineering/consultation?sector=Construction%20Engineering"
          >
            Book a Consultation <ArrowUpRight size={17} />
          </Link>
          {imagery && <ConstructionPhotograph />}
        </article>
      </div>
      <div
        className={`sector-secondary engineering-sector-grid ${imagery ? "sector-photo-grid" : ""}`}
      >
        {engineering.sectors.map((sector, index) => {
          const Icon = sectorIcons[index];
          return (
            <article key={sector}>
              {imagery && (
                <ConceptualImage asset={engineeringSectorImages[index]} />
              )}
              <Icon size={28} strokeWidth={1.5} aria-hidden="true" />
              <div>
                <h3>{sector}</h3>
                <Link
                  className="text-link"
                  href={`/engineering/consultation?sector=${encodeURIComponent(sector)}`}
                >
                  Discuss your project <ArrowUpRight size={16} />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function EngineeringAbout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageIntro
        eyebrow="ABOUT DRENIAK ENGINEERING"
        title={
          <>
            Build. Connect.
            <br />
            <em>Deliver.</em>
          </>
        }
      />
      <section
        className="story-section engineering-overview"
        aria-labelledby="engineering-overview"
      >
        <div>
          <span className="eyebrow">FOUNDED 2024 · INCORPORATED 2025</span>
          <h2 id="engineering-overview">Company overview</h2>
          <Mark stroke />
        </div>
        <div>
          <p className="story-lead">{engineering.description}</p>
          <p>
            {engineering.legalName} works with government, investors and private
            developers on their project, site and engineering challenges.
          </p>
        </div>
      </section>
      <div className="mission-vision">
        <article aria-labelledby="engineering-mission">
          <span className="eyebrow">PURPOSE IN THE PRESENT</span>
          <h2 id="engineering-mission">Mission</h2>
          <p>{engineering.mission}</p>
        </article>
        <article aria-labelledby="engineering-vision">
          <span className="eyebrow">A BETTER FUTURE</span>
          <h2 id="engineering-vision">Vision</h2>
          <p>{engineering.vision}</p>
        </article>
      </div>
      <section
        className="engineering-values"
        aria-labelledby="engineering-values"
      >
        <div className="section-heading">
          <span className="eyebrow">WHAT WE STAND FOR</span>
          <h2 id="engineering-values">Core values</h2>
        </div>
        <div className="engineering-value-grid">
          {engineering.values.map((value) => (
            <Reveal key={value}>
              <h3>{value}</h3>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="thinking" aria-labelledby="engineering-philosophy">
        <span className="eyebrow">EVERY STAGE, CONNECTED</span>
        <h2 id="engineering-philosophy">Engineering philosophy</h2>
        <ConvergenceDiagram
          items={[
            "Assessment",
            "Design",
            "Construction",
            "Handover",
            "Maintenance",
          ]}
          caption="A whole-lifecycle approach to physical delivery."
        />
      </section>
      <section aria-labelledby="engineering-expertise">
        <div className="section-heading compact">
          <span className="eyebrow">ENGINEERING SERVICES UGANDA</span>
          <h2 id="engineering-expertise">Areas of expertise</h2>
        </div>
        <EngineeringSectors />
      </section>
      <LeadershipSection context="engineering" />
      <section aria-labelledby="engineering-credentials">
        <div className="section-heading compact">
          <span className="eyebrow">{engineering.legalName}</span>
          <h2 id="engineering-credentials">
            Professional credentials & registrations
          </h2>
        </div>
        <Standards division="engineering" full />
      </section>
      <section
        className="engineering-commitment"
        aria-labelledby="engineering-commitment"
      >
        <span className="eyebrow">LOOKING BEYOND DELIVERY</span>
        <h2 id="engineering-commitment">
          Commitment to quality, sustainability & innovation
        </h2>
        <p>
          Quality, sustainability and innovation guide our decisions throughout a project, with attention to its safety, efficiency and sustainability.
        </p>
      </section>
      {children}
    </>
  );
}

export function EngineeringCareers() {
  return (
    <>
      <PageIntro
        eyebrow="CAREERS / DRENIAK ENGINEERING"
        title={
          <>
            Careers in <br /> <em>engineering.</em>
          </>
        }
        description="Opportunities to contribute to engineering in Uganda and beyond."
      />
      {engineeringOpenings.length ? (
        <div className="engineering-openings">
          {engineeringOpenings.map((opening) => (
            <article className="insight-card" key={opening.id}>
              <span className="eyebrow">{opening.location}</span>
              <h2>{opening.title}</h2>
              <p>{opening.description}</p>
              <a className="text-link" href={opening.applicationUrl}>
                Apply for this role <ArrowUpRight size={17} />
              </a>
            </article>
          ))}
        </div>
      ) : (
        <section className="insights-empty">
          <div>
            <span className="eyebrow">CURRENT OPPORTUNITIES</span>
            <h2>No current openings.</h2>
            <p>
              There are no vacancies listed at the moment. Please check back for
              future opportunities.
            </p>
          </div>
          <Mark stroke />
        </section>
      )}
    </>
  );
}
