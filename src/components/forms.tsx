"use client";
import { useState, useId, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { engineering as engineeringContent } from "@/content/engineering";
import type { Division } from "@/lib/site";
import { usePathname, useSearchParams } from "next/navigation";
export function EnquiryForm({ division }: { division: Division }) {
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const query = useSearchParams();
  const score = query.get("assessment");
  const sector = query.get("sector");
  const context =
    score && /^\d{1,3}$/.test(score) && Number(score) <= 100
      ? `Indicative maturity assessment: ${score}/100 (self-reported).`
      : sector
        ? `Sector: ${sector.slice(0, 160)}`
        : "";
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    setStatus("sending");
    try {
      const data = Object.fromEntries(new FormData(form));
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          division,
          consent: data.consent === "on",
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Your message could not be sent.");
      setStatus("success");
      setMessage(
        "Thank you. Your enquiry has been sent to info@dreniak.com, for the attention of Darren Kamunuga.",
      );
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to send. Please email info@dreniak.com.",
      );
    }
  }
  return (
    <form className="enquiry-form" onSubmit={submit}>
      {context && (
        <label>
          Conversation context
          <input name="context" value={context} readOnly />
          <span className="fine-print">
            This context will be included with your enquiry.
          </span>
        </label>
      )}
      <div className="form-grid">
        <label>
          Your name{" "}
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={120}
            placeholder="Full name"
          />
        </label>
        <label>
          Email address{" "}
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="you@organisation.com"
          />
        </label>
      </div>
      <label>
        Organisation{" "}
        <input
          name="organisation"
          autoComplete="organization"
          maxLength={160}
          placeholder="Organisation or institution"
        />
      </label>
      <label>
        What would you like to discuss?
        <select name="interest" defaultValue="">
          <option value="" disabled>
            Select an area of interest
          </option>
          {(division === "engineering"
            ? engineeringContent.services.map((service) => service.name)
            : [
                "Asset intelligence & strategy",
                "Lifecycle engineering",
                "Capital planning & investment",
                "Digital asset management",
                "Risk & resilience",
                "Infrastructure & economic strategy",
              ]
          ).map((x) => (
            <option key={x}>{x}</option>
          ))}
          <option>Something else</option>
        </select>
      </label>
      <label>
        {division === "engineering"
          ? "Tell us about your project, site or engineering challenge"
          : "Tell us about your assets, portfolio or infrastructure challenge"}
        <textarea
          name="message"
          rows={5}
          minLength={20}
          maxLength={5000}
          required
          placeholder="Describe what you would like to discuss…"
        />
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="consent">
        <input type="checkbox" name="consent" required />
        <span>
          I agree to Dreniak using these details to respond to my enquiry.{" "}
          <Link href="/privacy">Privacy information</Link>
        </span>
      </label>
      <button className="button" disabled={status === "sending"}>
        {status === "sending" ? (
          <>
            Sending <LoaderCircle className="spin" size={18} />
          </>
        ) : (
          <>
            {division === "engineering"
              ? "Request a consultation"
              : "Send your enquiry"}{" "}
            <ArrowUpRight size={18} />
          </>
        )}
      </button>
      <div role="status" aria-live="polite" className={`form-status ${status}`}>
        {message}
      </div>
      {status === "error" && (
        <a
          className="text-link"
          href="mailto:info@dreniak.com?subject=For%20Darren%20Kamunuga%20%E2%80%94%20Website%20enquiry"
        >
          Email Darren directly <ArrowUpRight size={16} />
        </a>
      )}
    </form>
  );
}
export function Newsletter() {
  const emailId = useId();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    setBusy(true);
    setStatus("");
    try {
      const values = Object.fromEntries(new FormData(form));
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, consent: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus("Thank you. Your newsletter signup has been received.");
      form.reset();
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Signup could not be saved. Please try again later.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="newsletter" onSubmit={submit}>
      <label htmlFor={emailId}>The Dreniak newsletter.</label>
      <p>Read about infrastructure and the value it creates over time.</p>
      <div className="newsletter-input">
        <input
          id={emailId}
          name="email"
          type="email"
          required
          maxLength={254}
          placeholder="Your email address"
          autoComplete="email"
          aria-describedby={`${emailId}-consent`}
        />
        <button disabled={busy} aria-label="Subscribe to newsletter">
          {busy ? (
            <LoaderCircle className="spin" size={20} />
          ) : (
            <ArrowRight size={20} />
          )}
        </button>
      </div>
      <input
        className="honeypot"
        name="website"
        aria-label="Leave empty"
        tabIndex={-1}
        autoComplete="off"
      />
      <p id={`${emailId}-consent`} className="fine-print">
        By subscribing, you agree to receive our newsletter. Unsubscribe by
        emailing us. <Link href="/privacy">Privacy</Link>
      </p>
      <p role="status" className="fine-print">
        {status}
      </p>
    </form>
  );
}
export function AnalyticsConsent() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const id = process.env.NEXT_PUBLIC_GA_ID;
  function choose(value: boolean) {
    localStorage.setItem("dreniak-analytics", value ? "accepted" : "declined");
    setAllowed(value);
    setShow(false);
  }
  return (id || process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === "true") && !pathname.startsWith("/admin") ? (
    <ConsentLoader
      id={id || ""}
      show={show}
      allowed={allowed}
      setShow={setShow}
      setAllowed={setAllowed}
      choose={choose}
    />
  ) : null;
}
import { useEffect } from "react";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
function ConsentLoader({
  id,
  show,
  allowed,
  setShow,
  setAllowed,
  choose,
}: {
  id: string;
  show: boolean;
  allowed: boolean;
  setShow: (v: boolean) => void;
  setAllowed: (v: boolean) => void;
  choose: (v: boolean) => void;
}) {
  useEffect(() => {
    const value = localStorage.getItem("dreniak-analytics");
    setShow(!value);
    setAllowed(value === "accepted");
  }, [setShow, setAllowed]);
  return (
    <>
      {show && (
        <aside className="cookie-notice" aria-label="Analytics preferences">
          <p>
            May we use analytics to understand how this site is used?{" "}
            <Link href="/privacy">Learn more</Link>
          </p>
          <button onClick={() => choose(false)}>Decline</button>
          <button onClick={() => choose(true)}>
            Allow <Check size={14} />
          </button>
        </aside>
      )}
      {allowed && process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === "true" && <Analytics />}
      {allowed && id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`}
            strategy="afterInteractive"
          />
          <Script
            id="dreniak-ga"
            strategy="afterInteractive"
          >{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(id)},{anonymize_ip:true});`}</Script>
        </>
      )}
    </>
  );
}
export function ResetConsent() {
  return (
    <button
      className="text-button"
      onClick={() => {
        localStorage.removeItem("dreniak-analytics");
        location.reload();
      }}
    >
      Change analytics preference <ArrowRight size={16} />
    </button>
  );
}
