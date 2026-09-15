export interface CaseStudySection {
  id: "problem" | "intervention" | "result" | "long-term-value";
  heading: string;
  paragraphs: string[];
  subsections?: Array<{
    heading: string;
    paragraphs: string[];
  }>;
  list?: Array<{
    heading: string;
    items: string[];
  }>;
}

export interface ProjectCaseStudy {
  slug: string;
  isPublished: boolean;
  client?: string;
  sector: string;
  sectorLink?: string;
  location: string;
  status?: string;
  role?: string;
  capability?: string;
  title: string;
  subtitle: string;
  opening: string;
  summary: string;
  sections: CaseStudySection[];
  serviceLinks?: Array<{ label: string; href: string }>;
}

export interface ProjectCard {
  title: string;
  location: string;
  sector: string;
  slug?: string;
  hook: string;
  capabilityTags: string[];
  body: string;
  valueLine: string;
  href?: string;
}

export const assetManagementFeaturedProjects: ProjectCaseStudy[] = [
  {
    slug: "from-construction-project-to-performing-asset",
    isPublished: true,
    sector: "Real Estate & Major Developments",
    sectorLink: "/asset-management/sectors#real-estate-major-developments",
    location: "Nigeria",
    status: "90% Complete",
    role: "Engineering | Development Oversight | Asset Management | Lifecycle Planning",
    title: "From Construction Project to Performing Asset",
    subtitle: "End-to-End Development & Lifecycle Management of a Residential Apartment Complex",
    opening:
      "The project was never simply to complete an apartment complex. It was to create an asset capable of performing long after construction ends.",
    summary:
      "Dreniak embedded lifecycle thinking into design and delivery to ensure the residential asset could perform operationally, economically and technically over its long life.",
    sections: [
      {
        id: "problem",
        heading: "Problem",
        paragraphs: [
          "Residential development is often measured against three immediate outcomes: cost, programme and completion.",
          "Dreniak approached this development differently.",
          "From the outset, the apartment complex had to be considered simultaneously as an engineering project, operating asset and long-term investment. Decisions taken during design and construction would eventually determine maintenance requirements, operating expenditure, durability, tenant experience, resilience and ultimately the long-term commercial performance of the property.",
          "This created a fundamental asset-management challenge: how do you prevent the operational future of an asset from becoming an afterthought to its construction?",
          "The implications extend far beyond this development. ISO 55000:2024 places lifecycle management and value realisation at the centre of asset management, while UK whole-life infrastructure practice similarly distinguishes whole-life value from simply achieving the lowest initial capital cost."
        ]
      },
      {
        id: "intervention",
        heading: "Intervention",
        paragraphs: [
          "Dreniak embedded asset-management thinking into the development process rather than waiting for practical completion.",
          "Our involvement extended across the asset lifecycle: coordinating engineering and construction considerations; reviewing materials, systems and maintainability; monitoring delivery; documenting key asset information; identifying future inspection and maintenance requirements; considering operational accessibility; and evaluating decisions against their potential effect on long-term performance.",
          "This required collaboration across engineering, architectural, construction, procurement, commercial and site teams. Rather than allowing each discipline to optimise its own package independently, decisions were considered against the performance of the completed asset.",
          "The approach effectively created a bridge between CAPEX and OPEX.",
          "Where alternative solutions existed, the question was not simply: \"Which option costs less today?\"",
          "It became: \"What does this decision mean for the next 20–30 years of this asset?\"",
          "That philosophy is consistent with modern whole-life asset practice. UK government infrastructure guidance, for example, assesses whole-life cost across capital, maintenance, management, operation and eventual exit or disposal rather than initial acquisition cost alone.",
          "As the development progressed, Dreniak's role increasingly shifted from helping deliver the building to preparing for management of the asset."
        ]
      },
      {
        id: "result",
        heading: "Result",
        paragraphs: [
          "The development has reached approximately 90% completion, representing a major transition from construction into operational readiness.",
          "More importantly, the project has given Dreniak practical experience across the complete relationship between design decisions, construction delivery, asset information, maintainability, cost and future performance.",
          "The success of the relationship has created sufficient confidence for Dreniak to be positioned to execute a further development with the client in 2027.",
          "That repeat mandate is important.",
          "The first development establishes the methodology.",
          "The next creates the opportunity to apply everything learned from the first asset before the next one is built."
        ]
      },
      {
        id: "long-term-value",
        heading: "Long-term Value",
        paragraphs: [
          "The real opportunity now lies at portfolio level.",
          "As successive developments are delivered, asset information, maintenance experience, actual performance and lifecycle lessons from the first property can inform the specification and management of the next.",
          "Over time, this creates something more valuable than a series of completed buildings: a continuously improving asset portfolio.",
          "The strategic progression is therefore: Design → Build → Document → Operate → Learn → Improve → Build Better",
          "For Dreniak, this project demonstrates one of our fundamental beliefs: A successful building is not one that merely reaches completion. It is one that continues to perform economically, technically and operationally throughout its life."
        ]
      }
    ],
    serviceLinks: [
      { label: "Lifecycle Engineering & Performance", href: "/asset-management/services#service-1" },
      { label: "Capital Planning, Finance & Investment Advisory", href: "/asset-management/services#service-2" }
    ]
  },
  {
    slug: "building-the-information-architecture-behind-a-national-transport-system",
    isPublished: true,
    client: "National Planning Authority, Uganda",
    sector: "Government | Transport & National Infrastructure",
    sectorLink: "/asset-management/sectors#government-national-infrastructure",
    location: "Uganda",
    role: "Consultative Input — Phase II",
    capability: "Infrastructure Intelligence | Asset Data | Transport Infrastructure Strategy",
    title: "Building the Information Architecture Behind a National Transport System",
    subtitle: "National Multimodal Transport Modelling & Integrated Infrastructure Database",
    opening:
      "Before a country can optimise infrastructure investment, it must first understand how its infrastructure works as a system.",
    summary:
      "Dreniak brought an asset-management lens to Uganda's national transport planning work by connecting data, infrastructure, economics and future investment decisions.",
    sections: [
      {
        id: "problem",
        heading: "Problem",
        paragraphs: [
          "Transport infrastructure is rarely a collection of independent assets.",
          "Roads influence rail. Rail influences freight. Freight affects ports and border crossings. Public transport influences urban productivity. Airports connect domestic economic activity to international markets.",
          "Yet infrastructure information can exist across different institutions, formats, geographies and transport modes.",
          "That fragmentation creates a national planning problem.",
          "Without integrated infrastructure information and a model of how people and goods move across the network, decision-makers face a more difficult task answering fundamental questions: Where is demand actually growing? Where are the network constraints? How does investment in one mode affect another? Which interventions create the greatest national economic benefit? Where should the next unit of infrastructure capital be deployed?"
        ]
      },
      {
        id: "intervention",
        heading: "Intervention",
        paragraphs: [
          "Dreniak was consulted by Uganda's National Planning Authority in relation to Phase II of a project concerning the development of a multimodal transport model alongside a National Integrated Transport Infrastructure Database.",
          "This represented asset management at a fundamentally different scale.",
          "Rather than assessing one road or one transport asset, the work concerns the information architecture required to understand a national infrastructure system.",
          "Dreniak's contribution brought an asset-management perspective to the discussion: infrastructure data becomes significantly more valuable when it can support decisions around condition, capacity, utilisation, criticality, risk, investment and future demand.",
          "The database dimension is particularly significant. International asset-management practice increasingly treats reliable data as a strategic asset in itself. ISO 55013:2024 specifically addresses the management of data assets in support of asset-management objectives, while the 2024 ISO 55001 revision strengthened requirements around data, knowledge, decision-making, lifecycle operations and value realisation."
        ],
        subsections: [
          {
            heading: "How we approached the system",
            paragraphs: [
              "The thinking required interaction across more than engineering.",
              "Transport modelling requires the relationship between infrastructure, geography, population, economic activity, travel behaviour, freight movement, land use and future development to be understood.",
              "The asset-management dimension therefore sits between several disciplines:",
              "Transport Engineering — understanding networks, capacity and infrastructure.\nData & GIS — creating structured and spatially meaningful infrastructure information.\nPlanning — connecting infrastructure with national and regional development.\nEconomics — understanding demand, productivity and the consequences of investment.\nGovernment & Institutions — understanding who owns, operates, funds and maintains the underlying infrastructure.",
              "This multidisciplinary environment closely reflects Dreniak's philosophy: engineering tells us what exists; data allows us to understand it; economics helps determine what should happen next."
            ]
          }
        ]
      },
      {
        id: "result",
        heading: "Result",
        paragraphs: [
          "The assignment places Dreniak within a national-level conversation about how infrastructure information can support multimodal transport planning and investment decision-making.",
          "The significance is not simply the creation of another database.",
          "A national integrated infrastructure dataset can create the foundation from which government progressively develops a more coherent picture of its transport assets and networks — supporting modelling, scenario analysis, prioritisation and future infrastructure planning."
        ]
      },
      {
        id: "long-term-value",
        heading: "Long-term Value",
        paragraphs: [
          "At national scale, relatively small improvements in infrastructure decision-making can have consequences far beyond an individual project.",
          "The UK's current Government Major Projects Portfolio illustrates the magnitude involved: its 2024–25 portfolio contained 213 major projects with approximately £996 billion of whole-life cost, including £433 billion within infrastructure and construction alone. This is why mature infrastructure systems increasingly place such emphasis on portfolio data, assurance and whole-life decision-making.",
          "Uganda's context is different, but the principle travels: better infrastructure information enables better infrastructure decisions.",
          "A mature national transport model connected to reliable infrastructure data can ultimately support questions around corridor investment, network capacity, maintenance priorities, urban growth, logistics, regional connectivity and capital allocation.",
          "For Dreniak, the project represents the progression from: Managing Assets → Understanding Networks → Informing Economies.",
          "Infrastructure becomes more powerful when a nation can see not only the assets it owns, but how those assets work together.",
          "That is Infrastructure Harmony at national scale."
        ]
      }
    ],
    serviceLinks: [
      { label: "Digital Asset Management & Intelligence", href: "/asset-management/services#service-3" },
      { label: "Infrastructure & Economic Strategy", href: "/asset-management/services#service-5" }
    ]
  },
  {
    slug: "when-asset-management-became-business-transformation",
    isPublished: true,
    client: "Client identity withheld due to commercial confidentiality.",
    sector: "Corporate / Social Infrastructure",
    location: "United Kingdom",
    status: "3 Years",
    role: "Asset Management | Operational Systems | Finance | Workforce | Investment & Growth Advisory",
    title: "When Asset Management Became Business Transformation",
    subtitle: "Three-Year Enterprise Asset, Operational & Financial Transformation Programme",
    opening:
      "The most valuable assets inside an organisation do not appear in one asset register. Property, vehicles, equipment, people, information and capital must ultimately work as one system.",
    summary:
      "Dreniak's three-year transformation programme moved from asset baseline control to enterprise finance, workforce and investment planning for a growing UK organisation.",
    sections: [
      {
        id: "problem",
        heading: "Problem",
        paragraphs: [
          "Dreniak was engaged by a multi-million-pound UK company operating a distributed portfolio of client-facing properties, staff accommodation, vehicles, operational equipment and supporting business infrastructure.",
          "The initial challenge appeared to be asset management.",
          "The deeper assessment revealed something larger.",
          "Physical assets were directly connected to workforce deployment, operating costs, payroll, procurement, service capacity and cash flow. Decisions being made in one part of the organisation were therefore creating financial and operational consequences elsewhere.",
          "A vehicle was not simply a vehicle. It influenced staff mobility, service capacity, mileage expenditure, maintenance, insurance, downtime and ultimately revenue delivery.",
          "A property was not simply a building. It represented accommodation capacity, occupancy cost, utilities, maintenance liabilities and an operating platform.",
          "Equipment was not simply inventory. Its availability, condition and allocation affected the ability of people to perform.",
          "Dreniak therefore concluded that optimising the physical assets without improving the management system surrounding them would only solve part of the problem."
        ]
      },
      {
        id: "intervention",
        heading: "Intervention",
        paragraphs: [
          "The mandate progressively expanded into a three-year enterprise asset and management transformation programme."
        ],
        subsections: [
          {
            heading: "Asset Baseline & Portfolio Control",
            paragraphs: [
              "Dreniak assessed the organisation's principal physical and operational assets, including properties, transport assets and equipment.",
              "The objective was to establish greater clarity around: Ownership → Location → Responsibility → Condition → Cost → Utilisation → Risk → Required Action",
              "This mirrors mature estate-management practice internationally. For example, the UK's Defra group has undertaken full asset-verification exercises to establish accurate registers as a foundation for whole-life asset management and investment planning."
            ]
          },
          {
            heading: "Property & Accommodation",
            paragraphs: [
              "Property arrangements were reviewed against occupancy, operational need, recurring expenditure, responsibilities and management controls.",
              "Rather than seeing accommodation purely as overhead, Dreniak considered how the estate supported workforce availability and service delivery while identifying where stronger controls were required around utilisation, cost recovery and accountability."
            ]
          },
          {
            heading: "Fleet & Transport",
            paragraphs: [
              "Transport assets were reviewed against utilisation, operating requirements, driver arrangements, mileage, maintenance, acquisition options and lifecycle economics.",
              "This enabled management to consider not only whether vehicles were available, but whether the fleet model itself was economically appropriate."
            ]
          },
          {
            heading: "Equipment & Resources",
            paragraphs: [
              "Operational equipment was brought into clearer accountability structures covering allocation, responsibility, loss or damage, replacement and return.",
              "The underlying principle was straightforward: an asset without accountability becomes a cost centre."
            ]
          },
          {
            heading: "From Asset Management to Management Systems",
            paragraphs: [
              "The assessment revealed that several asset problems originated upstream — in information flow, responsibilities and financial processes.",
              "Dreniak therefore worked across operations, administration, service management, finance, workforce leadership and senior management to strengthen the management environment surrounding the assets.",
              "Responsibilities were clarified. Information flows were redesigned. Operational reporting was strengthened. Cost visibility improved. Maintenance and resource decisions became more structured. Asset decisions increasingly began to feed into financial planning.",
              "This is consistent with ISO 55000's core principle that asset management should align with organisational objectives rather than operate as an isolated technical function."
            ]
          },
          {
            heading: "Finance, Payroll & Capital",
            paragraphs: [
              "As confidence in the programme developed, Dreniak's mandate expanded further.",
              "The company was entrusted with responsibilities spanning payroll, financial management, cash-flow oversight, expenditure control, financial reporting support, investment scoping and commercial decision-making.",
              "This was a significant evolution. Dreniak could now see the relationship between: Asset → Operational Activity → Labour → Cost → Revenue → Cash → Investment",
              "That allowed physical asset decisions to be considered alongside their actual financial consequences. For example, fleet decisions could be assessed against labour deployment and operating cost. Property decisions could be considered alongside occupancy and workforce requirements. Investment proposals could be evaluated against affordability, cash generation and future organisational capacity.",
              "The UK government's whole-life value approach similarly emphasises that asset decisions should account for capital, maintenance, management, operation and exit costs — not simply purchase price."
            ]
          }
        ]
      },
      {
        id: "result",
        heading: "Result",
        paragraphs: [
          "Over the three-year engagement, the organisation's gross annual income grew approximately threefold, surpassing its previous scale of operations.",
          "It is important that Dreniak describes this correctly: We should not claim that Dreniak alone caused a 3× increase in revenue.",
          "Growth of this magnitude is produced by an organisation — its leadership, workforce, market, operations and clients.",
          "What Dreniak can credibly state is that our work supported and enabled that growth by helping build the asset, financial and management infrastructure required for a larger organisation to operate with greater control.",
          "The relationship itself is perhaps the strongest evidence.",
          "What began as an asset-management mandate expanded into responsibility across finance, payroll, systems, investment and commercial planning.",
          "The client did not simply ask Dreniak to manage more assets. They trusted Dreniak with more of the organisation."
        ]
      },
      {
        id: "long-term-value",
        heading: "Long-term Value",
        paragraphs: [
          "The programme demonstrated something fundamental to Dreniak's philosophy: Asset performance and business performance cannot always be separated.",
          "A poorly utilised vehicle affects cost. Poorly managed property affects cash. Unavailable equipment affects productivity. Weak information affects management decisions. Poor capital allocation affects growth. And fragmented financial information prevents leadership from seeing the whole system.",
          "This is why mature asset management increasingly integrates physical and financial decision-making rather than treating engineering, finance and operations as independent disciplines.",
          "The long-term outcome was therefore not simply a better asset register or maintenance plan.",
          "It was the development of a more disciplined management architecture around the organisation's productive resources.",
          "The objective was never to make the assets look better on paper. It was to make the organisation perform better because its assets were managed better."
        ]
      }
    ],
    serviceLinks: [
      { label: "Asset Intelligence & Strategic Management", href: "/asset-management/services#service-0" }
    ]
  }
];

