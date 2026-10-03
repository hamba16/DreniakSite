# Dreniak final round, 3 October 2026

Implemented in `D:\PROBOOK\DreniakSite`, branch `main`. The seven requested tasks have separate local commits, in the requested order. No push, deployment, CMS mutation or database migration was performed. The pre-existing `next-env.d.ts` working-tree change remains outside these commits.

## Changes and review points

| Brief section | Local commit | Files and result |
| --- | --- | --- |
| 7. Gallery removal | `94bdf8b` | `src/content/projects-gallery.ts`, `src/app/editorial.css`, `tests/e2e/projects-gallery.spec.ts`, both `docs/image-manifest` files; deleted the identified image file. Eight retained entries; final tile closes each responsive grid. |
| 1. Natural imagery | `7a9cd55` | `src/content/homepage-imagery.ts`, `src/app/{page.tsx,final-imagery.css,sitemap.ts,credits/page.tsx}`, `src/components/{cinematic-image.tsx,division-pages.tsx,shared.tsx}`, two new `public/images/natural/*-natural-v1.webp` files and the prompt/provenance records linked below. Both parent panels and both division heroes use the new images. |
| 2. Asset Prism | `6c927e8` | `src/components/asset-prism.tsx`, its CSS module, `interactions.tsx`, `tests/e2e/{asset-prism,final-visual}.spec.ts`. One component supplies both placements; CSS 3D with no new library. |
| 3. Engineering content | `e9b8ce5` | `src/components/division-pages.tsx`, `engineering-service-plates.tsx` and its CSS module, `src/app/editorial.css`. Added restrained introductions to thin sections and two different supplied images beside existing service content. Substantive About, Approach and Contact copy preserved. |
| 4. Careers | `4016ad5` | `src/app/careers/page.tsx`, `src/content/careers.ts`, `src/components/career-roles.tsx` and CSS module; navigation/shared components, `next.config.ts`, sitemap, site route list and relevant tests. Shared `/careers`, five illustrative role cards, Open Applications and permanent legacy redirects. |
| 5. Partners | `f5449cd` | `src/content/partners.ts`, `src/app/partners/page.tsx`, `docs/final-round-partner-sources.md`. Approved entries use the existing public partner shape and merge with published CMS content, without writing to the CMS. |
| 6. Flowlines/theme | `d0e1d0e` | `src/components/{brand,flow-mark,convergence-diagram,image-leaflet,signature-gallery,team-portrait-fallback,shared,division-pages,engineering-pages,interactions}.tsx`, `src/app/{brand-flow.css,layout.tsx,page.tsx,partners/page.tsx,partners/partners.module.css}`, `tests/e2e/final-round.spec.ts`. Reusable `flow` option and consistent red-led shared theme. |

The client's additional screenshot was handled in local commit `9e23bc9`: removed `apartment-skyline`, title “Apartment elevations beneath a cloudy sky”, and file `building-d-apartment-block-complete-straight-01.jpeg`. Its historical provenance is withdrawn. Updated the same gallery data, CSS, manifests and interaction test. The final gallery contains **seven** photographs; the final pair fills the desktop row and the two-column tablet row. Test counters derive their total from the gallery data and explicitly check first/last wraparound.

Supplementary commits: `537696c` removes the two generic division `loading.tsx` boundaries that hid static content without JavaScript, stabilises Prism hydration dimensions and completes stage-specific icon motion; `1be003a` prevents inactive decorative icons contributing layout shift. Specific project/insight detail loading boundaries remain. `de73535` covers the large footer background motif while preserving static linked logos. `ad87cdd` corrects Careers panel semantics and the duplicate Partners landmark name. `09eb8db` corrects the unit-test fixture path to the existing `src/supabase/migrations` location; no SQL changed.

## Local browser evidence

