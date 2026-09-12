import Link from "next/link";
import { logout } from "./actions";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

const links = [
  ["Dashboard", "/admin"], ["Homepage Content", "/admin/homepage_content"], ["Company & Founder", "/admin/company_profile"],
  ["Services", "/admin/services"], ["Sectors", "/admin/sectors"], ["Values", "/admin/company_values"],
  ["Job Openings", "/admin/job_openings"], ["Insights", "/admin/insights"], ["Testimonials", "/admin/testimonials"],
  ["Media Library", "/admin/media"], ["Social Links", "/admin/social_links"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return <div className="admin-shell"><aside><span className="eyebrow">DRENIAK CMS</span><nav>{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav><form action={logout}><button type="submit">Log out</button></form></aside><section className="admin-content">{children}</section></div>;
}
