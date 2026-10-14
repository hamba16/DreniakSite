import Link from "next/link";
import { portalClient } from "@/lib/portal/supabase";
import styles from "@/components/portal-page.module.css";

export const metadata = { title: "Engagements — Client Portal", robots: { index: false, follow: false } };

export default async function EngagementsPage() {
  const supabase = await portalClient();
  if (!supabase) return <p className={styles.error}>Engagements are unavailable.</p>;
  const { data, error } = await supabase.from("engagements")
    .select("id, name, division, stage, status_text, start_date, target_date")
    .order("updated_at", { ascending: false });
  if (error) return <p className={styles.error} role="status">Engagements are temporarily unavailable.</p>;
  return <main className={styles.page}>
    <header className={styles.heading}><div><span className="eyebrow">CLIENT WORKSPACE</span><h1>Engagements.</h1><p className={styles.muted}>Your active and completed work with Dreniak.</p></div></header>
    {!data?.length ? <p className={styles.empty}>No client-visible engagements are available yet.</p> : <div className={styles.list}>{data.map((item) => <Link key={item.id} className={styles.row} href={`/portal/engagements/${item.id}`}><span>{item.name}<small>{item.division === "asset-management" ? "Asset Management" : "Engineering"} · {item.start_date || "Start date not set"}</small></span><span className={styles.badge}>{item.stage}</span></Link>)}</div>}
  </main>;
}
