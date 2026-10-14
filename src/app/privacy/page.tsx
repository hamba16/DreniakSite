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
        <h2>Client portal information</h2>
        <p>
          If you use the Dreniak Client Portal, Supabase Auth processes your
          email address and sign-in session. The portal may also store your
          name, role, work phone, organisation and confirmed service access,
          notification choices, privacy acknowledgement, engagement updates,
          messages, service requests, documents you acknowledge, invoices,
          payments recorded by Dreniak, engineering records, asset register
          information and maturity assessment answers. The portal uses this
          information to provide the workspace requested by your organisation.
          Do not upload special category personal information unless Dreniak
          has agreed a lawful and secure basis with you.
        </p>
        <p>
          Portal files are stored in a private Supabase Storage bucket and are
          provided through short-lived authenticated download links. Supabase
          provides portal authentication, database and file storage. Vercel
          hosts the website and may process request and security logs. Email
          sign-in and invitation messages are sent through the configured
          Supabase Auth SMTP provider. The portal does not load Google Analytics
          or Vercel Web Analytics and is excluded from search indexing.
        </p>
        <p>
          Portal records are retained while the organisation needs the service,
          then according to applicable contractual, financial and legal
          retention requirements. A retention schedule and processor terms must
          be confirmed by Dreniak before launch. You can request a copy of your
          portal information or account deletion from Portal Settings, or
          contact <a href="mailto:info@dreniak.com">info@dreniak.com</a>. A
          deletion request is reviewed by Dreniak and may be limited by legal,
          contractual, security or accounting obligations.
        </p>
        <p>
          This portal notice is a draft product disclosure and requires legal
          review, confirmation of the data controller and processors, approved
          retention periods and final contact details before production use.
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
