# Googlebot traffic mitigation — 19 November 2026

## Production change

Project: `hamba-bp/dreniak-site` on Vercel.

Published a single firewall change at approximately 11:04 EAT: disabled the
custom `Rule for Path: /` blanket Challenge rule. It preceded the existing
`Rate limit Googlebot` rule, so challenged homepage requests stopped before
reaching the limiter.

The existing enabled limiter was preserved:

- User Agent contains `Googlebot`.
- Fixed window: 5 requests per 60 seconds per IP address.
- Excess requests receive HTTP 429.
- Vercel counts limits per region, so this is not a global request cap.

The PHP-path Deny rule and managed Bot Protection remain enabled. The separate
blanket Googlebot Deny rule remains disabled. Existing temporary Attack Mode
was left unchanged (about 31 minutes remaining at the final check).

Vercel displayed `Firewall changes published`, and subsequent read-back showed
the homepage challenge disabled and the Googlebot limiter enabled. A temporary
draft to re-enable the challenge was discarded; no pending change was retained.

## Evidence

- Before the change, the hourly traffic view showed 27,000 challenged requests
  and 16 rate-limited requests. The original hourly view had about 114,100
  allowed requests; these are different rolling snapshots, not fixed-window
  before/after totals.
- At 11:07 EAT, the refreshed live view showed 2,400 rate-limited requests,
  254 allowed, 192 denied, 9,100 challenged and 1 logged in its displayed
  rolling window. The graph showed challenges falling to approximately zero
  and rate-limit responses rising after the change around 11:04.
- This establishes live enforcement, not a measured monthly billing saving or
  proof that Google has reduced its attempted crawl rate yet.
- A top source, `66.249.74.96`, reverse-resolved to
  `crawl-66-249-74-96.googlebot.com`; forward resolution returned the same IP.
- Vercel Domains showed `dreniak.com` permanently redirecting (308) to
  `www.dreniak.com`, which serves Production.
- The live sitemap contained 29 URLs, all on `www.dreniak.com`.
- Live homepage source contained canonical `https://www.dreniak.com` and
  Organization/WebSite JSON-LD URLs and IDs on the same host.
- The November 10 UTC SEO commit (`b266d85` in this checkout, corresponding
  SEO change `e52de24` on main) uses the shared `siteUrl`. No host split was
  established. No application code or deployment was changed.

## Search Console and Cloudflare

Search Console denied the signed-in account access to the `dreniak.com`
domain property's Crawl Stats page. Crawl Stats were not inspected.

DNS uses `ns1.dns-parking.com` and `ns2.dns-parking.com`; sampled HTTP responses
were served by Vercel. Cloudflare was evaluated but not configured. Its default
cache does not cache HTML or JSON, so simply enabling the proxy would not
offload repeated homepage HTML fetches. A future rollout needs a verified DNS
inventory (including mail), TLS configuration, public-HTML cache eligibility,
and explicit bypasses for cookies/authentication, admin/API routes, non-GET
requests and Next.js RSC/prefetch variants. Preserve origin no-store/private
responses; verify actual cache HITs before claiming origin-request savings.

## Follow-up and rollback

Review allowed CDN Requests and Googlebot 429 counts after the traffic has
settled, then inspect Crawl Stats with a property-authorised account. Keep some
successful crawls available; the limiter is not a full Googlebot ban. Tune the
allowance from observed volume and indexing needs. The current per-IP rule
does not cap traffic spread over many IPs or regions.

Rollback: in Firewall > Rules, enable `Rule for Path: /`, review and publish.
This restores the old blanket challenge and can again prevent homepage
requests reaching the rate limiter, so it is not the preferred steady state.

## Provider references checked

- [Vercel rule execution](https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules)
- [Vercel rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)
- [Vercel current WAF usage policy](https://vercel.com/docs/vercel-firewall/vercel-waf/usage-and-pricing): mitigated deny/challenge/rate-limit traffic does not incur CDN Requests or Fast Data Transfer; requests that pass a challenge do.
- [Google crawl-rate guidance](https://developers.google.com/crawling/docs/crawlers-fetchers/reduce-crawl-rate)
- [Cloudflare default caching](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/)