The production server was tested at `http://localhost:3100`. The reusable capture runner is [scripts/verify-final-round.cjs](../scripts/verify-final-round.cjs). Screenshots and machine-readable results are local ignored artifacts in [tmp/final-round/production](../tmp/final-round/production/), including [evidence.json](../tmp/final-round/production/evidence.json). Re-run with `node scripts/verify-final-round.cjs` after starting the production server; `TEST_BASE_URL` can override the address.

| Width | Parent panels | Engineering hero | Asset hero | Home Prism | Approach Prism | Gallery |
| --- | --- | --- | --- | --- | --- | --- |
| 360 | [PNG](../tmp/final-round/production/panels-360.png) | [PNG](../tmp/final-round/production/engineering-hero-360.png) | [PNG](../tmp/final-round/production/asset-management-hero-360.png) | [PNG](../tmp/final-round/production/home-prism-360.png) | [PNG](../tmp/final-round/production/approach-prism-360.png) | [PNG](../tmp/final-round/production/gallery-360.png) |
| 390 | [PNG](../tmp/final-round/production/panels-390.png) | [PNG](../tmp/final-round/production/engineering-hero-390.png) | [PNG](../tmp/final-round/production/asset-management-hero-390.png) | [PNG](../tmp/final-round/production/home-prism-390.png) | [PNG](../tmp/final-round/production/approach-prism-390.png) | [PNG](../tmp/final-round/production/gallery-390.png) |
| 768 | [PNG](../tmp/final-round/production/panels-768.png) | [PNG](../tmp/final-round/production/engineering-hero-768.png) | [PNG](../tmp/final-round/production/asset-management-hero-768.png) | [PNG](../tmp/final-round/production/home-prism-768.png) | [PNG](../tmp/final-round/production/approach-prism-768.png) | [PNG](../tmp/final-round/production/gallery-768.png) |
| 1024 | [PNG](../tmp/final-round/production/panels-1024.png) | [PNG](../tmp/final-round/production/engineering-hero-1024.png) | [PNG](../tmp/final-round/production/asset-management-hero-1024.png) | [PNG](../tmp/final-round/production/home-prism-1024.png) | [PNG](../tmp/final-round/production/approach-prism-1024.png) | [PNG](../tmp/final-round/production/gallery-1024.png) |
| 1440 | [PNG](../tmp/final-round/production/panels-1440.png) | [PNG](../tmp/final-round/production/engineering-hero-1440.png) | [PNG](../tmp/final-round/production/asset-management-hero-1440.png) | [PNG](../tmp/final-round/production/home-prism-1440.png) | [PNG](../tmp/final-round/production/approach-prism-1440.png) | [PNG](../tmp/final-round/production/gallery-1440.png) |
| 1920 | [PNG](../tmp/final-round/production/panels-1920.png) | [PNG](../tmp/final-round/production/engineering-hero-1920.png) | [PNG](../tmp/final-round/production/asset-management-hero-1920.png) | [PNG](../tmp/final-round/production/home-prism-1920.png) | [PNG](../tmp/final-round/production/approach-prism-1920.png) | [PNG](../tmp/final-round/production/gallery-1920.png) |

Desktop panel hover states: [Engineering](../tmp/final-round/production/panels-hover-engineering.png), [Asset Management](../tmp/final-round/production/panels-hover-asset-management.png). Additional full-content captures cover [Services](../tmp/final-round/production/engineering-services-1440.png), [Careers](../tmp/final-round/production/careers-1440.png), [Partners](../tmp/final-round/production/partners-1440.png), [Credits](../tmp/final-round/production/credits-1440.png) and [Story](../tmp/final-round/production/story-1440.png).

Motion-enabled hero captures: [Engineering](../tmp/final-round/production/engineering-hero-zoom-1440.png), [Asset Management](../tmp/final-round/production/asset-management-hero-zoom-1440.png). These isolated section screenshots suppress fixed header/skip-link overlays during capture so those controls do not obscure the middle of a long section. Gallery tiles are scrolled into view first to trigger their existing reveal behaviour. This is a screenshot-only adjustment, not a site style change.

