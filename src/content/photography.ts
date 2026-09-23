import nairobiExpressway from "../../public/images/photography/nairobi-expressway.webp";
import mombasaTerminus from "../../public/images/photography/mombasa-terminus.webp";
import tangerMed from "../../public/images/photography/tanger-med.webp";
import karibaDam from "../../public/images/photography/kariba-dam.webp";
import britamTower from "../../public/images/photography/britam-tower.webp";
import nairobiPark from "../../public/images/photography/nairobi-uhuru-park.webp";
import engineeringManagementSite from "../../public/images/visual-depth/engineering-management-site.webp";
import assetGovernmentParliament from "../../public/images/visual-depth/asset-government-parliament.webp";
import assetHealthcareClinic from "../../public/images/visual-depth/asset-healthcare-clinic.webp";
import assetEducationSchool from "../../public/images/visual-depth/asset-education-school.webp";

export const photographs = {
  "nairobi-expressway": {
    image: nairobiExpressway,
    position: "50% 50%",
    alt: "Concrete deck, beams and supporting piers of the Nairobi Expressway above a city road",
  },
  "mombasa-terminus": {
    image: mombasaTerminus,
    position: "50% 35%",
    alt: "Curved facade and entrance signage of the Mombasa Standard Gauge Railway terminus",
  },
  "tanger-med": {
    image: tangerMed,
    position: "25% 65%",
    alt: "Aerial view of Tanger Med port with container yards, quays, breakwaters and surrounding road infrastructure",
  },
  "kariba-dam": {
    image: karibaDam,
    position: "65% 65%",
    alt: "Curved concrete wall of Kariba Dam with its reservoir and water discharging into the gorge",
  },
  "britam-tower": {
    image: britamTower,
    position: "50% 0%",
    alt: "Britam Tower and neighbouring high-rise commercial buildings in Nairobi's Upper Hill district",
  },
  "nairobi-uhuru-park": {
    image: nairobiPark,
    position: "50% 45%",
    alt: "Nairobi's city-centre buildings beyond the lawns, trees and public spaces of Uhuru Park in 2009",
  },
  "engineering-management-site": {
    image: engineeringManagementSite,
    position: "50% 50%",
    alt: "Painted multi-storey apartment buildings with balconies and surrounding site works",
  },
  "asset-government-parliament": {
    image: assetGovernmentParliament,
    position: "50% 50%",
    alt: "Parliament of the Republic of Uganda, a civic government building",
    credit: "Andrew Regan / Wikimedia Commons, CC BY-SA 3.0",
  },
  "asset-healthcare-clinic": {
    image: assetHealthcareClinic,
    position: "50% 55%",
    alt: "Maternity clinic building under construction in a rural landscape",
    credit: "Andy Wheatley / UK Department for International Development, Wikimedia Commons, CC BY 2.0",
  },
  "asset-education-school": {
    image: assetEducationSchool,
    position: "50% 55%",
    alt: "Primary school buildings beside a broad grassy playing field in Uganda",
    credit: "BalukuBrian / Wikimedia Commons, CC BY-SA 4.0",
  },
} as const;

export type PhotographId = keyof typeof photographs;
export const sectorPhotographs: Partial<Record<string, PhotographId>> = {
  "engineering-highway": "nairobi-expressway",
  "engineering-structural": "britam-tower",
  "engineering-management": "engineering-management-site",
  "engineering-water": "kariba-dam",
  "asset-government": "asset-government-parliament",
  "asset-energy": "kariba-dam",
  "asset-transport": "mombasa-terminus",
  "asset-cities": "nairobi-uhuru-park",
  "asset-real-estate": "britam-tower",
  "asset-logistics": "tanger-med",
  "asset-healthcare": "asset-healthcare-clinic",
  "asset-education": "asset-education-school",
};
export const divisionPhotographs = {
  engineering: photographs["nairobi-expressway"],
  "asset-management": photographs["tanger-med"],
};
