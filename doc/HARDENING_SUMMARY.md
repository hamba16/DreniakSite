# Hardening pass summary

## Completed

- Public CMS reads no longer require the authenticated cookie client. They use an anonymous Supabase client with tagged, time-based caching and same-request deduplication.
- Public division, content, project, and homepage routes now prerender as static/SSG where content is available.
- Insight slugs are generated at build time while unknown newly published slugs remain allowed at runtime.
- Admin content mutations invalidate the shared public-content cache tag.
- Services pages now use the same CMS-backed service source as division landing pages.
- Added route loading states for the public dynamic segments.
- Removed the globally preloaded italic font, added image placeholders, prioritized the first homepage panel image, enabled AVIF/WebP output, and stopped preloading the footer wordmark.
- Vercel deploys now exclude source documents, test assets, scripts, Markdown files, and the unreferenced root image.
- Enquiry throttling now uses Vercel's trusted forwarded-IP header instead of putting every Vercel visitor in one shared bucket.
- Multi-digit service links and assessment question counts are now data-driven.

## Measured outcome

- Baseline public routes: `/`, division landings, insight articles, and case studies were dynamic (`ƒ`).
- Post-change public routes: homepage and division/content/project routes are static/SSG (`○`/`●`) with one-hour or fifteen-minute cache windows.
- Post-change production build completed successfully in about 22 seconds.
- Root shared JavaScript baseline: 127 KB gzip; no claim is made that the final target is met because the full bundle-splitting work still needs profiling.

## Remaining verification or decisions

- The checkout is not linked to Vercel, so production environment variables, deployment preview Lighthouse scores, runtime regions, and live CMS propagation could not be verified.
- The distributed rate limiter still needs a durable shared store (Supabase or Vercel KV) selected and implemented.
- Newsletter persistence still needs production configuration checked; a filesystem fallback must not be used on Vercel.
- Lighthouse, WebPageTest, DevTools coverage, Safari/Firefox checks, and interaction traces need a reachable deployed preview.
- SVG SVGO optimization and source-image re-encoding were deliberately not performed without pixel comparisons.
- The animation-library split, OG image build-time conversion, sitemap/copyright refinements, and 404/error shell review remain follow-up items.
- Baseline unit and E2E suites contain pre-existing failures: the engineering brief fixture is missing, and several assertions expect older image/route behavior. ESLint has two pre-existing admin hook errors.
