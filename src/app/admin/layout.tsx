import Link from "next/link";
import { logout } from "./actions";
import { adminSession, authRpc } from "@/lib/admin-auth/server";
import { AdminLogin } from "./login-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false, follow: false } };

const links = [
  ["Dashboard", "/admin"], ["Homepage Content", "/admin/homepage_content"], ["Company & Founder", "/admin/company_profile"],
  ["Services", "/admin/services"], ["Sectors", "/admin/sectors"], ["Values", "/admin/company_values"],
  ["Job Openings", "/admin/job_openings"], ["Insights", "/admin/insights"], ["Testimonials", "/admin/testimonials"],
  ["Media Library", "/admin/media"], ["Social Links", "/admin/social_links"], ["Authenticators", "/admin/authenticators"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let user;
  let count = 3;
  try {
    user = await adminSession();
    if (!user) count = (await authRpc<{ count: number }>("status")).count;
  } catch {
    return <main className="admin-login"><div className="admin-card"><h1>Admin access</h1><p role="alert">Admin authentication is temporarily unavailable. Please try again later.</p></div></main>;
  }
  if (!user) return <AdminLogin enrollmentOpen={count < 3} />;
  return <div className="admin-shell"><aside><span className="eyebrow">DRENIAK CMS</span><nav>{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav><form action={logout}><button type="submit">Log out</button></form></aside><section className="admin-content">{children}</section></div>;
}
