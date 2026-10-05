"use client";

import { useId, useRef, useState, type CSSProperties } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { careerRoles } from "@/content/careers";
import styles from "./career-roles.module.css";

// Original line drawings for each discipline, in careerRoles order.
const drawings = [
  {
    lines: "M65 180V72L160 28L255 72V180M65 72L160 116L255 72M160 116V224M65 126L160 170L255 126M65 180L160 224L255 180M65 72L160 170M160 116L65 126M160 170L255 72",
    accent: "M65 72L160 28L255 72L160 116Z",
  },
  {
    lines: "M66 48H254V196H66ZM76 58H244V186H76M166 58V124H244M76 132H144V186M174 186V150H244M166 94H200V58M112 132V97H76M144 150A18 18 0 0 1 162 168M144 150V168M66 28H254M66 23V33M254 23V33M274 48V196M269 48H279M269 196H279",
    accent: "M76 132H144V186M166 58V124H244",
  },
  {
    lines: "M35 171L137 219L289 148L187 100ZM77 161V83L174 38L247 72V151M77 83L150 117L247 72M150 117V195M77 161L150 195L247 151M102 173V95M126 185V106M182 180V102M215 165V87M35 156V186M20 171H50M289 133V163M274 148H304",
    accent: "M77 83L174 38L247 72L150 117ZM150 117V195",
  },
  {
    lines: "M62 156L160 207L258 156M62 134L160 185L258 134M62 112L160 163L258 112L160 61ZM62 112V156M258 112V156M160 163V207",
    accent: "M114 110L149 128L207 99M160 26V55M146 40L160 26L174 40",
  },
  {
    lines: "M83 72L160 120L242 65M160 120L232 187M160 120L76 185M64 53H102V91H64ZM228 51H256V79H228ZM210 165H254V209H210ZM63 172H89V198H63Z",
    accent: "M128 120L160 88L192 120L160 152ZM145 120H175M160 105V135",
  },
  {
    lines: "M54 42V198H270M80 176V138H112V176M136 176V106H168V176M192 176V70H224V176M80 106L136 78L192 48L248 32",
    accent: "M80 106L136 78L192 48L248 32M232 32H248V48",
  },
  {
    lines: "M108 82H212V158H108ZM126 100H194M126 116H174M126 132H184M54 36H102V66H54ZM218 36H266V66H218ZM54 174H102V204H54ZM218 174H266V204H218M78 66V120H108M212 120H242V66M78 174V144H108M212 144H242V174",
    accent: "M108 82H212V158H108ZM144 174H176M160 158V174",
  },
];

function RoleDrawing({ index }: { index: number }) {
  const drawing = drawings[index];
  return (
    <svg className={styles.drawing} viewBox="0 0 320 240" fill="none" aria-hidden="true">
      <g className={styles.guides} stroke="currentColor" strokeWidth="0.7">
        <path d="M20 200H300M40 20V220M280 20V220M20 40H300" strokeDasharray="3 6" />
        <circle cx="160" cy="120" r="92" />
        <path d="M152 120H168M160 112V128" />
      </g>
      <g className={styles.linework} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
        <path d={drawing.lines} />
        <path className={styles.highlight} d={drawing.accent} />
      </g>
    </svg>
  );
}

export function CareerRoles() {
  const [active, setActive] = useState(0);
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const role = careerRoles[active];
  const nextIndex = (active + 1) % careerRoles.length;

  function selectRole(index: number, focus = false) {
    setActive(index);
    if (focus) refs.current[index]?.focus({ preventScroll: true });
    refs.current[index]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
  }

  return (
    <section className={styles.roles} aria-label="Working across our disciplines">
      <div className={styles.intro}>
        <div>
          <span className="eyebrow">A VIEW OF THE WORK</span>
          <h2>Different roles.<br /><em>Shared purpose.</em></h2>
        </div>
        <p className={styles.note}>These examples describe the kind of work a role may involve. Actual responsibilities depend on the project and your experience. They are not vacancy announcements or formal training programmes.</p>
      </div>
      <div className={styles.explorer}>
        <div className={styles.indexHeader} aria-hidden="true">
          <span>Explore a discipline <ArrowDownRight size={15} /></span>
          <span>01 — {String(careerRoles.length).padStart(2, "0")}</span>
        </div>
        <div className={styles.tabViewport}>
          <div className={styles.tabs} role="tablist" aria-label="Explore a role"
            style={{ "--active-role": active, "--role-count": careerRoles.length } as CSSProperties}>
            {careerRoles.map((item, index) => (
              <button type="button" key={item.name} role="tab" id={`${id}-${index}`}
                aria-selected={active === index} aria-controls={`${id}-panel`}
                tabIndex={active === index ? 0 : -1}
                ref={(node) => { refs.current[index] = node; }}
                onClick={() => selectRole(index)}
                onKeyDown={(event) => {
                  const next = event.key === "ArrowRight" ? (index + 1) % careerRoles.length
                    : event.key === "ArrowLeft" ? (index + careerRoles.length - 1) % careerRoles.length
                    : event.key === "Home" ? 0 : event.key === "End" ? careerRoles.length - 1 : null;
                  if (next === null) return;
                  event.preventDefault();
                  selectRole(next, true);
                }}>
                <span className={styles.tabNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span>{item.name}</span>
                <ArrowUpRight className={styles.tabArrow} size={18} aria-hidden="true" />
              </button>
            ))}
            <span className={styles.tabIndicator} aria-hidden="true" />
          </div>
        </div>
        <div className={styles.card} role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${active}`} tabIndex={0}>
          <div className={styles.panelBody} key={role.name}>
            <div className={styles.roleVisual}>
              <div className={styles.roleHeading}>
                <span className={styles.kicker}>The discipline</span>
                <h3>{role.name}</h3>
              </div>
              <RoleDrawing index={active} />
              <div className={styles.visualFooter} aria-hidden="true">
                <span className={styles.roleNumber}>{String(active + 1).padStart(2, "0")}</span>
                <span>DRENIAK<br />A shared perspective</span>
              </div>
            </div>
            <dl className={styles.details}>
              <div className={styles.week}>
                <dt><span aria-hidden="true">01 /</span> A typical week</dt><dd>{role.week}</dd>
              </div>
              <div className={styles.detail}>
                <dt><span aria-hidden="true">02 /</span> What you pick up</dt><dd>{role.learning}</dd>
              </div>
              <div className={styles.detail}>
                <dt><span aria-hidden="true">03 /</span> Who you work alongside</dt><dd>{role.alongside}</dd>
              </div>
            </dl>
          </div>
          <div className={styles.panelFooter}>
            <p className={styles.closing}>You will be asked what you think. We would rather hear a question early than a problem late.</p>
            <button className={styles.nextRole} type="button" onClick={() => selectRole(nextIndex)} aria-label={`Next role: ${careerRoles[nextIndex].name}`}>
              <span><span className={styles.kicker}>Next role</span>{careerRoles[nextIndex].name}</span>
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
