"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ImageLeaflet, type ImageCredit } from "./image-leaflet";
import { Mark } from "./brand";
import styles from "./signature-gallery.module.css";

export type SignatureGalleryItem = {
  id: string;
  label: string;
  icon: ReactNode;
  visual: string;
  imageSrc?: string;
  imageAlt?: string;
  imageCredit?: ImageCredit;
  imageNote?: string;
  rightsPending?: boolean;
  objectPosition?: string;
  summary?: string;
  href?: string;
  hrefLabel?: string;
};

function SectorArtwork({ visual, label, accentColor }: { visual: string; label: string; accentColor: string }) {
  const variant = visual.replace(/[^a-z-]/g, "");
  return (
    <svg className={styles.artwork} viewBox="0 0 960 600" role="img" aria-label={label} preserveAspectRatio="xMidYMid slice">
      <rect width="960" height="600" fill="#e4e0d7" />
      <path d="M0 438 160 345 315 405 500 270 690 355 960 185V600H0Z" fill="#c5c9c5" />
      <path d="M0 505 190 420 360 486 575 350 760 430 960 305V600H0Z" fill="#aeb8b7" opacity=".72" />
      {variant.includes("government") && <><path d="M120 390 320 220 520 390Z" fill="#52616a" /><path d="M155 382h330v96H155z" fill="#f0ede5" /><path d="M190 382v96M250 382v96M310 382v96M370 382v96M430 382v96" stroke="#52616a" strokeWidth="14" /></>}
      {variant.includes("energy") && <><path d="M150 390 350 150 550 390M410 210 630 90 830 390" fill="none" stroke="#52616a" strokeWidth="12" /><path d="M350 150v240M630 90v300" stroke="#52616a" strokeWidth="7" /><path d="M82 460h790" stroke="#52616a" strokeWidth="5" /></>}
      {variant.includes("transport") && <><path d="M40 440 920 300M40 510 920 370" stroke="#52616a" strokeWidth="15" /><path d="M80 400 870 520M80 470 870 590" stroke="#f0ede5" strokeWidth="8" /><path d="M190 170v340M470 130v340M750 90v340" stroke="#52616a" strokeWidth="7" /><path d="M115 200h690" stroke="#52616a" strokeWidth="7" /></>}
      {variant.includes("cities") && <><path d="M120 450V220h150v230M310 450V125h180v325M530 450V205h145v245M710 450V95h125v355" fill="#52616a" /><path d="M155 270h80M345 180h110M345 235h110M565 260h75M745 145h55M745 205h55" stroke="#e4e0d7" strokeWidth="12" /></>}
      {variant.includes("real-estate") && <><path d="m170 440 140-155 140 155Z" fill="#52616a" /><path d="m390 440 180-205 180 205Z" fill="#78898c" /><path d="M235 440v-95M300 440v-95M455 440V300M525 440V300M600 440V300" stroke="#e4e0d7" strokeWidth="14" /></>}
      {variant.includes("logistics") && <><path d="M110 420h690v74H110z" fill="#52616a" /><path d="M170 420V275h170v145M390 420V225h170v195M610 420V305h130v115" fill="#78898c" /><path d="M0 510h960" stroke="#52616a" strokeWidth="8" /></>}
      {variant.includes("healthcare") && <><path d="M170 450V245h620v205Z" fill="#f0ede5" stroke="#52616a" strokeWidth="12" /><path d="M430 270v150M355 345h150" stroke={accentColor} strokeWidth="26" /><path d="M220 450v-90M290 450v-90M670 450v-90M740 450v-90" stroke="#52616a" strokeWidth="12" /></>}
      {variant.includes("education") && <><path d="M105 445 430 235l325 210Z" fill="#52616a" /><path d="M185 430h490v90H185z" fill="#f0ede5" /><path d="M235 430v90M315 430v90M395 430v90M475 430v90M555 430v90" stroke="#52616a" strokeWidth="13" /></>}
      {variant.includes("highway") && <><path d="M40 480 900 255M40 555 900 330" stroke="#52616a" strokeWidth="38" /><path d="M90 500 850 300" stroke="#f0ede5" strokeWidth="6" strokeDasharray="30 26" /><path d="M210 185v315M650 85v315" stroke="#52616a" strokeWidth="13" /></>}
      {variant.includes("structural") && <><path d="M230 470 360 135h240l130 335M360 135v335M600 135v335M295 300h370" fill="none" stroke="#52616a" strokeWidth="16" /></>}
      {variant.includes("water") && <><path d="M90 430h780L670 180H290Z" fill="#52616a" /><path d="M135 485h690" stroke={accentColor} strokeWidth="22" /><path d="M260 430V210M700 430V210" stroke="#e4e0d7" strokeWidth="11" /></>}
      {variant.includes("management") && <><path d="M150 460V210h660v250" fill="#f0ede5" stroke="#52616a" strokeWidth="12" /><path d="M205 275h550M205 345h550" stroke="#52616a" strokeWidth="10" /><path d="M290 210v250M430 210v250M570 210v250M710 210v250" stroke="#52616a" strokeWidth="8" /></>}
      {variant.includes("geotechnical") && <><path d="M130 450 260 330 390 390 540 270 830 420" fill="none" stroke="#52616a" strokeWidth="28" /><path d="M480 70v380M450 100h60M450 180h60M450 260h60M450 340h60" stroke={accentColor} strokeWidth="9" /></>}
      <path d="M0 560h960" stroke={accentColor} strokeWidth="4" opacity=".9" />
      <text x="48" y="70" fill={accentColor} fontSize="16" letterSpacing="4">DRENIAK / FIELD STUDY</text>
    </svg>
  );
}

