import Link from "next/link";
import { getPortalSession } from "@/lib/portal/access";
import { portalClient } from "@/lib/portal/supabase";
import styles from "@/components/portal-page.module.css";

export const metadata = { title: "Overview â€” Client Portal", robots: { index: false, follow: false } };

export default async function PortalDashboard() {
  const session = await getPortalSession();
  if (session.state !== "ready") return null;
  const supabase = await portalClient();
  if (!supabase) return <p className={styles.error}>Portal information is unavailable.</p>;
  const userId = session.identity.user.id;
  const [engagements, invoices, requests, messages, milestones, documents, divisions] = await Promise.all([
    supabase.from("engagements").select("id, name, division, stage, status_text, target_date").order("updated_at", { ascending: false }).limit(6),
    supabase.from("invoices").select("id, invoice_number, status, currency, total_minor, due_date").in("status", ["issued", "part_paid", "overdue"]).order("due_date").limit(10),
    supabase.from("requests").select("id, title, status, created_at").in("status", ["open", "in_progress"]).order("created_at", { ascending: false }).limit(10),
    supabase.from("messages").select("id", { count: "exact", head: true }).is("read_at", null).neq("sender_id", userId),
    supabase.from("milestones").select("id, title, due_date, engagement_id, engagements(name)").is("completed_at", null).not("due_date", "is", null).order("due_date").limit(5),
    supabase.from("documents").select("id, title, engagement_id, document_versions(id, document_acknowledgements(id))").eq("requires_acknowledgement", true).eq("visibility", "client").is("deleted_at", null).limit(50),
    session.identity.memberships.length
      ? supabase.from("organisation_divisions").select("division").in("organisation_id", session.identity.memberships.map((membership) => membership.organisation_id)).not("confirmed_at", "is", null)
      : supabase.from("organisation_divisions").select("division").limit(0),
  ]);
  if (engagements.error || invoices.error || requests.error || messages.error || milestones.error || documents.error || divisions.error)
    return <p className={styles.error} role="status">Portal information is temporarily unavailable. Please try again later.</p>;

  const waitingOnYou = (documents.data || []).filter((document) =>
    (document.document_versions || []).some((version) => !(version.document_acknowledgements || []).length),
  ).length;
  const unreadCount = messages.count || 0;
  const attention = (invoices.data?.length || 0) + (requests.data?.length || 0) + unreadCount + waitingOnYou;
  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <div><span className="eyebrow">CLIENT WORKSPACE</span><h1>Overview.</h1><p className={styles.muted}>A current view of your Dreniak workspaces.</p></div>
      </header>
      {session.identity.staffRole ? <p className={styles.notice}>You are signed in with Dreniak staff access.</p> : null}
      {!session.identity.staffRole && session.identity.memberships.length > 0 && <p className={styles.notice}>Workspace access follows the divisions confirmed by Dreniak. A category request remains pending until it is confirmed.</p>}
      <section aria-labelledby="attention-heading">
        <h2 id="attention-heading">Needs your attention <span className={styles.badge}>{attention}</span></h2>
        <div className={styles.grid}>
          <Link className={styles.card} href="/portal/documents"><h3>Documents awaiting acknowledgement</h3><span className={styles.value}>{waitingOnYou}</span><p>Review client-visible documents that request your acknowledgement.</p></Link>
          <Link className={styles.card} href="/portal/invoices"><h3>Unpaid invoices</h3><span className={styles.value}>{invoices.data?.length || 0}</span><p>Issued, part-paid and overdue invoices.</p></Link>
          <Link className={styles.card} href="/portal/messages"><h3>Open requests and unread messages</h3><span className={styles.value}>{(requests.data?.length || 0) + unreadCount}</span><p>{requests.data?.length || 0} open requests · {unreadCount} unread messages.</p></Link>
        </div>
      </section>
      {(divisions.data?.length ?? 0) > 0 && <section aria-labelledby="workspaces-heading"><h2 id="workspaces-heading">Workspaces</h2><div className={styles.grid}>{divisions.data?.some((item) => item.division === "engineering") && <Link className={styles.card} href="/portal/engineering"><h3>Engineering</h3><p>Engagements, supervision and contract records available to your organisation.</p></Link>}{divisions.data?.some((item) => item.division === "asset-management") && <Link className={styles.card} href="/portal/asset-management"><h3>Asset Management</h3><p>Asset register, lifecycle planning and maturity history available to your organisation.</p></Link>}</div></section>}
      <section aria-labelledby="engagements-heading"><h2 id="engagements-heading">Your engagements</h2>{!engagements.data?.length ? <p className={styles.empty}>No client-visible engagements are available yet. Contact your Dreniak representative if you expected to see one.</p> : <div className={styles.list}>{engagements.data.map((engagement) => <Link key={engagement.id} className={styles.row} href={`/portal/engagements/${engagement.id}`}><span>{engagement.name}<small>{engagement.division === "asset-management" ? "Asset Management" : "Engineering"} · {engagement.status_text || engagement.stage}</small></span><span className={styles.badge}>{engagement.target_date || engagement.stage}</span></Link>)}</div>}</section>
      <section aria-labelledby="milestones-heading"><h2 id="milestones-heading">Next milestones</h2>{!milestones.data?.length ? <p className={styles.empty}>No upcoming milestones are listed.</p> : <div className={styles.list}>{milestones.data.map((item) => <div key={item.id} className={styles.row}><span>{item.title}<small>{item.engagements?.[0]?.name || "Engagement"}</small></span><span className={styles.badge}>{item.due_date}</span></div>)}</div>}</section>
    </main>
  );
}

