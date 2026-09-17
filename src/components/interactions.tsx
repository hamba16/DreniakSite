"use client";
import { ServicePillarIcon } from "./category-icons";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  Menu,
  X,
  ScanLine,
  Layers3,
  ChartNoAxesCombined,
  Network,
  ShieldCheck,
  TrendingUp,
  Plus,
  Minus,
  ArrowLeft,
} from "lucide-react";
import { Mark, Logo } from "./brand";
import markPath from "../../public/brand/mark-path.json";
import { names, type Division, type PageName, pageTitles } from "@/lib/site";
import { assessmentQuestions, scoreAssessment } from "@/lib/assessment";

const TransitionContext = createContext<
  (href: string, division: Division) => void
>(() => {});
export function Experience({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [transition, setTransition] = useState<Division | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );
  useEffect(() => {
    if (!transition) return;
    const id = setTimeout(() => setTransition(null), 850);
    return () => clearTimeout(id);
  }, [transition]);
  function navigate(href: string, division: Division) {
    if (transition) return;
    if (reduced) {
      router.push(href);
      return;
    }
    setTransition(division);
    timeout.current = setTimeout(() => router.push(href), 350);
  }
  return (
    <TransitionContext.Provider value={navigate}>
      <div key={pathname} className="page-enter">
        {children}
      </div>
      {transition && (
        <div className={`division-wipe ${transition}`} aria-hidden="true">
          <svg
            className="wipe-surface"
            viewBox="0 0 1440 1000"
            preserveAspectRatio="none"
          >
            <defs>
              <mask
                id="dreniak-arc-wipe"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="1440"
                height="1000"
              >
                <motion.g
                  initial={{ x: -550 }}
                  animate={{ x: 1600 }}
                  transition={{ duration: 0.35, ease: [0.65, 0, 0.25, 1] }}
                >
                  <rect
                    x="-2000"
                    y="0"
                    width="2000"
                    height="1000"
                    fill="white"
                  />
                  {[0, 1, 2, 3].map((i) => (
                    <path
                      key={i}
                      d={markPath}
                      fill="white"
                      transform={`translate(-5 ${i * 280 - 60}) scale(4 3)`}
                    />
                  ))}
                </motion.g>
              </mask>
              <pattern
                id="wipe-pattern"
                width="180"
                height="160"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={markPath}
                  fill="white"
                  opacity=".09"
                  transform="scale(1.3)"
                />
              </pattern>
            </defs>
            <g mask="url(#dreniak-arc-wipe)">
              <rect width="1440" height="1000" fill="var(--accent)" />
              <rect width="1440" height="1000" fill="url(#wipe-pattern)" />
            </g>
          </svg>
          <Mark />
        </div>
      )}
    </TransitionContext.Provider>
  );
}
export function DivisionLink({
  division,
  children,
  className = "",
  href,
}: {
  division: Division;
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  const navigate = useContext(TransitionContext);
  const target = href || `/${division}`;
  function click(e: MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
      return;
    e.preventDefault();
    navigate(target, division);
  }
  return (
    <Link href={target} onClick={click} className={className}>
      {children}
    </Link>
  );
}
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduced ? {} : { opacity: [0.6, 1], y: [20, 0] }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.7, delay }}
    >
      {children}
    </motion.div>
  );
}
export function Header({ division }: { division?: Division }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [open]);
  if (!division)
    return (
      <header className={`parent-header ${path !== "/" ? "on-light" : ""}`}>
        <Link href="/" aria-label="Dreniak home">
          <Mark />
        </Link>
        <span className="eyebrow">ONE ORIGIN. TWO DISCIPLINES.</span>
      </header>
    );
  const other: Division =
    division === "engineering" ? "asset-management" : "engineering";
  const nav: PageName[] = [
    "about",
    "approach",
    "services",
    "sectors",
    "projects",
    "insights",
    ...(division === "engineering" ? ["careers" as const] : []),
    "contact",
  ];
  return (
    <header className={`site-header ${division}`}>
      <div className="header-top">
        <Link href={`/${division}`} className="brand-link">
          <Logo />
          <span>{names[division]}</span>
        </Link>
        <div className="header-utilities">
          {division === "engineering" && (
            <Link
              className="header-consultation"
              href="/engineering/consultation"
            >
              Book a Consultation <ArrowUpRight size={13} />
            </Link>
          )}
          <Link href="/#divisions">
            Our divisions <ArrowUpRight size={13} />
          </Link>
          <Link href="/portal">
            Client portal <ArrowUpRight size={13} />
          </Link>
        </div>
        <button
          className="menu-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="division-nav"
          onClick={() => setOpen(!open)}
          ref={toggleRef}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <nav
        id="division-nav"
        aria-label="Division navigation"
        className={open ? "navigation open" : "navigation"}
      >
        {nav.map((page) => (
          <Link
            key={page}
            href={`/${division}/${page}`}
            aria-current={path === `/${division}/${page}` ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {page === "approach"
              ? names[division]
              : page === "about"
                ? "About"
                : page === "contact"
                  ? "Contact"
                  : page === "services"
                    ? "Services"
                    : pageTitles[page]
                        .replace("Our ", "")
                        .replace(" we serve", "")}
          </Link>
        ))}
        {division === "engineering" && (
          <Link
            className="mobile-consultation"
            href="/engineering/consultation"
            onClick={() => setOpen(false)}
          >
            Book a Consultation <ArrowUpRight size={14} />
          </Link>
        )}
        <DivisionLink division={other} className="switch-link">
          Switch to {names[other]} <ArrowUpRight size={14} />
        </DivisionLink>
      </nav>
    </header>
  );
}
export function ScrollCue() {
  return (
    <a href="#premise" className="scroll-cue">
      <span>SCROLL TO EXPLORE</span>
      <ArrowDown size={16} />
    </a>
  );
}
const stageIcons = [
  ScanLine,
  Layers3,
  ChartNoAxesCombined,
  Network,
  ShieldCheck,
  TrendingUp,
];
const stages = [
  "Understand",
  "Manage",
  "Invest",
  "Digitise",
  "Protect",
  "Grow",
];
const explanations = [
  "Know what you own, its condition, its performance and its potential.",
  "Make infrastructure perform better, cost less and last longer.",
  "Direct capital towards the greatest long-term value.",
  "Turn infrastructure data into intelligence and better decisions.",
  "Build resilience into your assets and your organisation.",
  "Connect infrastructure decisions to lasting economic growth.",
];
export function CapabilityJourney() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className="journey">
      <div
        className="journey-tabs"
        role="tablist"
        aria-label="Our capability journey"
      >
        {stages.map((stage, i) => {
          const Icon = stageIcons[i];
          return (
            <button
              key={stage}
              role="tab"
              id={`stage-${i}`}
              aria-controls="stage-panel"
              aria-selected={active === i}
              tabIndex={active === i ? 0 : -1}
              ref={(el) => {
                refs.current[i] = el;
              }}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                let next = i;
                if (e.key === "ArrowRight") next = (i + 1) % 6;
                else if (e.key === "ArrowLeft") next = (i + 5) % 6;
                else if (e.key === "Home") next = 0;
                else if (e.key === "End") next = 5;
                else return;
                e.preventDefault();
                setActive(next);
                refs.current[next]?.focus();
              }}
            >
              <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
              <span>{stage}</span>
              <ArrowRight className="stage-arrow" size={15} />
            </button>
          );
        })}
      </div>
      <div
        className="journey-explanation"
        id="stage-panel"
        role="tabpanel"
        aria-labelledby={`stage-${active}`}
        tabIndex={0}
      >
        <span>{stages[active]}</span>
        <p>{explanations[active]}</p>
        <Link
          href="/asset-management/services"
          aria-label={`Explore ${stages[active]} services`}
        >
          <ArrowUpRight />
        </Link>
      </div>
    </div>
  );
}
export type Service = {
  name: string;
  description: string;
  includes: string[];
  value: string;
};
export function ServiceAccordion({
  services,
  engineering = false,
}: {
  services: Service[];
  engineering?: boolean;
}) {
  const [active, setActive] = useState<number | null>(0);
  useEffect(() => {
    function syncHash() {
      const match = window.location.hash.match(/^#service-(\d+)$/);
      if (match) {
        const index = Number(match[1]);
        if (index < services.length) {
          setActive(index);
          requestAnimationFrame(() =>
            document
              .getElementById(`service-heading-${index}`)
              ?.scrollIntoView({ block: "start" }),
          );
        }
      }
    }
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [services.length]);
  return (
    <div
      className={`service-list ${engineering ? "engineering-services" : "asset-services"}`}
    >
      {services.map((s, i) => {
        const Icon = stageIcons[i % 6];
        return (
          <section
            className={`service ${active === i ? "expanded" : ""} ${i === 5 ? "signature" : ""}`}
            key={s.name}
          >
            <h2 id={`service-heading-${i}`}>
              <button
                aria-expanded={active === i}
                aria-controls={`service-${i}`}
                onClick={() => setActive(active === i ? null : i)}
              >
                {engineering ? (
                  <>
                    <span className="service-index">0{i + 1}</span>
                    <Icon className="service-icon" aria-hidden="true" />
                  </>
                ) : (
                  <ServicePillarIcon index={i} className="service-icon" />
                )}
                <span className="service-title">
                  {s.name}
                  {i === 5 && <small>OUR SIGNATURE CAPABILITY</small>}
                </span>
                {active === i ? <Minus /> : <Plus />}
              </button>
            </h2>
            <div
              id={`service-${i}`}
              hidden={active !== i}
              className="service-content"
            >
              <p>{s.description}</p>
              <div>
                <span className="eyebrow">INCLUDES</span>
                <ul>
                  {s.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <p className="economic-value">
                <span className="eyebrow">
                  {engineering ? "DELIVERY FOCUS" : "ECONOMIC VALUE"}
                </span>
                <strong>{s.value}</strong>
              </p>
            </div>
          </section>
        );
      })}
    </div>
  );
}
export function Assessment() {
  const questionCount = assessmentQuestions.length;
  const questionCountLabel = questionCount === 6 ? "Six" : String(questionCount);
  const [answers, setAnswers] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const q = assessmentQuestions[step];
  const result = finished ? scoreAssessment(answers) : null;
  function go(n: number) {
    setStep(n);
    requestAnimationFrame(() => heading.current?.focus());
  }
  return (
    <div className="assessment" id="assessment">
      {result ? (
        <>
          <span className="eyebrow">YOUR INDICATIVE RESULT</span>
          <div className="score">
            <span>{result.score}</span>
            <small>/ 100</small>
          </div>
          <h2 tabIndex={-1} ref={heading}>
            {result.label}
          </h2>
          <p>{result.description}</p>
          <div className="score-breakdown">
            {assessmentQuestions.map((question, i) => (
              <div key={question.area}>
                <span>{question.area}</span>
                <meter
                  min="0"
                  max="3"
                  value={answers[i]}
                  aria-label={question.area}
                />
                <span>{answers[i]} / 3</span>
              </div>
            ))}
          </div>
          <p className="fine-print">
            A self-reported starting point for a conversation. This is not an
            audit, certification, investment recommendation or a formal ISO
            assessment. Your answers stay in this browser and are not submitted.
          </p>
          <Link
            className="button"
            href={`/asset-management/contact?assessment=${result.score}`}
          >
            Discuss your result <ArrowUpRight size={18} />
          </Link>
          <button
            className="text-button"
            onClick={() => {
              setFinished(false);
              setAnswers([]);
              go(0);
            }}
          >
            Start again <ArrowLeft size={16} />
          </button>
        </>
      ) : (
        <>
          <div className="assessment-top">
            <span className="eyebrow">ASSET MANAGEMENT MATURITY</span>
            <span>
              {String(step + 1).padStart(2, "0")} /{" "}
              {String(questionCount).padStart(2, "0")}
            </span>
          </div>
          <progress max={questionCount} value={step + 1} aria-label="Assessment progress" />
          <span className="eyebrow">{q.area}</span>
          <h2 ref={heading} tabIndex={-1}>
            {q.question}
          </h2>
          <fieldset>
            <legend className="sr-only">
              Choose the answer that best describes your organisation
            </legend>
            {q.options.map((option, i) => (
              <label
                key={option}
                className={answers[step] === i ? "selected" : ""}
              >
                <input
                  type="radio"
                  name={`answer-${step}`}
                  checked={answers[step] === i}
                  onChange={() =>
                    setAnswers((a) => {
                      const b = [...a];
                      b[step] = i;
                      return b;
                    })
                  }
                />
                <span>{option}</span>
                <span className="option-letter">
                  {String.fromCharCode(65 + i)}
                </span>
              </label>
            ))}
          </fieldset>
          <div className="assessment-actions">
            <button
              className="text-button"
              disabled={step === 0}
              onClick={() => go(step - 1)}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              className="button"
              disabled={answers[step] === undefined}
              onClick={() => {
                if (step === questionCount - 1) {
                  setFinished(true);
                  requestAnimationFrame(() => heading.current?.focus());
                } else go(step + 1);
              }}
            >
              {step === questionCount - 1 ? "See my result" : "Next question"}{" "}
              <ArrowRight size={18} />
            </button>
          </div>
          <p className="fine-print">
            {questionCountLabel} questions. Approximately two minutes. No email required.
          </p>
        </>
      )}
    </div>
  );
}
