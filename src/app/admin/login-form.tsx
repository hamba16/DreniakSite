"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export async function authRequest(action: string, body: object) {
  const response = await fetch(`/api/admin/auth/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Request failed.");
  return result;
}
export function AdminLogin({ enrollmentOpen }: { enrollmentOpen: boolean }) {
  const router = useRouter();
  const [registering, setRegistering] = useState(false);
  const [qr, setQr] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  // Refresh capacity for remote browsers; POST always rechecks transactionally.
  useEffect(() => { const timer = setInterval(() => router.refresh(), 15_000); return () => clearInterval(timer); }, [router]);
  useEffect(() => {
    if (!qr) return;
    const timer = setTimeout(() => { setQr(""); setMessage("Setup expired. Register again to get a new QR code."); }, 600_000);
    return () => clearTimeout(timer);
  }, [qr]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      if (registering && enrollmentOpen) {
        if (!qr) {
          const result = await authRequest("begin", { label: String(data.get("label")) });
          setQr(result.qr);
        } else {
          await authRequest("confirm", { code: String(data.get("code")) });
          setQr(""); setRegistering(false);
          setMessage("Authenticator registered. Wait for the next code, then sign in.");
          form.reset(); router.refresh();
        }
      } else {
        await authRequest("login", { code: String(data.get("code")) });
        // Clear the entire router cache at this authentication boundary.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/admin");
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Request failed."); router.refresh(); }
    finally { setBusy(false); }
  }
  const enrollment = registering && enrollmentOpen;
  return <main id="main" className="admin-login"><form onSubmit={submit} className="admin-card">
    <span className="eyebrow">DRENIAK ADMIN</span>
    <h1>{enrollment ? "Register authenticator" : "Sign in"}</h1>
    {enrollment ? <>
      <p>Register your own authenticator for admin access. Up to three authenticators can be registered.</p>
      {!qr ? <label>Authenticator label<input name="label" required maxLength={60} placeholder="e.g. Alex’s iPhone" autoComplete="off" /></label> : <>
        <p>In Apple Passwords, open the entry for this website, choose Set Up Code, then scan this QR code. Setup expires in ten minutes.</p>
        {/* The private server-generated QR is the necessary provisioning disclosure. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt="Scan to register this authenticator" width={320} height={320} style={{ maxWidth: "100%", height: "auto" }} />
        <CodeInput />
      </>}
    </> : <><p>Enter a current code from any registered authenticator.</p><CodeInput /></>}
    {message && <p role="status" className="admin-error">{message}</p>}
    <button className="button" disabled={busy}>{busy ? "Please wait…" : enrollment ? qr ? "Confirm authenticator" : "Generate QR code" : "Sign in"}</button>
    {enrollmentOpen && <button type="button" disabled={busy} onClick={() => { setRegistering(!registering); setQr(""); setMessage(""); }}>{enrollment ? "Back to sign in" : "Register authenticator"}</button>}
  </form></main>;
}
function CodeInput() {
  return <label>Six-digit code<input name="code" inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} autoComplete="one-time-code" required /></label>;
}
