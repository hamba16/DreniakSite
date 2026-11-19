export const decodedArticle = {
  title: "After the connection",
  slug: "after-the-connection-africa-electricity",
  standfirst: "What it takes to make electricity dependable",
  secondaryStandfirst:
    "Electricity access and distribution performance in Uganda",
  metaDescription:
    "What Uganda's distribution losses reveal about keeping electricity reliable as Africa expands access.",
  listingExcerpt:
    "Uganda's distribution losses rose from 16.7% to 18.1%. What that number can and cannot tell us about keeping electricity dependable.",
  date: "November 2026",
  series: "Dreniak Decoded · Issue 01 · November 2026",
  divisionTag: "Infrastructure & Asset Management",
  quickRead: {
    opening:
      "A grain mill has orders to fill. The electricity goes off halfway through the morning. The owner can wait, pay to run a generator or send customers away. On paper, the mill has access to electricity. On the shop floor, the owner still has to decide how much work to promise.",
    introduction:
      "That’s the part of electrification we’re decoding. Once a customer is connected, someone has to keep the equipment working, understand why service is failing and decide where the next investment will make the most difference.",
    ugandaHeading: "Why Uganda is a useful place to look",
    uganda:
      "Mission 300 aims to reach 300 million people in sub-Saharan Africa with electricity by 2030. Uganda’s National Energy Compact sets an access target of 85% by the same year. As more homes, businesses and public facilities connect, the equipment serving them needs an operating and maintenance plan that can keep up.",
    statCaption:
      "Uganda's distribution loss rate, 2024 to 2025 (ERA)",
    statSupport:
      "Uganda’s regulator reported a rise in distribution losses. It measures the gap between the electricity distributors purchase and the electricity they sell. Both purchases and sales grew, but the gap grew faster.",
    statAfter:
      "Some electricity is lost as it moves through cables and equipment. Meter problems or incomplete records can widen the gap too. The national figure tells us where to start asking questions. Finding the answer means looking at individual circuits and what customers experience.",
  },
  decision: {
    scenarioHeading: "Your decision",
    promptHeading: "Where would you send the first team?",
    scenario:
      "Imagine you run a local electricity network. Two circuits serving different areas report similar energy losses. You have one field team available this week. Where would you send it first?",
    choices: [
      {
        id: "if-you-chose-a",
        title: "A / The health centre",
        description:
          "The circuit has repeated outages, and the health centre regularly switches to backup power.",
        explanation:
          "We would check how long the outages lasted, when they occurred and which equipment failed. If the same transformer was overloaded each time, the operator could compare shifting some demand to a nearby circuit with upgrading the equipment. If the interruptions started further upstream, replacing the local transformer could leave the health centre with the same problem.",
      },
      {
        id: "if-you-chose-b",
        title: "B / The trading centre",
        description:
          "The circuit has few recorded outages, but the electricity arriving in the area is well above what customer meters account for.",
        explanation:
          "We would make sure the main meter and customer meters cover the same area and period. Then we would check suspect meters and reconcile the customer list. If a records or metering problem explains the gap, fixing it may be a better use of funds than replacing equipment.",
      },
    ],
    closing:
      "With only this information, we would give the health centre the first field visit because of the potential consequences of an outage. We could start checking the trading centre’s meter records in parallel. These are illustrative scenarios, and the priority would change if new evidence pointed to a more urgent risk.",
  },
  howWeWork: {
    heading: "How Dreniak would fill the gap",
    introduction:
      "An operator may know which areas receive the most complaints. A finance team may know how much it can spend. The missing piece is often a shared view of which equipment is causing the problem, who depends on it and which fix would justify the cost. That’s the work Dreniak would take on with the operator.",
    table: {
      caption: "What Dreniak would do and what the client would get.",
      headers: ["What we would do", "What the client would get"],
      rows: [
        [
          "Start with a small group of circuits. Match equipment records, outage history and meter data to the places they serve. Check the gaps with local operators.",
          "A map and asset register showing equipment, known problems and critical customers such as clinics and water facilities.",
        ],
        [
          "Compare the likely causes and the options. Test maintenance, metering fixes or upgrades against cost, disruption and expected service improvement.",
          "A ranked list of actions with a cost range, the evidence behind each recommendation and the checks required before spending.",
        ],
        [
          "Agree how to judge the work before it starts. Track outages, energy losses and outstanding high-priority maintenance in the same areas afterwards.",
          "A baseline and a simple reporting tool that shows what improved, where problems persisted and what should be funded next.",
        ],
      ],
    },
    investmentHeading: "What that changes for an investment decision",
    investment:
      "Consider a utility choosing between replacing a transformer and increasing the stock of spare parts. If peak demand is already above what the transformer can carry, faster repairs alone may leave the same overload in place. If faults are straightforward but crews have to wait days for parts, a larger transformer could tie up money without shortening the outages. We would help the client identify which problem it is paying to solve and how it will know the spend worked.",
    startHeading: "Start with one area",
    start:
      "If you manage or fund an electricity network, pick an area with frequent interruptions or unexplained losses. Bring a sample of outage records, a basic equipment list and meter readings. Dreniak can help you scope a focused review and identify what evidence you need for the next decision.",
    serviceObjectives: {
      caption: "Service objectives, measures and how to use them.",
      headers: ["Service objective", "Measure", "How to use it"],
      rows: [
        [
          "Extend access",
          "New active connections",
          "Report location and customer type.",
        ],
        [
          "Improve reliability",
          "SAIDI, SAIFI and hours lost at critical sites",
          "Use the network average and identify circuits with persistent interruptions.",
        ],
        [
          "Reduce losses",
          "Input less sales, in GWh and as a share of input",
          "Align the readings and track gaps in coverage.",
        ],
        [
          "Maintain asset health",
          "Overdue high-risk work and repeat failures",
          "Assign work to named owners and track whether defects recur.",
        ],
      ],
    },
    verification:
      "Set a baseline before the works and compare performance over equivalent operating periods after completion. Record changes in customer numbers, demand and outage reporting coverage. The aim is to test whether the intervention delivered the expected improvement and to use that evidence in the next investment round.",
  },
  questions: {
    heading: "Could you answer these three questions?",
    items: [
      {
        question: "Where is the service problem?",
        answer:
          "Can you name the area, the equipment and who loses power when it fails?",
      },
      {
        question: "What would you pay to fix first?",
        answer:
          "Can you explain how the proposed work would address the cause and what it would cost to keep working?",
      },
      {
        question: "How would you know it worked?",
        answer:
          "Could you compare interruptions or energy losses before and after the work for the same group of customers?",
      },
    ],
  },
  research: {
    heading: "Research brief: Electricity access and distribution performance in Uganda",
    abstract:
      "This paper examines how electricity access programmes can account for the performance of distribution assets after customers are connected. It uses public data from Uganda’s Electricity Regulatory Authority (ERA) and policy documents from Mission 300 and Uganda’s National Energy Compact. Between 2024 and 2025, Uganda’s reported distribution loss rate rose from 16.7% to 18.1%, while electricity purchases and sales both increased. The annual data establish a widening energy gap. The causes and service consequences require feeder-level evidence. The paper proposes a method for gathering that evidence and using it to appraise interventions.",
    sections: [
      {
        heading: "1. Introduction",
        paragraphs: [
          "A health centre may have a grid connection and still incur backup power costs when supply fails. A grain mill faces a different calculation. Interruptions can idle machinery and labour, while low voltage may constrain the equipment it can run. Counting connections establishes how far access has extended. Measuring the service delivered helps establish what households and businesses can do with it.",
          "Mission 300, led by the World Bank Group and the African Development Bank, aims to extend electricity access to 300 million people in sub-Saharan Africa by 2030. The World Bank Group reported reaching around 64 million people by September 2026, with another 8 million reached through the African Development Bank. Uganda launched its National Energy Compact on 22 October 2026 with an electricity access target of 85% by 2030. These figures describe different things. Mission 300 reports people reached, while Uganda’s target describes the share of the population the country aims to reach.",
        ],
      },
      {
        heading: "2. Method and scope",
        paragraphs: [
          "This is a descriptive case study based on published annual energy balances and policy documents. We subtract energy sold from energy purchased and divide the difference by purchases to check the published loss rate. The service analysis draws on the World Bank’s Uganda energy access study, whose framework includes reliability, capacity, quality and affordability. Feeder measurements, outage logs and customer-level records were unavailable for this analysis, so the intervention examples are illustrative.",
        ],
      },
      {
        heading: "3. Results from Uganda",
        paragraphs: [
          "Uganda’s distributors purchased 815 GWh more electricity in 2025 than in 2024 and sold 584 GWh more. The difference between purchased and sold energy therefore widened by 231 GWh. The reported loss rate rose by 1.4 percentage points. ERA records a decline from 18.9% in 2021 to 16.7% in 2024, so the 2025 increase interrupted the earlier downward trend. Further years are needed to determine whether the increase persists.",
        ],
        energyTable: {
          caption:
            "Table 1. ERA distribution data and Dreniak calculations. Volumes are rounded. pp = percentage points.",
          headers: ["Distribution measure", "2024", "2025", "Change"],
          rows: [
            ["Energy purchased", "5,815 GWh", "6,630 GWh", "+815 GWh"],
            ["Energy sold", "4,846 GWh", "5,430 GWh", "+584 GWh"],
            ["Purchase–sales gap", "969 GWh", "1,200 GWh", "+231 GWh"],
            ["Reported loss rate", "16.7%", "18.1%", "+1.4 pp"],
          ],
          note: "[4]",
        },
      },
      {
        heading: "4. What the energy balance can explain",
        paragraphs: [
          "Distribution losses have different causes and different remedies. Electrical resistance in conductors and losses in transformers consume some of the energy entering the network. Meter faults, incomplete customer records or unauthorised consumption can also widen the gap between purchased and sold energy. Where purchase and sales periods are misaligned, the accounting gap can change even if the physical network performs as before. An investigation should reconcile meter boundaries, reading periods and customer records before attributing the difference to a particular cause.",
          "Reliability needs a separate measure. A feeder can experience repeated faults while accounting for most of the energy it receives. Another circuit may deliver power with few interruptions and still show a substantial metering discrepancy. Uganda’s regulator recognises these different dimensions in its 2026 tariff review, which sets separate parameters for losses, new customer connections, average interruption duration (SAIDI) and average interruption frequency (SAIFI). Those licence parameters are targets for UEDCL. The energy balance in Table 1 covers the wider distribution network.",
          "The 231 GWh increase also cannot be priced as lost cash by applying a single retail tariff. Avoidable technical losses may reduce the energy required to serve existing demand. Correcting a billing issue can increase recorded sales, but the cash effect depends on the applicable tariff and how much of the resulting bill is collected. Costing the two interventions requires different assumptions.",
        ],
      },
      {
        heading: "5. From feeder evidence to investment",
        paragraphs: [
          "The feeder, a circuit that carries electricity from a substation, is a practical starting point. Give each circuit a stable identifier and link it to its transformers, protective devices, customer groups and connected facilities. For the same reporting period, assemble meter readings, load profiles, interruption logs, maintenance records and field observations. Keep a record of data gaps so an incomplete circuit history does not make a poorly monitored area appear to offer better service.",
          "Once the records are linked, compare circuits with similar load profiles and operating conditions. An overloaded transformer serving a health centre warrants checking load history, voltage at the end of the circuit and the interruption causes before selecting a remedy. If an adjacent circuit has capacity, transferring load may defer an upgrade. Where the spare capacity is limited or demand is growing quickly, reinforcement may be justified. A second feeder with a similar loss rate but few recorded interruptions calls for a different first step. Compare energy entering the circuit with customer meter readings over the same period and verify the mapping of customers to the feeder before committing to equipment replacement.",
        ],
      },
      {
        heading: "6. Appraise and verify the options",
        paragraphs: [
          "Compare each intervention against continued operation with planned maintenance. Estimate capital cost, recurring maintenance, spares, implementation outages and renewal timing over a common appraisal period. Identify the benefit each option is meant to produce. For example, load transfer may reduce outage exposure, while a meter audit may improve billed energy. Test the ranking against plausible changes in demand, collection rates and repair times. Assess utility cash flows separately from service benefits such as fewer hours of disrupted trading or lower reliance on backup generation.",
        ],
      },
      {
        heading: "7. Limitations and conclusion",
        paragraphs: [
          "The annual figures describe an aggregate change. They cannot establish which assets drove it, whether the same circuits experienced more outages, or how customers’ costs changed. Establishing those relationships would require a longer series of comparable feeder measurements, customer interruption records and data on operating conditions. Any comparison of interventions should also account for seasonal demand and major upstream interruptions.",
          "Uganda’s case supports a straightforward requirement for electrification business cases. Alongside the number of people expected to gain access, set out what service the operator is expected to deliver, how it will measure that service and how maintenance and renewal will be funded. This gives funders a basis for assessing whether the assets continue to serve the households, firms and public facilities they were built to reach.",
        ],
      },
    ],
  },
  sources: [
    "World Bank Group. Energy overview. Mission 300 results as of September 2026.",
    "World Bank Group. Mission 300 FAQ. Programme scope and 2030 access target.",
    "African Development Bank. Uganda National Energy Compact launch announcement, October 2026.",
    "Uganda Electricity Regulatory Authority. Energy Purchases, Sales and Losses. Distribution series through 2025.",
    "World Bank and ESMAP. Measuring Energy Access in Uganda. Multi-Tier Framework.",
    "Uganda Electricity Regulatory Authority. Main Grid Tariff Review Report, April to June 2026, Table 10.",
  ],
} as const;

