// Client-safe field definitions. Keep API field names private to the form code.
export type ContentValue = string | number | boolean | string[] | null;
export type ContentRecord = Record<string, ContentValue>;
export type ContentField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "list" | "number" | "date" | "url" | "select" | "checkbox" | "portrait";
  required?: boolean;
  help?: string;
  placeholder?: string;
  settings?: boolean;
  options?: readonly { value: string; label: string }[];
};
export type ContentForm = { title: string; singular: string; description: string; fields: ContentField[]; defaults: ContentRecord };
const division: ContentField = { key: "division", label: "Division", type: "select", settings: true, options: [{ value: "engineering", label: "Engineering" }, { value: "asset-management", label: "Asset Management" }, { value: "", label: "Shared" }] };
const order: ContentField = { key: "sort_order", label: "Display order", type: "number", settings: true, help: "Lower numbers appear first. Use 0 if the order does not matter." };
const published: ContentField = { key: "is_published", label: "Show on the website", type: "checkbox", settings: true, help: "Leave off to save this as a draft." };

export const contentForms: Record<string, ContentForm> = {
  services: {
    title: "Services", singular: "service", description: "Describe what you offer and what each service includes.",
    defaults: { division: "engineering", name: "", description: "", includes: [], value: "", editorial_status: "published", sort_order: 0 },
    fields: [
      { key: "name", label: "Service name", required: true },
      { key: "description", label: "Description", type: "textarea", help: "Explain the service in your own words." },
      { key: "includes", label: "What’s included", type: "list", help: "Add each activity or deliverable as a separate item." },
      { key: "value", label: "Benefit to the client", type: "textarea", help: "What does this service help your client achieve?" },
      division, order,
      { key: "editorial_status", label: "Review status", type: "select", settings: true, options: [{ value: "published", label: "Ready" }, { value: "drafted, pending client refinement", label: "Needs review" }], help: "For your team’s reference. This does not hide the service from the website." },
    ],
  },
  sectors: {
    title: "Sectors", singular: "sector", description: "Introduce the industries and communities you serve.",
    defaults: { division: "engineering", name: "", description: "", sort_order: 0 },
    fields: [{ key: "name", label: "Sector name", required: true }, { key: "description", label: "Description", type: "textarea" }, division, order],
  },
  company_values: {
    title: "Values", singular: "value", description: "Share the principles that guide your work.",
    defaults: { division: "engineering", name: "", text: "", sort_order: 0 },
    fields: [{ key: "name", label: "Value name", required: true }, { key: "text", label: "What it means", type: "textarea" }, division, order],
  },
  job_openings: {
    title: "Job Openings", singular: "job opening", description: "Add a role, describe the opportunity, and tell applicants how to apply.",
    defaults: { division: "engineering", title: "", location: "", description: "", application_url: "", is_published: true },
    fields: [{ key: "title", label: "Job title", required: true }, { key: "location", label: "Location" }, { key: "description", label: "About the role", type: "textarea" }, { key: "application_url", label: "Application link", type: "url", placeholder: "https://", help: "Optional. Paste the page where applicants should apply." }, division, published],
  },
  insights: {
    title: "Insights", singular: "insight", description: "Write an article or share a useful resource with your audience.",
    defaults: { division: "engineering", slug: "", title: "", category: "", date: "", summary: "", body: [], external_url: "", author: "", is_published: false },
    fields: [{ key: "title", label: "Title", required: true }, { key: "summary", label: "Short introduction", type: "textarea" }, { key: "body", label: "Article paragraphs", type: "list", help: "Write each paragraph in its own box. You can add as many as you need." }, { key: "author", label: "Author" }, { key: "category", label: "Category" }, { key: "date", label: "Article date", type: "date", required: true }, { key: "external_url", label: "Link to the original article", type: "url", placeholder: "https://", help: "Optional. Use this when sharing an article from another website." }, division, { key: "slug", label: "Page address", settings: true, required: true, help: "Created from your title. Use words separated by hyphens; changing an existing address changes its link." }, published],
  },
  testimonials: {
    title: "Testimonials", singular: "testimonial", description: "Add a client’s words and how they should be credited.",
    defaults: { division: null, quote: "", name: "", role: "", is_published: true },
    fields: [{ key: "quote", label: "Client’s testimonial", type: "textarea", required: true }, { key: "name", label: "Client name", required: true }, { key: "role", label: "Role or organisation" }, division, published],
  },
  social_links: {
    title: "Social Links", singular: "social link", description: "Help visitors find your social profiles.",
    defaults: { name: "", href: "", sort_order: 0 },
    fields: [{ key: "name", label: "Platform name", required: true }, { key: "href", label: "Profile link", type: "url", required: true, placeholder: "https://" }, order],
  },
  founder: {
    title: "Founder", singular: "founder profile", description: "Update the founder’s name, role, portrait, and story link.",
    defaults: { name: "", role: "", portrait_media_id: null, story_href: "/story" },
    fields: [{ key: "name", label: "Name", required: true }, { key: "role", label: "Role", required: true }, { key: "portrait_media_id", label: "Portrait", type: "portrait", help: "Choose an image from the Media Library." }, { key: "story_href", label: "Story link", help: "Use a website path such as /story, or a full web address." }],
  },
};

export function newContent(resource: string): ContentRecord {
  const definition = contentForms[resource];
  return { ...definition.defaults, ...(resource === "insights" ? { date: new Date().toISOString().slice(0, 10) } : {}) };
}
export function pageAddress(title: string) {
  return title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
export function contentPayload(resource: string, record: ContentRecord): ContentRecord {
  const definition = contentForms[resource];
  const result: ContentRecord = record.id ? { id: record.id } : {};
  for (const field of definition.fields) {
    const value = record[field.key] === undefined ? definition.defaults[field.key] : record[field.key];
    if (field.key === "division" || field.type === "portrait") result[field.key] = value || null;
    else if (field.type === "number") result[field.key] = Number(value);
    else if (field.type === "checkbox") result[field.key] = value === true;
    else if (field.type === "list") result[field.key] = Array.isArray(value) ? value.filter((item) => item.trim().length > 0) : [];
    else result[field.key] = value == null ? "" : String(value);
  }
  return result;
}
