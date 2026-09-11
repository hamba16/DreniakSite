// Confirmed copy: ENGINEERING_UPDATE_BRIEF.md. Draft fields remain editable here.
// Session decisions: retain ERB; feature Construction Engineering separately;
// use a dedicated consultation route and the existing shared contact accounts.
export const engineering = {
  legalName: "DRENIAK (U) LIMITED",
  description:
    "Dreniak Engineering is a Ugandan engineering consultancy providing innovative, sustainable and client-focused engineering solutions across infrastructure, consultancy, construction, asset management and related sectors. The company combines engineering expertise, technical advisory services, project support and practical problem-solving to help clients deliver safe, efficient and sustainable projects.",
  mission:
    "To be at the forefront of engineering excellence in Uganda and beyond. We are dedicated to providing innovative, sustainable, and client-centric engineering consultancy services that empower our clients to thrive and make a positive impact on their communities.",
  vision:
    "Our vision is to become the most trusted and sought-after engineering firm in Uganda, renowned for our unwavering commitment to quality, integrity, and innovation. We aspire to shape a better future through our engineering solutions.",
  values: [
    "Delivering Excellence",
    "Sustainability",
    "Innovation",
    "Integrity",
    "Continuous Growth",
  ],
  registrations: [
    "Engineers Registration Board of Uganda (ERB)",
    "URSB registration",
    "Uganda Revenue Authority (URA) registration",
    "Valid trading license",
  ],
  services: [
    {
      name: "Engineering Consultancy & Research",
      description:
        "Engineering advice and research help clarify a project's requirements and the options available. We support informed decisions by examining the engineering questions behind a project.",
      includes: ["Engineering advice", "Engineering research"],
      value: "A clearer basis for engineering decisions.",
      editorialStatus: "drafted, pending client refinement",
    },
    {
      name: "Construction",
      description:
        "Construction brings engineering plans into physical form. We focus on the practical work of building and the requirements that guide delivery.",
      includes: ["Construction works", "Practical delivery"],
      value: "A practical connection between plans and construction.",
      editorialStatus: "drafted, pending client refinement",
    },
    {
      name: "Supervision",
      description:
        "Supervision follows work as it progresses against the project's requirements. It helps identify issues that need attention and keeps delivery discussions grounded in what is happening on site.",
      includes: ["Review of work in progress", "Site observations"],
      value: "A clearer view of progress and issues requiring attention.",
      editorialStatus: "drafted, pending client refinement",
    },
    {
      name: "Contract Management",
      description:
        "Contract management helps organise the obligations and processes agreed for a project. It supports clear records and communication as the parties work through delivery.",
      includes: [
        "Contract administration",
        "Contract records and communication",
      ],
      value: "Clarity around agreed responsibilities and processes.",
      editorialStatus: "drafted, pending client refinement",
    },
  ],
  featuredSector: "Construction Engineering",
  sectors: [
    "Highway and Transportation Engineering",
    "Architecture and Structural Engineering",
    "Water Resources Engineering",
    "Project Management",
    "Materials and Geotechnical Engineering",
  ],
  insightCategories: [
    "Engineering insights",
    "Infrastructure insights",
    "Construction and materials",
    "Asset management",
    "Pavement and road engineering",
    "Engineering project updates",
    "Industry developments",
    "Company news",
  ],
  insightOwner: null as string | null,
  publicationCadence: "Monthly or as needed",
  keywords: [
    "Engineering consultancy Uganda",
    "Engineering consultants Uganda",
    "Engineering company Uganda",
    "Engineering services Uganda",
    "Engineering consultancy Kampala",
    "Infrastructure engineering Uganda",
    "Construction engineering consultancy Uganda",
    "Mining engineering consultancy Uganda",
    "Mining engineering services Uganda",
    "Asset management Uganda",
    "Asset integrity Uganda",
    "Pavement engineering Uganda",
    "Road engineering consultancy Uganda",
    "Agricultural engineering Uganda",
    "Industrial engineering consultancy Uganda",
    "Project management Uganda",
    "Construction supervision Uganda",
  ],
};

export interface EngineeringOpening {
  id: string;
  title: string;
  location: string;
  description: string;
  applicationUrl: string;
}

// Publish only approved openings. No listings were supplied for this update.
export const engineeringOpenings: EngineeringOpening[] = [];
