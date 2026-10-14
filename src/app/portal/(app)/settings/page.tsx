import Link from "next/link";
import { portalClient } from "@/lib/portal/supabase";
import { PrivacyRequestForm } from "@/components/portal-actions";
import styles from "@/components/portal-page.module.css";
export const metadata = { robots: { index: false, follow: false } };
export default async function SettingsPage() {
  const supabase = await portalClient();
  if (!supabase) return <p className={styles.error}>Settings are unavailable.</p>;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return <p className={styles.error}>Please sign in again.</p>;
  const [profile, preferences, requests, memberships] = await Promise.all([
    supabase.from("portal_profiles").select("full_name, job_title, phone_e164, timezone, currency").eq("user_id", auth.user.id).maybeSingle(),
    supabase.from("notification_preferences").select("email_enabled, whatsapp_enabled, event_types").eq("user_id", auth.user.id).maybeSingle(),
    supabase.from("privacy_requests").select("id, request_type, status, created_at").eq("user_id", auth.user.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("organisation_members").select("organisation_id").eq("user_id", auth.user.id).limit(1),
  ]);
  if (profile.error || preferences.error || requests.error || memberships.error) return <p className={styles.error}>Settings are temporarily unavailable.</p>;
  return <main className={styles.page}><header className={styles.heading}><div><span className="eyebrow">ACCOUNT</span><h1>Settings and privacy.</h1></div></header><section className={styles.card}><h2>Profile</h2><p>{profile.data?.full_name || auth.user.email}</p><p>{profile.data?.job_title || "Role not supplied"} · {profile.data?.phone_e164 || "Phone not supplied"}</p><p>Region: {profile.data?.timezone || "Not set"} · Currency: {profile.data?.currency || "Not set"}</p><p>Signed-in email: {auth.user.email}</p></section><section className={styles.card}><h2>Notifications</h2><p>{preferences.data?.email_enabled ? "Email enabled" : "Email disabled"} · {preferences.data?.whatsapp_enabled ? "WhatsApp enabled with recorded consent" : "WhatsApp disabled"}</p><p>Selected events: {preferences.data?.event_types?.join(", ") || "No event notifications selected"}</p><p>To change notification or contact details, contact <a href="mailto:info@dreniak.com">info@dreniak.com</a> while self-service editing is being completed.</p></section><section className={styles.card}><h2>Privacy requests</h2><p>Download an account data copy or submit a deletion request. A person at Dreniak must review and complete deletion requests.</p><PrivacyRequestForm organisationId={memberships.data?.[0]?.organisation_id}/>{requests.data?.map((request) => <p key={request.id}>{request.request_type.replace("_", " ")} · {request.status} · {new Date(request.created_at).toLocaleDateString("en-GB")}</p>)}</section><section className={styles.card}><h2>Security</h2><p>Email sign-in uses a one-time Supabase Auth link. Dreniak staff must enrol and verify an authenticator; client MFA is available through Supabase but is not required.</p><p><Link href="/privacy">Read privacy information</Link></p></section></main>;
}

