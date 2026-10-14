# Client Portal Operations

## Staging prerequisites

1. Review `src/supabase/migrations/20261014144728_client_portal_foundation.sql` and apply it to an isolated staging project first. The repository's Supabase local stack could not be started in this environment because Docker Desktop was unavailable; the migration was exercised with PGlite instead.
2. Configure the three portal environment values documented in `README.md`. `SUPABASE_SERVICE_ROLE_KEY` is server-only and required for staff actions, invitation acceptance, export auditing and privacy operations.
3. In Supabase Auth, disable public email signup, configure a verified SMTP sender, set site URL and redirect allowlist for each approved deployment origin, and review the invitation and magic-link templates. The local config sets a seven-day email OTP lifetime so it matches the seven-day database invite expiry; links are single-use. Confirm whether production policy should shorten this window.
4. Review the Auth MFA setting for TOTP and enforce the staff enrolment policy before adding real portal staff.
5. Bootstrap the first admin using the restricted SQL example in `README.md`. Confirm identity and role out of band. The administrator must complete TOTP before staff operations are available.
6. Create an organisation, confirm only the service divisions in scope, invite named client admins/members, and create engagements under a confirmed division. Engineers need an active `portal_staff` row and an `engagement_staff` assignment to see client data for that engagement. Administrators can see all portal workspaces.
7. Configure a high-entropy `PORTAL_NOTIFICATION_SECRET` on the server and invoke `/api/portal/notifications/dispatch` from an authenticated scheduler using `Authorization: Bearer <secret>`. Set SMTP values before enabling email preferences. The worker sends content-free notices, retries transient failures with backoff, and records WhatsApp as `not_configured` until a consent-aware provider is configured.
8. Confirm private bucket limits, backups, SMTP delivery, Auth redirects, rate-limit store configuration, privacy notice and retention schedule before inviting client users.

## Current functional boundary

- Working source flows: email-link request/callback, database-checked invitation acceptance/revocation/expiry, five resumable onboarding steps, staff TOTP gate, tenant and division RLS, client engagement/dashboard reads, private document downloads/acknowledgements, conversations/service requests, issued-invoice/payment history views and payment references, privacy export/deletion requests, engineering record reads, asset/capital/maturity views, and basic admin organisation/invite/division/engagement creation.
- A small PGlite test executes the migration and checks confirmed-division isolation, the private bucket, document path tenant checks, invitation one-time acceptance/expiry/revocation and phone validation.
- No live Supabase migration, Auth/SMTP delivery, Storage request, Vercel deployment, browser sign-in journey or client data proof has been performed.
- Not implemented: WhatsApp Business integration, invoice PDF or authoring workflow, online payments, editable asset lifecycle/intervention tools, CSV import/export, full staff document management, member removal, audit viewer, sample-data seeding, malware scanning, or legal-reviewed retention/deletion automation.

## Security and privacy operations

- Assign client service access only through `organisation_divisions.confirmed_at`; category requests during onboarding are not permissions.
- Assign engineers per engagement. Never add staff/client authorization claims to user-editable Auth metadata.
- Uploads must use the private `portal-files` bucket and the path `org/{organisation_uuid}/engagement/{engagement_uuid}/{document_uuid}/{filename}`. Allowed size is 20 MiB and the SQL bucket allowlist includes PDF, JPEG, PNG, WebP, plain text, DOCX and XLSX. A client receives a 60-second signed URL only after an RLS read and audit check.
- Audit rows are append-only. They intentionally omit emails, document text and other content. Direct user profile, preference and portal rows remain subject to RLS.
- A data export contains account fields and that user's visible profile, membership, onboarding, preference, maturity, privacy-request, authored-message and service-request records. It deliberately excludes private files, other users' messages and internal Dreniak records.
- Deletion requests are recorded for human review; the application does not delete organisation, contractual, invoice, payment or audit records automatically.
- The public `/privacy` text is provisional. Legal/operations must confirm controller details, lawful basis, processors, transfer terms, retention schedule, deletion exceptions and incident contact before production.
