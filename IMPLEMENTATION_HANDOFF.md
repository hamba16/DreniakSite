# Dreniak implementation handoff

Implemented 10 September 2026 in `D:\PROBOOK\Dreniak`.

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
- Newsletter capture supports a durable filesystem or authenticated HTTPS storage webhook. In production, missing storage is an explicit unavailable state, never a false success.
- Portal authentication and authenticated document/project views remain Phase 2. No credentials are solicited or fake sign-in provided.
- Instagram and Facebook links use the supplied `@dreniak_limited` handle at the user's direction. LinkedIn has no supplied account URL. GA4 is optional and requires explicit visitor consent before loading.
- Office hours are shown as 08:00–18:00 East Africa Time; confirm this timezone before launch.

## Verification evidence

| Check | Result |
| --- | --- |
| Production build | Pass; no build warnings |
| TypeScript | Pass |
| ESLint | Pass; no warnings |
| Content / validation / persistence tests | 6 passed |
| Complete desktop/mobile browser suite | 18 passed in 2.1 minutes |
| All 23 page routes, desktop and mobile | HTTP 200, one H1, no detected horizontal overflow, broken rendered images or JavaScript errors |
| Accessibility | No automated WCAG 2 A/AA or WCAG 2.1 A/AA violations detected on 12 audited routes at both tested sizes |
| Division gateway and switching | Pass, desktop and mobile |
| Keyboard capability tabs and service accordion | Pass |
| Assessment scoring, completion and restart | Pass |
| Enquiry unconfigured-delivery state | Pass; no false success |
| Service deep links and assessment context in enquiries | Pass |
| Reduced-motion navigation and newsletter unavailable state | Pass |
| Social cards, sitemap, robots and icons | Valid HTTP responses; social cards are PNG |
| Unknown division pages and unpublished articles | Correct 404 responses |
| Packaging | No supplied brand PDF, brief, questionnaire or archived-site assets included in the social-card server trace |

The automated report is generated at `playwright-report/index.html`. Tests run against the local production server using Chromium desktop (1440 × 1000) and mobile emulation (390 × 844). These are automated and local browser checks, not a formal accessibility certification or physical-device test.

Fourteen review images are saved in `docs/preview`: desktop home, split, both divisions, services, About and assessment; mobile home, Asset Management, contact and assessment; and the three social cards. Recreate them with `node scripts/capture-preview.mjs` while the server is running.

## Launch dependencies

1. Confirm colors, Inter substitution, timezone and final social handles.
2. Configure the approved SMTP service and test actual receipt with Darren. SMTP integration is implemented; real outbound delivery and inbox placement have not been tested.
3. Configure durable newsletter storage; establish access controls, deduplication and unsubscribe/deletion handling. The local persistence adapter is tested; an external production backend is not connected.
4. Supply final Engineering content, leadership details/portraits, real case studies and Insights.
5. Confirm final privacy/retention wording against the selected hosting and delivery services.
6. Select/authorize the deployment target and publish a stakeholder preview. No site deployment, registrar change or Microsoft 365 DNS alteration was performed.
7. Schedule the separately scoped client portal authentication and authorized document/status views for Phase 2.

`.env.example` documents the setup values without secrets. `README.md` explains the architecture, commands, source content and integration behavior.

## Public-copy revision

At the user's direction, public editorial caveats were removed from the standards, project, leadership, Engineering and Insights content. The supplied Instagram and Facebook handle is now linked directly. ISO standards remain presented as frameworks; specific certification status and completed-project details have been requested because none were supplied.

Verification after this revision: production build and lint pass, six content/backend tests pass, and all four scoped desktop/mobile routing and accessibility tests pass. All 23 rendered page responses were checked with no registrar mention. Requests for `.env`, `.env.local`, the source brief and brand PDF return 404. No credentials or source documents were added to public assets.
