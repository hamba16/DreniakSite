import { portalClient } from "@/lib/portal/supabase";
import styles from "@/components/portal-page.module.css";
import { PortalAcknowledgeButton } from "@/components/portal-actions";
export const metadata = { robots: { index: false, follow: false } };
export default async function DocumentsPage() {
  const supabase = await portalClient();
  if (!supabase) return <p className={styles.error}>Documents are unavailable.</p>;
  const [{ data, error }, acknowledgements] = await Promise.all([
    supabase.from("documents").select("id, title, document_type, engagement_id, requires_acknowledgement, engagements(name), document_versions(id, version_number, filename, size_bytes, created_at)").eq("visibility", "client").is("deleted_at", null).order("created_at", { ascending: false }),
    supabase.from("document_acknowledgements").select("document_version_id").eq("action", "acknowledge"),
  ]);
  if (error || acknowledgements.error) return <p className={styles.error} role="status">Documents are temporarily unavailable.</p>;
  const acknowledged = new Set((acknowledgements.data || []).map((item) => item.document_version_id));
  return <main className={styles.page}><header className={styles.heading}><div><span className="eyebrow">CLIENT VAULT</span><h1>Documents.</h1><p className={styles.muted}>Private, versioned project records shared with your organisation.</p></div></header>{!data?.length ? <p className={styles.empty}>No client documents have been shared yet.</p> : <div className={styles.list}>{data.map((doc) => <article className={styles.row} key={doc.id}><span><strong>{doc.title}</strong><small>{doc.engagements?.[0]?.name} · {doc.document_type}</small>{doc.document_versions?.map((version) => <small key={version.id}>Version {version.version_number} · {version.filename} · {Math.ceil(version.size_bytes / 1024)} KB · {new Date(version.created_at).toLocaleDateString("en-GB")}</small>)}</span><span>{doc.document_versions?.map((version) => <span key={version.id}><a className={styles.badge} href={`/api/portal/documents/${version.id}/download`}>Download v{version.version_number}</a>{doc.requires_acknowledgement && <span>{acknowledged.has(version.id) ? "Acknowledged" : <PortalAcknowledgeButton versionId={version.id}/>}</span>}</span>)}</span></article>)}</div>}</main>;
}


