"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, ScanLine, Layers3, ChartNoAxesCombined, Network, ShieldCheck, TrendingUp } from "lucide-react";
import styles from "./asset-prism.module.css";

const stages = ["Understand", "Manage", "Invest", "Digitise", "Protect", "Grow"];
const explanations = [
  "Know what you own, its condition, its performance and its potential.",
  "Make infrastructure perform better, cost less and last longer.",
  "Direct capital towards the greatest long-term value.",
  "Turn infrastructure data into intelligence and better decisions.",
  "Build resilience into your assets and your organisation.",
  "Connect infrastructure decisions to lasting economic growth.",
];
const icons = [ScanLine, Layers3, ChartNoAxesCombined, Network, ShieldCheck, TrendingUp];
type DeviceHints = Navigator & { deviceMemory?: number; connection?: EventTarget & { saveData?: boolean } };
function capability() {
  const hints = navigator as DeviceHints;
  return matchMedia("(prefers-reduced-motion: reduce)").matches || hints.connection?.saveData ||
    (hints.deviceMemory !== undefined && hints.deviceMemory <= 2) ||
    (hints.hardwareConcurrency > 0 && hints.hardwareConcurrency <= 2) ||
    !CSS.supports("transform-style", "preserve-3d") ? "flat" : "prism";
}
function subscribe(update: () => void) {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const connection = (navigator as DeviceHints).connection;
  media.addEventListener("change", update); connection?.addEventListener?.("change", update);
  return () => { media.removeEventListener("change", update); connection?.removeEventListener?.("change", update); };
}
const serverCapability = () => "server";

