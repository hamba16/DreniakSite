import Image from "next/image";
import { visualImageFiles } from "@/content/visual-image-files";
import status from "@/content/visual-depth-status.json";

export function hasConceptualImage(asset: VisualAsset) {
  return status.available.includes(asset.id);
}

export type VisualAsset = {
  id: string;
  alt: string;
  division: "engineering" | "asset-management";
};

export function ConceptualImage({
  asset,
  variant = "sector",
  caption,
}: {
  asset: VisualAsset;
  variant?: "sector" | "editorial" | "project";
  caption?: string;
}) {
  if (!hasConceptualImage(asset)) return null;
  return (
    <figure className={`conceptual-figure conceptual-${variant}`}>
      <div className={`conceptual-image ${asset.division}`}>
        <Image
          src={visualImageFiles[asset.id]}
          alt={`Conceptual illustration: ${asset.alt}`}
          width={1200}
          height={800}
          sizes="(max-width: 760px) 88vw, 43vw"
          placeholder="blur"
        />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

export function ConceptualImageNote() {
  return (
    <p className="conceptual-note">
      These generated illustrations show types of infrastructure. They do not depict Dreniak projects.
    </p>
  );
}
