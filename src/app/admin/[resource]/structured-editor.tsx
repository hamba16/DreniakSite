"use client";

import { useEffect, useState } from "react";

const fields = {
  homepage_content: [
    ["hero_kicker", "Hero kicker"], ["hero_title", "Hero title"], ["hero_subtitle", "Hero subtitle"],
    ["premise_label", "Premise label"], ["premise_heading", "Premise heading"], ["closing_text", "Closing text"],
  ],
  company_profile: [
    ["division", "Division"], ["story", "Story"], ["mission", "Mission"], ["vision", "Vision"],
    ["landing_kicker", "Landing kicker"], ["landing_title", "Landing title"], ["landing_description", "Landing description"],
    ["landing_intro_label", "Landing intro label"], ["landing_intro", "Landing introduction"],
  ],
} as const;

export function StructuredEditor({ resource }: { resource: keyof typeof fields }) {
  const [records, setRecords] = useState<Record<string, string>[]>([]);
  const [current, setCurrent] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const response = await fetch(`/api/admin/${resource}`);
      if (!response.ok || cancelled) return;
      const data = await response.json();
      if (cancelled) return;
      setRecords(data);
      if (data[0]) setCurrent(data[0]);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [resource]);
  function update(field: string, value: string) {
    setCurrent((valueBefore) => ({ ...valueBefore, [field]: value }));
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    const method = current.id ? "PATCH" : "POST";
    const response = await fetch(`/api/admin/${resource}`, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(current) });
    setMessage(response.ok ? "Saved." : ((await response.json()).error || "Save failed."));
    if (response.ok) {
      const refreshed = await fetch(`/api/admin/${resource}`);
      if (refreshed.ok) {
        const data = await refreshed.json();
        setRecords(data);
        if (data[0]) setCurrent(data[0]);
      }
    }
  }
  return <div className="structured-editor"><div className="admin-record-tabs">{records.map((record) => <button key={record.id} onClick={() => setCurrent(record)}>{record.division || "Homepage"}</button>)}<button onClick={() => setCurrent({})}>New</button></div><form onSubmit={save}>{fields[resource].map(([field, label]) => <label key={field}>{label}{field === "division" ? <select value={current[field] || ""} onChange={(event) => update(field, event.target.value)}><option value="">Shared</option><option value="engineering">Engineering</option><option value="asset-management">Asset Management</option></select> : field.includes("story") || field.includes("mission") || field.includes("vision") || field.includes("description") || field.includes("intro") || field.includes("heading") || field.includes("text") || field.includes("title") ? <textarea value={current[field] || ""} onChange={(event) => update(field, event.target.value)} /> : <input value={current[field] || ""} onChange={(event) => update(field, event.target.value)} />}</label>)}<button className="button" type="submit">Save changes</button>{message && <p>{message}</p>}</form></div>;
}