## Interaction and content checks

- Prism: all six selections, unchanged explanations/order/service links, one accessible active panel, roving tab focus, Left/Right/Home/End, wraparound, and permanent auto-advance stop after interaction. Both placements use `CapabilityJourney`. No JavaScript: all six native anchor destinations and service links are reachable by keyboard. JavaScript fallbacks tested for reduced motion, Save-Data, memory <=2GB, cores <=2 and unsupported `preserve-3d`. Missing hints safely use the capable tier. Mouse drag and CDP touch input were exercised separately; horizontal swipes select and vertical touch drags move the actual page without changing selection.
- Careers: both legacy routes return HTTP 308 to `/careers`; division navigation reaches the same page. All five role cards and keyboard controls pass. Existing `info@dreniak.com` is used with subject `Open application: [role] / [your name]`. Examples are explicitly illustrative, with no vacancy, pay or programme guarantee. Published openings, when present, render above Open Applications.
- Shared theme: entered from both divisions, refreshed, then traversed with back/forward. The shared red accent remains `#991923`; no arrival-history or referrer state is used. Division palettes remain independent.
- Gallery: removed stable ID `columned-facade`, title “Columns, arches and balcony rhythm”, file `building-e-ornate-apartment-complete-angle-01.jpeg`, followed by the additionally requested `apartment-skyline` image. Historical provenance is withdrawn, not silently erased. Seven entries remain, with contiguous counters, first/last wrap, keyboard opening, focus trapping/restoration and touch controls checked at all six widths.
- Partners: AG Rosa uses the existing architectural-rendering descriptor. NK Udada Foundation uses the client-confirmed Community partner label and the supplied sourced description. DBAM's rendered card contains exactly `DBAM`, with no paragraph, logo, link or relationship label. See [partner sources](final-round-partner-sources.md).

All seven retained gallery entries still have unconfirmed location and Dreniak relationship. Their captions were preserved: `concrete-front`, `hillside-construction`, `stone-masonry-wide`, `concrete-front-detail`, `stone-masonry-side`, `townhouse-front`, `apartment-towers`. The two service-plate images retain the same limitation; neither is presented as a verified Dreniak project.

## Decorative-mark audit

Sizes below are approximate CSS pixels at a 1440px viewport unless a responsive CSS rule is given. `evidence.json` records individual rendered instances. A zero measurement means existing CSS hides that instance, not that it was made visible for this round. Animation is conditional on visibility, tab state and motion preference.

