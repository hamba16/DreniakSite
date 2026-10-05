import type { PublishedPartner } from "@/lib/public-content";

// Client-approved directory entries. Public CMS entries retain their existing model.
export const approvedPartners: PublishedPartner[] = [
  { id: "ag-rosa", name: "AG Rosa", description: "Architectural rendering", category: "Service Providers", link: "https://agluxurydev.com/", sortOrder: 100, logo: null },
  { id: "nk-udada-foundation", name: "NK Udada Foundation", description: "A youth-led Ugandan foundation supporting young people through education, health outreach, life skills and mentorship.", category: "Community partner", link: "https://the-nkfoundation.org/", sortOrder: 110, logo: null },
  { id: "dbam", name: "DBAM", description: "", category: "", link: "https://dbamsocialcare.co.uk/", sortOrder: 120, logo: null },
];

export function withApprovedPartners(published: PublishedPartner[]) {
  const key = (name: string) => name.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const approvedNames = new Set([...approvedPartners.map(item => key(item.name)), "dbamuk"]);
  return [...published.filter(item => !approvedNames.has(key(item.name))), ...approvedPartners]
    .sort((a,b)=>a.sortOrder-b.sortOrder || a.name.localeCompare(b.name));
}

export const partnerIntroduction = {
  text: "Strong infrastructure work depends on strong collaborators. Clear coordination and complementary expertise support thoughtful outcomes across both Dreniak disciplines.",
  editorialStatus: "drafted, pending client review",
} as const;

export const partnerCategoryDefaults = [
  "Service Providers",
  "Contractors",
] as const;
