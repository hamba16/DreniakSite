import Link from "next/link";
import { notFound } from "next/navigation";
import { portalClient } from "@/lib/portal/supabase";
import styles from "@/components/portal-page.module.css";

export const metadata = { robots: { index: false, follow: false } };

export default async function EngagementDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await portalClient();
  if (!supabase) return <p className={styles.error}>Engagement details are unavailable.</p>;
  const { data: engagement, error } = await supabase.from("engagements")
    .select("id, name, division, stage, status_text, start_date, target_date")
    .eq("id", id).maybeSingle();
  if (error) return <p className={styles.error} role="status">Engagement details are temporarily unavailable.</p>;
  if (!engagement) notFound();
  const [milestones, updates, documents, invoices, staff] = await Promise.all([
    supabase.from("milestones").select("id, title, description, due_date, completed_at").eq("engagement_id", id).order("sort_order"),
    supabase.from("status_updates").select("id, body, created_at").eq("engagement_id", id).eq("client_visible", true).order("created_at", { ascending: false }).limit(10),
    supabase.from("documents").select("id, title, document_type").eq("engagement_id", id).eq("visibility", "client").is("deleted_at", null).order("created_at", { ascending: false }).limit(10),
    supabase.from("invoices").select("id, invoice_number, status, due_date, total_minor, currency").eq("engagement_id", id).neq("status", "draft").order("created_at", { ascending: false }).limit(10),
    supabase.from("engagement_staff").select("user_id, assignment, portal_profiles(full_name, job_title)").eq("engagement_id", id),
  ]);
  if (milestones.error || updates.error || documents.error || invoices.error || staff.error)
    return <p className={styles.error} role="status">Engagement details are temporarily unavailable.</p>;
  return <main className={styles.page}>
    <header className={styles.heading}><div><span className="eyebrow">{engagement.division === "asset-management" ? "ASSET MANAGEMENT" : "ENGINEERING"} · {engagement.stage.toUpperCase()}</span><h1>{engagement.name}.</h1><p className={styles.muted}>{engagement.status_text || "No status update has been added yet."}</p></div><span className={styles.badge}>{engagement.target_date || "Target date not set"}</span></header>
    <div className={styles.grid}><Link className={styles.card} href={`/portal/messages?engagement=${id}`}><h2>Messages and requests</h2><p>Open a conversation with your Dreniak team.</p></Link><Link className={styles.card} href={`/portal/documents?engagement=${id}`}><h2>Related documents</h2><p>View the client-visible documents for this engagement.</p></Link><Link className={styles.card} href={`/portal/invoices?engagement=${id}`}><h2>Invoices</h2><p>Review issued invoices and payment history.</p></Link></div>
    <section><h2>Milestones</h2>{!milestones.data?.length ? <p className={styles.empty}>No milestones are listed yet.</p> : <div className={styles.list}>{milestones.data.map((item) => <div className={styles.row} key={item.id}><span>{item.title}<small>{item.description}</small></span><span className={styles.badge}>{item.completed_at ? "Complete" : item.due_date || "Date not set"}</span></div>)}</div>}</section>
    <section><h2>Recent updates</h2>{!updates.data?.length ? <p className={styles.empty}>No client-visible status updates have been added.</p> : <div className={styles.list}>{updates.data.map((item) => <div className={styles.row} key={item.id}><span>{item.body}</span><span className={styles.badge}>{new Date(item.created_at).toLocaleDateString("en-GB", { timeZone: "Africa/Kampala" })}</span></div>)}</div>}</section>
    <section><h2>Assigned Dreniak contacts</h2>{!staff.data?.length ? <p className={styles.empty}>Contact assignments are not listed here yet.</p> : <div className={styles.list}>{staff.data.map((item) => <div className={styles.row} key={item.user_id}><span>{item.portal_profiles?.[0]?.full_name || "Dreniak team member"}<small>{item.portal_profiles?.[0]?.job_title || item.assignment}</small></span></div>)}</div>}</section>
    <section><h2>Related records</h2><div className={styles.grid}><div className={styles.card}><h3>Documents</h3>{documents.data?.length ? documents.data.map((item) => <p key={item.id}>{item.title}</p>) : <p>No client-visible documents.</p>}</div><div className={styles.card}><h3>Invoices</h3>{invoices.data?.length ? invoices.data.map((item) => <p key={item.id}>{item.invoice_number} · {item.status} · {item.currency} {((item.total_minor || 0) / 100).toFixed(2)}</p>) : <p>No issued invoices.</p>}</div></div></section>
  </main>;
}

