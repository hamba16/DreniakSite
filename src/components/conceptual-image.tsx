import type { CSSProperties } from "react";
import Image from "next/image";

export function hasConceptualImage(asset: VisualAsset) {
  return Boolean(asset.imageSrc) || asset.id === "engineering-geotechnical";
}

export type VisualAsset = {
  id: string;
  alt: string;
  division: "engineering" | "asset-management";
  imageSrc?: string;
  imageCredit?: {
    creator: string;
    sourceUrl: string;
    license: string;
    licenseUrl: string;
    changes: string;
  };
  imageNote?: string;
  rightsPending?: boolean;
};

export function sectorImageStyle(asset: VisualAsset): CSSProperties | undefined {
  void asset;
  return undefined;
}

export function ConceptualImage({
  asset,
  variant = "sector",
  caption,
}: {
  asset: VisualAsset;
  variant?: "sector" | "editorial" | "project";
  caption?: string;
}) {
  if (asset.imageSrc) {
    return (
      <figure className={`conceptual-figure conceptual-${variant}`}>
        <div className="conceptual-image photo-duotone">
          <Image
            src={asset.imageSrc}
            alt={asset.alt}
            aria-description={asset.imageNote}
            fill
            sizes="(max-width: 760px) 100vw, 56vw"
          />
        </div>
        {caption && <figcaption>{caption}</figcaption>}
      </figure>
    );
  }
  if (asset.id === "engineering-geotechnical") {
    return (
      <figure className="conceptual-figure ground-study">
        <div className="conceptual-image ground-study-image">
          <svg viewBox="0 0 600 360" role="img" aria-label="Schematic cross-section of ground layers and a foundation investigation borehole">
            <defs>
              <pattern id="ground-hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0 0V12" stroke="#b8afa0" strokeWidth="1" /></pattern>
            </defs>
            <rect width="600" height="360" fill="#eeece5" />
            <g fill="none" stroke="#b6afa3" strokeWidth="1">
              <path d="M40 100 145 80 320 105 440 85 560 100V295H40Z" fill="#dfd9cd" />
              <path d="M40 150 180 126 355 153 455 137 560 145V207L430 195 280 218 140 189 40 210Z" fill="url(#ground-hatch)" />
              <path d="M40 250 150 230 290 259 425 235 560 254M40 275 150 253 290 280 425 261 560 277" />
              <path d="M40 100 145 80 320 105 440 85 560 100" stroke="#52616a" strokeWidth="2" />
            </g>
            <g stroke="#991923" fill="none">
              <path d="M310 48V282" strokeWidth="2" />
              <path d="M297 63H323M297 120H323M297 180H323M297 240H323M297 282H323" />
              <circle cx="310" cy="48" r="8" />
              <path d="M330 50H402M330 282H402M392 50V282" strokeDasharray="3 6" opacity=".55" />
            </g>
            <g fill="#52616a" fontFamily="sans-serif" fontSize="9" letterSpacing="2">
              <text x="40" y="40">GROUND / STRUCTURE</text>
              <text x="40" y="325">SECTION STUDY</text>
              <text x="462" y="325">SCHEMATIC</text>
            </g>
          </svg>
        </div>
      </figure>
    );
  }
  return null;
}
