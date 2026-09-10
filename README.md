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
- Engineering: lifecycle capabilities and ERB registration, presented directly without editorial draft labels.
- Six-question maturity assessment with transparent indicative scoring, answer review, restart and context passed into an enquiry.
- Contact: client and server validation, consent, honeypot, request size/origin checks, throttling, SMTP delivery adapter, explicit unavailable/error states and email fallback.
- Newsletter: validated capture, consent timestamp/version, authenticated storage webhook or persistent filesystem adapter. No ESP integration.
- Portal entry: honest Phase 2 surface with no fake credentials or document access.
- SEO: route metadata, canonical URLs, social images for all three brands, sitemap, robots, favicon and Apple icon.
- Optional GA4 behind visitor consent; privacy and preference reset surface.

## Content and artwork

`doc/` holds the source documents, build brief, implementation handoff, and review previews. `doc/archive/` preserves the original website snapshot. `assets/brand/` and `assets/images/` hold original supplied logos and the banner; production website assets live in `public/`.

`src/content/brief.json` preserves the supplied story, values, mission, vision, services and sectors verbatim. Tests verify each against the original brief. `src/lib/site.ts` contains Engineering interim content and typed Insights/testimonial collections. No client projects, outcomes or testimonials are invented.

`public/brand` contains the exact mark extracted from the PDF, outlined logo wordmark/tagline, and four mirrored motif variants. The website body uses **Inter as the brief-permitted substitute for Sweet Sans Pro**, pending licensing/approval. The approved logo artwork retains its original typography.

`public/images` contains two locally bundled, AI-generated conceptual infrastructure images with red and indigo duotone treatment. They do not depict Dreniak projects. No source documents or original supplied images were modified.

`scripts/prepare_assets.py` documents content/vector extraction. Python with PyMuPDF and Pillow is only needed to rerun this asset preparation, not to build or operate the site. Generated photographic sources remain in the originating Codex image folder; the production files are already bundled locally.

## Email and newsletter setup

Copy `.env.example` to `.env.local` and fill values locally; never commit secrets. Set the canonical URL to the actual preview origin when testing a preview. `SMTP_*` settings are server-only; the recipient is fixed to `info@dreniak.com`, attention Darren Kamunuga. The submitter is used only for Reply-To. SMTP 587 requires STARTTLS; 465 uses TLS directly. Delivery is reported only after SMTP accepts the recipient. This does not prove inbox placement.

In development, newsletter records go to ignored `.data/newsletter.jsonl`. In production choose one:

1. `NEWSLETTER_WEBHOOK_URL` and `NEWSLETTER_WEBHOOK_TOKEN`: an Hamba-controlled HTTPS endpoint that commits the JSON record to durable storage before returning a success status. Implement deduplication, access controls and unsubscribe/deletion handling there.
2. `NEWSLETTER_DATA_DIR`: an absolute directory on a persistent, access-controlled server volume. Do not set this to ephemeral serverless storage. Each record is JSONL with email, consent, consent version, timestamp and source. Deduplicate normalized email addresses when importing for a newsletter.

Without configuration, both endpoints fail explicitly and the UI never claims a successful send/signup. Contact enquiries are not silently written to local files. No external email or newsletter provider was configured or contacted during the build.

The included rate limit is per running process. Enable `TRUST_PROXY` only where the host overwrites forwarded client IP headers. Multi-instance production hosting should enforce a shared/platform rate limit; the application fallback is deliberately bounded and is not a distributed limiter.

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

## Before public launch

- Confirm red / indigo division assignment, Inter substitution, and preferred office-hours timezone (implemented as East Africa Time).
- Supply and verify email delivery and durable newsletter storage. Test actual receipt with Darren after setup.
- Supply Engineering’s complete questionnaire, leadership credentials/portraits, real case studies and initial Insights content.
- Instagram and Facebook use the supplied `@dreniak_limited` handle, published at the user's direction. LinkedIn remains omitted because no account URL was supplied.
- Confirm privacy/retention details against the final hosting and delivery services.
- Configure `NEXT_PUBLIC_GA_ID` only if GA4 is selected; test consent acceptance, rejection and withdrawal with that configuration.
- Implement authenticated client portal access and document authorization in Phase 2. No auth provider has been chosen or connected.
- Deploy to an approved staging host for stakeholder review. Registrar/DNS changes and Microsoft 365 mail records remain a deployment handoff; preserve existing email configuration.

See `doc/IMPLEMENTATION_HANDOFF.md` for the final verification evidence and launch status.
