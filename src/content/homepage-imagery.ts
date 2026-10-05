export const homepageImagery = {
  engineering: {
    src: "/images/natural/engineering-crossing-natural-v1.webp",
    panelSrc: "/images/natural/engineering-crossing-native-v2.webp",
    alt: "AI-generated concept of a concrete bridge crossing an East African river at first light",
  },
  "asset-management": {
    src: "/images/natural/asset-corridor-natural-v1.webp",
    panelSrc: "/images/natural/asset-corridor-native-v2.webp",
    alt: "AI-generated concept of a viaduct, railway and electricity infrastructure near an African city at dusk",
  },
} as const;

// Cover scales the 3:2 artwork by panel height on narrow screens. Account for
// the existing 600px mobile / 720px desktop / 840px wide-screen panel heights.
export const homepagePanelSizes = "(max-width: 760px) max(100vw, 900px), (min-width: 1550px) max(60vw, 1260px), max(60vw, 1080px)";
