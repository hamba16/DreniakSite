# Dreniak Site — Performance & Quality Hardening Pass

**For:** the implementation agent working in `DreniakSite-main`
**Status of the site:** built, deployed at `dreniak-site.vercel.app`, client-facing
**Type of work:** diagnosis and repair only

---

## 0. Read this before you touch anything

This is not a redesign. This is not a feature pass. The visual language, the layout, the copy, the interaction concepts and the page architecture are **signed off and live**. Your job is to make the existing thing faster, more correct and more robust, and to leave it looking and behaving exactly as it does now — only better on every measurable axis.

Three rules that override any instinct you have:

1. **Do not change what the site looks like.** If a fix would move a pixel, change a colour, change a font size, reorder content, or alter an animation's visible result, stop and log it as a proposal instead of implementing it. The only exception is fixing something that is visibly *broken* (overflow, cut-off text, a missing focus ring) — and even then, match the surrounding design language rather than inventing new treatment.
2. **Do not remove or simplify features.** The split-screen wipe, the maturity assessment, the capability journey, the service accordion, the conceptual imagery, the admin CMS, the TOTP auth — all stay. If something is expensive, make it cheaper, do not delete it.
3. **Do not "clean up" code you were not asked to touch.** Every diff must trace back to a numbered finding in this document or a finding you discovered and logged. No opportunistic refactors.

You are working on a client's live property. Assume every change is a change you have to defend.

---

## 1. How you are to work (the harness)

This is not optional process decoration — follow it exactly.

### 1.1 Establish a baseline before you change a single line

Run and record, verbatim, in `doc/HARDENING_BASELINE.md`:

```bash
npm install
npx tsc --noEmit                    # record output
npx eslint .                        # record full output
npx next build                      # record the ENTIRE route table
npm test                            # record pass/fail
npx playwright test                 # record pass/fail per spec
du -sh .next && du -sh public && du -sh assets && du -sh doc
```

Then, with a real `.env.local` containing the production Supabase credentials, run `npx next build` **a second time** and record the route table again. This matters: the route table changes depending on whether Supabase env vars are present, and the production table is the one that counts. Note the difference explicitly.

Also record, per route, the first-load JS. Next 16 does not print it, so compute it:

```bash
node -e "
const m=require('./.next/build-manifest.json'),fs=require('fs'),z=require('zlib');
const gz=f=>{try{return z.gzipSync(fs.readFileSync('.next/'+f)).length}catch(e){return 0}};
console.log('root shared JS (gz):',((m.rootMainFiles||[]).reduce((a,f)=>a+gz(f),0)/1024|0)+'KB');
"
find .next/static/chunks -name '*.js' -exec sh -c 'printf \"%s gz=%sKB\n\" \"$1\" $(( $(gzip -c \"$1\" | wc -c)/1024 ))' _ {} \;
```

Finally, run Lighthouse against the deployed preview (mobile preset, throttled) for these six routes and record all four scores plus LCP, CLS, INP, TBT and total transferred bytes:

- `/`
- `/engineering`
- `/asset-management`
- `/asset-management/sectors`
- `/asset-management/assessment`
- `/engineering/services`

**You may not begin fixing until the baseline file exists and is committed.** Everything you do afterwards is measured against it.

### 1.2 Work in small, reviewable units

One finding (or one tight cluster of related findings) per commit. Commit message format:

```
perf(A1): serve public content through an anonymous Supabase client

Problem: createClient() awaits cookies(), which opts every public page
out of static rendering. Build table showed / and /[division] as ƒ.
Fix: added a cookieless read client for public reads; routes now ● / ○.
Evidence: route table before/after in doc/HARDENING_LOG.md#A1
Risk: admin routes still use the cookie client — verified auth unaffected.
```

### 1.3 Show your reasoning, not just your diffs

Maintain `doc/HARDENING_LOG.md`. For every finding, write:

