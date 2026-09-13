"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authRequest } from "../login-form";

export function AuthenticatorList({ factors, currentId }: { factors: { id: string; label: string }[]; currentId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function revoke(id: string, label: string) {
    if (!window.confirm(`Revoke ${label}? Its codes and sessions will stop working, and public registration will reopen.`)) return;
    setBusy(true); setMessage("");
    try {
      const result = await authRequest("revoke", { id });
      // Clear previously authenticated UI from the router cache.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      if (result.signedOut) window.location.assign("/admin");
      else { setMessage("Authenticator revoked."); router.refresh(); }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Revocation failed."); }
    finally { setBusy(false); }
  }
  return <><div className="admin-records">{factors.map((factor) => <article key={factor.id}><strong>{factor.label}{factor.id === currentId ? " (this session)" : ""}</strong><button disabled={busy || factors.length <= 1} onClick={() => revoke(factor.id, factor.label)}>Revoke</button></article>)}</div>{factors.length === 1 && <p>The last authenticator cannot be revoked. Register a replacement first.</p>}{message && <p role="status">{message}</p>}</>;
}
