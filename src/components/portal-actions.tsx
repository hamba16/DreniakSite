"use client";
import { useState } from "react";

export function PrivacyRequestForm({ organisationId }: { organisationId?: string }) {
  const [status, setStatus] = useState("");
  async function submit(requestType: "data_export" | "deletion") {
    setStatus("Submitting requestâ€¦");
    try {
      const response = await fetch("/api/portal/privacy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestType, organisationId }) });
      const result = await response.json();
      setStatus(response.ok ? `Request recorded (${result.request.status}). Dreniak will review it and respond through the portal.` : result.error || "The request could not be submitted.");
    } catch { setStatus("The request could not be submitted. Try again later."); }
  }
  return <div><button type="button" onClick={() => submit("data_export")}>Record export request</button> <button type="button" onClick={() => submit("deletion")}>Request account deletion</button> <button type="button" onClick={() => { window.location.assign(new URL("/api/portal/privacy/export", window.location.origin).toString()); }}>Download my account data</button><p role="status" aria-live="polite">{status}</p></div>;
}

export function PortalMessageForm({ engagements }: { engagements: Array<{ id: string; name: string }> }) {
  const [status, setStatus] = useState("");
  async function submit(form: FormData) {
    setStatus("Sendingâ€¦");
    try {
      const response = await fetch("/api/portal/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: form.get("action"), engagementId: form.get("engagementId"), subject: form.get("subject"), body: form.get("body"), requestType: form.get("requestType") }) });
      const data = await response.json();
      setStatus(response.ok ? "Saved. Refresh the page to see your message." : data.error || "Message could not be sent.");
    } catch { setStatus("Message could not be sent. Try again later."); }
  }
  if (!engagements.length) return <p>No engagement is available for messaging.</p>;
  return <form action={submit}><h2>Start a conversation or request</h2><label>Engagement <select name="engagementId">{engagements.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Type <select name="action"><option value="new_thread">Message</option><option value="request">Service request</option></select></label><label>Request category <select name="requestType"><option value="general">General</option><option value="information">Information</option><option value="site_visit">Site visit</option><option value="variation_query">Variation query</option></select></label><label>Subject <input name="subject" maxLength={200}/></label><label>Message <textarea name="body" required minLength={1} maxLength={10000} rows={5}/></label><button type="submit">Send securely</button><p role="status" aria-live="polite">{status}</p></form>;
}

export function PortalAcknowledgeButton({ versionId }: { versionId: string }) {
  const [status, setStatus] = useState("");
  async function acknowledge() {
    setStatus("Savingâ€¦");
    try {
      const response = await fetch("/api/portal/documents/acknowledge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ versionId }) });
      const data = await response.json();
      setStatus(response.ok ? data.alreadyAcknowledged ? "Already acknowledged" : "Acknowledged" : data.error || "Could not save acknowledgement.");
    } catch { setStatus("Could not save acknowledgement."); }
  }
  return <span><button type="button" onClick={acknowledge}>Acknowledge</button> <span role="status">{status}</span></span>;
}

export function PaymentReferenceForm({ invoiceId }: { invoiceId: string }) {
  const [status, setStatus] = useState("");
  async function submit(form: FormData) {
    setStatus("Saving…");
    try {
      const response = await fetch("/api/portal/invoices/reference", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invoiceId, reference: form.get("reference"), note: form.get("note") }) });
      const data = await response.json();
      setStatus(response.ok ? "Reference sent to Dreniak for reconciliation." : data.error || "Reference could not be saved.");
    } catch { setStatus("Reference could not be saved. Try again later."); }
  }
  return <form action={submit}><h3>Send a payment reference</h3><label>Bank or transfer reference <input name="reference" maxLength={200} required/></label><label>Note (optional) <textarea name="note" rows={2} maxLength={1000}/></label><button type="submit">Send reference</button><p role="status" aria-live="polite">{status}</p></form>;
}