| File/component | Route/instance | Size | Position | Flow |
| --- | --- | --- | --- | --- |
| `app/page.tsx`, Mark | `/`, hero arc | 984 x 892 | Inside positioned hero arc | Yes |
| `app/page.tsx`, Motif | `/`, premise | About 1084 x 1492 after inherited transform | Absolute background | Yes |
| `app/page.tsx`, Mark | `/`, closing band | 42 x 36 | Inline flex | Yes, explicitly requested |
| `components/shared.tsx`, Footer/Motif | All public footers | Responsive background, within right 30% | Absolute background | Yes; footer linked Logo remains static |
| `components/shared.tsx`, CTA/Motif | Division CTA sections and Story | Existing CSS hides some instances (0 x 0) | Absolute | Yes when displayed |
| `components/division-pages.tsx`, story Mark | `/story` and division About content | 155 x 133 | In first content column | Yes |
| `components/engineering-pages.tsx`, EngineeringAbout Mark | Engineering overview component | Inherits story-section width, 155px desktop | First content column | Yes |
| `components/convergence-diagram.tsx` | Story and both division About surfaces | Five layers about 117–148 x 101–134; final 98 x 85 | Layered centre; final absolute | Yes, all six |
| `components/division-pages.tsx`, assessment art | Asset home teaser | 75px wide, responsive | Inside assessment diagram | Yes |
| `components/shared.tsx`, ProjectApproach | Both division Projects | Asset 300 x 258; Engineering hidden behind existing photograph | Absolute in project placeholder | Yes when displayed |
| `components/division-pages.tsx`, insights empty | Both division Insights | 240 x 207 | Background within empty state | Yes |
| `components/division-pages.tsx`, contact aside | Both division Contact | 120 x 103 | Inline within aside | Yes |
| `components/division-pages.tsx`, approach study | Both division Approach | 584 x 503 | Inside study figure | Yes |
| `components/division-pages.tsx`, portal Motif | `/portal` | 463 x 320 | Absolute introductory background | Yes |
| `app/partners/page.tsx`, hero Motif | `/partners` | 547 x 328 | Absolute hero background | Yes |
| `app/partners/page.tsx`, empty-category Motif/Mark | `/partners`, remaining empty categories | 506 x 245 motif; 68 x 59 mark | Absolute within category | Yes |
| `app/partners/page.tsx`, closing Motif | `/partners` | 750 x 237 | Absolute closing background | Yes |
| `components/image-leaflet.tsx`, watermark | Shared cover-image dialog | `clamp(90px,16vw,190px)` wide | Top 8%, right 7% | Yes; existing portrait/contain modes hide it |
| `components/signature-gallery.tsx`, empty-image brand | Shared galleries, only when an image is absent | `min(24%,180px)` wide | Centred absolute layer | Yes |
| `components/team-portrait-fallback.tsx`, motif | Leadership fallback, only if no portrait | Width of container inset 12% | Absolute behind initials | Yes |
| `components/interactions.tsx`, Header; parent panel marks; shared Footer Logo | Public navigation | Existing small functional sizes | Header/panel/footer links | Static |
| `components/shared.tsx`, Standards Mark | Standards emblem | 32px wide | Informational emblem | Static |
| `components/interactions.tsx`, division wipe | Temporary navigation transition | Existing responsive width | Fixed transition overlay | Existing transition only; no continuous flow |
| `app/not-found.tsx`, status Mark | 404 | 80px wide | Inline status illustration | Static small status mark |

Flow uses four phased copies of the flattened brand path, edge fading, stroke-dash movement and transform-only drift/parallax. No animated blur or SVG filters. Offscreen pause and static reduced-motion behaviour were browser-tested. Hidden-tab handling is tested by a synthetic `document.hidden`/`visibilitychange` event; this is not a claim of an operating-system background-tab test. Decorative SVGs are hidden from accessibility APIs and ignore pointer input.

## Imagery and provenance

[Generation metadata and prompts](final-round-image-prompts.json) and [selection/export record](final-round-imagery.md) record five candidates/revisions, generation date, original output filenames and rejection reasons. Native 1536 x 1024 images were proportionally enlarged to 2400 x 1600 and exported WebP at quality 80. Engineering is 229,050 bytes; Asset Management is 168,270 bytes, both below the requested approximate 250–450KB band. Model identifiers and seeds were not exposed by the tool.

Both new images are disclosed as AI-generated conceptual imagery on `/credits` and in alt text. There was no credits route to update, so one was added and linked from the footer/sitemap. The image-wash backgrounds are neutral, resting opacity is .9 and hover is 1. Supplied building photography was not given new cinematic motion. No external service photograph was added; existing supplied assets were reused, so there is no new external licence to certify. Existing licensed-photo metadata is retained on Credits.

Crop inspection is visual at the six requested widths with real overlays. It is not a measured proof that every infrastructure feature lies inside precisely the central 40% of the source image. The images remain conceptual, and their native resolution and file-size deviations are disclosed rather than represented as native 2400px photography.

## Validation and limits

Final measured results are recorded below after the production run. Browser checks use Chromium and a touch-capable emulated viewport, not a physical low-end Android device or assistive-technology session. Automated accessibility findings do not certify the whole site. No Lighthouse score, live deployment, email delivery or database write is claimed.
