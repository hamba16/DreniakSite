"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Restrained motion for the natural-colour conceptual homepage artwork. */
export function CinematicImage({
  children,
  division,
}: {
  children: ReactNode;
  division: "engineering" | "asset-management";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const section = element.parentElement;
    if (!section) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      if (preference.matches || !visible || document.hidden) return;
      const bounds = section.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (innerHeight - bounds.top) / (innerHeight + bounds.height)));
      element.style.setProperty("--image-scale", (1 + progress * 0.04).toFixed(4));
    };
    const schedule = () => {
      if (!frame && visible && !preference.matches && !document.hidden) {
        frame = requestAnimationFrame(update);
      }
    };
    const sync = () => {
      element.dataset.active = String(visible && !preference.matches && !document.hidden);
      if (preference.matches) element.style.removeProperty("--image-scale");
      schedule();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(section);
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div ref={ref} className="cinematic-image" data-division={division}>
      <div className="cinematic-image__scroll">
        <div className="cinematic-image__drift">{children}</div>
      </div>
    </div>
  );
}
