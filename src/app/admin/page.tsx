import Link from "next/link";

export default function AdminDashboard() {
  return <main><span className="eyebrow">ADMINISTRATION</span><h1>Content dashboard</h1><p className="admin-lead">Manage the content that powers Dreniak across both disciplines.</p><div className="admin-dashboard-links"><Link href="/admin/company_profile">Company profile</Link><Link href="/admin/services">Services</Link><Link href="/admin/insights">Insights</Link><Link href="/admin/media">Media library</Link></div></main>;
}
