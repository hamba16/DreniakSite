import Image from "next/image";
import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  MoveUpRight,
  LockKeyhole,
} from "lucide-react";
import { Mark, Motif } from "./brand";
import {
  CapabilityJourney,
  ServiceAccordion,
  Reveal,
  Assessment,
} from "./interactions";
import { PageIntro, Standards, CTA, Sectors, ProjectApproach } from "./shared";
import { EnquiryForm, Newsletter } from "./forms";
import {
  type Division,
  type PageName,
  names,
  engineeringServices,
  insights,
} from "@/lib/site";
import data from "@/content/brief.json";

export function DivisionHome({ division }: { division: Division }) {
  const engineering = division === "engineering";
  return (
    <>
      <section className="division-hero">
        <Image
          src={`/images/${division}.webp`}
          alt={
            engineering
              ? "Conceptual concrete civic infrastructure"
              : "Conceptual elevated infrastructure and a distant city skyline"
          }
          fill
          priority
          sizes="100vw"
        />
        <div className="division-hero-overlay" />
        <div className="division-hero-content">
          <span className="eyebrow">
            DRENIAK {names[division].toUpperCase()}
          </span>
          <h1>
            {engineering ? (
              <>
                Built with purpose.
                <br />
                Delivered with
                <br />
                <em>precision.</em>
              </>
            ) : (
              <>
                Infrastructure
                <br />
                understood.
                <br />
                <em>Value multiplied.</em>
              </>
            )}
          </h1>
          <p>
            {engineering
              ? "From site assessment to post-construction support. Engineering that connects the ambition with the physical delivery."
              : "A longer view of what you own. A clearer understanding of what it can become."}
          </p>
          <Link className="button light" href={`/${division}/contact`}>
            {engineering ? "Discuss your project" : "Book a Consultation"}
            <ArrowUpRight size={19} />
          </Link>
        </div>
        <div className="division-hero-foot">
          <span>
            {engineering
              ? "BUILD. CONNECT. DELIVER."
              : "INFRASTRUCTURE & ECONOMIC VALUE"}
          </span>
          <span>UK · EAST AFRICA</span>
        </div>
      </section>
      {!engineering && <CapabilityJourney />}
      <section className="content-section intro-statement">
        <span className="eyebrow">
          {engineering
            ? "A COMPLETE VIEW OF DELIVERY"
            : "THE VALUE BEYOND THE ASSET"}
        </span>
        <Reveal>
          <h2>
            {engineering
              ? "Good engineering sees the whole project. Great engineering sees what comes after."
              : "We help organisations understand what they own, maximise how it performs, determine where capital should go, and ensure infrastructure creates value far beyond the asset itself."}
          </h2>
        </Reveal>
        <Link className="text-link" href={`/${division}/approach`}>
          Explore our approach <ArrowUpRight size={18} />
        </Link>
      </section>
      <section className="content-section service-preview">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CONNECTED CAPABILITIES</span>
            <h2>
              {engineering
                ? "From the ground up."
                : "Every stage. A longer view."}
            </h2>
          </div>
          <Link className="text-link" href={`/${division}/services`}>
            All services <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="service-preview-grid">
          {(engineering ? engineeringServices : data.services).map((s, i) => (
            <Link href={`/${division}/services#service-${i}`} key={s.name}>
              <span className="eyebrow">0{i + 1}</span>
              <h3>{s.name}</h3>
              <p>{s.description}</p>
              <ArrowUpRight size={22} />
            </Link>
          ))}
        </div>
      </section>
      <div className="content-section">
        <Standards division={division} />
      </div>
      {!engineering && (
        <section className="assessment-preview">
          <div>
            <span className="eyebrow">A PRACTICAL FIRST STEP</span>
            <h2>
              How well do you
              <br />
              know your assets?
            </h2>
            <p>
              Six questions to reflect on your asset management maturity. A
              useful starting point for a more informed conversation.
            </p>
            <Link className="button" href="/asset-management/assessment">
              Assess your starting point <ArrowUpRight size={18} />
            </Link>
            <span className="fine-print">2 MINUTES · NO EMAIL REQUIRED</span>
          </div>
          <div className="assessment-art" aria-hidden="true">
            <div />
            <div />
            <div />
            <div />
            <Mark />
            <span>
              UNDERSTAND
              <br />
              YOUR POTENTIAL.
            </span>
          </div>
        </section>
      )}
      <CTA division={division} />
    </>
  );
}

