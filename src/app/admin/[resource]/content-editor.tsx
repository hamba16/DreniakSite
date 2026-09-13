"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { contentForms, contentPayload, newContent, pageAddress, type ContentField, type ContentRecord, type ContentValue } from "@/lib/admin-content-forms";

type MediaChoice = { id: string; alt_text: string; media_type: string };
export function ContentEditor({ resource }: { resource: string }) {
  const definition = contentForms[resource];
  const [items, setItems] = useState<ContentRecord[]>([]);
  const [draft, setDraft] = useState<ContentRecord>(() => newContent(resource));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>( {} );
  const [media, setMedia] = useState<MediaChoice[]>([]);
  const [mediaError, setMediaError] = useState(false);
  const editor = useRef<HTMLFormElement>(null);
  const slugEdited = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/${resource}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => { if (!response.ok) throw new Error(); return response.json() as Promise<ContentRecord[]>; })
      .then((data) => { setItems(data); setLoading(false); setLoadError(""); })
      .catch(() => { if (!controller.signal.aborted) { setLoading(false); setLoadError("We couldn’t load your saved content. Please try again."); } });
    if (resource === "founder") {
      fetch("/api/admin/media", { signal: controller.signal, cache: "no-store" })
        .then(async (response) => { if (!response.ok) throw new Error(); return response.json() as Promise<MediaChoice[]>; })
        .then((data) => { setMedia(data.filter((item) => item.media_type === "image")); setMediaError(false); })
        .catch(() => { if (!controller.signal.aborted) setMediaError(true); });
    }
    return () => controller.abort();
  }, [resource, reload]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function update(key: string, value: ContentValue) {
    setDirty(true); setMessage("");
    if (key === "slug") slugEdited.current = true;
    setDraft((current) => ({ ...current, [key]: value, ...(resource === "insights" && key === "title" && !current.id && !slugEdited.current ? { slug: pageAddress(String(value)) } : {}) }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  }
  function select(item?: ContentRecord) {
    if (dirty && !window.confirm("Discard your unsaved changes?")) return;
    setDraft(item ? { ...newContent(resource), ...item } : newContent(resource));
    slugEdited.current = Boolean(item);
    setDirty(false); setError(""); setMessage(""); setFieldErrors({});
    editor.current?.scrollIntoView({ behavior: "auto", block: "start" });
    editor.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea")?.focus({ preventScroll: true });
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const invalid = Object.fromEntries(definition.fields.filter((field) => field.required && !String(draft[field.key] ?? "").trim()).map((field) => [field.key, `Enter ${field.label.toLowerCase()}.`]));
    if (Object.keys(invalid).length) { setFieldErrors(invalid); setError("Please complete the highlighted fields."); return; }
    setBusy(true); setError(""); setMessage(""); setFieldErrors({});
    try {
      const response = await fetch(`/api/admin/${resource}`, { method: draft.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(contentPayload(resource, draft)) });
      const result = await response.json();
      if (!response.ok) {
        if (result.error?.fieldErrors) {
          setFieldErrors(Object.fromEntries(Object.entries(result.error.fieldErrors).map(([key]) => [key, "Please check this field."])));
        }
        throw new Error(typeof result.error === "string" ? result.error : "Please check your entries and try again.");
      }
      setItems((current) => draft.id ? current.map((item) => item.id === draft.id ? result : item) : [result, ...current]);
      setMessage(`${definition.singular[0].toUpperCase() + definition.singular.slice(1)} ${draft.id ? "updated" : "created"}.`);
      setDraft(newContent(resource)); setDirty(false); slugEdited.current = false;
    } catch (cause) { setError(cause instanceof Error && !(cause instanceof TypeError) && !(cause instanceof SyntaxError) ? cause.message : "We couldn’t save your changes. Please try again."); }
    finally { setBusy(false); }
  }
  async function remove(item: ContentRecord) {
    if (!window.confirm(`Delete “${String(item.name || item.title)}”? This cannot be undone.`)) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/admin/${resource}?id=${encodeURIComponent(String(item.id))}`, { method: "DELETE" });
      if (!response.ok) { const result = await response.json(); throw new Error(typeof result.error === "string" ? result.error : "We couldn’t delete this item. Please try again."); }
      setItems((current) => current.filter((row) => row.id !== item.id));
      if (draft.id === item.id) { setDraft(newContent(resource)); setDirty(false); slugEdited.current = false; }
      setMessage(`${definition.singular[0].toUpperCase() + definition.singular.slice(1)} deleted.`);
    } catch (cause) { setError(cause instanceof Error && !(cause instanceof TypeError) && !(cause instanceof SyntaxError) ? cause.message : "We couldn’t delete this item. Please try again."); }
    finally { setBusy(false); }
  }
  function field(field: ContentField) {
    const id = `content-${field.key}`;
    const value = draft[field.key];
    const common = { id, name: field.key, required: field.required, "aria-invalid": Boolean(fieldErrors[field.key]), "aria-describedby": `${field.help ? `${id}-help ` : ""}${id}-error` };
    let input;
    if (field.type === "list") {
      const entries = Array.isArray(value) ? value : [];
      input = <div className="content-repeat-list" role="group" aria-label={field.label}>{entries.map((entry, index) => <div className="content-repeat-row" key={index}>
        {field.key === "body" ? <textarea aria-label={`Paragraph ${index + 1}`} value={entry} rows={4} onChange={(event) => update(field.key, entries.map((text, i) => i === index ? event.target.value : text))} /> : <input aria-label={`Included item ${index + 1}`} value={entry} onChange={(event) => update(field.key, entries.map((text, i) => i === index ? event.target.value : text))} />}
        <button type="button" className="content-text-button" aria-label={`Remove ${field.key === "body" ? "paragraph" : "item"} ${index + 1}`} onClick={() => update(field.key, entries.filter((_, i) => i !== index))}>Remove</button>
      </div>)}<button type="button" className="content-secondary" onClick={() => update(field.key, [...entries, ""])}>+ Add {field.key === "body" ? "paragraph" : "included item"}</button></div>;
    } else if (field.type === "select" || field.type === "portrait") {
      const choices = field.type === "portrait" ? [{ value: "", label: "No portrait" }, ...media.map((item, index) => ({ value: item.id, label: item.alt_text || `Image ${index + 1}` }))] : field.options!;
      input = <><select {...common} value={String(value ?? "")} onChange={(event) => update(field.key, event.target.value || null)}>
        {value && !choices.some((choice) => choice.value === value) && <option value={String(value)}>{field.type === "portrait" ? "Current portrait" : String(value)}</option>}
        {choices.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
      </select>{field.type === "portrait" && <small>{mediaError ? "Images couldn’t be loaded. " : "Need a different image? "}<Link href="/admin/media">Open Media Library</Link>{mediaError && <button type="button" className="content-text-button" onClick={() => setReload((value) => value + 1)}>Retry</button>}</small>}</>;
    } else if (field.type === "checkbox") {
      input = <label className="content-toggle"><input {...common} type="checkbox" checked={value === true} onChange={(event) => update(field.key, event.target.checked)} /><span>{field.label}</span></label>;
    } else if (field.type === "textarea") {
      input = <textarea {...common} rows={4} value={String(value ?? "")} onChange={(event) => update(field.key, event.target.value)} />;
    } else {
      input = <input {...common} type={field.type || "text"} step={field.type === "number" ? 1 : undefined} placeholder={field.placeholder} value={String(value ?? "")} onChange={(event) => update(field.key, event.target.value)} />;
    }
    return <div className={`content-field ${field.type === "textarea" || field.type === "list" ? "content-field-wide" : ""}`} key={field.key}>
      {field.type !== "checkbox" && (field.type === "list" ? <span className="content-field-label">{field.label}</span> : <label htmlFor={id}>{field.label}{field.required && <span className="content-required">Required</span>}</label>)}
      {field.help && <small id={`${id}-help`}>{field.help}</small>}{input}
      <small className="admin-error" id={`${id}-error`}>{fieldErrors[field.key]}</small>
    </div>;
  }
  return <div className="content-manager">
    <form ref={editor} className="content-form" onSubmit={save} aria-label={`${draft.id ? "Edit" : "Add"} ${definition.singular}`}>
      <div className="content-form-heading"><div><h2>{draft.id ? `Edit ${definition.singular}` : `Add ${definition.singular}`}</h2><p>Fill in the details below. Fields marked Required must be completed.</p></div>{draft.id && <button type="button" className="content-text-button" disabled={busy} onClick={() => select()}>Cancel editing</button>}</div>
      <fieldset disabled={busy} className="content-fields"><legend className="sr-only">Content details</legend>{definition.fields.filter((item) => !item.settings).map(field)}</fieldset>
      {definition.fields.some((item) => item.settings) && <fieldset disabled={busy} className="content-fields content-settings"><legend>Website settings</legend>{definition.fields.filter((item) => item.settings).map(field)}</fieldset>}
      <div className="content-form-footer"><button className="button" type="submit" disabled={busy}>{busy ? "Saving…" : draft.id ? "Save changes" : `Create ${definition.singular}`}</button>{dirty && <span>Unsaved changes</span>}</div>
    </form>
    <div aria-live="polite">{message && <p className="content-success" role="status">{message}</p>}{error && <p className="content-feedback admin-error" role="alert">{error}</p>}</div>
    <section className="content-saved" aria-label={`Saved ${definition.title.toLowerCase()}`}><div className="content-list-heading"><h2>Saved {definition.title.toLowerCase()}</h2><span>{items.length} {items.length === 1 ? "item" : "items"}</span></div>
      {loading ? <p role="status">Loading your content…</p> : loadError ? <p role="alert">{loadError} <button type="button" className="content-text-button" onClick={() => { setLoading(true); setReload((value) => value + 1); }}>Retry</button></p> : !items.length ? <p className="content-empty">No {definition.title.toLowerCase()} yet. Add your first {definition.singular} using the form above.</p> : <div className="content-record-list">{items.map((item) => <article key={String(item.id)}>
        <div><h3>{String(item.name || item.title || definition.singular)}</h3><p>{item.division === "engineering" ? "Engineering" : item.division === "asset-management" ? "Asset Management" : "Shared"}{typeof item.is_published === "boolean" ? ` · ${item.is_published ? "Visible on website" : "Draft"}` : ""}</p>{Boolean(item.description || item.summary || item.quote || item.text) && <p className="content-excerpt">{String(item.description || item.summary || item.quote || item.text)}</p>}</div>
        <div className="content-record-actions"><button type="button" className="content-secondary" disabled={busy} onClick={() => select(item)}>Edit</button><button type="button" className="content-text-button" disabled={busy} onClick={() => remove(item)}>Delete</button></div>
      </article>)}</div>}
    </section>
  </div>;
}
