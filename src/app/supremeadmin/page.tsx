import Link from "next/link";

export default function AdminDashboard() {
  return <main><span className="eyebrow">ADMINISTRATION</span><h1>Content dashboard</h1><p className="admin-lead">Manage the content that powers Dreniak across both disciplines.</p><div className="admin-dashboard-links"><Link href="/supremeadmin/company_profile">Company profile</Link><Link href="/supremeadmin/services">Services</Link><Link href="/supremeadmin/insights">Insights</Link><Link href="/supremeadmin/partners">Partners</Link><Link href="/supremeadmin/media">Media library</Link></div></main>;
}
