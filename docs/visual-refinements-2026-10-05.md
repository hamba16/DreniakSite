# Visual refinements, 5 October 2026

## DBAM identity

- Official website and destination: https://dbamsocialcare.co.uk/
- Original logo: https://dbamsocialcare.co.uk/wp-content/uploads/2024/10/dbam-logo.png (488 × 100, transparent PNG).
- Enhanced asset: `public/partners/dbam-social-care-enhanced.png` (1960 × 802, transparent PNG with clear space).
- Created with the built-in image generation tool using the official logo as the edit target. It is an AI-assisted enhancement, not an official vector master. The directory retains the approved name “DBAM” and adds no relationship or service claims.
- Prompt: “Enhance and upscale this exact official DBAM Social Care logo to a crisp high resolution transparent PNG, about 1952 by 400 pixels, maintaining its exact wide aspect ratio. Preserve the exact design, shapes, hand and heart illustration, all original gradients and colors, typography, letter spacing, composition and proportions. Exact text: DBAM Social Care. This is faithful restoration of an existing corporate logo, not redesign. Remove pixelation and stair-step edges, reconstruct clean precise edges. No added elements, no shadows, no background, no cropping. The reference is the sole edit target.”

## Homepage image delivery

The existing 2400 × 1600 WebP files were enlarged from 1536 × 1024 generated artwork and encoded at quality 80 (see `final-round-imagery.md`). The new homepage-only files are lossless WebP encodings of those same native PNG originals, without resizing, recoloring, or cropping:

- `public/images/natural/engineering-crossing-native-v2.webp`: original `exec-ad597c2f-b514-4431-9bf6-813c8d230d82.png`.
- `public/images/natural/asset-corridor-native-v2.webp`: original `exec-cb9928a6-50da-47cb-b8dc-cf07ec395656.png`.

Next Image serves responsive derivatives at quality 90. The `sizes` calculation accounts for the 3:2 artwork covering tall panels: at 390px wide, a 600px-tall panel needs at least 900px of image width before cropping. Previously the browser selected 640px at 1× density. The panel-only zoom transforms are disabled; panel dimensions, layout, text, focal positions and hover expansion remain intact. Division hero sources and motion remain unchanged. This improves delivery fidelity; it does not invent additional detail beyond the native artwork.

## Other refinements

- Shared ImageLeaflet details use a thin translucent scrollbar with a transparent track; overflow remains scrollable.
- Careers discipline header uses a pale red background, muted red text, and an inset red edge without changing dimensions or tab interaction.
- Homepage “Leadership” links to the existing `/story#leadership` section, using the site's existing responsive scroll offset.

## Local verification

Browser evidence and screenshots: `tmp/visual-refinements/`. The focused verifier covers 390, 768, 1440 and 1920px widths, before/after homepage panel dimensions, image delivery, leadership navigation and portrait viewing, all five careers tabs and keyboard wrapping, careers accessibility, DBAM logo/link, and sector viewer attribution scrolling and focus restoration.

Passed: focused browser verifier (all four widths, zero recorded page/console errors); desktop/mobile partner regression and Partners/Careers accessibility checks (6 tests); TypeScript; targeted ESLint; production build; `git diff --check`. Normal-motion, 2× density checks at 390 and 1440px also confirmed higher-resolution image selection and no extra panel zoom. Homepage panel widths/heights matched the pre-edit baseline exactly. Verification was local; no deployment was performed.
