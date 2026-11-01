import Link from "next/link";
import { logout } from "./actions";
import { adminSession, authRpc } from "@/lib/admin-auth/server";
import { AdminLogin } from "./login-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false, follow: false } };

const links = [
  ["Dashboard", "/supremeadmin"], ["Homepage Content", "/supremeadmin/homepage_content"], ["Company & Founder", "/supremeadmin/company_profile"],
  ["Services", "/supremeadmin/services"], ["Sectors", "/supremeadmin/sectors"], ["Values", "/supremeadmin/company_values"],
  ["Job Openings", "/supremeadmin/job_openings"], ["Insights", "/supremeadmin/insights"], ["Testimonials", "/supremeadmin/testimonials"], ["Partners", "/supremeadmin/partners"],
  ["Media Library", "/supremeadmin/media"], ["Social Links", "/supremeadmin/social_links"], ["Authenticators", "/supremeadmin/authenticators"],
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
