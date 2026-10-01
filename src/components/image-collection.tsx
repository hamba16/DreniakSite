"use client";

import type { StaticImageData } from "next/image";
import { Children, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { ImageLeaflet, type ImageCredit } from "./image-leaflet";
import styles from "./image-collection.module.css";

export type ImageChoice = {
  label: string;
  image?: StaticImageData | string;
  imageAlt?: string;
  summary?: string;
  note?: string;
  credit?: ImageCredit;
  href?: string;
  hrefLabel?: string;
};

/** One set of original cards: an expanding contact sheet, with native swiping on small screens. */
export function ImageCollection({ items, children, className, label, kind = "sector" }: {
  items: ImageChoice[];
  children: ReactNode;
  className: string;
  label: string;
  kind?: "sector" | "project" | "people";
}) {
  const [active, setActive] = useState(0);
  const [leafletIndex, setLeafletIndex] = useState<number | null>(null);
  const rail = useRef<HTMLDivElement>(null);
  const id = useId();
  const cards = Children.toArray(children);
  const enabled = items.length > 1 && items.some(item => item.image);

  useEffect(() => {
    const element = rail.current;
    if (!element || !enabled) return;
    element.dataset.ready = "true";
    let frame = 0;
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (getComputedStyle(element).overflowX !== "auto") return;
        const left = element.getBoundingClientRect().left;
        const leaves = Array.from(element.children) as HTMLElement[];
        const closest = leaves.reduce((best, leaf, index) =>
          Math.abs(leaf.getBoundingClientRect().left - left) < Math.abs(leaves[best].getBoundingClientRect().left - left) ? index : best, 0);
        setActive(closest);
      });
    };
    // Preserve deep links to team members, including links followed within this page.
    const hash = () => {
      let anchor = location.hash.slice(1);
      try { anchor = decodeURIComponent(anchor); } catch { return; }
      const target = document.getElementById(anchor);
      const index = Array.from(element.children).findIndex(child => target && child.contains(target));
      if (index >= 0) setActive(index);
    };
    element.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("hashchange", hash);
    hash();
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener("scroll", sync);
      delete element.dataset.ready;
      window.removeEventListener("hashchange", hash);
    };
  }, [enabled]);

  if (!enabled) return <div className={className} data-count={items.length}>{children}</div>;

  const select = (index: number, keyboard = false) => {
    const next = (index + items.length) % items.length;
    setActive(next);
    const element = rail.current;
    const leaf = element?.children[next] as HTMLElement | undefined;
    if (keyboard) leaf?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    if (element && leaf && getComputedStyle(element).overflowX === "auto") {
      const left = leaf.getBoundingClientRect().left - element.getBoundingClientRect().left + element.scrollLeft;
      element.scrollTo({ left, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }
  };

  const openLeaflet = (index: number) => {
    select(index);
    setLeafletIndex(index);
  };

  return (
    <div className={styles.collection} role="region" aria-label={label} data-image-deck={kind}>
      <div ref={rail} className={`${className} ${styles.rail}`} data-count={items.length}>
        {cards.map((card, index) => (
          <div key={items[index].label} className={styles.leaf} data-active={active === index} onPointerEnter={event => {
            if (event.pointerType === "mouse" || event.pointerType === "pen") setActive(index);
          }} onFocusCapture={() => setActive(index)} onClick={event => {
            if (!(event.target as HTMLElement).closest("a, button")) openLeaflet(index);
          }}>
            <button type="button" className={styles.select} aria-label={`Explore ${items[index].label}`} aria-expanded={active === index} aria-controls={`${id}-${index}`}
              onClick={() => openLeaflet(index)} onKeyDown={event => {
                const next = event.key === "ArrowRight" ? index + 1 : event.key === "ArrowLeft" ? index - 1 : event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : null;
                if (next !== null) { event.preventDefault(); select(next, true); }
              }}>
              <span className={styles.open}><ArrowUpRight size={19} strokeWidth={1.3} /></span>
            </button>
            <div id={`${id}-${index}`} className={styles.content}>{card}</div>
          </div>
        ))}
      </div>
      <span className={styles.srOnly} aria-live="polite">{items[active].label}, {active + 1} of {items.length}</span>
      {leafletIndex !== null && <ImageLeaflet
        open
        onClose={() => setLeafletIndex(null)}
        title={items[leafletIndex].label}
        image={items[leafletIndex].image}
        imageAlt={items[leafletIndex].imageAlt}
        credit={items[leafletIndex].credit}
        note={items[leafletIndex].note}
        href={items[leafletIndex].href}
        hrefLabel={items[leafletIndex].hrefLabel}
      >
        {items[leafletIndex].summary || items[leafletIndex].label}
      </ImageLeaflet>}
    </div>
  );
}
