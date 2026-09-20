# Email and newsletter operations

Current implementation and verification status: [IMPLEMENTATION_HANDOFF.md](IMPLEMENTATION_HANDOFF.md).

## Enquiries

Configure server-only `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` and `SMTP_FROM`. Port 587 requires STARTTLS; 465 uses TLS directly. Recipient is `info@dreniak.com`, with the submitter as Reply-To. Verify real receipt, reply routing, SPF/DKIM/DMARC and inbox placement after deployment. SMTP acceptance does not prove inbox delivery.

## Storage and rate limits

Apply all Supabase migrations in order, including `20260920173005_public_intake_limits.sql`. Set the project URL and server-only service-role key. `RATE_LIMIT_STORE=supabase` enables shared five-attempt/ten-minute windows; `memory` is the single-process default. Configured-store failures return 503. Configure only trusted proxy headers as explained in `.env.example`.

`NEWSLETTER_PROVIDER=buttondown` is the default. Supabase stores consent before provider sync. Existing rows retain their original consent evidence and unsubscribe status on duplicate signup. `consent_version=2026-09-10` identifies the existing signup statement, not an approved privacy-policy date. Client-approved privacy text/version remains a content decision.

## Buttondown unsubscribe webhook

1. Configure `BUTTONDOWN_API_KEY` and a long random `BUTTONDOWN_WEBHOOK_SIGNING_KEY` on the server.
2. In Buttondown webhook settings, register `https://YOUR-DOMAIN/api/webhooks/buttondown`, select `subscriber.unsubscribed`, and set the identical signing key.
3. Use Buttondown's delivery test, then verify a real unsubscribe updates the corresponding Supabase row. The endpoint must be publicly reachable over HTTPS.
4. Monitor failed deliveries. Invalid signatures return 401; malformed events return 400; oversized bodies return 413; missing configuration or failed provider/database calls return 503. Never acknowledge failed persistence as success.

The receiver implements the [documented HMAC contract](https://docs.buttondown.com/api-webhooks-introduction). It resolves the subscriber ID through the authenticated API and checks current state before updating Supabase; repeated updates are idempotent. A late event for a currently re-subscribed member is ignored. It never creates a subscriber from an unsubscribe event or changes provider subscription state.

The configured account's read-only webhook listing returned HTTP 200 on 20 September 2026. No plan-tier block was observed. Callback registration and delivery verification await the chosen deployment URL; these are setup operations, not missing endpoint code.

## Retry captured signups

Dry-run: `npx tsx scripts/reconcile-newsletter.ts`.

Apply: `npx tsx scripts/reconcile-newsletter.ts --apply`.

Run from the repository root (or equivalent packaged job with these source files/dependencies), using environment secrets. Select a schedule in the host's job runner. The command paginates active captures, submits sequentially with bounded provider retries and logs only totals. Nonzero exit means at least one failure; alert and review provider availability/suppression. Duplicate collision handling never forces a subscriber's type to active. Re-subscription must follow the subscriber's provider-supported consent flow.

Buttondown remains the authority on sendability/double opt-in; Supabase `active` means a captured signup, not proof that Buttondown has confirmed it. The website preserves that distinction by reporting capture success separately from provider sync.

## Legacy adapters

Explicit `NEWSLETTER_PROVIDER=webhook` uses `NEWSLETTER_WEBHOOK_URL`, bearer token and optional HMAC secret. Its receiver owns unsubscribe/deletion/export operations. Explicit `filesystem` uses an absolute persistent `NEWSLETTER_DATA_DIR`; never select it on ephemeral/serverless hosting. Set `NEXT_PUBLIC_NEWSLETTER_ENABLED=false` until the selected integration is ready.