- **What I found** — the actual evidence (file, line, build output, byte count, screenshot). Not "this seemed slow."
- **Why it costs** — the mechanism. "This forces dynamic rendering because `cookies()` is a dynamic API" beats "this is inefficient."
- **What I considered** — the options you rejected and why. If you picked the second-best option because the best one would have changed the visuals, say so.
- **What I changed** — the diff summary.
- **How I proved it** — the before/after number, or the test that now passes.
- **What I did not do** — anything you found and deliberately left alone, with the reason.

If you cannot state the measured improvement, you have not finished the finding.

### 1.4 Never regress to prove a point

After every cluster: `npx tsc --noEmit && npx eslint . && npm test && npx next build && npx playwright test`. All must pass. If a Playwright spec fails because your fix genuinely changed correct behaviour, fix the spec and say so loudly in the log — do not quietly weaken an assertion.

### 1.5 When you are uncertain, ask — do not guess

There are judgement calls below where I have told you to stop and ask. Honour those. A wrong guess on a client's live site costs more than a round trip.

---

## 2. What I found — the findings register

I have already audited the repo: installed it, typechecked it, linted it, built it, inspected the emitted chunks and the prerendered HTML, measured every asset, and read the source. What follows is evidence, not speculation. Verify each finding yourself before fixing it (the repo you have may be a few commits ahead of what I inspected), but do not re-derive from scratch — start here.

Severity: **S1** = fix first, it affects every visitor or breaks something real. **S2** = significant, fix in this pass. **S3** = worth doing, do not let it block S1/S2.

---

### GROUP A — Rendering and caching (this is where the real wins are)

**A1 · S1 · Every public page is dynamically rendered on every request.**

`src/utils/supabase/server.ts` → `createClient()` calls `await cookies()` as its first statement. `cookies()` is a dynamic API: any route that transitively calls it is permanently opted out of static rendering. `homepageContent()`, `publicCompanyProfile()`, `publicServices()`, `publishedInsights()`, `publishedMedia()` and `publishedCaseStudies()` all go through it.

Evidence from the build table: `/` and `/[division]` render as `ƒ (Dynamic)`. In production, with Supabase env vars present, `/[division]/insights/[slug]`, `/[division]/projects/[slug]` and the sectors/insights pages join them.

Nothing about reading published marketing content requires a cookie. The cookie client exists for authenticated admin sessions. Public reads are anonymous.

