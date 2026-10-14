# Dreniak Client Portal Implementation Plan

## Implementation status

The initial local portal foundation and read-first client/staff workflows have been implemented on `feature/client-portal`. This is not a production-ready release. Some planned write workflows, the notification sender, CSV/lifecycle tools, invoice PDF/authoring, the full staff console and live Supabase/browser evidence remain incomplete; see `doc/PORTAL_OPERATIONS.md`. No remote database, email provider, or deployment was changed.

## Objective

Add an authenticated client workspace and staff console under `/portal`, backed by Supabase Auth, Postgres RLS, and private Supabase Storage. Preserve the current public site, division content, enquiry delivery, and self-reported maturity score.

## Existing system and integration points

- Next.js 16.3.4 App Router lives under `src/app`; `src/proxy.ts` currently protects the separate `/admin` console.
- Supabase SSR clients are in `src/utils/supabase/`. Public CMS reads use the publishable key. Server-only admin flows use `SUPABASE_SERVICE_ROLE_KEY` in `src/lib/admin-auth/server.ts` and the rate limiter.
- Migrations are imperative SQL under `src/supabase/migrations/`; there are no declarative schema files. Use the Supabase CLI to name new migration files.
- `src/lib/intake.ts` supplies bounded request parsing, origin checks, and IP keying; `src/lib/public-rate-limit.ts` fails closed when the configured Supabase limiter is unavailable.
- `src/app/api/enquiry/route.ts` contains the existing Nodemailer SMTP settings and transport behavior.
- `src/lib/assessment.ts` contains the six existing maturity questions and scoring. Portal assessments must call that scoring logic without changing it.
- `/portal` is currently a public placeholder. `src/app/robots.ts` already disallows it; `src/app/sitemap.ts` does not include it. `AnalyticsConsent` must also exclude `/portal` from both GA4 and Vercel Analytics.
- `.env.example`, `package.json`, `package-lock.json`, `src/app/layout.tsx`, and `src/components/forms.tsx` have pre-existing user edits. Keep those edits intact and stage only portal-owned changes when committing.

## Architecture decisions

- Supabase Auth email magic links are the sign-in method; users are invited by staff. The public `/portal` route remains available when Supabase is unconfigured and reports that sign-in is unavailable.
- Use `@supabase/ssr` and `getUser()` for cookie-backed identity. Proxy performs session refresh and security headers only; each page, action, and route handler checks authorization itself.
- Put business data in `public` with RLS on every portal table. A private, non-exposed `portal_private` schema holds narrowly granted `SECURITY DEFINER` helper functions with a locked `search_path` to avoid recursive membership policies. Do not use user-editable Auth metadata as authorization.
- Clients read only their organisation and confirmed division entitlements. Requested categories do not confer entitlement. Draft invoices and internal documents remain staff-only. Client writes are limited to onboarding/profile/preferences, messages/requests, acknowledgements, payment reference notes, data-export/deletion requests, and maturity assessments.
- Keep the Supabase service role server-only for staff operations, invite administration, and the existing atomic rate limiter. Client reads/writes use the authenticated SSR client and RLS.
- Store money as integer minor units and ISO 4217 currency. Keep invoice status changes and payment history auditable.
- Keep the `portal-files` Storage bucket private, limit types and size, scope paths to organisation and engagement, and generate short-lived signed URLs only after authorization. Malware scanning is not included in this phase.
- Implement email notifications through the existing SMTP adapter. WhatsApp records preference/outbox state but has no Business API integration. No payment gateway is integrated.
- Portal routes are `noindex`, have `no-store`/security response headers, are omitted from the sitemap, and are excluded from GA4 and Vercel Analytics regardless of consent.

## Delivery phases

1. **Foundations:** plan, schema, RLS and helper functions, private Storage bucket, Auth callback/magic-link/invitation plumbing, staff/client role checks, audit events, headers, and environment documentation.
2. **Onboarding and shell:** resumable validated onboarding, portal layout, dashboard, workspace switcher, settings, notification consent and preferences.
3. **Core modules:** engagements, documents and acknowledgements, requests/messages, notification outbox and email/WhatsApp adapters.
4. **Invoices:** issued invoice views, line items, payment history/reference notes, staff entry, and PDF downloads.
5. **Division modules:** Engineering supervision/issues/contracts/quality; Asset Management register/import/export/lifecycle/capital plan/maturity history.
6. **Staff console:** organisation/member/invitation/engagement/document/message/invoice/division workflows, audit viewer, and guarded labelled sample data.
7. **Hardening:** RLS integration checks, browser flows, accessibility, docs, operational setup, and release review.

Each phase should be a focused commit on `feature/client-portal`, with the existing unrelated worktree edits left unstaged. No live migration, deployment, or provider/DNS configuration change is part of local implementation.

## Verification

- Unit tests cover schemas, authorization decisions, invoice calculations, CSV validation, notification routing, and maturity-score parity.
- Database tests prove cross-organisation and cross-division isolation, invoice/document visibility, invitation expiry/use/revocation, and Storage tenant isolation.
- Browser tests cover the available sign-in/onboarding/module journeys, denied access, noindex, analytics exclusion, responsive behavior, and key-page accessibility.
- Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:e2e`; report unavailable live Supabase/SMTP proof separately.

## Decisions still needed before public launch

- Confirm WhatsApp Business provider and account ownership before any API integration.
- Select any future payment methods; this implementation records staff-maintained payments and client references only.
- Confirm whether client MFA is optional or required; staff TOTP is required by the brief.
- Approve retention periods for portal content, audit events, and closed engagements.
- Obtain legal review for UK GDPR, Uganda's Data Protection and Privacy Act, privacy text, and cross-border processing.
- Verify staging Supabase Auth templates/redirect allowlist, SMTP delivery, private Storage limits, and operational backups before inviting real clients.
