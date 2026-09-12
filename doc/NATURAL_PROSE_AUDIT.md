# Natural prose and visual follow-up - 12 September 2026

The visual-depth audit initially found both Part A component changes implemented, with 7 of 16 commissioned images available. All 16 are now present. Natural color is used outside the parent homepage and the two division landing-page heroes, whose original toned design was subsequently restored at the user's request.

## Copy audit

Applied the supplied natural-prose-check skill to agent-authored copy. Initially rewrote 30 passages. Following the requested restoration of both original division heroes, 28 rewrites remain applied and two hero introductions are restored. Exact before/after text, affected surfaces, reasons and reversal status are in `natural-prose-edits.json`. These include the four Engineering draft service descriptions, both division homepages, Engineering About/Approach/Careers/Sectors, Asset Management Services/Assessment, both divisions' Projects/Insights/Standards, Portal, shared calls to action, newsletter, enquiry microcopy, conceptual-image note and shared metadata. Approach-image alt text was also made descriptive. Newly added project captions and founder-card labels were reviewed during writing.

The entire client-content file `src/content/brief.json` is byte-for-byte unchanged against the pre-audit snapshot. Engineering source differs only in the four logged draft descriptions. Existing exact-content tests also check the supplied story, missions, visions, values, service/sector names and other protected wording against the briefs. Client language with repeated lists or promotional wording remains untouched. The four service descriptions retain their pending-client-refinement status. No external AI detector was used and no detector score is claimed.

## Photography and layout

All 16 visual-depth assets now use natural-color optimized WebP files. The approach sections use two natural-color variants of the original hero concepts. The two division heroes use their original toned image files. The parent homepage's original two image files are unchanged, verified by SHA-256. Division hero text sits over the original dark overlays, matching the requested design restoration. Conceptual/project-image tint overlays remain removed. No further image generation is needed.

Two supplied assets now appear on Engineering Projects: the construction-progress site photograph and the AG Rosa architectural rendering. Captions distinguish the photograph from the rendering. Source files in `assets/new` remain untouched; duplicate photos, video embeds and brochure downloads were not added to the page.

The homepage founder card uses a native keyboard-operable disclosure, responsive folded-card styling, reduced-motion support and an Our story link to `/story`. The user explicitly chose to skip Darren's portrait. The DK monogram is the accepted final treatment, and no portrait dependency remains.

## Verification

- Production build passed, including TypeScript and 31 static pages.
- Eight unit/content tests passed.
- Lint passed.
- Current-state comparison passed: all 28 retained replacements, both restored hero introductions and the unchanged client-content file.
- Final targeted browser run: 12/12 passed at 1440x1000 and 390x844. Covers all 16 assets, image decoding/cropping, delayed loading with stable frames, accessibility, no overflow, category/framework styling, supplied gallery and keyboard-operated founder card.
- Broader browser run: 31/34 passed initially. One report-artifact collision was caused by overlapping test runs; its isolated rerun passed. Two mobile image-loading checks failed; after switching conceptual images to explicit intrinsic dimensions and restarting the production server, both passed in the final run. Lazy loading remains enabled.
- Four separate unavailable-form/newsletter browser checks passed. Configuration presence was checked without printing credentials; no mail delivery or webhook was configured.
- Broader desktop/mobile route, navigation, assessment, metadata and WCAG A/AA checks passed. Screenshots reviewed for division heroes, founder card and supplied project gallery.
- `git diff --check` passed.

- After the hero restoration: production build, lint and all four targeted desktop/mobile browser checks passed.

No deployment or publication was performed.

## User-directed hero restoration - 12 September 2026

Restored only the Engineering and Asset Management landing-page heroes to their saved pre-audit design, matching the supplied screenshots: original full-width toned photographs, dark overlays, white/grey typography, original introductory copy, consultation links and Engineering WhatsApp link. Removed the later split-layout CSS overrides. Hero markup matches the saved snapshot exactly. Prose edits 5 and 6 are now explicitly marked reverted; 28 of the original 30 rewrites remain applied. Other natural-color imagery, project gallery, founder card and copy edits remain in place.

## Completion

Complete locally under the final user instructions: retain the restored division heroes and omit Darren's portrait. All other requested copy, image, gallery and founder-card work is implemented and verified. No outstanding implementation tasks remain within this goal.
