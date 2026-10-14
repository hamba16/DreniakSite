"use client";
import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Factor = { id: string; friendlyName: string };
type Enrollment = { factorId: string; qrCode: string; secret: string; uri: string };

export function PortalMfaGate() {
  const router = useRouter();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [factorId, setFactorId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/portal/mfa/enroll")
      .then((response) => response.json())
      .then((result) => {
        const available = (result.factors || []) as Factor[];
        setFactors(available);
        if (available[0]) setFactorId(available[0].id);
      })
      .catch(() => setError("Authenticator status is unavailable."));
  }, []);

  async function enroll() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/portal/mfa/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Authenticator setup is unavailable.");
      setEnrollment(result as Enrollment);
      setFactorId(result.factorId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authenticator setup is unavailable.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!factorId || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/portal/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ factorId, code }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The code could not be verified.");
      router.refresh();
      router.push("/portal/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The code could not be verified.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main" className="portal-layout">
      <div>
        <span className="eyebrow">DRENIAK STAFF ACCESS</span>
        <h1>Set up your authenticator.</h1>
        <section className="portal-card" aria-labelledby="portal-mfa-heading">
          <h2 id="portal-mfa-heading">Two-step verification is required</h2>
          {factors.length ? (
            <p>Enter a current code from your registered authenticator.</p>
          ) : enrollment ? (
            <>
              <p>Scan this code with an authenticator app, then enter the six-digit code it shows.</p>
              <Image src={enrollment.qrCode} alt="Authenticator setup QR code" width={220} height={220} unoptimized />
              <p className="fine-print">Manual setup key: <code>{enrollment.secret}</code></p>
            </>
          ) : (
            <>
              <p>Register an authenticator before opening staff records.</p>
              <button className="button" type="button" onClick={enroll} disabled={busy}>Register authenticator</button>
            </>
          )}
          {(factors.length > 0 || enrollment) && (
            <form onSubmit={verify}>
              <label>Six-digit code<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))} /></label>
              <button className="button" type="submit" disabled={busy || code.length !== 6}>{busy ? "Verifying…" : "Verify and continue"}</button>
            </form>
          )}
          {error && <p role="alert">{error}</p>}
        </section>
      </div>
    </main>
  );
}
