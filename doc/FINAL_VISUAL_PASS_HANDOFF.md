# Final visual pass — 30 September 2026

Implemented from the live production source, commit `f21f01cfc1d5884ad9c205c1ca2fd3624af74812`, verified through GitHub's successful Production deployment record `6697421178` and direct browser comparison with dreniak-site.vercel.app. The supplied `FINAL_VISUAL_PASS.md` is the governing brief.

The active implementation is in `D:\PROBOOK\DreniakSite`. Superseded local files were preserved in `tmp/superseded-visual-work-20260930`, with a manifest. Archived TypeScript files have `.txt` appended to keep them outside the active build. The unrelated local ISK image and photography edit were preserved there; the active photography registry uses the production version. No admin database files were edited.

## Changes

- Original homepage composition, Inter typography, copy, colors, navigation, motif transition, and footer retained. No standalone facts section or new font remains from the superseded work.
- Division labels use 12px, weight 550, uppercase, .09em tracking, muted brand tones, transparent backgrounds, no border or pill, and thin separators. Dark photographic fields use a readable step of the same brand ramp.
- Generated parent-panel and division-hero images have scroll-linked scale and a slow 22-second pan/zoom. Motion pauses offscreen and when the document is hidden. Reduced-motion preferences disable it.
- Real photography retains its complete composition and contain sizing. The user's subsequent instruction restores original image colours: grayscale filters, duotone overlays and sector-image colour blending are removed. Original image files, alt text, captions and image motion remain intact.
- The six-stage Asset Management journey pins while scrolling, updates a slim progress indicator, and crossfades its existing descriptions. Click and keyboard controls remain available; reduced motion uses the compact manual version.
- Desktop case studies use sticky introductions, metadata and existing status values beside the four-part narrative. Mobile retains the original content order. All three production case studies have no assigned images; none were invented or borrowed.
- Services and Sectors share a 2px muted accent hover/focus edge. Sectors reveal their already assigned image at 6% opacity. Cards without an assigned image retain the accent interaction.
- Reveal motion uses 550ms ease-out, 20px movement and 70ms sibling stagger. Content is visible before JavaScript runs.
- Corrected production's orphan grids in Engineering service previews, sectors, project photography and mobile values, plus odd service inclusion lists.
- Replaced a Partners icon selector function with a stable icon map to satisfy the current React lint rule. The rendered icons and words are unchanged.

## Verification

- Production build, ESLint and TypeScript passed.
- Direct comparison: 29 live routes at 1440px and 390px, 58 local views. Zero main-copy differences, page errors, horizontal overflows, empty sections or orphaned grids detected.
- Every journey state and every Services accordion state compared with the captured live version: identical words.
- Browser suite: 27 passed, 1 intentional mobile-hover skip. Includes all public routes, division switching, assessment, form feedback, deep links, metadata, photo containment, label styles, pinned journey and split case studies.
- Automated WCAG A/AA checks passed across 17 key routes at desktop and mobile widths. The final journey adjustment also passed accessibility/overflow checks at 320px, 768px and 1440px, plus four repeated journey interaction/reduced-motion tests.
- Hero motion verified in-browser: scroll scale changes continuously and the 22-second drift is active. Reduced-motion tests confirm static imagery.
- Live and local screenshots were reviewed, including the pinned desktop/mobile journey and sticky case-study narrative. No website text or content data was edited.

Evidence is in `tmp/final-live` and `tmp/final-pass`: reports, screenshots, interaction captures and comparison results. Local production preview: http://localhost:3001. No commit, push or deployment was performed.
