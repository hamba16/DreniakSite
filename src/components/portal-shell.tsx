"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./portal-shell.module.css";

const commonLinks = [
  ["/portal/dashboard", "Overview"],
  ["/portal/engagements", "Engagements"],
  ["/portal/documents", "Documents"],
  ["/portal/messages", "Messages"],
  ["/portal/invoices", "Invoices"],
] as const;

export function PortalShell({
  name,
  divisions,
  staff,
  children,
}: {
  name: string;
  divisions: string[];
  staff: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  async function signOut() {
    await fetch("/api/portal/sign-out", { method: "POST" });
    router.replace("/portal");
    router.refresh();
  }
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Link href="/portal/dashboard" className={styles.brand} aria-label="Dreniak portal home">
          <span>DRENIAK</span><small>CLIENT PORTAL</small>
        </Link>
        <div className={styles.account}>
          <span>{name}</span>
          <button type="button" onClick={signOut}>Sign out</button>
        </div>
      </header>
      <nav className={styles.nav} aria-label="Portal navigation">
        {commonLinks.map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}
        {divisions.includes("engineering") && <Link href="/portal/engineering" aria-current={pathname.startsWith("/portal/engineering") ? "page" : undefined}>Engineering</Link>}
        {divisions.includes("asset-management") && <Link href="/portal/asset-management" aria-current={pathname.startsWith("/portal/asset-management") ? "page" : undefined}>Asset Management</Link>}
        <Link href="/portal/settings" aria-current={pathname === "/portal/settings" ? "page" : undefined}>Settings</Link>
        {staff && <Link href="/portal/admin" aria-current={pathname.startsWith("/portal/admin") ? "page" : undefined}>Staff console</Link>}
      </nav>
      <div className={styles.content}>{children}</div>
      <footer className={styles.footer}><span>Private workspace · Not indexed or tracked</span><Link href="/privacy">Privacy information</Link></footer>
    </div>
  );
}