**Fix:** add a second, cookieless client for public reads — a plain `createClient` from `@supabase/supabase-js` using the publishable key, constructed once at module scope. Point every function in `src/lib/public-content.ts` at it. Leave `src/utils/supabase/server.ts` exactly as it is for admin and auth paths. Wrap each public read in React `cache()` for per-request dedup, and give it a revalidation window (`unstable_cache` with tags, or route-level `export const revalidate`, whichever fits Next 16.3's current recommendation — **read `node_modules/next/dist/docs/` before choosing**, per `AGENTS.md`; this version has breaking changes).

**Acceptance:** with production env vars present, `next build` shows `/`, `/engineering`, `/asset-management` and every `[division]/[page]` route as `●` or `○`, not `ƒ`. Content edits made in the admin CMS still appear on the public site within the revalidation window — verify this by hand, do not assume.

**A2 · S1 · There is no revalidation configured anywhere on the public site.**

`grep -rn "export const revalidate\|unstable_cache\|cacheLife" src/` returns exactly one hit, and it is `export const dynamic = "force-dynamic"` in the admin layout. Once A1 lands, choose deliberate revalidation windows and document the choice:

- Homepage, division landings, static content pages: long (an hour or more) plus on-demand revalidation
- Insights and case studies: shorter, or tag-based
- Admin: stays `force-dynamic`

Best outcome: wire `revalidateTag`/`revalidatePath` into the admin save actions in `src/app/admin/actions.ts` so the CMS publishes instantly rather than waiting out a timer. If you do this, test it end-to-end: edit a field in the CMS, confirm the public page updates.

**A3 · S2 · Insight and case-study pages fetch the same data twice per request.**

`src/app/[division]/insights/[slug]/page.tsx` calls `publishedInsights()` in `generateMetadata` and again in the page body. `src/app/[division]/projects/[slug]/page.tsx` does the same with `publishedCaseStudies()`. Supabase calls are not automatically deduped by Next's fetch cache. Two full round trips to Supabase for one page render.

**Fix:** React `cache()` around the read functions (this also covers A1's dedup requirement). Verify by logging call counts in dev.

**A4 · S2 · `[division]/insights/[slug]` has no `generateStaticParams`.**

Every other dynamic segment has one. Insights do not, so every insight article is rendered on demand. Add it, sourcing slugs from `publishedInsights()` for both divisions, and pair it with `dynamicParams` so newly published insights still resolve.

**A5 · S2 · There is not a single `loading.tsx` in the app.**

`find src -name loading.tsx` → nothing. Any route that still renders on demand shows the user a blank white wait with no feedback. Add route-level loading UI for `/[division]`, `/[division]/[page]`, `/[division]/insights/[slug]` and `/[division]/projects/[slug]`.

**Constraint:** the skeleton must use the existing design tokens and match the real page's layout geometry so nothing shifts when content arrives. Do not introduce a new spinner style — the site already has `.spin` on `LoaderCircle`. Reuse the existing vocabulary.

**A6 · S2 · Nested async server components create request waterfalls.**

`DivisionHome` awaits `Promise.all([publicCompanyProfile, publicServices])` — correct. But it then renders `<Sectors />`, which is itself an async server component that awaits `publishedMedia()`. That second fetch cannot start until the first pair resolves. Same pattern elsewhere.

**Fix:** either hoist the data fetch to the nearest common parent and pass it down as props, or wrap the independently-fetching subtree in `<Suspense>` with a matching skeleton so it streams in parallel. The first option is safer for a site where nothing should visibly shift. There is currently exactly one `<Suspense>` in the entire codebase (`division-pages.tsx:756`).

**A7 · S2 · OG images are re-rendered per request through satori.**

`src/app/og/[brand]/route.tsx` reads a 13KB SVG off disk and runs `ImageResponse` on every hit, with no cache headers and no revalidation. There are exactly three possible outputs (`parent`, `engineering`, `asset-management`) and they never change.

**Fix:** simplest correct answer is to generate the three PNGs at build time and serve them statically. If you keep the route, add `generateStaticParams` for the three brands plus aggressive `Cache-Control`. Either way the output image must be byte-for-byte visually identical to what ships today — screenshot-compare before and after.

**A8 · S3 · `sitemap.xml` is dynamic and unrevalidated.** Add a revalidation window.

**A9 · S3 · The copyright year will freeze.** `src/components/shared.tsx` renders `new Date().getFullYear()` in the footer. Under static rendering (which A1 introduces) this bakes in at build time and will read "2026" forever. Either move it to a tiny client component or ensure the revalidation window guarantees at least an annual rebuild. Flag your choice.

---

### GROUP B — Client bundle

**B1 · S1 · The animation library ships on every single page, including the 404.**

`src/app/layout.tsx` renders `<Experience>` from `src/components/interactions.tsx`, which is `"use client"` and imports `motion/react` plus fourteen Lucide icons at module scope.

Measured: chunk `1q8qyxb2y3up8.js` is **154KB raw / 51KB gzipped** and contains `motion`, `framer` and `lucide` strings. It is referenced in the `<head>` of `_not-found.html` — a page with no animation on it at all. Total shared root JS measures ~127KB gzipped; the whole first load lands around 200KB gzipped.

The library is genuinely used in only three places: the division wipe overlay (fires on click), `Reveal` (fires on scroll), and `useReducedMotion`.

**Fix:**
- Split `interactions.tsx`. The transition context provider and `useReducedMotion` are tiny and can stay eager. The wipe overlay — the `motion.g`, the SVG mask, the imported `markPath` — moves into its own module loaded with `next/dynamic` and `ssr: false`, imported only when a transition actually starts.
- Prefetch that chunk on `pointerenter`/`focus` of a `DivisionLink` so it is already in memory by the time the user clicks. The wipe must not stutter or arrive late. **This is the acceptance bar: the transition must feel identical to today, including on a cold load.** If you cannot hit that, say so and leave it eager rather than shipping a worse transition.
- Add `experimental.optimizePackageImports` for `lucide-react` in `next.config.ts` and verify the chunk actually shrinks — do not assume it worked.

**Acceptance:** measured gzipped first-load JS for `/engineering/services` drops by at least 40KB with no visual or behavioural change anywhere. Record before/after.

**B2 · S2 · `Reveal` uses a JS animation library for a fade-and-rise.**

`Reveal` renders `motion.div` with `whileInView={{ opacity: [0.6, 1], y: [20, 0] }}`. This is a scroll-triggered fade-up — CSS handles it natively now via `animation-timeline: view()`, with an `IntersectionObserver` fallback of maybe fifteen lines.

**Fix:** reimplement in CSS with a small progressive-enhancement fallback. The existing `@keyframes fade-up` at `globals.css:2875` is already there. **The visual result must be indistinguishable** — same distance, same duration (0.7s), same easing, same `once: true` behaviour, same `amount: 0.1` trigger point, and it must still respect the `prefers-reduced-motion` block at `globals.css:4004`. Diff a screen recording before and after if you are unsure.

**B3 · S2 · The whole app remounts on every navigation.**

`Experience` renders `<div key={pathname} className="page-enter">`. Changing the `key` forces React to unmount and remount the entire subtree on every route change. That discards all reconciliation, re-runs every effect, and repaints everything.

This is presumably there to retrigger the `page-enter` animation. Get the same visual result without the remount — a CSS animation keyed off a data attribute, or `View Transitions`, or retriggering via `animation-name` reset.

**Acceptance:** the page-enter animation still plays on every navigation, identically, and React DevTools shows the tree updating rather than remounting.

**B4 · S2 · Navigation is artificially delayed by 350ms.**

`interactions.tsx` → `navigate()` does `setTimeout(() => router.push(href), 350)`. Every division link costs a third of a second of deliberate latency before navigation even begins, and Next's prefetch has no chance to help because nothing warms the target route.

**Fix:** start the navigation immediately and let the wipe overlay cover the transition, or at minimum call `router.prefetch(target)` on `pointerenter` so the destination is warm when the timer fires. **The wipe must still read as a full, uninterrupted sweep** — if the page arrives early and the wipe cuts short, that is a regression. Tune it, measure it, and show me the before/after timeline in the log.

**B5 · S3 · ESLint errors in the admin client components.** Two `react-hooks/set-state-in-effect` errors (`src/app/admin/media/media-library.tsx:16`, `src/app/admin/[resource]/structured-editor.tsx:28`), plus a raw `<img>` at `media-library.tsx:45`, plus unused vars at `api/admin/[resource]/route.ts:29` and `division-pages.tsx:35`. Clear all of them. `npx eslint .` must exit clean.

---

### GROUP C — Fonts, images and static assets

**C1 · S1 · A 52KB italic font file is preloaded on every page for seventeen `<em>` tags.**

The prerendered HTML head contains:

```html
<link rel="preload" href="/_next/static/media/inter_latin_wght_italic-….woff2" as="font" crossorigin type="font/woff2"/>
```

That file is **51,832 bytes**, preloaded at high priority on every route, competing with the LCP image for bandwidth. The entire codebase contains 17 `<em>` elements and zero `font-style: italic` declarations in CSS.

**Fix:** drop the italic entry from the `localFont` config, or set it non-preloading. The seventeen `<em>`s can use synthetic oblique — on Inter at display sizes this is visually near-identical, but **check the three most prominent ones yourself at the sizes they actually render** (they appear in `PageIntro` headings, which are large) and if synthesis looks wrong at that size, subset a minimal italic file instead of shipping the full variable axis. Tell me which you chose and why.

**C2 · S2 · The wordmark is a 13KB SVG, tripled, preloaded, and routed through the image optimiser.**

`public/brand/logo-{dark,light,white}.svg` are each 13,347 bytes with 28 `<path>` elements, `clipPath` definitions and outlined font glyphs. `Logo` renders them through `next/image` with `priority`, which emits `<link rel="preload" as="image" href="/brand/logo-dark.svg">` on every page. The logo appears in both header and footer.

**Fix, in order:**
- Run the three files through SVGO with a conservative config. Verify pixel-identical rendering at 1×, 2× and 3× — this is the brand mark, it must not degrade.
- The three variants are probably one shape in three colours. If so, collapse to one file and recolour with `currentColor` + CSS, or inline it as a component.
- `next/image` adds nothing for a local SVG. Use `unoptimized`, or inline the SVG, so it does not round-trip the optimiser.
- Keep `priority` only on the header instance. The footer logo is below the fold.

**C3 · S2 · Source images are heavy and only offered as WebP.**

Twenty-two WebP files, 107KB–371KB each, at 1200×800 or 1536×1024. `next.config.ts` sets no `formats`, no `minimumCacheTTL`, no `deviceSizes`, no `qualities`.

**Fix:** add `formats: ['image/avif', 'image/webp']` and a long `minimumCacheTTL`. AVIF typically lands 30–50% below WebP at matched quality. Re-encode the source files at a quality that holds up at their largest rendered size — several are 1200px wide but never render above ~520 CSS px. **Compare every re-encoded image side by side against the original at 2× before committing.** These are the client's conceptual illustrations; banding or mush in a gradient is not an acceptable trade for kilobytes.

**C4 · S2 · No blur placeholders.** `src/content/visual-image-files.ts` uses static imports, which means `placeholder="blur"` is available for free — Next generates the blur data at build. `ConceptualImage`, `ProjectGallery` and `FounderCard` do not use it. Add it. Images currently pop in against flat `#e8e6e0` blocks.

**C5 · S2 · The homepage LCP image has no priority.** `src/app/page.tsx` renders both division panel images with `fill` and `sizes` but no `priority`. On desktop the engineering panel is almost certainly the LCP element. The `/[division]` hero *does* have `priority` — so the pattern is understood, it was just missed here. Add `priority` to the first panel only; the second is a `fetchPriority="low"` candidate.

**C6 · S3 · Dead weight in the repo.** `image.png` at the repo root is 358KB and referenced nowhere in `src/`. `public/images/natural/` holds 582KB across two files used in one place — confirm that usage (`division-pages.tsx:814`) is live and reachable before keeping them. Delete what is genuinely unreferenced; **list anything you delete in the log** so it can be recovered.

---

### GROUP D — Deploy and build

**D1 · S1 · Every deploy uploads about 150MB of files the site never serves.**

```
assets/   105M    (brochure PDF, source videos, source photography)
doc/       45M    (brand guideline PDF, questionnaires, preview screenshots)
```

There is no `.vercelignore`. Both directories are tracked and both are uploaded in the build context on every single deploy. This is the single largest contributor to deploy time and it buys nothing.

**Fix:** add a `.vercelignore` covering `assets/`, `doc/`, `tests/`, `scripts/`, `*.md` (excluding anything the build genuinely reads), `image.png`. **Verify the build still succeeds afterwards** — `scripts/` and `doc/` may be read at build time by something; check before excluding. Longer term, source assets belong in Drive or Git LFS, not in the deploy context. Flag this as a recommendation, do not migrate it unilaterally.

**D2 · S3 · Build timing.** Baseline was 18.5s compile + 9.9s TypeScript + 1.0s for 37 static pages. That is healthy. Record it and make sure your changes do not balloon it — A1 will *increase* build time by prerendering more pages, which is the correct trade. Note the delta rather than treating it as a regression.

---

### GROUP E — Correctness bugs

These are not performance items. They are things that are wrong, and I found them while looking at performance. Fix them.

**E1 · S1 · The rate limiter will lock out real enquiries site-wide.**

```ts
// src/lib/intake.ts
export function requestKey(request: Request, category: string) {
  const ip = process.env.TRUST_PROXY === "true"
    ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    : "local";
  return `${category}:${ip}`;
}
```

`.env.example` ships `TRUST_PROXY=false`. So unless someone explicitly set it in Vercel, **every visitor on earth shares the key `enquiry:local`**, and `consumeLimit` caps that key at 5 submissions per 10 minutes. The sixth real enquiry from anyone gets a 429 telling them to wait ten minutes.

**Fix:** on Vercel, `x-forwarded-for` is set by the platform and is trustworthy. Either default `TRUST_PROXY` to true in the Vercel environment and document it as a required variable, or key off a Vercel-provided header directly. **Then verify by hand** on the preview: submit six enquiries from one client and confirm the limit engages; submit from a second IP and confirm it does not.

**This one is urgent.** Check whether `TRUST_PROXY` is set in the production environment before you change any code — if it is unset, the contact form has been silently rate-limiting real clients.

**E2 · S2 · The rate limiter is per-instance and therefore mostly decorative.** `counters` is an in-process `Map`. On Vercel's serverless functions each cold instance starts empty, so the limit resets constantly and is trivially bypassed by concurrency. Supabase is already in the stack — a small `rate_limits` table with an atomic upsert, or Vercel KV, gives you a real limiter. Propose the approach in the log, then implement once I confirm.

**E3 · S2 · Newsletter signups may be writing to disk that disappears.** `src/app/api/newsletter/route.ts` falls back to `appendFile` into `NEWSLETTER_DATA_DIR`. On Vercel that filesystem is ephemeral — signups written there are lost on the next cold start. With neither `NEWSLETTER_WEBHOOK_URL` nor the directory set, the route returns an honest 503, which is fine.

**Check which of the three states production is actually in.** If the directory path is set on Vercel, signups have been silently evaporating. Supabase is right there; a `newsletter_signups` table is the correct store. Propose, then implement.

**E4 · S2 · CMS-edited services do not appear on the services page.** `DivisionHome` reads services from the database via `publicServices()` and falls back to static content. But `DivisionPage`'s `services` case renders `<ServiceAccordion services={engineering ? engineeringServices : data.services} />` — always static, never the database. So a service edited in the admin CMS changes the division landing page and not the services page. Route both through the same source.

**E5 · S3 · Deep-link to service 10+ silently fails.** `interactions.tsx` matches `/^#service-(\d)$/` — single digit only. Use `(\d+)` and bounds-check.

**E6 · S3 · The assessment is hardcoded to exactly six questions.** `step === 5`, `max={6}`, `0{step + 1} / 06`, `stageIcons[i % 6]`, `(i + 1) % 6`. Derive all of it from `assessmentQuestions.length`. Adding a seventh question should not require touching the component. **The rendered output must be identical for the current six** — including the zero-padded `01 / 06` format.

**E7 · S3 · The 404 and error pages are dead ends.** `src/app/not-found.tsx` and `src/app/error.tsx` render without `Header` or `Footer`. A visitor who hits a bad URL gets a page with exactly one link on it. Add the header and footer so they match the rest of the site. This is the one place where I *do* want the visuals to change — because right now they are inconsistent with everything else.

**E8 · S3 · Numeral treatment is inconsistent with the refinement pass.** `REFINEMENT_PASS.md` specified dropping bare numerals in favour of the icon family. In the copy I inspected, `ServiceAccordion` still renders `<span className="service-index">0{i + 1}</span>` for engineering, `ProjectApproach` renders `<span>0{i + 1}</span>` for asset management, and `ConvergenceDiagram` renders `<b>0{i + 1}</b>`.

**Do not fix this on your own initiative.** Check whether the refinement pass landed in the current HEAD. If it did, these are the survivors and they need the same treatment — but confirm with me first, because it is a visual change and the refinement brief may have deliberately scoped some of them out.

---

### GROUP F — Accessibility and interaction polish

**F1 · S2 · Focus visibility is inconsistent.** 927 rule blocks in `globals.css`, only 7 mentioning `:focus` or `:focus-visible`. Tab through every interactive element on every route — links, buttons, the mobile menu toggle, the capability journey tablist, accordion headers, all form fields, the assessment radio labels, the cookie banner — and confirm each has a visible, sufficiently-contrasting focus indicator. Add a single consistent `:focus-visible` treatment using the existing accent tokens. Do not add default browser outlines on top of custom styling; make one deliberate treatment and apply it globally.

**F2 · S2 · The mobile menu has no focus management.** `Header` handles Escape correctly, but when the nav opens: focus is not moved into it, focus is not trapped, background content is not inert, and body scroll is not locked. On a small screen a keyboard or screen-reader user tabs straight out of the open menu into the page behind it.

**F3 · S3 · The accordion cannot animate.** `ServiceAccordion` uses the `hidden` attribute on the panel, which forces `display: none` and makes any open/close transition impossible. If the current instant snap is the intended design, leave it and say so. If it is meant to ease, move to a `grid-template-rows: 0fr → 1fr` technique. **Ask before changing** — this is visible behaviour.

**F4 · S3 · `scroll-padding-top: 155px` is a fixed value** against a header whose height changes across breakpoints. Anchor links on mobile may land with the heading tucked under the header. Test `/asset-management/services#service-5` and every in-page anchor at 390px, 768px and 1440px. Make it responsive if it is wrong.

**F5 · S3 · The cookie banner causes layout shift.** `AnalyticsConsent` reads `localStorage` in an effect and renders the banner after hydration. Reserve its space or animate it in from outside the viewport so it does not contribute to CLS. Measure CLS before and after on a first visit with cleared storage.

**F6 · S2 · Extend axe coverage.** Only two specs currently run `AxeBuilder`, over a limited route set. Extend to every public route on both the desktop and mobile Playwright projects, with the open mobile menu and the assessment's result state as explicit test states. Zero serious or critical violations is the bar.

---

### GROUP G — Headers

**G1 · S3 · No Content-Security-Policy.** `next.config.ts` sets `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` and `Permissions-Policy` — good, and `poweredByHeader` is off. CSP is the notable gap.

**Draft it, do not deploy it blind.** It has to accommodate Next's inline bootstrap, Google Tag Manager (only after consent), Supabase, and the image optimiser. Ship it in `Content-Security-Policy-Report-Only` first, gather violations across every route including the admin CMS and the media uploader, then promote to enforcing. A CSP that breaks the client's admin panel is worse than no CSP.

---

## 3. Discover what I missed

I audited statically. You can run the thing. Go and find what I could not:

- **Lighthouse and WebPageTest** on all six baseline routes, mobile throttled, and chase every opportunity over 100ms.
- **Real interaction profiling** — record a performance trace while triggering the division wipe, opening the mobile menu, running the full assessment, and scrolling `/asset-management/sectors` end to end. Look for long tasks, forced reflow, and dropped frames. The sectors page renders up to nine large images with a `Reveal` on each; that is the most likely place for jank.
- **Coverage analysis** in Chrome DevTools on `globals.css` (4,025 lines, 927 rule blocks, 19 `!important`). Report the unused percentage per route. Do not delete anything on coverage alone — a rule can be unused on one route and essential on another, and there are hover and state-dependent rules coverage will not catch. Report, then propose.
- **Cross-browser**: Safari (desktop and iOS) and Firefox. The site uses `clip-path`, SVG masks, `aspect-ratio`, `<meter>`, `<progress>` and `<details>` styling — all of which have historically diverged in Safari. The assessment results `<meter>` elements in particular are worth checking.
- **Throttled network**: Slow 4G, and 3G. This is a Uganda-facing site; assume a meaningful share of visitors are on constrained mobile connections and high-latency links to whatever region the Supabase project sits in. **Check which region that is** — if the database is in `us-east-1` and the functions are elsewhere, every uncached read pays a transcontinental round trip, and A1 becomes even more valuable than the numbers suggest.
- **Every button and link on every route.** Click all of them. Confirm the destination is right, external links open correctly with `rel="noopener noreferrer"`, `mailto:`/`tel:`/WhatsApp links are correctly formatted, and nothing 404s. Build a route-by-route checklist in the log. Pay attention to `/portal` (deliberately a scaffold — confirm it still reads as intentional, not broken), and to `?sector=` and `?assessment=` query-param handoffs into the contact form.

Add anything you find to the register with the same structure, and flag it before fixing if it touches visuals.

---

## 4. Targets

These are the numbers this pass is judged against. Measure on the deployed preview, mobile preset, throttled.

| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 95 every audited route |
| Lighthouse Accessibility | 100 |
| Lighthouse Best Practices | 100 |
| Lighthouse SEO | 100 |
| LCP | < 1.8s |
| CLS | < 0.05 |
| INP | < 150ms |
| TBT | < 150ms |
| First-load JS (gzipped) | < 130KB shared |
| axe serious/critical violations | 0 |
| `tsc --noEmit` | clean |
| `eslint .` | clean |
| `npm test` + `playwright test` | all passing |

On "99% efficiency": there is no single metric that reads that. The table above is what it decomposes into, and it is a harder bar than a round number. If you hit every row you are at the top of what this stack allows.

Where a target is genuinely unreachable — a third-party script, a platform constraint, a trade-off that would cost visual quality — **say so explicitly with the reason and the measured ceiling**. Do not quietly miss it, and do not game a score at the cost of how the site actually feels. A 100 on a site whose transition now stutters is a failure.

---

## 5. What you hand back

1. `doc/HARDENING_BASELINE.md` — every before-number, committed before any fix.
2. `doc/HARDENING_LOG.md` — the full register, worked finding by finding, with reasoning, before/after evidence, and explicit notes on anything deliberately not done.
3. `doc/HARDENING_SUMMARY.md` — a short client-readable summary: what was slow, what was fixed, what improved by how much, in plain language and no jargon. This one may go to Darren and Derrick.
4. Clean commit history, one finding (or tight cluster) per commit, each message naming its finding ID.
5. A single list at the top of the log: **every change that has any visual effect at all**, however small, so it can be reviewed in one pass before anything ships.

---

## 6. Questions to raise before you start

Answer these in the log, and stop and ask where I have said to ask:

1. Is `TRUST_PROXY` currently set in the Vercel production environment? (E1 — check this first, it may be actively affecting client enquiries.)
2. Is `NEWSLETTER_DATA_DIR` set in production, and if so, have any signups already been lost? (E3)
3. Which Supabase region hosts the project, and which region do the Vercel functions run in?
4. Did the `REFINEMENT_PASS.md` numeral changes land in the current HEAD, or are the `0{i+1}` instances I found the originals? (E8)
5. Is the service accordion's instant open/close intentional, or was it meant to ease? (F3)
6. Is anything in `assets/` or `doc/` read at build time, or are both directories genuinely deploy-only dead weight? (D1)

---

## 7. The standard

Everything on this site was built to be defensible. The split-screen concept came out of the brand's own logo geometry; the assessment tool is a working scoring engine rather than a mock; the portal scaffold is honest about what it is instead of faking a login. Hold this pass to the same standard.

That means: no fix you cannot explain, no number you cannot reproduce, no change you would not defend to the client. When a performance gain and the quality of the experience pull against each other, the experience wins — and you write down the trade you made and why.

Make it faster. Leave it exactly as good.
