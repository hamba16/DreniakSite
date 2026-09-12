"use client";

import { useEffect, useRef, useState } from "react";

type MediaItem = { id: string; public_url: string; media_type: "image" | "video"; alt_text: string };

export function MediaLibrary() {
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function load() {
    const response = await fetch("/api/admin/media");
    if (response.ok) setItems(await response.json());
  }
  useEffect(() => { void load(); }, []);
  async function upload(file: File) {
    setBusy(true);
    setMessage("");
    const type = file.type.startsWith("video/") ? "video" : "image";
    const form = new FormData();
    form.set("file", file);
    form.set("media_type", type);
    form.set("alt_text", file.name);
    const response = await fetch("/api/admin/media/upload", { method: "POST", body: form });
    if (!response.ok) setMessage((await response.json()).error || "Upload failed.");
    else await load();
    setBusy(false);
  }
  async function remove(item: MediaItem) {
    const response = await fetch("/api/admin/media/delete", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: item.id }) });
    if (response.ok) await load();
  }
  async function copy(url: string) {
    await navigator.clipboard.writeText(url);
    setMessage("Public URL copied.");
  }
  return <div className="media-library">
    <button className="media-dropzone" disabled={busy} onClick={() => input.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files[0]; if (file) void upload(file); }}>
      {busy ? "Uploading…" : "Drop an image or video here, or click to choose"}
    </button>
    <input ref={input} hidden type="file" accept="image/*,video/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} />
    {message && <p className="admin-error">{message}</p>}
    <div className="media-grid">{items.map((item) => <article className="media-card" key={item.id}>
      {item.media_type === "video" ? <video src={item.public_url} controls /> : <img src={item.public_url} alt={item.alt_text} />}
      <small>{item.alt_text}</small>
      <div><button onClick={() => void copy(item.public_url)}>Copy URL</button><button onClick={() => void remove(item)}>Delete</button></div>
    </article>)}</div>
  </div>;
}
