# DRENIAK — FINAL VISUAL PASS
### This replaces every visual instruction given since the original build brief. One document. One source of truth.

**`VISUAL_ELEVATION_PASS.md`, `VISUAL_ELEVATION_CORRECTION.md`, and `CREATIVE_ELEVATION_PASS.md` are all retired as of this document. Do not reference them, do not apply them, do not build on top of any local, uncommitted work that came from them.** Those three passes produced empty sections, flattened tags, and cropped photography — that work is not being pushed and should not be the starting point for anything below.

**Start from the current live production deployment at dreniak-site.vercel.app.** That is the known-good baseline. It is genuinely good — confirmed directly, not assumed. This pass adds polish, motion, and richness on top of it. It does not rebuild it, does not strip anything from it, and does not risk it.

**Zero text changes anywhere in this pass.** Not a headline, not a label, not a single word of copy. Every word currently live stays exactly as it is. This pass is: tab/label design, image and video behavior, and motion/flow — nothing else.

---

## 0. The creative DNA this pass must not drift from

This is restated in full because it's the anchor for everything below, straight from the original brief, unchanged:

- **The big idea:** one brand, two disciplines, told as one story from two angles — not two brochures bolted together. The split-screen homepage and the motif-driven transition are Dreniak's signature and are not being touched structurally in this pass, only polished.
- **Colors:** Business Red `#991923` for Engineering, Indigo (Xona) `#0d3251` for Asset Management, full black/white for parent chrome. No new colors, ever.
- **The motif:** the mirrored, repeating logo-arc pattern is the brand's single most distinctive asset. It belongs in the split-transition, subtle background texture on dark hero sections (4–8% opacity), section dividers, and the footer — used exactly as the brand guideline specifies: "without overpowering the main content."
- **Photography:** duotone treatment (grayscale base, tinted in the relevant division color) on every photographic image, no full-color photography anywhere.
- **Typography:** weight contrast as a deliberate tool — heavy headlines against regular/light body copy, not uniform weight throughout.
- **Tone:** confident, spacious, editorial, unhurried. Avoid engineering-firm clichés and overclaiming. This is a young, ambitious, credible company — not a flashy startup.

Nothing in this pass should feel like it was designed by someone who hadn't read the above. If a decision below ever seems to conflict with it, the original brief wins.

---

## 1. TAB / LABEL DESIGN — one exact specification, no room for misreading

Every small label across the site — sector tags, capability tags, status badges ("90% Complete," "3 Years"), location labels, Insights categories — gets exactly this treatment. Not looser, not stricter:

