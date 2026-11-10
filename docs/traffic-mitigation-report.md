# Scraper, bot, DDoS, and traffic mitigation report

**Scope:** Controls present in this repository as of 2026-11-05. This describes checked-in code and configuration; it cannot confirm sett ings managed outside the repo, such as Vercel dashboard firewall rules.

## Summary

The site has useful protections against form spam and abusive admin/API requests, plus a daily homepage traffic anomaly alert. It does **not** implement a site-wide bot challenge, scraper blocking system, or DDoS mitigation policy in checked-in code. The crawler rules in `robots.txt` are advisory, not access controls. The homepage monitor observes traffic but does not rate-limit or block it.

## Controls found

| Area | What is implemented | Scope and limitations |
|---|---|---|
| Crawler directives | `src/app/robots.ts` allows general crawling of public pages, disallows `/api/`, `/supremeadmin`, `/design-review`, `/portal`, and `/auth/`, and disallows all paths for `Bytespider` and `CCBot`. It publishes the sitemap URL. | Requests are not blocked; compliant crawlers may follow these rules. Any bot can ignore them. No user-agent filtering is used as an access-control mechanism. |
| Public enquiry and newsletter | Both POST handlers reject invalid origins when an `Origin` is supplied, require JSON, cap the parsed request body at 16 KB, validate fields, and reject a non-empty honeypot field. They apply a per-category, per-client limit of five valid requests per ten-minute window and return HTTP 429 with `Retry-After: 600` when exceeded. | Protects these two submission routes, not page views or other API endpoints. Requests rejected before the limiter (for example malformed submissions) do not consume its bucket. |
| Public rate-limit storage | `RATE_LIMIT_STORE=memory` uses a bounded in-process map. `RATE_LIMIT_STORE=supabase` calls the atomic `consume_public_limit` database function; the migration hashes client keys in the application, limits the bucket to five attempts in ten minutes, enables RLS, and grants function access only to `service_role`. A configured-store error returns HTTP 503 rather than bypassing the limit. | Memory limits are not shared across instances/processes and may reset on restart. Distributed enforcement requires the Supabase migration and service-role configuration. |
| Admin API throttling | Admin content and media mutation handlers use the same five-per-ten-minute in-memory limiter, separated by client and resource. Admin auth actions also use Supabase-backed counters: generally five requests per five minutes per action/client, logout allows 30; enrollment has a global 100-per-ten-minute cap, confirmation has five per enrollment token per ten minutes, and login has a global 30-per-five-minute cap. | Content/media throttling is process-local. Auth counters are shared through the database. Per-client keys use Vercel's `x-vercel-forwarded-for` on Vercel; on other hosts, forwarded IPs are trusted only with `TRUST_PROXY=true`. Without a trusted proxy, request keys share a fallback bucket. |
| Homepage traffic monitoring | `src/proxy.ts` counts homepage requests in Upstash Redis. The daily monitor reads yesterday plus the preceding seven days, and alerts when yesterday exceeds the greater of 1,000 requests or five times the prior-seven-day average (defaults are configurable). The Vercel cron runs `/api/monitor/home-traffic` daily at 00:15 UTC. Alerts go to logs and optionally `TRAFFIC_ALERT_WEBHOOK_URL`. | Monitoring only: no automatic blocking, throttling, challenge, or mitigation is applied when a threshold is exceeded. The homepage counter is awaited on requests; Redis failures are logged (at most once per minute per process) and the homepage is still served without a stored count. The monitor needs Upstash credentials and `CRON_SECRET`; missing or failed configuration degrades monitoring. |
| Other request safeguards | `next.config.ts` disables the `X-Powered-By` header and sets standard browser security headers. Admin pages receive private/no-store and noindex headers in `src/proxy.ts`. | These are not bot or DDoS controls. |

## Important deployment settings

- `RATE_LIMIT_STORE` defaults to `memory`. Set it to `supabase` and apply the checked-in migrations to share public intake limits across serverless instances. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- On a non-Vercel host, set `TRUST_PROXY=true` only when a trusted proxy overwrites the forwarded client-IP header. Otherwise client-based limits cannot reliably distinguish clients. Vercel uses its dedicated forwarded-IP header automatically.
- Homepage monitoring requires `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and `CRON_SECRET` in the deployed environment. `TRAFFIC_ALERT_MULTIPLIER`, `TRAFFIC_ALERT_MIN_REQUESTS`, and `TRAFFIC_ALERT_WEBHOOK_URL` are optional overrides.
- `vercel.json` configures the cron only. It contains no firewall, WAF, rate-limit, bot-management, or IP-blocking rules. The proxy comment says CDN request quotas are counted before it, but no such quota policy is configured in this repository.

## Gaps and interpretation

1. **No site-wide request throttling:** apart from the intake and admin routes, ordinary pages and other routes have no application-level request limiter.
2. **No active scraper detection/blocking:** crawler directives are voluntary. There is no request-time bot classification, challenge/CAPTCHA flow, denylist, or scraper-specific response behavior.
3. **No DDoS mitigation configuration in repo:** no checked-in WAF rules, IP/ASN controls, managed bot rules, or global edge rate limits were found. Hosting-provider protections may exist outside version control and are not assessed here.
4. **Traffic alerts do not mitigate:** an alert requires someone or an external system to respond; the application continues serving traffic.
5. **BotID is only a dependency:** `botid` appears in `package.json`/lockfile, but there are no imports or usage in the application source. Its presence does not indicate active bot protection.
6. **Supabase CAPTCHA is not enabled here:** the CAPTCHA configuration in `src/supabase/config.toml` is commented out, and no CAPTCHA integration was found in the app.

## Source map

- `src/app/robots.ts` — crawler directives.
- `src/lib/intake.ts`, `src/lib/public-rate-limit.ts`, `src/supabase/migrations/20260920173005_public_intake_limits.sql` — intake validation, client keys, and public limiter.
- `src/app/api/enquiry/route.ts`, `src/app/api/newsletter/route.ts` — public intake enforcement.
- `src/lib/admin.ts`, `src/lib/admin-auth/server.ts`, `src/app/api/admin/auth/[action]/route.ts`, `src/supabase/migrations/20260913060024_admin_totp.sql` — admin throttling and shared auth counters.
- `src/proxy.ts`, `src/lib/traffic-guard.ts`, `src/app/api/monitor/home-traffic/route.ts`, `vercel.json` — homepage counting, threshold alert, and schedule.
- `.env.example`, `README.md` — configuration and deployment notes.
