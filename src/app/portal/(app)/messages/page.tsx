import { portalClient } from "@/lib/portal/supabase";
import styles from "@/components/portal-page.module.css";
import { PortalMessageForm } from "@/components/portal-actions";
export const metadata = { robots: { index: false, follow: false } };
export default async function MessagesPage() {
  const supabase = await portalClient();
  if (!supabase) return <p className={styles.error}>Messages are unavailable.</p>;
  const [{ data, error }, { data: engagements, error: engagementError }, { data: requests, error: requestError }] = await Promise.all([
    supabase.from("threads").select("id, subject, engagement_id, created_at, closed_at, engagements(name), messages(id, sender_id, body, created_at)").order("updated_at", { ascending: false }),
    supabase.from("engagements").select("id, name").order("name"),
    supabase.from("requests").select("id,title,body,status,request_type,created_at,engagements(name)").order("created_at",{ascending:false}),
  ]);
  if (error || engagementError || requestError) return <p className={styles.error} role="status">Messages are temporarily unavailable.</p>;
  return <main className={styles.page}><header className={styles.heading}><div><span className="eyebrow">WORKSPACE</span><h1>Messages and requests.</h1><p className={styles.muted}>Keep project conversations and service requests with their engagement.</p></div></header><section className={styles.card}><PortalMessageForm engagements={engagements||[]}/></section><section><h2>Service requests</h2>{!requests?.length?<p className={styles.empty}>No service requests.</p>:<div className={styles.list}>{requests.map((request)=><article className={styles.row} key={request.id}><span><strong>{request.title}</strong><small>{request.engagements?.[0]?.name} · {request.request_type} · {new Date(request.created_at).toLocaleDateString("en-GB")}</small><small>{request.body}</small></span><span className={styles.badge}>{request.status}</span></article>)}</div>}</section><section><h2>Conversations</h2>{!data?.length ? <p className={styles.empty}>No conversations yet.</p> : <div className={styles.list}>{data.map((thread) => <article className={styles.card} key={thread.id}><h2>{thread.subject}</h2><p>{thread.engagements?.[0]?.name} · {thread.closed_at ? "Closed" : "Open"}</p>{thread.messages?.map((message) => <p className={styles.row} key={message.id}>{message.body}<small>{new Date(message.created_at).toLocaleString("en-GB")}</small></p>)}</article>)}</div>}</section></main>;
}

