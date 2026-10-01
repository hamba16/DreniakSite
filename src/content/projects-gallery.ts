export type ProjectImageSpan = "2x2" | "2x1" | "1x1";
export type ProjectImageOrientation = "landscape" | "portrait";

export type ProjectGalleryImage = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  span: ProjectImageSpan;
  orientation: ProjectImageOrientation;
  qualityRating: "B";
  heroEligible: boolean;
  focalPoint: { x: number; y: number };
  provenanceNote: string;
};

const provenanceNote = "Site photograph. Location and relationship to Dreniak have not been confirmed.";

// Captions describe inspected pixels; inventory filenames do not establish project provenance.
export const projectGalleryImages: ProjectGalleryImage[] = [
  {
    "id": "concrete-front",
    "src": "/images/projects/proposed/building-a-concrete-apartments-plastering-front-01.jpeg",
    "alt": "Concrete apartment block with open balconies, barred openings and timber scaffolding",
    "caption": "Concrete apartment front under construction",
    "width": 1080,
    "height": 810,
    "span": "2x2",
    "orientation": "landscape",
    "qualityRating": "B",
    "heroEligible": true,
    "focalPoint": {
      "x": 50,
      "y": 0
    },
    provenanceNote
  },
  {
    "id": "hillside-construction",
    "src": "/images/projects/proposed/building-c-red-roof-townhouses-finishing-wide-01.jpeg",
    "alt": "Unfinished concrete frame below a densely built hillside, with a telecom mast and blue sky",
    "caption": "Concrete frame against a hillside skyline",
    "width": 1080,
    "height": 471,
    "span": "2x1",
    "orientation": "landscape",
    "qualityRating": "B",
    "heroEligible": false,
    "focalPoint": {
      "x": 50,
      "y": 100
    },
    provenanceNote
  },
  {
    "id": "stone-masonry-wide",
    "src": "/images/projects/proposed/building-b-stone-apartments-masonry-wide-01.jpeg",
    "alt": "Stone-clad apartment building and adjoining rendered wing with scaffolding",
    "caption": "Stone-clad apartment structure",
    "width": 1080,
    "height": 747,
    "span": "2x1",
    "orientation": "landscape",
    "qualityRating": "B",
    "heroEligible": false,
    "focalPoint": {
      "x": 48,
      "y": 28
    },
    provenanceNote
  },
  {
    "id": "concrete-front-detail",
    "src": "/images/projects/proposed/building-a-concrete-apartments-plastering-front-02.jpeg",
    "alt": "Straight-on view of an unfinished concrete apartment facade with pink balcony rails and scaffolding",
    "caption": "Concrete facade and balcony detail",
    "width": 810,
    "height": 1080,
    "span": "1x1",
    "orientation": "portrait",
    "qualityRating": "B",
    "heroEligible": true,
    "focalPoint": {
      "x": 50,
      "y": 5
    },
    provenanceNote
  },
  {
    "id": "stone-masonry-side",
    "src": "/images/projects/proposed/building-b-stone-apartments-masonry-side-01.jpeg",
    "alt": "Side elevation of a stone-clad apartment building with green scaffolding and overhead wires",
    "caption": "Stone facade and side elevation",
    "width": 908,
    "height": 1080,
    "span": "1x1",
    "orientation": "portrait",
    "qualityRating": "B",
    "heroEligible": false,
    "focalPoint": {
      "x": 48,
      "y": 5
    },
    provenanceNote
  },
  {
    "id": "townhouse-front",
    "src": "/images/projects/proposed/building-c-red-roof-townhouses-finishing-straight-01.jpeg",
    "alt": "White residential buildings with red tiled roofs, balconies and scaffolding beneath a blue sky",
    "caption": "Townhouse facade in finishing",
    "width": 980,
    "height": 1080,
    "span": "2x2",
    "orientation": "portrait",
    "qualityRating": "B",
    "heroEligible": true,
    "focalPoint": {
      "x": 50,
      "y": 5
    },
    provenanceNote
  },
  {
    "id": "columned-facade",
    "src": "/images/projects/proposed/building-e-ornate-apartment-complete-angle-01.jpeg",
    "alt": "Red and cream apartment facade with tall white columns, arched balconies and a triangular pediment",
    "caption": "Columns, arches and balcony rhythm",
    "width": 1022,
    "height": 1080,
    "span": "2x2",
    "orientation": "portrait",
    "qualityRating": "B",
    "heroEligible": true,
    "focalPoint": {
      "x": 50,
      "y": 0
    },
    provenanceNote
  },
  {
    "id": "apartment-towers",
    "src": "/images/projects/proposed/building-e-ornate-apartment-complete-straight-01.jpeg",
    "alt": "Brown, cream and maroon apartment towers with stacked balconies beneath a cloudy sky",
    "caption": "Apartment towers and stacked balconies",
    "width": 1080,
    "height": 748,
    "span": "2x1",
    "orientation": "landscape",
    "qualityRating": "B",
    "heroEligible": false,
    "focalPoint": {
      "x": 50,
      "y": 0
    },
    provenanceNote
  },
  {
    "id": "apartment-skyline",
    "src": "/images/projects/proposed/building-d-apartment-block-complete-straight-01.jpeg",
    "alt": "Wide view of brown, cream and maroon apartment elevations with rooftop structures and overhead utility wires",
    "caption": "Apartment elevations beneath a cloudy sky",
    "width": 1080,
    "height": 470,
    "span": "2x1",
    "orientation": "landscape",
    "qualityRating": "B",
    "heroEligible": false,
    "focalPoint": {
      "x": 50,
      "y": 0
    },
    provenanceNote
  }
];

export const projectHeroImages = projectGalleryImages.filter(image => image.heroEligible);