export function AboutContent({
  division = "asset-management",
  parent = false,
}: {
  division?: Division;
  parent?: boolean;
}) {
  const engineering = division === "engineering";
  return (
    <>
      <PageIntro
        eyebrow={parent ? "ONE ORIGIN. TWO DISCIPLINES." : "WHO WE ARE"}
        title={
          parent ? (
            <>
              We started with engineering.
              <br />
              <em>We are building towards economies.</em>
            </>
          ) : engineering ? (
            <>
              Build. Connect.
              <br />
              <em>Deliver.</em>
            </>
          ) : (
            <>
              Infrastructure understood.
              <br />
              Assets optimised.
              <br />
              <em>Value multiplied.</em>
            </>
          )
        }
      />
      <section className="story-section">
        <div>
          <span className="eyebrow">OUR STORY / EST. SUMMER 2024</span>
          <h2>
            Engineering was
            <br />
            where we started.
          </h2>
          <Mark stroke />
        </div>
        <div>
          <p className="story-lead">
            Engineering was where we started. Understanding the lifetime and
            economic value of what we build is where Dreniak is going.
          </p>
          <p className="origin-story">{data.story}</p>
          <span className="eyebrow">DARREN KAMUNUGA · THE DRENIAK STORY</span>
        </div>
      </section>
      <section className="mission-vision">
        {(["mission", "vision"] as const).map((key, i) => (
          <article key={key}>
            <span className="eyebrow">
              0{i + 1} / OUR {key.toUpperCase()}
            </span>
            <h2>
              {key === "mission"
                ? "Purpose in the present."
                : "Value for generations."}
            </h2>
            <p>{data[key]}</p>
          </article>
        ))}
      </section>
      <section className="thinking">
        <span className="eyebrow">HOW WE THINK</span>
        <h2>
          {engineering
            ? "Every stage, connected."
            : "Different disciplines. Shared intelligence."}
        </h2>
        <div className="convergence">
          {(engineering
            ? [
                "Assessment",
                "Design",
                "Construction",
                "Handover",
                "Maintenance",
              ]
            : [
                "Engineering",
                "Asset Management",
                "Finance",
                "Economics",
                "Technology",
              ]
          ).map((s, i) => (
            <div key={s}>
              <span>{s}</span>
              {i < 4 && <b>×</b>}
            </div>
          ))}
          <Mark />
        </div>
        <p>
          {engineering
            ? "A whole-lifecycle approach to physical delivery."
            : "Engineering × Asset Management × Finance × Economics × Technology"}
        </p>
      </section>
      <section className="values-section">
        <div className="section-heading">
          <span className="eyebrow">OUR VALUES</span>
          <h2>What we stand for.</h2>
        </div>
        {data.values.map((v, i) => (
          <Reveal key={v.name}>
            <article>
              <span className="value-number">0{i + 1}</span>
              <h3>{v.name}</h3>
              <p>{v.text}</p>
            </article>
          </Reveal>
        ))}
      </section>
      <section className="leadership">
        <div>
          <span className="eyebrow">LEADERSHIP</span>
          <h2>
            A personal ambition.
            <br />A shared future.
          </h2>
        </div>
        <div className="leader-card">
          <div className="leader-avatar">
            <Motif density={170} />
            <span>DK</span>
            <Mark />
          </div>
          <div>
            <span className="eyebrow">DRENIAK LIMITED</span>
            <h3>Darren Kamunuga</h3>
            <p>Founder · Enquiries & consultations</p>
            <a className="text-link" href="mailto:info@dreniak.com">
              Start a conversation <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </section>
      <section className="footprint">
        <div>
          <span className="eyebrow">OUR FOOTPRINT</span>
          <h2>
            Rooted in Africa.
            <br />A global ambition.
          </h2>
          <p>UK | East Africa</p>
        </div>
        <div
          className="footprint-graphic"
          role="img"
          aria-label="Dreniak footprint connects the UK and East Africa"
        >
          <svg viewBox="0 0 500 280" aria-hidden="true">
            <defs>
              <pattern
                id="dots"
                width="15"
                height="15"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1" fill="currentColor" opacity=".3" />
              </pattern>
            </defs>
            <rect width="500" height="280" fill="url(#dots)" />
            <path
              d="M125 80 Q340 20 350 205"
              fill="none"
              stroke="currentColor"
              strokeDasharray="3 6"
            />
            <circle cx="125" cy="80" r="6" fill="currentColor" />
            <circle cx="350" cy="205" r="6" fill="currentColor" />
            <circle
              cx="125"
              cy="80"
              r="20"
              fill="none"
              stroke="currentColor"
              opacity=".3"
            />
            <circle
              cx="350"
              cy="205"
              r="20"
              fill="none"
              stroke="currentColor"
              opacity=".3"
            />
            <text x="115" y="42" fill="currentColor" fontSize="13">
              UK
            </text>
            <text x="325" y="250" fill="currentColor" fontSize="13">
              EAST AFRICA
            </text>
          </svg>
        </div>
      </section>
      <Standards division={division} />
    </>
  );
}

