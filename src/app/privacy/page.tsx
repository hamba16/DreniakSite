import { Header } from "@/components/interactions";
import { Footer } from "@/components/shared";
import { ResetConsent } from "@/components/forms";
export const metadata = {
  title: "Privacy information",
  alternates: { canonical: "/privacy" },
};
export default function Privacy() {
  return (
    <>
      <Header />
      <main id="main" className="privacy page-container">
        <span className="eyebrow">DRENIAK LIMITED</span>
        <h1>Privacy information.</h1>
        <p>
          When you contact Dreniak, we use the details you provide to respond to
          your enquiry. Enquiries are directed to info@dreniak.com for the
          attention of Darren Kamunuga.
        </p>
        <h2>Information you choose to share</h2>
        <p>
          The enquiry form collects your name, email address, organisation, area
          of interest and message. Newsletter signup collects your email address
          and records your consent to receive updates. Please do not include
          confidential asset records or sensitive personal information in these
          public forms.
        </p>
        <h2>Your choices</h2>
        <p>
          You can request access to or deletion of the information you have
          supplied, or unsubscribe from the newsletter, by emailing{" "}
          <a href="mailto:info@dreniak.com">info@dreniak.com</a>.
        </p>
        <h2>Analytics and browser storage</h2>
        <p>
          If analytics is enabled, it loads only after you choose to allow it.
          Your preference is stored in this browser. The maturity assessment
          runs in your browser; its answers are not sent to Dreniak.
        </p>
        <ResetConsent />
        <h2>Third-party links</h2>
        <p>
          Phone, email and WhatsApp links open their respective applications or
          services. Their own privacy terms apply when you use them.
        </p>
        <h2>Questions</h2>
        <p>
          Contact Dreniak Limited at{" "}
          <a href="mailto:info@dreniak.com">info@dreniak.com</a> with any
          questions about your information.
        </p>
      </main>
      <Footer />
    </>
  );
}
