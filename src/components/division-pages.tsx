import { ConceptualImage, hasConceptualImage } from "./conceptual-image";
import { insightImages } from "@/content/visual-assets";
import { ProjectGallery } from "./project-gallery";
import { LeadershipSection } from "./leadership-section";
import { ProjectLabel } from "./project-label";
import { engineering as engineeringContent } from "@/content/engineering";
import {
  EngineeringAbout,
  EngineeringSectors,
  EngineeringCareers,
} from "./engineering-pages";
import { ServicePillarIcon } from "./category-icons";
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
import { ConvergenceDiagram } from "./convergence-diagram";
import {
  type Division,
  type PageName,
  names,
  engineeringServices,
  insights,
} from "@/lib/site";
import data from "@/content/brief.json";
import { publicCompanyProfile, publicServices } from "@/lib/public-content";
import { publishedInsights, type PublishedInsight } from "@/lib/public-content";
import {
  assetManagementFeaturedProjects,
  assetManagementProjectCards,
} from "@/content/project-case-studies";

export async function DivisionHome({ division }: { division: Division }) {
  const engineering = division === "engineering";
  let profile = null;
  let databaseServices: Awaited<ReturnType<typeof publicServices>> = [];
  try {
    [profile, databaseServices] = await Promise.all([
      publicCompanyProfile(division),
      publicServices(division),
    ]);
  } catch {
    profile = null;
    databaseServices = [];
  }
  const services = databaseServices.length
    ? databaseServices
    : engineering ? engineeringServices : data.services;
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
          <span className="eyebrow">{profile?.landing_kicker || `DRENIAK ${names[division].toUpperCase()}`}</span>
          <h1>
            {profile?.landing_title || (engineering ? "Built with purpose. Delivered with precision." : "Infrastructure understood. Value multiplied.")}
          </h1>
          <p>{profile?.landing_description || (engineering
            ? "Engineering consultancy in Uganda. Consultancy & research, construction, supervision and contract management, connected by a focus on safe, efficient and sustainable projects."
            : "A longer view of what you own. A clearer understanding of what it can become.")}</p>
          <Link
            className="button light"
            href={
              engineering ? "/engineering/consultation" : `/${division}/contact`
            }
          >
            Book a Consultation
            <ArrowUpRight size={19} />
          </Link>
          {engineering && (
            <a
              className="engineering-hero-whatsapp text-link"
              href="https://wa.me/256704175005"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat on WhatsApp <ArrowUpRight size={17} />
            </a>
          )}
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
        <span className="eyebrow">{profile?.landing_intro_label || (engineering ? "A COMPLETE VIEW OF DELIVERY" : "THE VALUE BEYOND THE ASSET")}</span>
        <Reveal>
          <h2>
            {profile?.landing_intro || (engineering
              ? "Good engineering considers the whole project; great engineering also considers what comes after delivery."
              : "We help organisations understand what they own, maximise how it performs, determine where capital should go, and ensure infrastructure creates value far beyond the asset itself.")}
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
              {engineering ? "From the ground up." : "Services throughout the asset lifecycle."}
            </h2>
          </div>
          <Link className="text-link" href={`/${division}/services`}>
            All services <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="service-preview-grid">
          {services.map((s, i) => (
            <Link href={`/${division}/services#service-${i}`} key={s.name}>
              {engineering ? (
                <span className="eyebrow">0{i + 1}</span>
              ) : (
                <span className="category-icon">
                  <ServicePillarIcon index={i} />
                </span>
              )}
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
              Reflect on your asset management maturity with six questions that can help inform a conversation with our team.
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

function CompanyFootprint() {
  return (
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
  if (engineering && !parent)
    return (
      <EngineeringAbout>
        <CompanyFootprint />
      </EngineeringAbout>
    );
  return (
    <>
      <PageIntro
        eyebrow={parent ? "THE DRENIAK STORY" : "WHO WE ARE"}
        title={
          parent ? (
            <>
              Infrastructure first.
              <br />
              <em>Value for the long term.</em>
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
            A practical
            <br />
            beginning.
          </h2>
          <Mark stroke />
        </div>
        <div>
          <p className="story-lead">
            Our work starts with infrastructure and looks to the value it
            creates over time.
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
        <ConvergenceDiagram
          items={
            engineering
              ? [
                  "Assessment",
                  "Design",
                  "Construction",
                  "Handover",
                  "Maintenance",
                ]
              : [
                  "Infrastructure",
                  "Asset Management",
                  "Finance",
                  "Economics",
                  "Technology",
                ]
          }
          caption={
            engineering
              ? "A whole-lifecycle approach to physical delivery."
              : undefined
          }
        />
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
      <LeadershipSection context={parent ? "story" : division} />
      <CompanyFootprint />
      <Standards division={division} />
    </>
  );
}

export async function DivisionPage({
  division,
  page,
}: {
  division: Division;
  page: PageName;
}) {
  const engineering = division === "engineering";
  let databaseInsights: PublishedInsight[] = [];
  let databaseServices: Awaited<ReturnType<typeof publicServices>> = [];
  if (page === "insights") {
    try {
      databaseInsights = await publishedInsights(division);
    } catch {
      databaseInsights = [];
    }
  }
  if (page === "services") {
    try {
      databaseServices = await publicServices(division);
    } catch {
      databaseServices = [];
    }
  }
  switch (page) {
    case "careers":
      return <EngineeringCareers />;
    case "about":
      return <AboutContent division={division} />;
    case "services":
      return (
        <>
          <PageIntro
            eyebrow={
              engineering
                ? "ENGINEERING CONSULTANCY UGANDA"
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
                ? "Engineering Consultancy & Research, Construction, Supervision and Contract Management. Tell us about your project, site or engineering challenge."
                : "Our approach combines engineering, intelligence, finance and economics to address the lifetime value of infrastructure."
            }
          />
          <ServiceAccordion
            services={
              databaseServices.length
                ? databaseServices
                : engineering
                  ? engineeringServices
                  : data.services
            }
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
                ? "Construction Engineering is our lead focus, supported by five areas of engineering expertise."
                : "We serve organisations, institutions and economies that own complex, long-life infrastructure."
            }
          />
          {engineering ? <EngineeringSectors imagery /> : <Sectors imagery />}
        </>
      );
    case "projects":
      if (!engineering) {
        const featuredStudies = assetManagementFeaturedProjects.filter(
          (study) => study.isPublished,
        );

        return (
          <>
            <PageIntro
              eyebrow="PROJECTS & PORTFOLIO"
              title={
                <>
                  The work behind
                  <br />
                  <em>long-term value.</em>
                </>
              }
              description="We support organisations to improve how they understand, manage and invest in the assets that shape economic performance."
            />
            <div className="asset-projects-summary">
              <p>
                Recent case studies that connect asset decisions to operational,
                financial and portfolio-level performance.
              </p>
            </div>
            <div className="asset-projects-grid">
              {featuredStudies.map((study) => (
                <article key={study.slug} className="asset-project-card asset-project-card-featured">
                  <div className="asset-project-topline">
                    <ProjectLabel kind="location">{study.location}</ProjectLabel>
                    {study.status && <ProjectLabel kind="status">{study.status}</ProjectLabel>}
                  </div>
                  <h3>{study.title}</h3>
                  <p className="asset-project-subtitle">{study.subtitle}</p>
                  <p className="asset-project-summary">{study.summary}</p>
                  <div className="asset-project-tags">
                    {study.serviceLinks?.slice(0, 2).map((link) => (
                      <ProjectLabel key={link.label} kind="category">{link.label}</ProjectLabel>
                    ))}
                  </div>
                  <Link
                    href={`/asset-management/projects/${study.slug}`}
                    className="text-link"
                  >
                    Read the case study <ArrowUpRight size={16} />
                  </Link>
                </article>
              ))}
            </div>
            <div className="asset-projects-secondary">
              {assetManagementProjectCards.map((card) => (
                <article key={card.title} className="asset-project-card asset-project-card-secondary">
                  <div className="asset-project-topline">
                    <ProjectLabel kind="location">{card.location}</ProjectLabel>
                    <ProjectLabel kind="category">{card.sector}</ProjectLabel>
                  </div>
                  <h3>{card.title}</h3>
                  <p className="asset-project-subtitle">{card.hook}</p>
                  <p className="asset-project-summary">{card.body}</p>
                  <div className="asset-project-tags">
                    {card.capabilityTags.map((tag) => (
                      <ProjectLabel key={tag} kind="category">{tag}</ProjectLabel>
                    ))}
                  </div>
                  <p className="asset-project-value-line">{card.valueLine}</p>
                  <Link
                    href={card.href || "/asset-management/projects"}
                    className="text-link"
                  >
                    View project <ArrowUpRight size={16} />
                  </Link>
                </article>
              ))}
            </div>
            <ProjectApproach engineering={engineering} />
          </>
        );
      }

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
            description="Engineering delivery and asset intelligence guide our work on the long-term value of infrastructure."
          />
          {engineering && <ProjectGallery />}
          <ProjectApproach engineering={engineering} />
        </>
      );
    case "insights":
      return (
        <>
          <div
            className={
              hasConceptualImage(insightImages[division])
                ? "insights-hero"
                : undefined
            }
          >
            <PageIntro
              eyebrow={
                engineering
                  ? "ENGINEERING / INFO HUB"
                  : "PERSPECTIVES / DARREN KAMUNUGA"
              }
              title={
                <>
                  Perspectives on <br /> <em>infrastructure.</em>
                </>
              }
              description="Perspectives on infrastructure, engineering, asset management and the economies they serve."
            />
            <ConceptualImage
              asset={insightImages[division]}
              variant="editorial"
              caption="Conceptual editorial imagery"
            />
          </div>
          <div
            className={`insight-categories ${engineering ? "engineering-category-tags" : ""}`}
            role={engineering ? "list" : undefined}
            aria-label={
              engineering ? "Engineering insight categories" : undefined
            }
          >
            {(engineering
              ? engineeringContent.insightCategories
              : ["Industry insights", "Project updates", "Industry papers"]
            ).map((category) => (
              <span key={category} role={engineering ? "listitem" : undefined}>
                {category}
              </span>
            ))}
          </div>
          {databaseInsights.length ? (
            databaseInsights.map((item) => (
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
                  Ideas from <br /> Dreniak.
                </h2>
                <p>
                  Our newsletter explores questions across engineering, asset management and economics, with perspectives on infrastructure and the value it creates over time.
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
                A considered framework <br /> <em>for higher standards.</em>
              </>
            }
          />
          <Standards division={division} full />
        </>
      );
    case "consultation":
    case "contact":
      return (
        <>
          <PageIntro
            eyebrow={
              page === "consultation"
                ? "PROJECT INQUIRY / ENGINEERING"
                : "A CONVERSATION WORTH STARTING"
            }
            title={
              engineering ? (
                <>
                  {page === "consultation"
                    ? "Book a Consultation"
                    : "Let’s talk about"}
                  <br />
                  <em>
                    {page === "consultation"
                      ? "Your project starts here."
                      : "your next project."}
                  </em>
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
                ? "We connect engineering consultancy and research, construction, supervision and contract management."
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
                  ? "From the first decisions about a site through its development into an asset, each stage shapes what the infrastructure can deliver throughout its life."
                  : "Our ambition goes beyond maintaining assets. We want to create infrastructure harmony: where buildings, transport, utilities, institutions and investment work together to strengthen businesses, communities and entire economies."}
              </p>
              <Link href={`/${division}/services`} className="text-link">
                Explore our services <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="approach-image">
              <Image
                src={`/images/natural/${division}.webp`}
                alt={engineering ? "Conceptual illustration of a concrete civic structure under construction" : "Conceptual illustration of a viaduct crossing a green valley towards a city"}
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
          Stay connected <br /> to your projects.
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
