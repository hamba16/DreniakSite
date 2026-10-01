# Project gallery implementation audit — 1 October 2026

The original implementation contained the main requested interactions, but its uniform presentation, repeated facade views, image descriptions, cropped portraits, and limited verification did not deliver the visual ambition of the brief. The gallery now has a dark photographic stage, a paired hero composition, a large two-line heading, and an asymmetric photographic index. This is the second visual pass following the user's feedback.

## Final implementation

- The hero reaches the edges of the existing page content container. Its overall ratio is 21:9 at desktop widths, 16:9 on tablet, and 4:5 on mobile. Desktop/tablet pair the active photograph with a clickable next-frame preview; mobile concentrates on one photograph.
- Nine inspected B-rated photographs replace the repetitive sequence. The index varies scale across a twelve-column desktop grid; tablet photographs are grouped into complete rows; mobile uses one column. Every index photograph retains its actual source aspect ratio.
- Captions, frame numbers, and directional arrows sit below the photographs. Text stays visible during image reveals, avoiding transient low contrast. A neutral provenance notice remains visible before the hero and in the viewer.
- Corrected descriptions where filenames and inventory subjects disagree, including the hillside photograph and apartment towers. No client, location, project name, or delivery attribution was invented. Original image files and inventory documents were retained.
- Hero autoplay uses a 6.5-second dwell, 900ms crossfade, and CSS 1–1.04 drift. Hover, keyboard focus, an open viewer, reduced motion, explicit pause, and a hidden tab pause autoplay. Controls remain operable while paused.
- Fine pointers get a 1.06 image zoom and a circular View badge moved with CSS transforms relative to the photograph. Touch interaction opens the viewer directly. Image reveals use IntersectionObserver with an 80% viewport trigger and 60ms stagger.
- Reduced motion removes drift, zoom, cursor following, and reveal translation; photograph opacity transitions shorten to 150ms. Index captions stay visible throughout reveals.
- Native fullscreen dialog supports close, Escape, arrow-key navigation, Tab/Shift+Tab focus containment, focus restoration without scrolling, and horizontal swipes. Images use contain and remain within 90vw/90vh; adjacent photographs preload optimized responsive URLs. Scroll lock compensates for the scrollbar.
- Uses next/image, existing typography and CSS, and existing navigation. No new dependency, CDN, image asset, or animation library was added. The first hero image is eager with high fetch priority; other photographs load lazily.

## Production verification

Local production build and TypeScript compilation passed. Targeted ESLint and diff whitespace checks passed. Twenty interaction checks passed across desktop/mobile browser projects. Twelve layout/accessibility checks passed again after extending the hero to the container edges. A final cursor-coordinate probe and five-width screenshot/axe capture passed after the cursor adjustment.

At 390, 768, 1024, 1440, and 1920 pixels: no horizontal overflow, no browser page errors, all nine index images loaded, and zero axe violations on the page and open viewer. Tests cycle every photograph through the viewer at each width, check viewport fit, and cover keyboard-only entry, focus return, swipe direction, autoplay dwell/pause, and reduced motion. Screenshots were inspected for layout and framing.

| Width | Gallery | Viewer |
| --- | --- | --- |
| 390 | [Screenshot](../tmp/gallery-audit/after-gallery-390.png) | [Screenshot](../tmp/gallery-audit/after-lightbox-390.png) |
| 768 | [Screenshot](../tmp/gallery-audit/after-gallery-768.png) | [Screenshot](../tmp/gallery-audit/after-lightbox-768.png) |
| 1024 | [Screenshot](../tmp/gallery-audit/after-gallery-1024.png) | [Screenshot](../tmp/gallery-audit/after-lightbox-1024.png) |
| 1440 | [Screenshot](../tmp/gallery-audit/after-gallery-1440.png) | [Screenshot](../tmp/gallery-audit/after-lightbox-1440.png) |
| 1920 | [Screenshot](../tmp/gallery-audit/after-gallery-1920.png) | [Screenshot](../tmp/gallery-audit/after-lightbox-1920.png) |

Tests: [projects-gallery.spec.ts](../tests/e2e/projects-gallery.spec.ts). Machine evidence: [after.json](../tmp/gallery-audit/after.json). Build log: [build-after.log](../tmp/gallery-audit/build-after.log).

## Lighthouse and JavaScript

Lighthouse 13.5.0 / Chromium 153 against local production builds. The before samples use the preserved original gallery snapshot; after samples use the final art direction. These are individual local measurements, not a deployment certification.

| Profile | Before performance | After performance | Before accessibility | After accessibility | After CLS |
| --- | ---: | ---: | ---: | ---: | ---: |
| Mobile | 69 | 90 | 100 | 100 | 0.000 |
| Desktop | 100 | 100 | 100 | 100 | 0.000 |

The final sampled performance and accessibility scores meet the requested numeric gates. Mobile LCP: 3.61 seconds. Prior local baseline samples varied from 65 to 93. Intermediate runs sometimes showed the shared route loading fallback exposing the footer before streamed content, causing layout shift. Consistent production performance requires broader validation; shared loading/layout was not rewritten in this gallery pass.

- [Before mobile](../tmp/gallery-audit/lighthouse-before-mobile-final.json), [after mobile](../tmp/gallery-audit/lighthouse-after-mobile-art.json)
- [Before desktop](../tmp/gallery-audit/lighthouse-before-desktop-final.json), [after desktop](../tmp/gallery-audit/lighthouse-after-desktop-art.json)

Loaded route scripts: 795,275 → 798,438 raw bytes; 253,845 → 254,888 gzip bytes. Delta: +3,163 raw / +1,043 gzip. This includes shared chunks loaded by the route, rather than a route-exclusive bundle. Modern next build does not print a route-size column.

## Remaining limits and preview

The inventory contains no A-rated photographs; supplied sources are at most 1080px wide. Better confirmed, high-resolution photography is still needed for the reference sites' image-quality bar. The hero intentionally crops to its required stage ratio; the index and viewer preserve complete photographs.

Accessible naming, image descriptions, focus behavior, and live announcements were checked in the browser. An actual NVDA/VoiceOver listening walkthrough was not performed.

The rest of the existing light editorial route and division navigation remain intact. The dark treatment is scoped to the gallery. Reference studied for inspiration: [Snøhetta's project archive](https://www.snohetta.com/projects); no assets or code were copied.

Final preview: http://localhost:3100/engineering/projects. Port 3100 previously served the before-change comparison; it now serves the current root production build. Work remains local and uncommitted, with unrelated existing changes preserved.
