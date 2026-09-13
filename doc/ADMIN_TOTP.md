# Admin authenticator access

Admin access at `/admin` now uses six-digit SHA-1 TOTP codes with a 30-second period and one interval of clock tolerance. Each of up to three authenticators has its own server-generated 160-bit secret and friendly label. Supabase remains the CMS database and media store; Supabase password users no longer authorize admin access or CMS writes.

## Environment and rollout

Add these **server-only** variables to the appropriate Vercel environment:

| Variable | Value |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | The server service-role credential for the existing Supabase project. Never use a publishable key here. |
| `ADMIN_TOTP_MASTER_KEY` | Exactly 32 cryptographically random bytes encoded as standard base64. Keep a secure backup and keep it stable across redeployments. |

Generate the master key privately with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"`. Do not commit the output, paste it into tickets, or prefix either variable with `NEXT_PUBLIC_`. No individual TOTP secret belongs in an environment variable.

Existing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` remain in use. Existing `TRUST_PROXY` defaults to false: outside Vercel, enable it only when the host overwrites `x-forwarded-for`. On Vercel, auth rate limits use the platform's `x-vercel-forwarded-for` header automatically. Without a trusted IP source all visitors share the conservative limit.

Apply `supabase/migrations/20260913060024_admin_totp.sql` to the matching project before using the new portal, with both new environment variables configured. Coordinate migration and deployment: the migration retires old CMS authorization, so the previous password portal stops writing after it runs. Use a separate database and master key for preview/testing. The migration does not remove existing CMS data, media, Supabase users, or the legacy `admins` records.

The new tables are `admin_authenticators`, `admin_enrollments`, `admin_sessions`, and `admin_auth_limits`. All have RLS enabled and no public/authenticated access. Only the server service-role can access the `admin_auth` RPC. It runs as the caller with a fixed empty search path. The migration removes legacy CMS admin policies/write grants and makes `is_admin()` return false, disabling existing Supabase JWTs as an authority for both CMS and media writes. Public read policies remain intact.

## Enrollment and lifecycle

- While fewer than three authenticators exist, unauthenticated `/admin` visitors see **Register authenticator**. Public onboarding is intentional. Remote parties visit the site independently and register their own device. A signed-in administrator can direct a replacement holder to `/admin` in their own browser; no codes need to be shared.
- Enter a label, scan the generated QR in Apple Passwords or another standard TOTP app, and verify a code. A pending setup expires after ten minutes, is bound to an HttpOnly browser cookie, and does not reserve a confirmed slot. Starting again in the same browser invalidates its prior pending setup. After confirmation, wait for a new code to sign in; the confirmation code has been consumed.
- A QR necessarily conveys the new secret to the enrolling authenticator. This is the sole intended secret disclosure: a private, non-cacheable setup image, generated locally on the server. Neither plaintext secrets, provisioning URIs, nor encrypted secrets are returned in lists, login results, or subsequent retrieval endpoints. The master key never leaves the server. Analytics is suppressed on admin pages.
- When the third confirmation wins, enrollment closes, all pending setups are discarded, and new setup requests are rejected. Open login pages refresh availability every 15 seconds; the database cap applies immediately to every request. Unique slots constrained to 1–3 enforce the hard limit independently of transaction locking.
- An eight-hour opaque session token is stored in an HttpOnly, SameSite=Strict cookie, with Secure and the `__Host-` prefix in production. Only its SHA-256 digest is stored in the database. Plain HTTP development uses a separate cookie name. Layout, proxy, management page, and every CMS API check sessions server-side; missing/unavailable storage fails closed.
- `/admin/authenticators` lists labels only (plus opaque IDs used for revocation). Revoking a device deletes it and all its sessions atomically. Self-revocation signs out the current browser. The server rechecks membership/session validity within the same transaction, protecting against concurrent revocations. An already-running CMS request authorized before revocation can finish; later requests fail.
- Revoking the final authenticator is blocked both by the RPC and a database trigger. There is no public recovery bypass. Enroll a replacement before removing the last existing device. If all devices are lost, a database operator must perform a deliberate, audited recovery; the application does not implement automatic reset.
- Logout deletes the database session, so replaying a copied cookie fails. Login consumes the accepted TOTP time step atomically, preventing concurrent code reuse.

Authentication attempts use shared PostgreSQL counters: five per IP/action per five minutes, five confirmations per pending setup, 30 login attempts globally per five minutes, and 100 setup starts globally per ten minutes. Expired counter rows are removed during checks; expired pending/session rows are pruned during enrollment/login. Limits fail closed when storage fails. Mutation endpoints require a matching Origin and bounded JSON input. Next.js origin checks also protect the logout Server Action.

Secrets use versioned AES-256-GCM envelopes with random IVs and authenticator-ID-bound associated data. Losing or replacing the master key makes existing secrets unreadable. Rotation requires decrypting and re-encrypting stored envelopes with both keys available in a controlled server process; changing the environment variable alone is not a rotation procedure. Back up the encrypted database and key separately.

## Files and validation

- `src/lib/admin-auth/crypto.ts`: TOTP, random secret/token generation, AES-GCM encryption and token hashing.
- `src/lib/admin-auth/server.ts`: server database client, RPC, cookies, session lookup, origin and rate-limit checks.
- `src/app/api/admin/auth/[action]/route.ts`: begin, confirm, login, logout and revoke endpoints.
- `src/app/admin/login-form.tsx`, `layout.tsx`, `actions.ts`, `authenticators/`: public entry, protected shell, logout and device management.
- `src/lib/admin.ts`: existing CMS API guard now checks TOTP sessions before granting server data access.
- `src/app/api/admin/[resource]/route.ts`: resource lookup now requires an own property of the existing allowlist.
- `src/proxy.ts`: admin routing and non-cacheable/noindex responses. Relocated from the root to sit beside `src/app`, as required by Next.js discovery.
- `src/app/(auth)/admin/login/page.tsx`: old login URL redirects to `/admin`.
- `src/components/forms.tsx`: excludes admin screens from analytics.
- `.env.example`, `package.json`, `package-lock.json`: configuration and pinned QR/test dependencies.

Run `npm run test:admin` for standard RFC 6238 vectors, crypto tampering, actual migration execution, lifecycle, hard slot constraints, replay, expiry, role grants and last-device protection. Run `npm run build` then `npm run test:admin:lifecycle` for actual Next.js HTTP handlers and Chromium UI with independent QR decoding, concurrent confirmation requests, CMS write authorization, secure cookies, revocation/replacement and logout. The test creates an ephemeral PGlite PostgreSQL database and a test-only PostgREST adapter on port 54329, with a production Next server on port 3100; no live data or credentials are used. `tsx tests/admin/lifecycle.ts --serve` keeps that isolated environment available for manual browser checks.

PGlite serializes statements on one connection: overlapping HTTP tests plus database constraints are covered, but this is not a multi-connection hosted PostgreSQL load test. Real Apple Passwords device import and hosted Supabase/Vercel deployment require live verification; QR format and code compatibility are tested independently here.

Local verification on 2026-09-13: production build passed and reports the active proxy; typecheck, all eight existing tests, all three new admin test groups, focused lint, and the full browser lifecycle passed. The lifecycle also verified storage outages fail closed and ran the database adapter as `service_role`. Separate agent-browser inspection found no page errors. Repository-wide lint remains blocked by seven pre-existing React hook errors in the resource editor, structured editor, and media library; those editors were not rebuilt. Hosted migration/application checks and a physical Apple device test were not performed. The checkout did not contain the two privileged environment variables, and local Supabase/Docker was unavailable.

References: [Apple's QR setup instructions](https://support.apple.com/en-euro/guide/iphone/ipha6173c19f/ios), [Vercel client IP headers](https://vercel.com/docs/headers/request-headers), [Supabase RPC API](https://supabase.com/docs/reference/javascript/rpc).
