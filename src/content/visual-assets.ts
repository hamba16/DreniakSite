import type { VisualAsset } from "@/components/conceptual-image";

const photoCredits = {
  nairobiExpressway: {
    creator: "Bahnfrend",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Nairobi_Expressway,_2025_(01).jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    changes: "Resized; cropped responsively.",
  },
  mombasaTerminus: {
    creator: "Martin Chomba",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Standard_Gauge_Railway_Mombasa_Terminus.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    changes: "Resized; cropped responsively.",
  },
  tangerMed: {
    creator: "Tanger Med",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Vue_g%C3%A9n%C3%A9raleH13A0659.JPG",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    changes: "Resized; cropped responsively.",
  },
  karibaDam: {
    creator: "Manfidza",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:The_way_to_Zambia_through_Kariba_Dam.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    changes: "Resized; cropped responsively.",
  },
  britamTower: {
    creator: "Daniel Case",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Britam_Tower_and_surrounding_buildings_in_sunlight_from_Radisson_Blu_hotel,_Nairobi,_KE.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    changes: "Resized; cropped responsively.",
  },
  uhuruPark: {
    creator: "Jorge Láscar",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Nairobi%27s_skyline_from_Uhuru_Park.jpg",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
    changes: "Resized; cropped responsively.",
  },
  ugandaParliament: {
    creator: "Andrew Regan",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Parliament-Of-Uganda.JPG",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    changes: "Resized; cropped responsively.",
  },
};

export const engineeringSectorImages: VisualAsset[] = [
  {
    id: "engineering-highway",
    alt: "Daylight view of Nairobi Expressway concrete viaducts",
    division: "engineering",
    imageSrc: "/images/photography/nairobi-expressway.webp",
    imageCredit: photoCredits.nairobiExpressway,
  },
  {
    id: "engineering-structural",
    alt: "Britam Tower and surrounding commercial buildings in Nairobi",
    division: "engineering",
    imageSrc: "/images/photography/britam-tower.webp",
    imageCredit: photoCredits.britamTower,
    imageNote: "Nairobi, photographed 2025; an illustrative sector example.",
  },
  {
    id: "engineering-water",
    alt: "Kariba Dam and reservoir between Zambia and Zimbabwe",
    division: "engineering",
    imageSrc: "/images/photography/kariba-dam.webp",
    imageCredit: photoCredits.karibaDam,
  },
  {
    id: "engineering-management",
    alt: "Apartment flats under construction with red-tiled roofs and timber scaffolding",
    division: "engineering",
    imageSrc: "/images/visual-depth/engineering-management-site.webp",
    imageNote: "Site photograph; location and provenance to be confirmed.",
  },
  {
    id: "engineering-geotechnical",
    alt: "Geotechnical drilling rig and engineers reviewing recovered soil cores at an investigation site",
    division: "engineering",
    imageSrc: "/images/visual-depth/engineering-geotechnical.webp",
  },
];

export const assetSectorImages: VisualAsset[] = [
  {
    id: "asset-government",
    alt: "Parliament building of the Republic of Uganda",
    division: "asset-management",
    imageSrc: "/images/visual-depth/asset-government-parliament.webp",
    imageCredit: photoCredits.ugandaParliament,
  },
  {
    id: "asset-energy",
    alt: "Kariba Dam and its reservoir",
    division: "asset-management",
    imageSrc: "/images/photography/kariba-dam.webp",
    imageCredit: photoCredits.karibaDam,
  },
  {
    id: "asset-transport",
    alt: "Standard Gauge Railway terminal at Mombasa",
    division: "asset-management",
    imageSrc: "/images/photography/mombasa-terminus.webp",
    imageCredit: photoCredits.mombasaTerminus,
  },
  {
    id: "asset-cities",
    alt: "Nairobi skyline viewed from Uhuru Park in 2009",
    division: "asset-management",
    imageSrc: "/images/photography/nairobi-uhuru-park.webp",
    imageCredit: photoCredits.uhuruPark,
    imageNote: "Nairobi skyline photographed in 2009; not a current skyline view.",
  },
  {
    id: "asset-real-estate",
    alt: "Britam Tower and surrounding commercial buildings in Nairobi",
    division: "asset-management",
    imageSrc: "/images/photography/britam-tower.webp",
    imageCredit: photoCredits.britamTower,
    imageNote: "Nairobi, photographed 2025; an illustrative sector example.",
  },
  {
    id: "asset-logistics",
    alt: "Aerial view of Tanger Med port and cargo infrastructure",
    division: "asset-management",
    imageSrc: "/images/photography/tanger-med.webp",
    imageCredit: photoCredits.tangerMed,
  },
  {
    id: "asset-healthcare",
    alt: "AI-generated conceptual illustration of a modern healthcare facility",
    division: "asset-management",
    imageSrc: "/images/visual-depth/asset-healthcare-ai.webp",
    imageNote: "AI-generated conceptual illustration.",
  },
  {
    id: "asset-education",
    alt: "AI-generated conceptual illustration of a university campus",
    division: "asset-management",
    imageSrc: "/images/visual-depth/asset-education-ai.webp",
    imageNote: "AI-generated conceptual illustration.",
  },
];

export const interventionImage: VisualAsset = {
  id: "engineering-intervention",
  alt: "Bridge reconstruction and structural repair works",
  division: "engineering",
  imageSrc: "/images/visual-depth/engineering-intervention-ai.webp",
  imageNote: "AI-generated conceptual illustration.",
};
export const insightImages: Record<VisualAsset["division"], VisualAsset> = {
  engineering: {
    id: "engineering-insights",
    alt: "Engineering plans, structural model, and site drawings",
    division: "engineering",
    imageSrc: "/images/visual-depth/engineering-insights-ai.webp",
    imageNote: "AI-generated conceptual illustration.",
  },
  "asset-management": {
    id: "asset-insights",
    alt: "Infrastructure asset planning and portfolio analysis",
    division: "asset-management",
    imageSrc: "/images/visual-depth/asset-insights-ai.webp",
    imageNote: "AI-generated conceptual illustration.",
  },
};
