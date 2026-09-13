import { redirect } from "next/navigation";
import { adminSession, authRpc, cookieHash, sessionCookie } from "@/lib/admin-auth/server";
import { AuthenticatorList } from "./list";

export default async function AuthenticatorsPage() {
  const session = await adminSession();
  if (!session) redirect("/admin");
  const factors = await authRpc<{ id: string; label: string }[]>("list", { token: await cookieHash(sessionCookie) });
  return <main id="main"><span className="eyebrow">ADMIN ACCESS</span><h1>Authenticators</h1><p className="admin-lead">{factors.length} of 3 registered. Revoking an authenticator signs out its sessions immediately and opens a place for a replacement.</p><AuthenticatorList factors={factors} currentId={session.id} /></main>;
}
