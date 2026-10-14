# Dreniak

A shared brand home and two complete division experiences, built from `doc/DRENIAK_SITE_BUILD_BRIEF.md` and the supplied brand artwork.

## Run locally

```sh
npm ci
npm run dev
```

Visit http://localhost:3000. For the production version:

```sh
npm run build
npm start
```

Node 20.9+ is required by Next.js; this build was developed with Node 24.13.0. The stack uses Next.js App Router, React, TypeScript, Tailwind CSS, Motion, and self-hosted Inter. Installation follows the [official Next.js installation guide](https://nextjs.org/docs/app/getting-started/installation).

## What is implemented

- Parent homepage: original vector logo, animated trace, grain, editorial premise, responsive division gateway and a logo-shaped transition under 900 ms. Reduced-motion preferences bypass the transition.
- Both divisions: Home, About, Approach, Services, Sectors, Projects, Insights, Contact, and Standards. Navigation provides a route home and across divisions.
- Asset Management: accessible six-stage capability tabs, complete six-pillar service accordions, eight sectors in two tiers, ISO framework treatment, founder story and values, leadership placeholder and UK / East Africa footprint.
- Engineering: confirmed company overview, mission, vision and values; four services; Construction Engineering as the featured sector with five supporting areas; Careers and a dedicated consultation page. ERB is retained alongside URSB, URA and trading-license registrations. Draft service copy is identified in the content layer.
- Six-question maturity assessment with transparent indicative scoring, answer review, restart and context passed into an enquiry.
- Contact: client and server validation, consent, honeypot, request size/origin checks, throttling, SMTP delivery adapter, explicit unavailable/error states and email fallback.
- Newsletter: validated capture with Supabase as the subscriber system of record and Buttondown as the delivery provider. Legacy authenticated webhook and persistent filesystem adapters remain available explicitly for migration or local use.
- Client portal: invitation-only Supabase Auth magic links, resumable five-step onboarding, staff TOTP gate, organisation and confirmed-division RLS, engagement dashboard, client vault with short-lived private downloads and acknowledgements, messages/requests, issued invoice views, privacy export/deletion requests, engineering records, asset/capital register views, and an administrator console for organisations, invitations, division approval and engagements.
- SEO: route metadata, canonical URLs, social images for all three brands, sitemap, robots, favicon and Apple icon.
- Optional GA4 behind visitor consent; privacy and preference reset surface.

## Content and artwork

`doc/` holds the source documents, build brief, implementation handoff, and review previews. `doc/archive/` preserves the original website snapshot. `assets/brand/` and `assets/images/` hold original supplied logos and the banner; production website assets live in `public/`.

`src/content/brief.json` preserves the supplied Asset Management story, values, mission, vision, services and sectors verbatim. `src/content/engineering.ts` holds the Engineering questionnaire content, service descriptions marked as drafted/pending client refinement, categories, SEO keywords and approved job-opening collection. Tests verify supplied copy against the respective briefs. `src/lib/site.ts` contains division routes and typed Insights/testimonial collections. No client projects, outcomes or testimonials are invented.

`public/brand` contains the exact mark extracted from the PDF, outlined logo wordmark/tagline, and four mirrored motif variants. The website body uses **Inter as the brief-permitted substitute for Sweet Sans Pro**, pending licensing/approval. The approved logo artwork retains its original typography.

`public/images` contains two locally bundled, AI-generated conceptual infrastructure images with red and indigo duotone treatment. They do not depict Dreniak projects. No source documents or original supplied images were modified.

`scripts/prepare_assets.py` documents content/vector extraction. Python with PyMuPDF and Pillow is only needed to rerun this asset preparation, not to build or operate the site. Generated photographic sources remain in the originating Codex image folder; the production files are already bundled locally.

## Email and newsletter setup

Copy `.env.example` to `.env.local` and fill values locally; never commit secrets. Set the canonical URL to the actual preview origin when testing a preview. `SMTP_*` settings are server-only; the recipient is fixed to `info@dreniak.com`, attention Darren Kamunuga. The submitter is used only for Reply-To. SMTP 587 requires STARTTLS; 465 uses TLS directly. Delivery is reported only after SMTP accepts the recipient. This does not prove inbox placement.

In production, Buttondown is the default provider:

1. `BUTTONDOWN_API_KEY`: server-only Buttondown API token.
2. `BUTTONDOWN_API_BASE_URL=https://api.buttondown.email/v1`: Buttondown API base URL.

Each signup is inserted into Supabase's `newsletter_subscribers` table before Buttondown is called. Duplicate capture preserves existing unsubscribe status and original consent evidence. A Buttondown outage is logged and returned as a successful capture because Supabase is authoritative. Run `npx tsx scripts/reconcile-newsletter.ts` for a read-only dry-run, then schedule that command with `--apply` on the selected host to retry provider sync. It paginates stored active captures and reports counts without printing subscriber emails. Buttondown collision behavior `add` handles duplicates without forcing suppressed subscribers active.

The legacy adapters remain available by setting `NEWSLETTER_PROVIDER` explicitly:

1. `NEWSLETTER_PROVIDER=webhook` with `NEWSLETTER_WEBHOOK_URL` and `NEWSLETTER_WEBHOOK_TOKEN`: an Hamba-controlled HTTPS endpoint that commits the JSON record to durable storage before returning a success status.
2. `NEWSLETTER_PROVIDER=filesystem` with `NEWSLETTER_DATA_DIR`: an absolute directory on a persistent, access-controlled server volume. Do not set this to ephemeral serverless storage. Each record is JSONL with email, consent, consent version, timestamp and source.

Without Buttondown credentials, the signup endpoint fails explicitly and the UI never claims a successful signup. Contact enquiries are not silently written to local files.

Buttondown manages unsubscribe links in sent emails. Register `/api/webhooks/buttondown` for `subscriber.unsubscribed` and set the same `BUTTONDOWN_WEBHOOK_SIGNING_KEY` on the server and webhook. The receiver verifies the raw-body signature, retrieves current subscriber state, and updates Supabase idempotently. Failed lookups/writes return 503 for retry. Verify an actual provider delivery after deployment. See `doc/EMAIL_AND_NEWSLETTER_OPERATIONS.md`.

`RATE_LIMIT_STORE=memory` is bounded per-process throttling. Use `RATE_LIMIT_STORE=supabase` after applying all migrations for distributed, atomic five-attempt/ten-minute windows on any hosting platform. Configured-store errors fail closed with 503. Enable `TRUST_PROXY` only where the host overwrites forwarded client IP headers; Vercel uses its dedicated header automatically.

## Verification

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
# Start the production server in another terminal before this command:
npm run test:e2e
```

The browser suite covers desktop and mobile routing, image errors, overflow, division navigation, keyboard tabs, services, assessment, contact failure feedback, automated accessibility checks, metadata endpoints and missing routes. It expects no live SMTP settings. Unit/integration tests exercise exact content, validation, intake limits and actual newsletter persistence. Test records are ignored under `.data/verification/`.

## Client portal setup and current scope

The portal migration is `src/supabase/migrations/20261014144728_client_portal_foundation.sql`.
Apply it to a staging Supabase project before using `/portal`. Configure
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and the
server-only `SUPABASE_SERVICE_ROLE_KEY`. Keep the service role key out of every
browser bundle and public environment variable.

In Supabase Auth, configure SMTP and add the exact site, preview and local
`/auth/callback` URLs to the redirect allowlist. The checked-in local Auth
configuration enables email sign-in, seven-day single-use links, and TOTP. The
seven-day Auth link expiry matches the database invitation expiry; shorten the
Auth OTP lifetime if operational policy requires a shorter link window, and
keep the invitation database expiry consistent. Public signup is disabled by
the portal sign-in API; staff invitations create the initial Auth identity.

Bootstrap the first Dreniak administrator only through the trusted Supabase
SQL editor after confirming that the Auth user belongs to Dreniak:

```sql
insert into public.portal_staff (user_id, role, active)
select id, 'dreniak_admin', true
from auth.users
where lower(email) = lower('approved-admin@example.com')
  and email_confirmed_at is not null;
```

The administrator must enrol and verify TOTP before using staff APIs. The
staff console can create organisations, confirm service divisions, invite
client admins/members, review requested categories, and create engagements.
Client service access comes only from confirmed organisation divisions.

Implemented client modules are read-first: engagement updates, vault listing,
download/acknowledgement, conversations and requests, issued invoice details
and staff-recorded payments, engineering supervision/contracts/quality, asset
register/capital plan/maturity scoring, and account privacy export/deletion
requests. Invoice PDF generation, client payment collection, editable asset
imports/interventions, notification delivery workers, full staff document and
invoice authoring, and an audit-log viewer are not implemented in this phase.
The notification outbox records the delivery boundary; WhatsApp has no provider
integration and no portal notification sender is enabled. No payment gateway is
configured.

The portal privacy copy is a draft. Confirm controller/processor terms,
cross-border processing, legal basis, retention periods, backups, incident
response, and UK/Uganda privacy requirements with legal and operations before
inviting real client users. Malware scanning is not included. Do not upload
sensitive personal data or unapproved records.

## Before public launch

- Confirm red / indigo division assignment, Inter substitution, and preferred office-hours timezone (implemented as East Africa Time).
- Add Buttondown credentials, apply all migrations, register the signed unsubscribe webhook and schedule reconciliation. Verify a subscriber and unsubscribe through both systems after deployment.
- Supply approved Engineering leadership biographies/portraits, real case studies, the named Insights owner and initial articles. Refine the drafted service descriptions when client copy is available.
- Instagram and Facebook use the supplied `@dreniak_limited` handle, published at the user's direction. LinkedIn remains omitted because no account URL was supplied.
- Confirm privacy/retention details against the final hosting and delivery services.
- Configure `NEXT_PUBLIC_GA_ID` and/or `NEXT_PUBLIC_VERCEL_ANALYTICS=true` only for selected analytics services; both require visitor consent. Test acceptance, rejection and withdrawal in the deployed configuration.
- Apply and verify the portal migration in staging, configure Auth SMTP/templates and allowed redirects, bootstrap staff, enrol staff MFA, and exercise invitation expiry/revocation, organisation isolation, confirmed-division access and private Storage with representative test users.
- Deploy to an approved staging host for stakeholder review. Registrar/DNS changes and Microsoft 365 mail records remain a deployment handoff; preserve existing email configuration.

See `doc/IMPLEMENTATION_HANDOFF.md` for the final verification evidence and launch status.

See `doc/REFINEMENT_HANDOFF.md` for the Engineering update and icon-refinement implementation, agreed exceptions and local verification results.
