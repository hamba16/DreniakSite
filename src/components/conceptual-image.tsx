import Image from "next/image";
import { photographs, sectorPhotographs } from "@/content/photography";

export function hasConceptualImage(asset: VisualAsset) {
  return Boolean(sectorPhotographs[asset.id]);
}

export type VisualAsset = {
  id: string;
  alt: string;
  division: "engineering" | "asset-management";
};

export function ConceptualImage({
  asset,
  variant = "sector",
}: {
  asset: VisualAsset;
  variant?: "sector" | "editorial" | "project";
  caption?: string;
}) {
  const photoId = sectorPhotographs[asset.id];
  if (!photoId) return null;
  const photo = photographs[photoId];
  return (
    <figure className={`conceptual-figure conceptual-${variant}`}>
      <div className={`conceptual-image ${asset.division}`}>
        <Image
          src={photo.image}
          alt={photo.alt}
          style={{ objectPosition: photo.position }}
          sizes="(max-width: 760px) 88vw, 43vw"
          placeholder="blur"
        />
      </div>
    </figure>
  );
}
