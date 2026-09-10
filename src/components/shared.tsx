import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Mail,
  Phone,
  Landmark,
  Zap,
  TrainFront,
  Building2,
  Factory,
  HeartPulse,
  GraduationCap,
  Building,
  ShieldCheck,
} from "lucide-react";
import { Logo, Mark, Motif } from "./brand";
import { Newsletter } from "./forms";
import { names, socialLinks, type Division } from "@/lib/site";
import { DivisionLink } from "./interactions";
import data from "@/content/brief.json";
export function Footer() {
  return (
    <footer className="footer">
      <Motif />
      <div className="footer-top">
        <div>
          <Link href="/" aria-label="Dreniak home">
            <Logo />
          </Link>
          <p>
            Engineering the Longevity
            <br />
            of Civilisation.
          </p>
          <span className="eyebrow">UK · EAST AFRICA</span>
        </div>
        <div className="footer-links">
          <span className="eyebrow">ONE COMPANY. TWO DISCIPLINES.</span>
          <DivisionLink division="engineering">
            Engineering <ArrowUpRight size={16} />
          </DivisionLink>
          <DivisionLink division="asset-management">
            Asset Management <ArrowUpRight size={16} />
          </DivisionLink>
          <Link href="/story">
            Our story <ArrowUpRight size={16} />
          </Link>
          <Link href="/portal">
            Client portal <ArrowUpRight size={16} />
          </Link>
          {socialLinks.map(({ name, href }) => (
            <a key={name} href={href} target="_blank" rel="noopener noreferrer">
              {name}
              <ArrowUpRight size={16} />
            </a>
          ))}
        </div>
        <Newsletter />
      </div>
      <div className="footer-contact">
        <a href="mailto:info@dreniak.com">
          <Mail size={15} /> info@dreniak.com
        </a>
        <a href="tel:+447789063938">
          <Phone size={15} /> +44 7789 063938
        </a>
        <a href="tel:+256704175005">UG +256 704 175 005</a>
        <span>08:00–18:00 · East Africa Time</span>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Dreniak Limited. Live the Future.
        </span>
        <Link href="/privacy">Privacy</Link>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
export function CTA({
  division = "asset-management",
}: {
  division?: Division;
}) {
  return (
    <section className={`cta ${division}`}>
      <Motif />
      <div>
        <span className="eyebrow">
          THE NEXT CHAPTER STARTS WITH A CONVERSATION
        </span>
        <h2>
          {division === "engineering" ? (
            <>
              Let’s build
              <br />
              what comes next.
            </>
          ) : (
            <>
              A longer view.
              <br />A better starting point.
            </>
          )}
        </h2>
      </div>
      <Link href={`/${division}/contact`} className="cta-link">
        {division === "engineering"
          ? "Tell us about your project"
          : "Start a Conversation About Your Assets"}
        <span>
          <ArrowUpRight />
        </span>
      </Link>
    </section>
  );
}
export function Standards({
  division,
  full = false,
}: {
  division: Division;
  full?: boolean;
}) {
  const engineering = division === "engineering";
  return (
    <section className="standards-section">
      <div className="standard-emblem">
        <Mark />
        <span>
          {engineering ? "REGISTERED PRACTICE" : "ASSET MANAGEMENT FRAMEWORK"}
        </span>
        <strong>
          {engineering ? "ERB" : "ISO"}
          <b>{engineering ? "UGANDA" : "55000"}</b>
        </strong>
        <div className="emblem-bottom">
          <ShieldCheck size={18} />
          {engineering ? "DRENIAK ENGINEERING" : "LONG-TERM VALUE"}
        </div>
      </div>
      <div>
        <span className="eyebrow">STANDARDS & GOVERNANCE</span>
        <h2>
          {engineering
            ? "Accountable by design."
            : "A framework for lasting value."}
        </h2>
        <p>
          {engineering
            ? "Dreniak Engineering is registered with the Engineers Registration Board of Uganda. Engineering standards, safety and quality sit at the centre of our project-lifecycle approach."
            : "ISO 55000 provides the asset management framework at the centre of our approach: connecting organisational objectives with the value created by assets throughout their lives."}
        </p>
        {!engineering && (
          <>
            <div className="secondary-standards">
              {["19650", "31000", "14001", "45001", "50001"].map((s) => (
                <span key={s}>ISO {s}</span>
              ))}
            </div>
          </>
        )}
        {!full && (
          <Link className="text-link" href={`/${division}/standards`}>
            Explore our approach to governance <ArrowUpRight size={17} />
          </Link>
        )}
      </div>
    </section>
  );
}
const sectorIcons = [
  Landmark,
  Zap,
  TrainFront,
  Building2,
  Building,
  Factory,
  HeartPulse,
  GraduationCap,
];
export function Sectors({ preview = false }: { preview?: boolean }) {
  return (
    <>
      <div className="sector-featured">
        {data.sectors.slice(0, 4).map((s, i) => {
          const Icon = sectorIcons[i];
          return (
            <article key={s.name}>
              <div className="sector-top">
                <Icon size={32} strokeWidth={1.2} />
                <span>0{i + 1}</span>
              </div>
              <h3>{s.name}</h3>
              <p>{s.description}</p>
              <Link
                href={`/asset-management/contact?sector=${encodeURIComponent(s.name)}`}
                className="text-link"
              >
                Start a conversation <ArrowUpRight size={16} />
              </Link>
            </article>
          );
        })}
      </div>
      {!preview && (
        <>
          <div className="section-heading compact">
            <span className="eyebrow">ORGANISATIONS & ESTATES</span>
            <h2>Value across every portfolio.</h2>
          </div>
          <div className="sector-secondary">
            {data.sectors.slice(4).map((s, i) => {
              const Icon = sectorIcons[i + 4];
              return (
                <article key={s.name}>
                  <Icon size={26} strokeWidth={1.3} />
                  <div>
                    <h3>{s.name}</h3>
                    <p>{s.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
export function Breadcrumb({
  division,
  label,
}: {
  division: Division;
  label?: string;
}) {
  return (
    <div className="breadcrumb">
      <Link href="/#divisions">Dreniak</Link>
      <span>/</span>
      <Link href={`/${division}`}>{names[division]}</Link>
      {label && (
        <>
          <span>/</span>
          <span>{label}</span>
        </>
      )}
    </div>
  );
}
export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="page-intro">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}
export function ProjectApproach() {
  return (
    <div className="projects-ready">
      <div className="project-placeholder">
        <Mark stroke />
        <span className="eyebrow">OUR PROJECT APPROACH</span>
        <h2>
          The work.
          <br />
          The thinking.
          <br />
          The lasting value.
        </h2>
        <p>
          We connect the immediate infrastructure challenge with the decisions
          that shape its lifetime performance and economic value.
        </p>
      </div>
      <div className="case-framework">
        {["Problem", "Intervention", "Result", "Long-term Value"].map(
          (s, i) => (
            <div key={s}>
              <span>0{i + 1}</span>
              <h3>{s}</h3>
              <ArrowRight size={20} />
            </div>
          ),
        )}
        <p className="fine-print">
          Problem. Intervention. Result. Long-term Value. A connected view of
          the challenge, the response and the value infrastructure creates.
        </p>
      </div>
    </div>
  );
}