export function SignatureGallery({ items, accentColor, autoAdvanceMs = 7000 }: { items: SignatureGalleryItem[]; accentColor: string; autoAdvanceMs?: number }) {
  const [active, setActive] = useState(0);
  const [leafletIndex, setLeafletIndex] = useState<number | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || hasInteracted || items.length < 2) return;
    const timer = window.setInterval(() => setActive(index => (index + 1) % items.length), autoAdvanceMs);
    return () => window.clearInterval(timer);
  }, [autoAdvanceMs, hasInteracted, items.length, reduceMotion]);

  useEffect(() => {
    const button = railRef.current?.querySelector<HTMLButtonElement>(`[data-index="${active}"]`);
    button?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest", inline: "nearest" });
  }, [active, reduceMotion]);

  const select = (index: number) => {
    setHasInteracted(true);
    setActive(index);
  };

  if (!items.length) return null;
  const item = items[active];
  const transition = reduceMotion ? { duration: 0 } : { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <section className={styles.gallery} aria-label="Gallery selection" style={{ "--gallery-accent": accentColor } as CSSProperties}>
      <div className={styles.stage} id={`signature-stage-${item.id}`}>
        {!item.imageSrc && <div className={styles.stageBrand} aria-hidden="true"><Mark stroke /></div>}
        <AnimatePresence mode="sync" initial={false}>
          <m.div key={item.id} className={styles.stageImage} initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.025 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={transition}>
            {item.imageSrc ? <Image src={item.imageSrc} alt={item.imageAlt || item.label} fill sizes="(max-width: 760px) 100vw, 70vw" style={{ objectPosition: item.objectPosition }} /> : <SectorArtwork visual={item.visual} label={item.label} accentColor={accentColor} />}
          </m.div>
        </AnimatePresence>
      </div>
      <div ref={railRef} className={styles.rail} role="tablist" aria-label="Gallery selection" onMouseEnter={() => setHasInteracted(true)}>
        {items.map((entry, index) => {
          const selected = index === active;
          return <button key={entry.id} type="button" role="tab" data-index={index} aria-selected={selected} aria-controls={`signature-stage-${entry.id}`} className={styles.tab} style={{ borderColor: selected ? accentColor : "transparent" }} onPointerEnter={() => select(index)} onClick={() => { select(index); setLeafletIndex(index); }} onFocus={() => { setHasInteracted(true); setActive(index); }}>
            <span className={styles.tabLabel} style={{ opacity: selected ? 1 : .6 }}>{entry.label}</span>
            <span className={styles.tabIcon} style={{ color: accentColor, opacity: selected ? 1 : .5 }}>{entry.icon}</span>
          </button>;
        })}
      </div>
      <span className={styles.srOnly} aria-live="polite">{item.label}, {active + 1} of {items.length}</span>
      <ImageLeaflet
        open={leafletIndex !== null}
        onClose={() => setLeafletIndex(null)}
        title={leafletIndex === null ? "" : items[leafletIndex].label}
        image={leafletIndex === null ? undefined : items[leafletIndex].imageSrc}
        imageAlt={leafletIndex === null ? undefined : items[leafletIndex].imageAlt}
        fallback={leafletIndex === null ? undefined : <SectorArtwork visual={items[leafletIndex].visual} label={items[leafletIndex].label} accentColor={accentColor} />}
        credit={leafletIndex === null ? undefined : items[leafletIndex].imageCredit}
        note={leafletIndex === null ? undefined : items[leafletIndex].imageNote}
        rightsPending={leafletIndex !== null && items[leafletIndex].rightsPending}
        href={leafletIndex === null ? undefined : items[leafletIndex].href}
        hrefLabel={leafletIndex === null ? undefined : items[leafletIndex].hrefLabel}
      >
        {leafletIndex === null ? undefined : items[leafletIndex].summary}
      </ImageLeaflet>
    </section>
  );
}