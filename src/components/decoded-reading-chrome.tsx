"use client";

import { useEffect, useRef } from "react";
import styles from "./decoded-article.module.css";

const readingGroups = [
  {
    label: "PART ONE",
    links: [
      { href: "#quick-read", label: "Quick read" },
      { href: "#your-decision", label: "Your decision" },
      { href: "#how-we-work", label: "How Dreniak would work" },
    ],
  },
  {
    label: "PART TWO",
    links: [
      { href: "#research-brief", label: "Research brief" },
      { href: "#sources", label: "Sources" },
    ],
  },
];

export function DecodedReadingChrome() {
  const progressRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const main = document.querySelector<HTMLElement>("main#main");
    const header = document.querySelector<HTMLElement>(".site-header");
    const progress = progressRef.current;
    const rail = railRef.current;

    if (!main || !header || !progress || !rail) {
      throw new Error("Decoded reading chrome could not find its page elements.");
    }

    const articleMain = main;
    const pageHeader = header;
    const progressElement = progress;
    const readingRail = rail;
    const body = document.body;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sections = [
      ...readingRail.querySelectorAll<HTMLAnchorElement>("a[href^='#']"),
    ]
      .map((link) => ({
        link,
        target: document.querySelector<HTMLElement>(link.hash),
      }))
      .filter(
        (item): item is { link: HTMLAnchorElement; target: HTMLElement } =>
          item.target instanceof HTMLElement,
      );
    const updateProgressWithJs =
      !CSS.supports("animation-timeline", "scroll(root block)") ||
      reducedMotion.matches;
    let updateProgress = updateProgressWithJs;
    let lastScrollY = window.scrollY;
    let frame = 0;
    let anchorCorrectionTimer = 0;
    let observer: IntersectionObserver | undefined;

    body.classList.add("decoded-reading-page");

    function measureHeader() {
      const height = pageHeader.getBoundingClientRect().height;
      body.style.setProperty("--decoded-header-height", `${height}px`);
      body.style.setProperty("--decoded-header-offset", `${height + 16}px`);
      if (observer) {
        observer.disconnect();
        observer = undefined;
      }
      if ("IntersectionObserver" in window) {
        observer = new IntersectionObserver(
          updateActiveSection,
          {
            rootMargin: `-${Math.round(height + 24)}px 0px -70% 0px`,
            threshold: 0,
          },
        );
        sections.forEach(({ target }) => observer?.observe(target));
      }
    }

    function updateActiveSection() {
      if (!sections.length) return;
      const marker = pageHeader.getBoundingClientRect().bottom + 24;
      let active = sections[0];
      for (const section of sections) {
        if (section.target.getBoundingClientRect().top <= marker) active = section;
        else break;
      }
      if (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 1
      ) {
        active = sections[sections.length - 1];
      }
      sections.forEach(({ link, target }) => {
        if (target === active.target) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }

    function updateProgressValue() {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const progressValue =
        maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      progressElement.style.setProperty(
        "--decoded-reading-progress",
        String(progressValue),
      );
    }

    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const currentScrollY = window.scrollY;
        if (currentScrollY <= pageHeader.offsetHeight) {
          body.classList.remove("decoded-header-compact");
        } else if (currentScrollY > lastScrollY + 2) {
          body.classList.add("decoded-header-compact");
        } else if (currentScrollY < lastScrollY - 2) {
          body.classList.remove("decoded-header-compact");
        }
        lastScrollY = currentScrollY;
        if (updateProgress) updateProgressValue();
        updateActiveSection();
      });
    }

    function onMotionPreferenceChange() {
      updateProgress = updateProgressWithJs || reducedMotion.matches;
      if (updateProgress) updateProgressValue();
    }

    function correctRailAnchorPosition(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[href^='#']");
      if (
        !link ||
        (!readingRail.contains(link) && !articleMain.contains(link))
      ) {
        return;
      }
      const target = document.querySelector<HTMLElement>(link.hash);
      if (!target) return;

      window.clearTimeout(anchorCorrectionTimer);
      anchorCorrectionTimer = window.setTimeout(() => {
        window.scrollTo(window.scrollX, window.scrollY);
        const margin = Number.parseFloat(
          window.getComputedStyle(target).scrollMarginTop,
        );
        const targetY =
          window.scrollY + target.getBoundingClientRect().top - margin;
        if (reducedMotion.matches) {
          window.scrollTo(window.scrollX, targetY);
          updateActiveSection();
        } else {
          window.scrollTo({ top: targetY, behavior: "smooth" });
        }
        anchorCorrectionTimer = 0;
      }, reducedMotion.matches ? 0 : 200);
    }

    function cancelAnchorCorrection() {
      window.clearTimeout(anchorCorrectionTimer);
      anchorCorrectionTimer = 0;
    }

    measureHeader();
    updateActiveSection();
    if (updateProgress) updateProgressValue();

    const headerObserver = new ResizeObserver(measureHeader);
    headerObserver.observe(pageHeader);
    rail.addEventListener("click", correctRailAnchorPosition);
    articleMain.addEventListener("click", correctRailAnchorPosition);
    window.addEventListener("wheel", cancelAnchorCorrection, { passive: true });
    window.addEventListener("touchstart", cancelAnchorCorrection, {
      passive: true,
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateProgressValue);
    reducedMotion.addEventListener("change", onMotionPreferenceChange);

    return () => {
      headerObserver.disconnect();
      observer?.disconnect();
      rail.removeEventListener("click", correctRailAnchorPosition);
      articleMain.removeEventListener("click", correctRailAnchorPosition);
      window.removeEventListener("wheel", cancelAnchorCorrection);
      window.removeEventListener("touchstart", cancelAnchorCorrection);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateProgressValue);
      reducedMotion.removeEventListener("change", onMotionPreferenceChange);
      if (frame) window.cancelAnimationFrame(frame);
      window.clearTimeout(anchorCorrectionTimer);
      body.classList.remove("decoded-reading-page", "decoded-header-compact");
      body.style.removeProperty("--decoded-header-height");
      body.style.removeProperty("--decoded-header-offset");
    };
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className={styles.readingProgress}
        ref={progressRef}
      />
      <nav
        aria-label="On this page"
        className={styles.readingRail}
        ref={railRef}
      >
        {readingGroups.map((group) => (
          <ul aria-label={group.label} key={group.label}>
            {group.links.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        ))}
      </nav>
    </>
  );
}
