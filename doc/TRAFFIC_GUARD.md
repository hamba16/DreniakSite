# Homepage traffic guard operations

The root route has a best-effort daily request counter in `src/proxy.ts` backed by Upstash Redis REST. Next.js 16 calls this request hook `proxy.ts`; the project already uses that convention, so a separate `middleware.ts` is not supported here. Next.js 16 Proxy runs on Node.js and does not support the Edge runtime; Vercel still runs its routing middleware globally before the cache. When Upstash is unavailable or its credentials are absent, the homepage serves normally; counter errors are logged at most once per minute per warm instance.

## Required Vercel settings

Create or connect an Upstash Redis database, then set these server-only Production environment variables in the Vercel project to enable the daily counter and monitor. The homepage itself remains available if these settings are absent:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `CRON_SECRET` (a long random bearer secret; Vercel Cron sends it as `Authorization: Bearer ...`)

Optional settings:

- `TRAFFIC_ALERT_MULTIPLIER` (default `5` times the prior seven-day daily average)
- `TRAFFIC_ALERT_MIN_REQUESTS` (default `1000` requests; keeps the monitor useful before a non-zero baseline exists and avoids noise at low volumes)
- `TRAFFIC_ALERT_WEBHOOK_URL` (optional Slack-compatible webhook; without it, alerts appear as errors in Vercel logs)

`vercel.json` schedules `/api/monitor/home-traffic` daily at 00:15 UTC. This meets Vercel Hobby's once-per-day schedule limit; Hobby may invoke it at any time in the scheduled hour. It compares the previous complete UTC day with the average of the seven complete days before it, and alerts above the greater of five times that average or `TRAFFIC_ALERT_MIN_REQUESTS`. The minimum-volume alert works before the seven-day baseline is populated. The monitor endpoint requires `CRON_SECRET`; do not expose it as a `NEXT_PUBLIC_` variable.

The homepage route is configured for hourly ISR. `src/app/robots.ts` excludes APIs, admin, design review, portal, and auth routes from compliant crawlers, and disallows Bytespider and CCBot. Robots rules and `Crawl-delay` are voluntary crawler hints, not request throttles; the rate limiter is the enforcement layer.

Rate limiting `/` does not reduce Vercel CDN/Edge Request counts: every request reaching Vercel's CDN is counted before middleware/cache handling, including a request answered with 429. Since the observed traffic was verified as Googlebot, the homepage has no request limiter that could throttle legitimate crawling. Existing abuse limits remain on enquiry, newsletter, and portal API routes.

The monitor endpoint logs configuration/backend failures and returns a `degraded` JSON status without failing the homepage or causing cron retries. A missing-secret warning is emitted once per warm instance. Unauthorized direct invocations still receive 401.

## Findings from the 2026-10-20 review

- A local production build classifies `/` as prerendered static content with a one-hour revalidation interval. A local `next start` GET returned `200`, `x-nextjs-cache: HIT`, `Cache-Control: s-maxage=3600, stale-while-revalidate=31532400`, and an `ETag`. It did not return `Last-Modified`.
- The public Production URL was still paused when checked. It returned Vercel's platform `503` with `X-Vercel-Error: DEPLOYMENT_PAUSED` and `Cache-Control: public, max-age=0, must-revalidate`; it had no `ETag` or `Last-Modified`. These are headers for Vercel's paused-deployment response, not the homepage application response. Historical 5xx data around October 18 must be checked in Search Console/Vercel logs.
- The homepage render path contains no server-side request headers/cookies, search params, `Date.now()`, or `Math.random()`. The root page is not marked `force-dynamic`. The cached homepage CMS lookup is revalidated hourly.
- No additional internal search, preview, or query-driven duplicate routes were found to disallow for Googlebot. The existing wildcard rules already cover API, admin, design-review, portal, and auth paths; `/og/*` serves the site's social preview images and remains crawlable.

## Manual dashboard actions before production rollout

1. In the correct Vercel project, enable Firewall > Bot Protection. Since the reported crawler was verified Googlebot, check its treatment before applying any block or challenge rule.
2. In Google Search Console, review Crawl Stats for October 18 and inspect host availability and 5xx responses.
3. In Vercel Production environment variables, configure `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and `CRON_SECRET`. Without these, the site remains available, but daily traffic counters and cron alerts report degraded status.
4. Deploy only after the above settings are ready, then verify actual Production headers and the cron execution in Vercel. No deployment was performed during this review.

## Activation check

After setting the variables and deploying, verify in Vercel that repeated requests from one IP to `/` receive HTTP 429 after the configured limit, `/` serves a cached response with an hourly revalidation policy, and the daily cron returns a successful report. Triggering an alert should create a Vercel error log and, if configured, a webhook notification. Confirm the Vercel dashboard shows the cron schedule enabled for the intended Production project.