export function DivisionPage({
  division,
  page,
}: {
  division: Division;
  page: PageName;
}) {
  const engineering = division === "engineering";
  switch (page) {
    case "about":
      return <AboutContent division={division} />;
    case "services":
      return (
        <>
          <PageIntro
            eyebrow={
              engineering
                ? "FULL PROJECT-LIFECYCLE DELIVERY"
                : "SIX CONNECTED SERVICE PILLARS"
            }
            title={
              <>
                From understanding
                <br />
                to <em>{engineering ? "delivery." : "lasting value."}</em>
              </>
            }
            description={
              engineering
                ? "Site assessment, design integration, construction management and post-construction support."
                : "Engineering, intelligence, finance and economics. One connected approach to the lifetime value of infrastructure."
            }
          />
          <ServiceAccordion
            services={engineering ? engineeringServices : data.services}
            engineering={engineering}
          />
        </>
      );
    case "sectors":
      return (
        <>
          <PageIntro
            eyebrow="SECTORS WE SERVE"
            title={
              engineering ? (
                <>
                  Infrastructure.
                  <br />
                  <em>Built for its purpose.</em>
                </>
              ) : (
                <>
                  Complex assets.
                  <br />
                  <em>Connected economies.</em>
                </>
              )
            }
            description={
              engineering
                ? "Our project-lifecycle approach brings assessment, design, construction management and post-construction support together."
                : "We serve organisations, institutions and economies that own complex, long-life infrastructure."
            }
          />
          {engineering ? (
            <div className="engineering-sectors">
              <div className="sector-featured">
                {["Site & context", "Design & delivery"].map((s, i) => (
                  <article key={s}>
                    <span className="eyebrow">0{i + 1} / ENGINEERING</span>
                    <h2>{s}</h2>
                    <p>
                      {i === 0
                        ? "Site assessment, planning and regulatory compliance establish the foundation for project delivery."
                        : "Design integration, construction management and post-construction support connect each stage of the project lifecycle."}
                    </p>
                    <Link className="text-link" href="/engineering/contact">
                      Discuss your requirements <ArrowUpRight size={17} />
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <Sectors />
          )}
        </>
      );
    case "projects":
      return (
        <>
          <PageIntro
            eyebrow="PROJECTS & PORTFOLIO"
            title={
              <>
                The work behind
                <br />
                <em>the vision.</em>
              </>
            }
            description="Engineering delivery and asset intelligence, connected by a focus on long-term value."
          />
          <ProjectApproach />
        </>
      );
    case "insights":
      return (
        <>
          <PageIntro
            eyebrow="PERSPECTIVES / DARREN KAMUNUGA"
            title={
              <>
                Thinking beyond
                <br />
                <em>the immediate.</em>
              </>
            }
            description="Perspectives on infrastructure, engineering, asset management and the economies they serve."
          />
          <div className="insight-categories">
            <span>Industry insights</span>
            <span>Project updates</span>
            <span>Industry papers</span>
          </div>
          {insights.length ? (
            insights.map((item) => (
              <article className="insight-card" key={item.slug}>
                <span className="eyebrow">
                  {item.category} · {item.date}
                </span>
                <h2>
                  <Link href={`/${division}/insights/${item.slug}`}>
                    {item.title}
                  </Link>
                </h2>
                <p>{item.summary}</p>
              </article>
            ))
          ) : (
            <section className="insights-empty">
              <div>
                <span className="eyebrow">
                  THE LONGER VIEW / DRENIAK PERSPECTIVES
                </span>
                <h2>
                  Good questions
                  <br />
                  deserve room.
                </h2>
                <p>
                  Explore the questions that connect engineering, asset
                  management and economics. Join our newsletter for perspectives
                  on infrastructure and lasting value.
                </p>
              </div>
              <Mark stroke />
            </section>
          )}
          <div className="inline-newsletter">
            <Newsletter />
          </div>
        </>
      );
    case "standards":
      return (
        <>
          <PageIntro
            eyebrow="STANDARDS & GOVERNANCE"
            title={
              <>
                A considered framework.
                <br />
                <em>A higher standard.</em>
              </>
            }
          />
          <Standards division={division} full />
        </>
      );
    case "contact":
      return (
        <>
          <PageIntro
            eyebrow="A CONVERSATION WORTH STARTING"
            title={
              engineering ? (
                <>
                  Let’s talk about
                  <br />
                  <em>your next project.</em>
                </>
              ) : (
                <>
                  Start a Conversation
                  <br />
                  About <em>Your Assets.</em>
                </>
              )
            }
            description={
              engineering
                ? "Tell us about your project, site or engineering challenge."
                : "Tell us about your assets, portfolio or infrastructure challenge."
            }
          />
          <div className="contact-layout">
            <aside>
              <span className="eyebrow">DIRECT TO DRENIAK</span>
              <a className="contact-email" href="mailto:info@dreniak.com">
                info@dreniak.com <ArrowUpRight size={22} />
              </a>
              <p>For the attention of Darren Kamunuga.</p>
              <div className="contact-channel">
                <span className="eyebrow">GENERAL / UK</span>
                <a href="tel:+447789063938">+44 7789 063938</a>
                <a
                  href="https://wa.me/447789063938"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Start a WhatsApp conversation <ArrowUpRight size={15} />
                </a>
              </div>
              <div className="contact-channel">
                <span className="eyebrow">ENGINEERING / UGANDA</span>
                <a href="tel:+256704175005">+256 704 175 005</a>
                <a
                  href="https://wa.me/256704175005"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Message our Uganda team <ArrowUpRight size={15} />
                </a>
              </div>
              <div className="contact-channel">
                <span className="eyebrow">OFFICE HOURS</span>
                <p>
                  08:00–18:00
                  <br />
                  East Africa Time (UTC+3)
                </p>
              </div>
              <Mark stroke />
            </aside>
            <Suspense fallback={<p>Loading your enquiry form…</p>}>
              <EnquiryForm division={division} />
            </Suspense>
          </div>
        </>
      );
    case "approach":
      return (
        <>
          <PageIntro
            eyebrow={
              engineering
                ? "ENGINEERING / FULL LIFECYCLE"
                : "ASSET MANAGEMENT / INFRASTRUCTURE & ECONOMIC VALUE"
            }
            title={
              engineering ? (
                <>
                  The whole project.
                  <br />
                  <em>The longer view.</em>
                </>
              ) : (
                <>
                  Beyond the asset.
                  <br />
                  <em>Towards economies.</em>
                </>
              )
            }
            description={
              engineering
                ? "We connect site assessment, planning, design, construction and post-construction support."
                : "We help organisations understand what they own, maximise how it performs, determine where capital should go, and ensure infrastructure creates value far beyond the asset itself."
            }
          />
          {!engineering && <CapabilityJourney />}
          <div className="approach-feature">
            <div>
              <span className="eyebrow">
                {engineering ? "PHYSICAL DELIVERY" : "INFRASTRUCTURE HARMONY"}
              </span>
              <h2>
                {engineering
                  ? "Build with the future in mind."
                  : "See the system. Multiply the value."}
              </h2>
              <p>
                {engineering
                  ? "A site becomes a project. A project becomes an asset. The decisions made at every stage shape what that infrastructure can deliver throughout its life."
                  : "Our ambition goes beyond maintaining assets. We want to create infrastructure harmony: where buildings, transport, utilities, institutions and investment work together to strengthen businesses, communities and entire economies."}
              </p>
              <Link href={`/${division}/services`} className="text-link">
                Explore our services <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="approach-image">
              <Image
                src={`/images/${division}.webp`}
                alt="Conceptual infrastructure photography"
                fill
                sizes="(max-width: 760px) 100vw, 45vw"
              />
            </div>
          </div>
          <Standards division={division} />
        </>
      );
  }
}

export function AssessmentPage() {
  return (
    <>
      <PageIntro
        eyebrow="YOUR PRACTICAL STARTING POINT"
        title={
          <>
            Understand where you are.
            <br />
            <em>See what comes next.</em>
          </>
        }
        description="Reflect on six aspects of your organisation’s asset management. Get an indicative score and a starting point for improvement."
      />
      <Assessment />
    </>
  );
}
export function PortalPage() {
  return (
    <div className="portal-layout">
      <div>
        <span className="eyebrow">DRENIAK / CLIENT PORTAL</span>
        <h1>
          Your portfolio.
          <br />
          One perspective.
        </h1>
        <p>
          A future space for project updates, portfolio status and securely
          shared documents.
        </p>
        <Motif />
      </div>
      <section className="portal-card">
        <LockKeyhole size={32} strokeWidth={1.2} />
        <span className="eyebrow">CLIENT PORTAL — SIGN IN</span>
        <h2>
          A more connected
          <br />
          client experience.
        </h2>
        <p>
          The client portal is being prepared for Phase 2. Sign-in and document
          access are not available yet.
        </p>
        <p>
          Existing clients can request documents and project updates directly
          from the team.
        </p>
        <a
          href="mailto:info@dreniak.com?subject=Client%20portal%20access"
          className="button"
        >
          Contact your Dreniak team <MoveUpRight size={18} />
        </a>
        <Link href="/#divisions" className="text-link">
          Explore our divisions <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
