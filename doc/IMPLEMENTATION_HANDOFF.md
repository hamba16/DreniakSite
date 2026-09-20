# Dreniak implementation handoff

Implemented in `D:\PROBOOK\DreniakSite`.

## Review the site

The production build runs at **http://localhost:3000** while the local server is active. Start it again with `npm start` after `npm run build`, or use `npm run dev` for development.

- Parent experience: `/`
- Division gateway: `/#divisions`
- Engineering: `/engineering`
- Asset Management: `/asset-management`
- Maturity assessment: `/asset-management/assessment`
- Shared story: `/story`
- Phase 2 portal entry: `/portal`

There are **23 implemented page routes**, including the shared story, privacy and portal surfaces. Both divisions have Home, About, Approach, Services, Sectors, Projects, Insights, Contact and Standards. Article-detail architecture is ready for supplied Insights content.

## Implementation decisions

- Original logo curves and outlined wordmark/tagline were extracted from the supplied brand PDF. Original source files remain in place.
- Engineering uses Business Red `#991923`; Asset Management uses Indigo `#0d3251`. Parent branding stays predominantly black and white.
- Inter is bundled and self-hosted as the explicitly permitted body/headline font substitute. Sweet Sans Pro remains in the original outlined logo artwork.
- Two conceptual infrastructure photographs were generated and bundled as optimized WebP assets. They are never presented as completed Dreniak projects.
- Values, story, mission, vision, all six service pillars and eight sectors are preserved verbatim and checked programmatically.
- ISO 55000 is presented as the governing framework, not an invented certification. The Engineering ERB registration is identified only for that division.
- Engineering uses the supplied lifecycle services. Public copy presents the company approach directly, without editorial draft/pending labels. Projects describe the delivery framework; no named completed projects were supplied.
- The maturity tool is functional and self-reported: six equally weighted answers scored 0–3, total divided by 18 and rounded to 100. It is explicitly not an audit or certification. No answers are sent automatically; a score is shared only when a visitor follows the contact link and submits an enquiry.
- Enquiries route through server-only SMTP to `info@dreniak.com`, attention Darren Kamunuga. Without configured delivery, the form reports that it could not send and provides a direct email link.
- Newsletter capture writes to Supabase first and syncs Buttondown for delivery. Missing Buttondown configuration is an explicit unavailable state, while a Buttondown sync failure remains an honest successful capture because Supabase is authoritative. Legacy webhook/filesystem adapters remain behind an explicit provider setting.
- Portal authentication and authenticated document/project views remain Phase 2. No credentials are solicited or fake sign-in provided.
- Instagram and Facebook links use the supplied `@dreniak_limited` handle at the user's direction. LinkedIn has no supplied account URL. GA4 is optional and requires explicit visitor consent before loading.
- Office hours are shown as 08:00–18:00 East Africa Time; confirm this timezone before launch.

## Verification evidence

| Check | Result |
| --- | --- |
| Production build | Pass; no build warnings |
| TypeScript | Pass |
| ESLint | Pass; no warnings |
| Content / validation / persistence tests | 10 passed |
| Complete desktop/mobile browser suite | 38 passed against the production server |
| All 23 page routes, desktop and mobile | HTTP 200, one H1, no detected horizontal overflow, broken rendered images or JavaScript errors |
| Accessibility | No automated WCAG 2 A/AA or WCAG 2.1 A/AA violations detected on 12 audited routes at both tested sizes |
| Division gateway and switching | Pass, desktop and mobile |
| Keyboard capability tabs and service accordion | Pass |
| Assessment scoring, completion and restart | Pass |
| Enquiry unconfigured-delivery state | Pass; no false success |
| Service deep links and assessment context in enquiries | Pass |
| Reduced-motion navigation and newsletter unavailable state | Pass |
| Social cards, sitemap, robots and icons | Valid HTTP responses; social cards are PNG |
| Unknown division pages, invalid division/page combinations and unpublished articles | Correct 404 responses |
| Packaging | No supplied brand PDF, brief, questionnaire or archived-site assets included in the social-card server trace |

The automated report is generated at `playwright-report/index.html`. Tests run against the local production server using Chromium desktop (1440 × 1000) and mobile emulation (390 × 844). The final verification sequence was run with the server stopped for lint, typecheck, unit tests and build, then with a clean `npm run start` process for the browser suite. These are automated and local browser checks, not a formal accessibility certification or physical-device test.

Fourteen review images are saved in `doc/preview`: desktop home, split, both divisions, services, About and assessment; mobile home, Asset Management, contact and assessment; and the three social cards. Recreate them with `node scripts/capture-preview.mjs` while the server is running.

## Launch dependencies

1. Confirm colors, Inter substitution, timezone and final social handles.
2. Configure the approved SMTP service and test actual receipt with Darren. SMTP integration is implemented with structured failure logging and Reply-To handling; real outbound delivery and inbox placement have not been tested.
3. The `newsletter_subscribers` migration is applied to the configured Supabase project and Buttondown credentials have been verified. A live test subscriber is present in both systems (`d.kamunuga@dreniak.com`); Buttondown reports it as `unactivated`, pending its double-opt-in confirmation. Buttondown duplicate handling, bounded retries and structured failure logging are implemented. Buttondown manages unsubscribe links, but unsubscribe reconciliation is currently a documented manual gap until a verified Buttondown webhook contract is connected.
4. Supply final Engineering content, leadership details/portraits, real case studies and Insights.
5. Confirm final privacy/retention wording against the selected hosting and delivery services.
6. Select/authorize the deployment target and publish a stakeholder preview. No site deployment, registrar change or Microsoft 365 DNS alteration was performed.
7. Schedule the separately scoped client portal authentication and authorized document/status views for Phase 2.

`.env.example` documents the setup values without secrets. `README.md` explains the architecture, commands, source content and integration behavior.

## Public-copy revision

At the user's direction, public editorial caveats were removed from the standards, project, leadership, Engineering and Insights content. The supplied Instagram and Facebook handle is now linked directly. ISO standards remain presented as frameworks; specific certification status and completed-project details have been requested because none were supplied.

Final verification: with the production server stopped, `npm run lint`, `npm run typecheck`, `npm test` (10/10), and `npm run build` pass. A fresh `npm run start` process then served the site for the full `npm run test:e2e` suite (38/38 desktop/mobile tests), after which the server was stopped. The browser suite includes WCAG checks at both viewport configurations and invalid-route regression coverage. No credentials or source documents were added to public assets.
