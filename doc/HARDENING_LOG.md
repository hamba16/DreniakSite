# Hardening log

## Visual-effect change list

- Added route-level loading states for dynamic navigation. They use the existing page typography and `.spin` vocabulary and are visible only while a route is loading.

## A1 / A2 / A3 / A4 / A5 / E4 — public caching, static generation, loading UI, and service consistency

### What I found

- `src/lib/public-content.ts` routed every public Supabase read through `src/utils/supabase/server.ts`, whose first operation is `cookies()`.
- The baseline build rendered `/`, `/[division]`, `/[division]/insights/[slug]`, and `/[division]/projects/[slug]` as dynamic (`ƒ`).
- Insight pages had no `generateStaticParams` and fetched the same list independently from metadata and page rendering.
- The services page used static service arrays even though the division landing page already preferred CMS services.
- No `loading.tsx` files existed under `src/app`.

### Why it costs

`cookies()` is a request-time API, so public reads could not be prerendered. Repeated Supabase reads added avoidable round trips. Missing loading boundaries left on-demand navigation without an immediate response. The static services-page source caused CMS edits to disagree between routes.

### What I considered

- Enabling Cache Components and migrating to `"use cache"` was rejected for this cluster because the project does not currently enable `cacheComponents`; the installed Next 16 guide identifies `unstable_cache` as the compatible previous-model API.
- Route-level `revalidate` alone would not remove the cookie dependency from the public data functions.
- The authenticated cookie client remains unchanged for admin and auth paths.

### What I changed

- Added a module-scoped anonymous Supabase client in `src/lib/public-content.ts`.
- Wrapped each public read in `unstable_cache` with explicit tags and windows: one hour for general public content, fifteen minutes for insights and case studies.
- Wrapped the exported readers with React `cache()` for same-request deduplication.
- Added on-demand `revalidateTag("public-content", "max")` after admin insert, update, and delete operations.
- Added `generateStaticParams` for published insight slugs while keeping `dynamicParams = true` for newly published content.
- Changed `DivisionPage` services to use CMS data with the same fallback used by `DivisionHome`.
- Added route-level loading UI for division pages, content pages, insight articles, and case studies.

### How I proved it

The post-change build completed successfully and changed the public route table:

```text
○ /                                           1h / 1y
● /engineering                                1h / 1y
● /asset-management                           1h / 1y
● /asset-management/services                   1h / 1y
● /asset-management/projects/<slug>            15m / 1y
○ /sitemap.xml                                 15m / 1y
```

The public routes that were `ƒ` in the baseline are now static/SSG (`○` or `●`). TypeScript passed. Targeted lint passed with only two pre-existing warnings in the touched files.

### What I did not do

- I did not change the authenticated Supabase server client.
- I did not claim end-to-end CMS propagation: this checkout is not linked to the production Vercel project, so a live admin publish and public revalidation could not be performed.
- I did not change the distributed rate limiter or newsletter storage; those require production environment facts and a storage decision.

## C1 / C4 / C5 / C3 / D1 / E1 / E5 / E6 — asset loading, deploy context, and small correctness fixes

### What I found

- The italic Inter variable font was configured in the root layout and preloaded on every route.
- Static conceptual and project images did not provide blur placeholders.
- Neither homepage division panel image had an explicit priority.
- Image optimization had no AVIF format or long cache lifetime configured.
- `assets/`, `doc/`, `tests/`, and `scripts/` were included in the Vercel build context despite not being runtime assets.
- Public intake used the shared `local` rate-limit key on Vercel unless `TRUST_PROXY=true`.
- Service deep links accepted only one-digit indices.
- Assessment controls hardcoded a six-question count in multiple places.

### Why it costs

The italic font competes with LCP resources despite only a small number of italic elements. Missing placeholders create a blank-to-image transition. Unprioritized hero imagery delays the likely LCP element. AVIF and immutable caching reduce repeat and first-load image transfer. Uploading source documents inflates deployment work. The Vercel rate-limit fallback grouped all visitors into one bucket. Hardcoded limits fail when content grows.

### What I considered

- I did not re-encode source WebP files or collapse the wordmark variants: the pass requires pixel comparison at 1x/2x/3x and a visual brand review, which cannot be defensibly completed from static inspection alone.
- I did not replace the in-process limiter with Supabase/Vercel KV; that is a storage and production-schema decision.
- I used Vercel's platform-overwritten `x-vercel-forwarded-for` header, matching the existing admin-auth implementation, instead of requiring a production environment variable.

### What I changed

- Removed the full italic font entry so headings use the browser's synthetic oblique.
- Added blur placeholders to static conceptual and project-gallery images.
- Prioritized the first homepage panel image and marked the second low priority.
- Enabled AVIF/WebP output and a one-year image optimizer cache lifetime.
- Added `.vercelignore` entries for deploy-only source directories, Markdown documentation, and the unreferenced root image.
- Keyed public intake limits by Vercel's trusted forwarded-IP header on Vercel, while preserving the explicit `TRUST_PROXY` opt-in for other hosts.
- Accepted multi-digit service hashes and derived assessment progress, final-step logic, and question copy from `assessmentQuestions.length`.

### How I proved it

- TypeScript and the changed-file diagnostics pass.
- The post-caching build passed before this cluster; the next full build is the required validation gate.
- Existing unit tests cover the request-key fallback and assessment scoring; they remain part of the post-cluster suite.
- The post-cluster build passed in 22.4 seconds and retained the static/SSG public route table.
- The full unit suite remains 7/8 because the baseline-missing `ENGINEERING_UPDATE_BRIEF.md` fixture is absent.
- Full ESLint remains blocked by the same two pre-existing admin hook errors; no new lint errors were introduced.

### What I did not do

- I did not delete `public/images/natural/engineering.webp` or `asset-management.webp`; both are reachable from the Approach page.
- `image.png` is unreferenced by `src`, but it is only excluded from deploy context for now so recovery remains possible until the deletion is separately reviewed.
- Lighthouse, cross-browser traces, production env checks, and side-by-side image comparisons remain blocked by the missing linked preview/project.
