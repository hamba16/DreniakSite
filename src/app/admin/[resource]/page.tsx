"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { StructuredEditor } from "./structured-editor";

const labels: Record<string, string> = {
  company_profile: "Company & Founder", company_values: "Values", job_openings: "Job Openings",
  social_links: "Social Links", testimonials: "Testimonials", insights: "Insights",
  services: "Services", sectors: "Sectors", media: "Media Library",
};
const templates: Record<string, object> = {
  homepage_content: { hero_kicker: "", hero_title: "", hero_subtitle: "", premise_label: "", premise_heading: "", closing_text: "" },
  company_profile: { division: "engineering", story: "", mission: "", vision: "", landing_kicker: "", landing_title: "", landing_description: "", landing_intro_label: "", landing_intro: "" },
  company_values: { division: "engineering", name: "", text: "", sort_order: 0 },
  services: { division: "engineering", name: "", description: "", includes: [], value: "", editorial_status: "published", sort_order: 0 },
  sectors: { division: "engineering", name: "", description: "", sort_order: 0 },
  job_openings: { division: "engineering", title: "", location: "", description: "", application_url: "", is_published: true },
  insights: { division: "engineering", slug: "", title: "", category: "", date: new Date().toISOString().slice(0, 10), summary: "", body: [], external_url: "", author: "", is_published: false },
  testimonials: { division: null, quote: "", name: "", role: "", is_published: true },
  social_links: { name: "", href: "https://", sort_order: 0 },
  founder: { name: "", role: "", portrait_media_id: null, story_href: "/story" },
};

export default function ResourcePage() {
  const { resource } = useParams<{ resource: string }>();
  if (resource === "homepage_content" || resource === "company_profile") {
    return <main><span className="eyebrow">CONTENT</span><h1>{labels[resource] || resource}</h1><StructuredEditor resource={resource} /></main>;
  }
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [json, setJson] = useState(JSON.stringify(templates[resource] || {}, null, 2));
  const [message, setMessage] = useState("");
  async function load() {
    const response = await fetch(`/api/admin/${resource}`);
    if (response.ok) setItems(await response.json());
  }
  useEffect(() => { void load(); }, [resource]);
  async function save() {
    try {
      const response = await fetch(`/api/admin/${resource}`, { method: "POST", headers: { "content-type": "application/json" }, body: json });
      if (!response.ok) throw new Error((await response.json()).error || "Save failed.");
      setMessage("Saved.");
      setJson(JSON.stringify(templates[resource] || {}, null, 2));
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Save failed."); }
  }
  async function remove(id: string) {
    const response = await fetch(`/api/admin/${resource}?id=${id}`, { method: "DELETE" });
    if (response.ok) await load();
  }
  return <main><span className="eyebrow">CONTENT</span><h1>{labels[resource] || resource}</h1><div className="admin-editor"><textarea value={json} onChange={(event) => setJson(event.target.value)} aria-label="Content JSON" /><button className="button" onClick={save}>Create record</button>{message && <p>{message}</p>}</div><div className="admin-records">{items.map((item) => <article key={String(item.id)}><strong>{String(item.name || item.title || item.slug || item.id)}</strong><button onClick={() => remove(String(item.id))}>Delete</button></article>)}</div></main>;
}