export const decodedCitations = {
  readerMission: { id: "cite-reader-mission", sources: [1, 2, 3] },
  readerLoss: { id: "cite-reader-loss", sources: [4] },
  briefIntroduction: { id: "cite-brief-introduction", sources: [1, 2, 3] },
  briefMethod: { id: "cite-brief-method", sources: [4, 5] },
  briefResults: { id: "cite-brief-results", sources: [4] },
  briefTable: { id: "cite-brief-table", sources: [4] },
  briefExplainer: { id: "cite-brief-explainer", sources: [4, 6] },
} as const;

export const decodedSourceBacklinks: Record<number, string[]> = {
  1: [
    decodedCitations.readerMission.id,
    decodedCitations.briefIntroduction.id,
  ],
  2: [
    decodedCitations.readerMission.id,
    decodedCitations.briefIntroduction.id,
  ],
  3: [
    decodedCitations.readerMission.id,
    decodedCitations.briefIntroduction.id,
  ],
  4: [
    decodedCitations.readerLoss.id,
    decodedCitations.briefMethod.id,
    decodedCitations.briefResults.id,
    decodedCitations.briefTable.id,
    decodedCitations.briefExplainer.id,
  ],
  5: [decodedCitations.briefMethod.id],
  6: [decodedCitations.briefExplainer.id],
};
