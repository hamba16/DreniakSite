"use client";

import Image, { type ImageProps } from "next/image";
import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { Mark } from "./brand";
import styles from "./image-leaflet.module.css";

export type ImageCredit = {
  creator: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
  changes: string;
};

function imageUrl(image: ImageProps["src"]) {
  if (typeof image === "string") return image;
  return "src" in image ? image.src : image.default.src;
}

export function ImageLeaflet({
  open,
  onClose,
  title,
  image,
  imageAlt,
  fallback,
  children,
  credit,
  note,
  rightsPending = false,
  imageFit = "cover",
  href,
  hrefLabel,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  image?: ImageProps["src"];
  imageAlt?: string;
  fallback?: ReactNode;
  children?: ReactNode;
  credit?: ImageCredit;
  note?: string;
  rightsPending?: boolean;
  imageFit?: "cover" | "contain";
  href?: string;
  hrefLabel?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className={styles.leaflet}
      aria-labelledby={titleId}
      data-image-fit={imageFit}
      onClose={onClose}
      onClick={event => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
    >
      <div className={styles.image}>
        <Mark className={styles.mark} stroke />
        {image ? <Image src={image} alt={imageAlt || title} fill sizes="100vw" priority /> : fallback}
        <div className={styles.shade} />
      </div>
      <button className={styles.close} type="button" aria-label="Close image details" onClick={() => dialogRef.current?.close()}>
        <X size={21} aria-hidden="true" />
      </button>
      <div className={styles.details}>
        <span className={styles.eyebrow}>IMAGE DETAILS</span>
        <h2 id={titleId}>{title}</h2>
        {children && <div className={styles.summary}>{children}</div>}
        {note && <p className={styles.note}>{note}</p>}
        {rightsPending && <p className={styles.note}>Publication rights confirmation pending.</p>}
        {credit && <details className={styles.credit}>
          <summary>Image attribution</summary>
          <div className={styles.creditDetails}>
            <span>Photo: {credit.creator}</span>
            <a href={credit.sourceUrl} target="_blank" rel="noreferrer">Source</a>
            <a href={credit.licenseUrl} target="_blank" rel="noreferrer">{credit.license}</a>
            {image && <a href={imageUrl(image)} download>Download image</a>}
            <span>{credit.changes}</span>
            <span>Representative image; not Dreniak project work.</span>
          </div>
        </details>}
        {href && <a className={styles.action} href={href}>{hrefLabel || "Open details"}</a>}
      </div>
    </dialog>
  );
}