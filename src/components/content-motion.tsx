"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Content stays visible before hydration and when motion is disabled. */
export function ContentMotion() {
  const pathname = usePathname();
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const seen = new WeakSet<Element>();
    const animations = new Set<Animation>();
    const selector = ".division-site #main :is(.service-preview-grid > a, .sector-featured > article, .sector-secondary > article, .asset-project-card, .project-gallery figure, .case-study-section, .mission-vision > article, .insight-card)";
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (preference.matches) continue;
        const siblings = Array.from(entry.target.parentElement?.children ?? []);
        const index = Math.max(0, siblings.indexOf(entry.target));
        const animation = entry.target.animate(
          [{ opacity: .5, transform: "translateY(20px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 550, delay: (index % 6) * 70, easing: "ease-out" },
        );
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    }, { threshold: .1 });
    const scan = () => {
      document.querySelectorAll(selector).forEach(element => {
        if (seen.has(element)) return;
        seen.add(element);
        observer.observe(element);
      });
    };
    const cancel = () => { if (preference.matches) { animations.forEach(animation => animation.cancel()); animations.clear(); } };
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });
    preference.addEventListener("change", cancel);
    scan();
    return () => {
      observer.disconnect();
      mutations.disconnect();
      animations.forEach(animation => animation.cancel());
      preference.removeEventListener("change", cancel);
    };
  }, [pathname]);
  return null;
}