export const assetManagementProjectCards: ProjectCard[] = [
  {
    title: "Uganda: Education Estate & Campus Planning",
    location: "Uganda",
    sector: "Education & Institutional Infrastructure",
    hook: "Portfolio strategy for expanding education assets.",
    capabilityTags: ["Portfolio Strategy", "Asset Intelligence"],
    body: "Developed a scalable infrastructure-management approach for education assets, considering how buildings, utilities, land, transport and supporting infrastructure can be managed collectively across an expanding institutional portfolio.",
    valueLine: "One estate. One strategy. Generations of value.",
    href: "/asset-management/projects#uganda-education-estate-campus-planning"
  },
  {
    title: "Jinja, Uganda: Residential Asset Optimisation",
    location: "Jinja, Uganda",
    sector: "Real Estate & Major Developments",
    hook: "Phased capital planning for an existing residential asset.",
    capabilityTags: ["Lifecycle Engineering", "Capital Planning"],
    body: "Developed a phased improvement strategy for an existing residential asset, prioritising structural, external and functional interventions against available capital. The programme converted an extensive scope of works into manageable investment phases while protecting long-term asset performance.",
    valueLine: "Better sequencing. Controlled capital. Longer-term performance.",
    href: "/asset-management/projects#jinja-uganda-residential-asset-optimisation"
  }
];

export const allAssetManagementProjectCaseStudies = [...assetManagementFeaturedProjects];