- **Type:** 12–13px, uppercase, letter-spacing 0.08–0.10em, medium weight (500–600).
- **Color:** the label text itself sits in a muted, deepened shade of the relevant division's brand color — a darker/desaturated step from the 5-step tint ramp already defined in the brand guideline (Section 3.1), not the full-saturation primary red/indigo, and never plain black or plain grey. Plain black/grey reads as undesigned; full-saturation red/indigo reads as loud. The muted mid-tone step is the correct answer, every time.
- **Background:** none. No fill, no border, no pill shape. The color lives in the text itself.
- **Separators:** where multiple labels sit in a row, separate them with a thin vertical rule (`|`) at 30–40% opacity of the label color, with 8–10px spacing on either side — not a bare space character.
- **Consistency:** this exact spec, everywhere this pattern appears, on both divisions (using each division's own muted brand tone). No page gets a different interpretation.

This is deliberately narrow and literal because the last two attempts at "quieter tags" drifted into either loud filled pills or flat unstyled text. There is one correct answer here, and this is it.

---

## 2. IMAGE & VIDEO BEHAVIOR — drawing directly from Brookfield.com

This is the section to actually study Brookfield for, specifically. Not its color philosophy, not its layout — its treatment of imagery and motion:

- **Full-bleed, cinematic crops.** Hero and major section imagery should fill the viewport width edge-to-edge, cropped to a wide, confident ratio (21:9-ish for full hero moments), the way Brookfield's every major section is a full-width photographic or video statement rather than a boxed-in image with margins around it.
- **Subtle scroll-linked scale ("living" imagery, not static).** Every full-bleed image gets a gentle continuous scale from 1.0 to ~1.04–1.06 tied to scroll position within its section — the image should feel like it's very slowly breathing as the visitor scrolls past it, never a hard jump, never fast enough to be distracting. This single technique is most of what makes Brookfield's imagery feel expensive rather than static.
- **Video where it earns its place, not everywhere.** Brookfield opens with full-bleed autoplay video. Dreniak doesn't have real project footage yet, and generating fabricated "stock" video footage risks looking exactly like the generic corporate-video cliché the original brief explicitly warned against. The practical, honest path to Brookfield's video *feeling* without fabricated footage: apply a slow, continuous Ken Burns-style pan-and-zoom to the existing duotone hero imagery (a soft, slow drift across the frame, 15–25 seconds per cycle, barely perceptible moment to moment) — this reads as "living," cinematic, and considered, without claiming to be real footage of anything. Reserve this treatment for the one or two most important hero moments per division (the division's own homepage hero, and the parent split-screen images) rather than applying it everywhere, so it stays a signature moment rather than wallpaper.
- **Never destructively crop real, client-supplied photography.** Any image that is real (not generated/duotone-conceptual) — the Engineering project photos, future team photos, future case-study photography — must never be forced into a crop that cuts into its subject. Check each real image's natural composition individually; use `object-fit: contain` with a soft background fill rather than `object-fit: cover` wherever a forced crop would cut off something structurally important. This rule does not apply to the generated duotone conceptual imagery, which can use the standardized full-bleed crop ratios above freely.
- **Consistent duotone treatment at all times**, per division color, exactly as the original brief specifies — this pass doesn't change the color treatment, only how the images move and fill their space.

---

## 3. MOTION & FLOW — specific, named interactions

Two signature moments, both built entirely from content that already exists — no new copy, no invented data:

**3a. The six-stage capability journey (Asset Management) becomes a pinned scroll sequence.** As the visitor scrolls through "Understand → Manage → Invest → Digitise → Protect → Grow," the strip pins in place while a slim progress indicator fills stage by stage, synced to scroll position. Each stage's one-line description crossfades in as its stage becomes active — one considered thought in view at a time, not all six visible and competing at once. Active stage: full color and weight. Inactive stages: reduced opacity. This is a genuine Brookfield-caliber technique (sticky-scroll storytelling), built from copy Dreniak already has.

**3b. Case-study pages get a two-panel split-scroll layout on desktop.** Left panel (sticky): hero image, the real stat (90% Complete / 3 Years), sector/location metadata. Right panel (scrolls normally): the Problem → Intervention → Result → Long-term Value narrative, including the existing sub-headings. On mobile this collapses naturally to the current single-column order — no separate mobile design needed.

**3c. Card micro-interactions (Services, Sectors) on both divisions:** on hover, a thin 2px accent line in the division's muted brand color draws itself in along one edge of the card (pick one edge, apply consistently sitewide), animating in over ~250ms. Sector cards additionally get a very low-opacity (5–8%) reveal of that sector's duotone conceptual image fading in behind the card content on hover — ties the Sectors grid back into the site's existing photography system rather than leaving it as icon-and-text only.

**3d. Standard scroll-reveal, applied consistently:** content fades in and rises 16–24px on scroll into view, ease-out, ~500–600ms, with a 60–80ms stagger between sibling elements in a group. One motion language sitewide — not a different animation style per section.

**Respect `prefers-reduced-motion` throughout** — every animation above needs a calm, functional fallback, consistent with what's already correctly implemented elsewhere in this build.

---

## 4. WHERE TO FOCUS — Engineering and Asset Management interior pages first

Apply Sections 1–3 with priority in this order:
1. **Both divisions' Services and Sectors pages** — tab/label spec (Section 1), card hover interactions (3c).
2. **Both divisions' Projects pages and the three real case-study detail pages** — split-scroll layout (3b), image handling (Section 2), tab/label spec on tags.
3. **The Asset Management capability journey** — the pinned scroll sequence (3a).
4. **Both divisions' homepages** — image/video behavior (Section 2) applied to hero imagery, scroll-reveal consistency (3d).
5. **The shared parent homepage** — already strong; apply only the image scale/breathing treatment (Section 2) to its existing imagery, and confirm the split-transition and motif wipe still perform exactly as before. Do not restructure anything here.

---

## 5. NON-NEGOTIABLE GUARDRAILS — carried forward, stated once, final

These are hard rules. Every one of them was violated by a previous pass. None of them are optional this time.

- **No section may ever render empty or near-empty.** If you add spacing, it surrounds real content — it never substitutes for it. Before finishing, scroll every page top to bottom at normal speed; any section where empty background meaningfully outweighs content fails this rule.
- **No grid may ever produce an orphaned item** (e.g. 4 items in a 3-column grid leaving one stranded). Check item counts against column counts before shipping any grid; adjust columns or use an intentional asymmetric layout instead.
- **No real, client-supplied photograph may be destructively cropped.** Covered in Section 2 — repeated here because it's a hard rule, not a suggestion.
- **No tag/label may be plain black/grey text with no color, and none may be a loud filled pill.** Section 1's spec is the only correct answer.
- **No text, copy, headline, or label changes anywhere**, for any reason, as part of this pass.

---

## 6. VERIFICATION — before reporting this done

- Compare the result directly against the current live production deployment, page by page, on both divisions — confirm everything that was already good is still there, unchanged in substance.
- Confirm no section fails the empty-space check, no grid is orphaned, no real photo is destructively cropped, and every tag/label matches the Section 1 spec exactly.
- Test the pinned capability-journey sequence and the case-study split-scroll layout specifically at both desktop and mobile widths — these are the two most structurally ambitious additions and the most likely to need real per-breakpoint attention.
- Confirm `prefers-reduced-motion` produces a calm, fully functional experience with every animation in this pass disabled or minimized.
- Confirm zero text/copy differs from what's currently live.