export function CapabilityJourney() {
  const mode = useSyncExternalStore(subscribe, capability, serverCapability);
  const id = useId();
  const [turn, setTurn] = useState(0);
  const active = ((turn % 6) + 6) % 6;
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const gesture = useRef<{ x: number; y: number; time: number; drag: boolean; vertical: boolean } | null>(null);
  const suppressClick = useRef(false);
  const manual = useRef(false);

  const select = (index: number) => {
    manual.current = true;
    const delta = ((index - active + 9) % 6) - 3;
    setTurn(value => value + delta);
  };

  // Preserve gentle automatic progression, but never restart it after interaction.
  useEffect(() => {
    if (mode !== "prism") return;
    const element = root.current;
    if (!element) return;
    let visible = false;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: .45 });
    observer.observe(element);
    const timer = window.setInterval(() => {
      if (!visible || document.hidden || manual.current || gesture.current || element.matches(":hover, :focus-within")) return;
      setTurn(value => value + 1);
    }, 6500);
    return () => { clearInterval(timer); observer.disconnect(); };
  }, [mode]);

  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = gesture.current;
    if (start) {
      const dx = event.clientX - start.x; const dy = event.clientY - start.y;
      if (!start.drag && Math.hypot(dx, dy) >= 8) {
        start.vertical = Math.abs(dy) > Math.abs(dx);
        start.drag = !start.vertical;
        if (start.drag) { manual.current = true; event.currentTarget.setPointerCapture(event.pointerId); }
      }
      if (start.drag && !start.vertical) {
        event.currentTarget.style.setProperty("--drag", `${Math.max(-45, Math.min(45, dx / 5))}deg`);
        event.currentTarget.dataset.dragging = "true";
      }
    } else if (mode === "prism" && event.pointerType === "mouse" && matchMedia("(pointer: fine)").matches) {
      const box = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty("--tilt", `${((event.clientX - box.left) / box.width - .5) * 4}deg`);
    }
  };
  const end = (event: PointerEvent<HTMLDivElement>, cancel = false) => {
    const start = gesture.current; gesture.current = null;
    event.currentTarget.style.removeProperty("--drag"); event.currentTarget.dataset.dragging = "false";
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    suppressClick.current = !!start?.drag;
    if (cancel || !start?.drag || start.vertical) return;
    const dx = event.clientX - start.x;
    const velocity = dx / Math.max(1, performance.now() - start.time);
    const steps = Math.max(1, Math.min(2, Math.round((Math.abs(dx) + Math.abs(velocity) * 70) / 160)));
    setTurn(value => value + (dx < 0 ? steps : -steps));
  };

  return <div ref={root} className={`journey ${styles.root}`} data-mode={mode} data-active-stage={stages[active]}>
    <div className={styles.tabs} role={mode === "server" ? undefined : "tablist"} aria-label="Our capability journey">
      {stages.map((stage, index) => {
        const Icon = icons[index];
        if (mode === "server") return <a key={stage} id={`${id}-tab-${index}`} href={`#${id}-panel-${index}`}><Icon size={22} aria-hidden="true" /><span>{stage}</span></a>;
        return <button key={stage} type="button" id={`${id}-tab-${index}`} role="tab" aria-selected={active === index}
          aria-controls={`${id}-panel-${index}`} tabIndex={active === index ? 0 : -1}
          ref={node => { tabs.current[index] = node; }} onClick={() => select(index)}
          onKeyDown={event => {
            const next = event.key === "ArrowRight" ? (index + 1) % 6 : event.key === "ArrowLeft" ? (index + 5) % 6 : event.key === "Home" ? 0 : event.key === "End" ? 5 : null;
            if (next === null) return; event.preventDefault(); select(next); tabs.current[next]?.focus();
          }}><Icon size={22} aria-hidden="true" /><span>{stage}</span></button>;
      })}
    </div>
    <div className={styles.progress} aria-hidden="true">{stages.map((stage,index)=><span key={stage} data-active={active===index}/>)}</div>
    <div className={styles.stage} style={{ "--turn": `${turn * -60}deg` } as CSSProperties}
      onPointerDown={event => { if (event.button !== 0) return; suppressClick.current = false; gesture.current = { x:event.clientX,y:event.clientY,time:performance.now(),drag:false,vertical:false }; }}
      onPointerMove={pointerMove} onPointerUp={event=>end(event)} onPointerCancel={event=>end(event,true)}
      onPointerLeave={event=>{event.currentTarget.style.removeProperty("--tilt"); if(gesture.current && !gesture.current.drag) gesture.current=null;}}
      onClickCapture={event=>{if(suppressClick.current){event.preventDefault();event.stopPropagation();suppressClick.current=false;}}}>
      <div className={styles.rotor}>
        {stages.map((stage,index)=>{
          const Icon=icons[index]; const offset=((index-active+9)%6)-3;
          return <section key={stage} id={`${id}-panel-${index}`} role={mode==="server"?undefined:"tabpanel"}
            aria-labelledby={`${id}-tab-${index}`} aria-hidden={mode!=="server" && active!==index ? true : undefined}
            inert={mode!=="server" && active!==index ? true : undefined} tabIndex={mode!=="server" && active===index?0:undefined}
            className={styles.face} data-active={active===index} data-offset={offset}
            style={{"--face":`${index*60}deg`} as CSSProperties}>
            <div className={styles.artifact} data-artifact={index} aria-hidden="true"><Icon size={80} strokeWidth={.8}/></div>
            <span className={styles.label}>{stage}</span><p>{explanations[index]}</p>
            <Link href="/asset-management/services" aria-label={`Explore ${stage} services`}>Explore services <ArrowUpRight size={18} aria-hidden="true"/></Link>
          </section>;
        })}
      </div>
      {mode==="prism" && <><button type="button" className={`${styles.neighbour} ${styles.previous}`} tabIndex={-1} aria-hidden="true" onClick={()=>select((active+5)%6)}>‹</button><button type="button" className={`${styles.neighbour} ${styles.next}`} tabIndex={-1} aria-hidden="true" onClick={()=>select((active+1)%6)}>›</button></>}
    </div>
  </div>;
}
