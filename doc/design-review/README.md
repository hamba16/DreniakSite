# Leadership and project-label implementation

Implemented locally on 2026-09-17 following the user's instruction to complete the task after the A/B samples were presented. The earlier recommendation is applied: backdrop B (center-light vignette), quiet status dots, and the proposed team placement.

## Implemented

- `/story`: all four people with exact supplied names, roles, scope and contacts; stable individual anchors.
- `/engineering/about`: Darren, Derrick and Jude; red portrait treatment. Darren links to his full shared entry without duplicated contact details.
- `/asset-management/about`: Darren with indigo portrait treatment and a link to his full shared entry.
- Shared/company portraits use indigo; Engineering portraits use red. The existing mirrored-arc SVG appears at 6% opacity at the edges, fading toward the center over warm off-white.
- Project listing and all three case studies use a shared category/location/status component. Categories and capabilities have tinted fills and borders; location and status use quiet text with colored dots. Existing tag destinations are preserved.
- Sector values previously styled as status badges now use category styling. Duplicate sector/location rows on case-study details are consolidated into the existing top metadata row.
- Both portrait directions and both status treatments remain at `/design-review` on the local development server (currently http://localhost:3000/design-review). This route is noindex and returns not-found outside development.

Comparison artifacts: [portraits](portrait-directions.png) and [project labels](project-label-directions.png). These captures record the original comparison, not the final shared team layout.

## Content and photo handoff

`src/content/leadership.ts` is the single source for team records. The user subsequently confirmed Derrick's number, +256 704 175 005, for his story-page card. It links to `tel:+256704175005` and is omitted from his Engineering card. Tania and Jude have no invented contact details.

Add a transparent portrait cutout using `portrait.src` and optional `portrait.position`. Portrait and initials share the exact same frame and patterned backdrop. An opaque photo requires background removal for the digital backdrop to remain visible behind the person. No real headshots were supplied or tested.

## Scope

Existing unrelated uncommitted changes to homepage/story copy, logo sizing, shared copy and brief content were preserved. No commit, push or hosted deployment was performed.

## Verification

- TypeScript passed.
- All eight existing tests passed.
- Lint of changed implementation files: no errors; one pre-existing unused `insights` import warning in `division-pages.tsx`.
- Browser checks passed for `/story`, both division About pages, the Asset Management project listing and all three case studies.
- Widths 1440, 390 and 320: no horizontal overflow after responsive layout settled.
- Exact shared team names/contact hrefs, division membership counts, absence of duplicated Darren phone links and cross-page Darren anchor navigation passed.
- Browser page errors: none. Computed category colors verified as indigo `rgb(13, 50, 81)` on project pages and red `rgb(153, 25, 35)` in the Engineering comparison context. Engineering has no equivalent published case-study pages; no project was invented.
- Desktop/mobile screenshots inspected for team and project listing layouts.
- Production build passed (38 pages generated). No hosted deployment verification was performed.
