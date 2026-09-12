export const assessmentQuestions = [
  {
    area: "Asset data quality",
    question: "How well do you understand what you own?",
    options: [
      "Our records are limited or scattered.",
      "We hold a basic asset list, with gaps.",
      "We maintain a mostly complete, current register.",
      "Our verified asset data informs decisions across the organisation.",
    ],
  },
  {
    area: "Maintenance approach",
    question: "How do you look after your infrastructure?",
    options: [
      "We respond when something fails.",
      "We carry out some scheduled maintenance.",
      "We plan maintenance around asset condition and risk.",
      "We continuously review performance and optimise maintenance.",
    ],
  },
  {
    area: "Lifecycle planning",
    question: "How far ahead do your asset plans look?",
    options: [
      "We do not have documented lifecycle plans.",
      "Our plans focus on the next budget period.",
      "We forecast renewal and whole-life costs over multiple years.",
      "Lifecycle plans guide long-term organisational decisions.",
    ],
  },
  {
    area: "Governance",
    question: "Who owns the responsibility for asset decisions?",
    options: [
      "Responsibility is unclear.",
      "Individuals take responsibility, but processes vary.",
      "Roles, policies and reporting are documented.",
      "Leadership regularly reviews asset performance against objectives.",
    ],
  },
  {
    area: "Risk & resilience",
    question: "How do you prepare for disruption?",
    options: [
      "We have not assessed asset-related risks.",
      "We identify the most obvious risks informally.",
      "We maintain risk assessments and continuity plans.",
      "We regularly test and update resilience plans using evidence.",
    ],
  },
  {
    area: "Capital planning",
    question: "How do you decide where capital should go?",
    options: [
      "We fund the most urgent issues first.",
      "We plan a budget using previous spending.",
      "We compare costs, risk and benefits to prioritise investment.",
      "We evaluate portfolio scenarios and long-term value before investing.",
    ],
  },
];
export function scoreAssessment(answers: number[]) {
  if (
    answers.length !== 6 ||
    answers.some((a) => !Number.isInteger(a) || a < 0 || a > 3)
  )
    throw new Error("Six complete answers from 0 to 3 are required.");
  const score = Math.round((answers.reduce((a, b) => a + b, 0) / 18) * 100);
  if (score < 25)
    return {
      score,
      label: "Establish the foundations.",
      description:
        "Start with a reliable asset register, clear responsibilities and visibility of your most critical risks.",
    };
  if (score < 50)
    return {
      score,
      label: "Build a connected approach.",
      description:
        "Connect your existing records and maintenance activity to consistent governance and longer-term plans.",
    };
  if (score < 75)
    return {
      score,
      label: "Move from planning to intelligence.",
      description:
        "Bring condition, risk, lifecycle costs and capital priorities together to strengthen decisions across your portfolio.",
    };
  return {
    score,
    label: "Refine your approach as it grows.",
    description:
      "Build on your established approach with scenario planning, continuous improvement and wider economic value.",
  };
}
