"use client";
import { useState, type FormEvent } from "react";

export function PortalSignIn({
  configured,
  status,
}: {
  configured: boolean;
  status?: string;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/portal/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: new FormData(event.currentTarget).get("email") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Sign-in is unavailable.");
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign-in is unavailable.");
    } finally {
      setBusy(false);
    }
  }

  const statusText: Record<string, string> = {
    "link-expired": "That sign-in link has expired. Request a new one.",
    "invite-invalid": "This invitation is expired or unavailable. Contact Dreniak for help.",
    access: "This account does not have active portal access. Contact Dreniak for help.",
    unavailable: "Sign-in is temporarily unavailable. Please try again later.",
  };
  return (
    <div className="portal-layout">
      <div>
        <span className="eyebrow">DRENIAK CLIENT PORTAL</span>
        <h1>Work, in view.</h1>
        <p>Sign in to view your Dreniak engagements, documents and updates.</p>
        <section className="portal-card" aria-labelledby="portal-sign-in-heading">
          <h2 id="portal-sign-in-heading">Sign in securely</h2>
          {configured ? (
            <form onSubmit={submit}>
              <label>
                Email address
                <input name="email" type="email" autoComplete="email" required maxLength={254} />
              </label>
              <button className="button" type="submit" disabled={busy}>
                {busy ? "Sending link…" : "Email me a sign-in link"}
              </button>
            </form>
          ) : (
            <p role="status">Portal sign-in is not configured yet. Contact Dreniak to request access.</p>
          )}
          {!configured && statusText[status || ""] ? null : status && statusText[status] ? (
            <p role="status">{statusText[status]}</p>
          ) : null}
          {message && <p role="status">{message}</p>}
          <p className="fine-print">
            Access is invitation-only. If you need help, email{" "}
            <a href="mailto:info@dreniak.com">info@dreniak.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
