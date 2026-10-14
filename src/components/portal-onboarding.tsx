"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import styles from "./portal-onboarding.module.css";

const eventOptions = [
  ["new_document", "New document"],
  ["message", "Message"],
  ["milestone_change", "Milestone change"],
  ["invoice_issued", "Invoice issued"],
  ["invoice_overdue", "Invoice overdue"],
  ["supervision_issue", "Supervision issue raised"],
] as const;

type Props = {
  currentStep: number;
  organisationName: string;
  privacyVersion: string;
  profile: { full_name: string; job_title: string; phone_e164: string | null; timezone: string; currency: string };
  categoryRequest: string | null;
  notifications: { email_enabled: boolean; whatsapp_enabled: boolean; event_types: string[] };
};

export function PortalOnboarding({
  currentStep,
  organisationName,
  privacyVersion,
  profile,
  categoryRequest,
  notifications,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(Math.min(5, Math.max(1, currentStep)));
  const [category, setCategory] = useState(categoryRequest || "engineering");
  const [channel, setChannel] = useState(
    notifications.whatsapp_enabled
      ? notifications.email_enabled
        ? "both"
        : "whatsapp"
      : "email",
  );
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (working) return;
    setWorking(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = { step };
    if (step === 1) {
      payload.fullName = form.get("fullName");
      payload.jobTitle = form.get("jobTitle");
      payload.phone = form.get("phone");
    } else if (step === 2) payload.category = category;
    else if (step === 3) {
      payload.channel = channel;
      payload.eventTypes = form.getAll("eventTypes");
      payload.whatsappConsent = form.get("whatsappConsent") === "on";
    } else if (step === 4) {
      payload.timezone = form.get("timezone");
      payload.currency = form.get("currency");
    } else payload.privacyAccepted = form.get("privacyAccepted") === "on";

    try {
      const response = await fetch("/api/portal/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "This step could not be saved.");
      if (result.complete) {
        router.push("/portal/dashboard");
        router.refresh();
      } else setStep(Math.min(5, step + 1));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "This step could not be saved.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <main id="main" className={styles.page}>
      <div className={styles.wrap}>
        <span className="eyebrow">CLIENT PORTAL · {organisationName}</span>
        <h1>Set up your workspace.</h1>
        <p className={styles.intro}>Complete these five short steps. Your progress is saved as you go.</p>
        <ol className={styles.progress} aria-label="Onboarding progress">
          {["Profile", "Category", "Notifications", "Region", "Privacy"].map((label, i) => (
            <li key={label} aria-current={step === i + 1 ? "step" : undefined} data-done={step > i + 1}>
              <span>{i + 1}</span>{label}
            </li>
          ))}
        </ol>
        <form className={styles.card} onSubmit={submit}>
          {step === 1 && (
            <>
              <h2>Your profile</h2>
              <p>These details help your Dreniak team identify the right contact.</p>
              <label>Full name<input name="fullName" required minLength={2} maxLength={160} defaultValue={profile.full_name} autoComplete="name" /></label>
              <label>Job title<input name="jobTitle" required maxLength={160} defaultValue={profile.job_title} autoComplete="organization-title" /></label>
              <label>Phone number<input name="phone" type="tel" required pattern="\+[1-9][0-9]{7,14}" title="Use international format, such as +256704175005" defaultValue={profile.phone_e164 || ""} autoComplete="tel" /><span className={styles.hint}>Use international format, including country code.</span></label>
            </>
          )}
          {step === 2 && (
            <>
              <h2>Choose your workspace</h2>
              <p>Select the area relevant to your work. Dreniak will confirm the access request.</p>
              <div className={styles.choices}>
                <label><input type="radio" name="category" checked={category === "engineering"} onChange={() => setCategory("engineering")} /><span><strong>Engineering</strong><small>Construction and engineering services.</small></span></label>
                <label><input type="radio" name="category" checked={category === "asset-management"} onChange={() => setCategory("asset-management")} /><span><strong>Asset Management</strong><small>{"Understanding what assets you own, their condition, performance, risk and value to enable smarter long-term decisions."}</small></span></label>
                <label><input type="radio" name="category" checked={category === "both"} onChange={() => setCategory("both")} /><span><strong>Both workspaces</strong><small>Request access to Engineering and Asset Management.</small></span></label>
              </div>
              <p className={styles.notice}>Your selection is a request. Division records stay unavailable until Dreniak confirms access.</p>
            </>
          )}
          {step === 3 && (
            <>
              <h2>Notifications</h2>
              <p>Choose where portal updates should be sent.</p>
              <fieldset><legend>Notification channel</legend>
                <label className={styles.radio}><input type="radio" name="channel" checked={channel === "email"} onChange={() => setChannel("email")} />Email</label>
                <label className={styles.radio}><input type="radio" name="channel" checked={channel === "whatsapp"} onChange={() => setChannel("whatsapp")} />WhatsApp</label>
                <label className={styles.radio}><input type="radio" name="channel" checked={channel === "both"} onChange={() => setChannel("both")} />Both</label>
              </fieldset>
              <fieldset><legend>Events</legend>
                <div className={styles.events}>{eventOptions.map(([value, label]) => <label className={styles.radio} key={value}><input type="checkbox" name="eventTypes" value={value} defaultChecked={notifications.event_types.includes(value)} />{label}</label>)}</div>
              </fieldset>
              {channel !== "email" && <label className={styles.consent}><input type="checkbox" name="whatsappConsent" required />I consent to Dreniak contacting me through WhatsApp about the portal events selected above. I can change this preference in Settings.</label>}
            </>
          )}
          {step === 4 && (
            <>
              <h2>Regional preferences</h2>
              <p>Set the time zone and currency used for portal dates and display.</p>
              <label>Time zone<select name="timezone" defaultValue={profile.timezone}><option value="Africa/Kampala">Africa/Kampala</option><option value="Europe/London">Europe/London</option></select></label>
              <label>Display currency<select name="currency" defaultValue={profile.currency}><option value="UGX">UGX</option><option value="GBP">GBP</option><option value="USD">USD</option></select></label>
            </>
          )}
          {step === 5 && (
            <>
              <h2>Privacy and terms</h2>
              <p>Review how portal information is used in the <a href="/privacy" target="_blank" rel="noreferrer">privacy information</a>.</p>
              <p className={styles.notice}>Privacy notice version {privacyVersion}. The portal is excluded from search indexing and analytics.</p>
              <label className={styles.consent}><input type="checkbox" name="privacyAccepted" required />I acknowledge the Dreniak privacy notice for the client portal.</label>
            </>
          )}
          {error && <p className={styles.error} role="alert">{error}</p>}
          <div className={styles.actions}>
            {step > 1 && <button type="button" className="text-button" onClick={() => setStep(step - 1)}>Back</button>}
            <button className="button" type="submit" disabled={working}>{working ? "Saving…" : step === 5 ? "Complete setup" : "Save and continue"}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
