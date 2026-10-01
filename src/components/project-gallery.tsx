"use client";

import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play, X } from "lucide-react";
import { projectGalleryImages, projectHeroImages } from "@/content/projects-gallery";

export function ProjectGallery() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLButtonElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const paused = hovered || focusWithin || reduceMotion || manuallyPaused || pageHidden || lightboxIndex !== null;
  const lightboxOpen = lightboxIndex !== null;

  useEffect(() => {
    const syncVisibility = () => setPageHidden(document.hidden);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReduceMotion(preference.matches);
    syncPreference();
    preference.addEventListener("change", syncPreference);
    return () => preference.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    if (paused || projectHeroImages.length < 2) return;
    const timer = window.setTimeout(() => {
      setHeroIndex(index => (index + 1) % projectHeroImages.length);
    }, 6500);
    return () => window.clearTimeout(timer);
  }, [heroIndex, paused]);

  useEffect(() => {
    const grid = galleryRef.current;
    if (!grid) return;
    const tiles = Array.from(grid.querySelectorAll<HTMLElement>(".project-bento-tile"));
    grid.dataset.revealReady = "true";

    if (!("IntersectionObserver" in window)) {
      tiles.forEach(tile => { tile.dataset.revealed = "true"; });
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.revealed = "true";
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -20% 0px", threshold: 0 });

    tiles.forEach(tile => observer.observe(tile));
    return () => observer.disconnect();
  }, [reduceMotion]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (lightboxIndex === null || !dialog || dialog.open) return;
    dialog.showModal();
    closeButtonRef.current?.focus();
  }, [lightboxIndex]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [lightboxOpen]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    for (const offset of [-1, 1]) {
      const image = new window.Image();
      const next = projectGalleryImages[(lightboxIndex + offset + projectGalleryImages.length) % projectGalleryImages.length];
      const { props } = getImageProps({ src: next.src, alt: next.alt, width: next.width, height: next.height, sizes: "90vw" });
      image.sizes = props.sizes || "90vw";
      image.srcset = props.srcSet || "";
      image.src = props.src;
    }
  }, [lightboxIndex]);

  const openLightbox = (index: number, trigger: HTMLButtonElement) => {
    returnFocusRef.current = trigger;
    setLightboxIndex(index);
  };

  const closeLightbox = () => dialogRef.current?.close();

  const finishLightbox = () => {
    setLightboxIndex(null);
    requestAnimationFrame(() => returnFocusRef.current?.focus({ preventScroll: true }));
  };

  const moveLightbox = (direction: number) => {
    setLightboxIndex(index => index === null ? index : (index + direction + projectGalleryImages.length) % projectGalleryImages.length);
  };

  const handleLightboxKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "Tab") {
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button")).filter(button => button.getClientRects().length);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveLightbox(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      moveLightbox(1);
    }
  };

  const handleSwipeStart = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || event.pointerType === "pen") {
      pointerStartRef.current = { x: event.clientX, y: event.clientY };
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handleSwipeEnd = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start) return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) >= 60 && Math.abs(deltaY) < 50) moveLightbox(deltaX < 0 ? 1 : -1);
  };

  const handleCursorMove = (event: MouseEvent<HTMLButtonElement>) => {
    if (reduceMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const bounds = event.currentTarget.querySelector(".project-bento-media")?.getBoundingClientRect();
    if (!bounds) return;
    event.currentTarget.style.setProperty("--cursor-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--cursor-y", `${event.clientY - bounds.top}px`);
  };

  const handleTileKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox(index, event.currentTarget);
    }
  };

  const handleHeroFocus = (event: FocusEvent<HTMLElement>) => setFocusWithin(event.currentTarget.contains(event.target));
  const handleHeroBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusWithin(false);
  };

  const currentImage = lightboxIndex === null ? null : projectGalleryImages[lightboxIndex];
  const currentImageIndex = lightboxIndex ?? 0;
  const nextHero = projectHeroImages[(heroIndex + 1) % projectHeroImages.length];

  return (
    <section className="project-gallery" aria-labelledby="project-gallery-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">ENGINEERING / FIELD PHOTOGRAPHS</span>
          <h2 id="project-gallery-title">Structure,<br /><span>in perspective.</span></h2>
        </div>
        <Link href="/engineering/consultation" className="text-link">
          Discuss a project <ArrowUpRight size={18} />
        </Link>
      </div>
      <p className="project-gallery-note">{projectGalleryImages[0].provenanceNote}</p>

      <div
        className="project-hero"
        role="region"
        data-paused={paused}
        aria-roledescription="carousel"
        aria-label="Featured project photographs"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={handleHeroFocus}
        onBlurCapture={handleHeroBlur}
      >
        {projectHeroImages.map((image, index) => {
          const galleryIndex = projectGalleryImages.findIndex(item => item.id === image.id);
          return (
            <div className="project-hero-slide" data-active={heroIndex === index} aria-hidden={heroIndex !== index} key={image.id}>
              <Image
                className="project-hero-image"
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 86vw, (max-width: 1450px) 60vw, 900px"
                style={{ objectPosition: `${image.focalPoint.x}% ${image.focalPoint.y}%` }}
                {...(index === 0 ? { loading: "eager" as const, fetchPriority: "high" as const } : { loading: "lazy" as const, fetchPriority: "low" as const })}
              />
              <button
                className="project-hero-open"
                type="button"
                tabIndex={heroIndex === index ? 0 : -1}
                aria-label={`View photograph: ${image.caption}. ${image.alt}`}
                onClick={event => openLightbox(galleryIndex, event.currentTarget)}
              ><span>View photograph <ArrowUpRight size={15} aria-hidden="true" /></span></button>
              {heroIndex === index && (
                <div className="project-hero-caption" key={`caption-${image.id}`}>
                  <span className="project-hero-eyebrow">FRAME {String(galleryIndex + 1).padStart(2, "0")} / {String(projectGalleryImages.length).padStart(2, "0")}</span>
                  <h3>{image.caption}</h3>
                  <span className="project-hero-rule" />
                </div>
              )}
            </div>
          );
        })}
        <button className="project-hero-preview" type="button" aria-label={`Up next: ${nextHero.caption}`} onClick={() => setHeroIndex(index => (index + 1) % projectHeroImages.length)}>
          <Image src={nextHero.src} alt={nextHero.alt} fill sizes="(max-width: 640px) 1px, 26vw" loading="lazy" style={{ objectPosition: `${nextHero.focalPoint.x}% ${nextHero.focalPoint.y}%` }} />
          <span className="project-hero-preview-label">UP NEXT <ArrowUpRight size={16} aria-hidden="true" /></span>
        </button>
        <div className="project-hero-controls">
          <button type="button" className="project-hero-arrow" aria-label={manuallyPaused ? "Play slideshow" : "Pause slideshow"} aria-pressed={manuallyPaused} onClick={() => setManuallyPaused(value => !value)}>
            {manuallyPaused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
          </button>
          <button type="button" className="project-hero-arrow" aria-label="Previous featured image" onClick={() => setHeroIndex(index => (index - 1 + projectHeroImages.length) % projectHeroImages.length)}>
            <ArrowLeft size={19} aria-hidden="true" />
          </button>
          <div className="project-hero-dots" aria-label="Featured image selection">
            {projectHeroImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                className="project-hero-dot"
                aria-label={`Show ${image.caption}`}
                aria-current={heroIndex === index ? "true" : undefined}
                onClick={() => setHeroIndex(index)}
              />
            ))}
          </div>
          <button type="button" className="project-hero-arrow" aria-label="Next featured image" onClick={() => setHeroIndex(index => (index + 1) % projectHeroImages.length)}>
            <ArrowRight size={19} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="project-bento-heading">
        <span className="eyebrow">THE PHOTOGRAPHIC INDEX</span>
        <span className="project-bento-count">01 — {String(projectGalleryImages.length).padStart(2, "0")} / SELECT A FRAME</span>
      </div>
      <div className="project-bento" ref={galleryRef}>
        {projectGalleryImages.map((image, index) => (
          <button
            key={image.id}
            type="button"
            className="project-bento-tile"
            data-span={image.span}
            data-orientation={image.orientation}
            data-index={index}
            data-revealed="false"
            style={{ "--tile-order": index, "--focal-x": `${image.focalPoint.x}%`, "--focal-y": `${image.focalPoint.y}%`, "--tile-aspect": `${image.width} / ${image.height}` } as React.CSSProperties}
            aria-label={`${String(index + 1).padStart(2, "0")} ${image.caption}. ${image.alt}. View photograph`}
            onClick={event => openLightbox(index, event.currentTarget)}
            onKeyDown={event => handleTileKeyDown(event, index)}
            onMouseMove={handleCursorMove}
          >
            {index === 1 && <span className="project-index-intro" aria-hidden="true">Material.<br />Form.<br />Perspective.</span>}
            <span className="project-bento-media"><Image
              className="project-bento-image"
              src={image.src}
              alt={image.alt}
              fill
              sizes={index === 0 ? "(max-width: 900px) 86vw, 58vw" : "(max-width: 640px) 86vw, (max-width: 900px) 43vw, 43vw"}
              style={{ objectPosition: `${image.focalPoint.x}% ${image.focalPoint.y}%` }}
              loading="lazy"
              fetchPriority="low"
            />
            <span className="project-bento-badge" aria-hidden="true">View</span>
            </span>
            <span className="project-bento-meta">
              <span className="project-bento-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span className="project-bento-caption">{image.caption}</span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </span>
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        className="project-lightbox"
        aria-modal="true"
        aria-labelledby="project-lightbox-title"
        aria-describedby="project-lightbox-provenance"
        onClose={finishLightbox}
        onClick={event => { if (event.target === event.currentTarget) closeLightbox(); }}
        onKeyDown={handleLightboxKeyDown}
      >
        {currentImage && (
          <>
            <div className="project-lightbox-topbar">
              <span className="eyebrow">PROJECT PHOTOGRAPH</span>
              <button ref={closeButtonRef} className="project-lightbox-close" type="button" aria-label="Close image viewer" onClick={closeLightbox}>
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <div className="project-lightbox-stage" onPointerDown={handleSwipeStart} onPointerUp={handleSwipeEnd} onPointerCancel={() => { pointerStartRef.current = null; }}>
              <button className="project-lightbox-nav" type="button" aria-label="Previous image" onClick={() => moveLightbox(-1)}>
                <ArrowLeft size={20} aria-hidden="true" />
              </button>
              <div className="project-lightbox-media">
                <Image key={currentImage.id} src={currentImage.src} alt={currentImage.alt} fill sizes="90vw" loading="eager" />
              </div>
              <button className="project-lightbox-nav" type="button" aria-label="Next image" onClick={() => moveLightbox(1)}>
                <ArrowRight size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="project-lightbox-caption">
              <div>
                <span className="project-lightbox-index">{String(currentImageIndex + 1).padStart(2, "0")} / {String(projectGalleryImages.length).padStart(2, "0")}</span>
                <h2 id="project-lightbox-title">{currentImage.caption}</h2>
                <p id="project-lightbox-provenance">{currentImage.provenanceNote}</p>
              </div>
              <div className="project-lightbox-progress" aria-hidden="true">
                {projectGalleryImages.map((image, index) => <span key={image.id} data-active={index === lightboxIndex} />)}
              </div>
            </div>
          </>
        )}
        <span className="project-gallery-live" role="status" aria-live="polite" aria-atomic="true">{currentImage ? `${currentImageIndex + 1} of ${projectGalleryImages.length}. ${currentImage.caption}` : ""}</span>
      </dialog>
    </section>
  );
}
