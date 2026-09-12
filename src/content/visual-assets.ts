import type { VisualAsset } from "@/components/conceptual-image";

export const engineeringSectorImages: VisualAsset[] = [
  {
    id: "engineering-highway",
    alt: "urban flyover construction and drainage",
    division: "engineering",
  },
  {
    id: "engineering-structural",
    alt: "a mid-rise structural frame under construction",
    division: "engineering",
  },
  {
    id: "engineering-water",
    alt: "water intake and spillway infrastructure",
    division: "engineering",
  },
  {
    id: "engineering-management",
    alt: "site engineers reviewing digital plans",
    division: "engineering",
  },
  {
    id: "engineering-geotechnical",
    alt: "geotechnical sampling and site investigation",
    division: "engineering",
  },
];

export const assetSectorImages: VisualAsset[] = [
  {
    id: "asset-government",
    alt: "civic buildings and public infrastructure",
    division: "asset-management",
  },
  {
    id: "asset-energy",
    alt: "an electrical substation and transmission corridor",
    division: "asset-management",
  },
  {
    id: "asset-transport",
    alt: "an electrified rail corridor with overhead catenary",
    division: "asset-management",
  },
  {
    id: "asset-cities",
    alt: "urban buildings and an elevated transport corridor",
    division: "asset-management",
  },
  {
    id: "asset-real-estate",
    alt: "a modern mixed-use development",
    division: "asset-management",
  },
  {
    id: "asset-logistics",
    alt: "an inland-water logistics yard and cargo handling",
    division: "asset-management",
  },
  {
    id: "asset-healthcare",
    alt: "a modern healthcare facility and accessible entrance",
    division: "asset-management",
  },
  {
    id: "asset-education",
    alt: "academic buildings and shaded campus walkways",
    division: "asset-management",
  },
];

export const interventionImage: VisualAsset = {
  id: "engineering-intervention",
  alt: "inspection and repair of an existing concrete bridge",
  division: "engineering",
};
export const insightImages: Record<VisualAsset["division"], VisualAsset> = {
  engineering: {
    id: "engineering-insights",
    alt: "engineering drawings, a material sample and digital plans",
    division: "engineering",
  },
  "asset-management": {
    id: "asset-insights",
    alt: "infrastructure planning sheets, a model and digital analysis",
    division: "asset-management",
  },
};
