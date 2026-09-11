# DRENIAK — REFINEMENT PASS
### Two corrections to prior instructions: an amendment to the Engineering content update, and a new design task for the numbered index/tab system sitewide.

Read this alongside `ENGINEERING_UPDATE_BRIEF.md` — it doesn't replace that document, it adjusts one section of it and adds a separate, unrelated design task. Both are scoped narrowly. **Nothing else about the current site — homepage structure, Engineering's page structure and features, or any copy not explicitly named below — should change.** The site is already at a high standard; this is refinement, not rework.

---

## PART A — Amendment to the Engineering content update (soften Section 5)

Section 5 of `ENGINEERING_UPDATE_BRIEF.md` ("Design tone — dial back interactivity on Engineering's own pages") asked for a meaningful reduction in interactive richness on Engineering's pages to match Derrick's stated preference for "a clean informational site."

**Revise that instruction as follows:** keep Engineering's current structure and every feature already built, exactly as implemented — do not remove, simplify, or flatten any existing component, animation, or interaction pattern on the Engineering division. Instead, lean toward Derrick's preference only at the margins: where a genuinely new piece of Engineering content is being added under that brief (new copy, new section, new card), default its presentation toward the calmer end of the site's existing design vocabulary rather than the most elaborate option available — but never at the cost of visual/structural parity with Asset Management, and never by deleting or disabling anything currently live. If a choice isn't obviously "new content going in," leave the existing build untouched.

Everything else in `ENGINEERING_UPDATE_BRIEF.md` stands as written — the ERB correction (Section 0), the corrected mission/vision/values (Section 2), the confirmed services/sectors content (Section 4), and the open questions for Derrick are all still active and should proceed.

The homepage (parent split-screen, transition, all copy) is confirmed as final — structural changes there are out of scope entirely. Adjust homepage text only if a specific edit is explicitly requested on Derrick's behalf; do not proactively rewrite anything there.

---

## PART B — Numbered index / tab system: icon-led redesign, applied sitewide

### The problem
Three places on the site currently use a plain two-digit numeral ("01", "02"...) as the primary way of marking sequence or position, and the treatment reads as generic and inconsistent rather than as a deliberate brand device:

1. **The six-service pillar cards** on `/asset-management` (preview grid) and the matching accordion on `/asset-management/services` — each item is headed by a bare "01/02/03..." with no connecting visual device between cards.
2. **The six-stage capability strip** ("Understand → Manage → Invest → Digitise → Protect → Grow") on `/asset-management` — this one already pairs each number with an icon and a connecting arrow, and reads noticeably better than the plain service cards. Use this as the closer reference point for tone, not the thing that needs fixing.
3. **The Sectors page** (`/asset-management/sectors`) — Side 1 sectors (Government & National Infrastructure, Energy & Utilities, Transport & Mobility, Cities & Urban Infrastructure) are numbered "01–04." Side 2 sectors (Real Estate & Major Developments, Industrial/Manufacturing/Logistics, Healthcare & Social Infrastructure, Education & Institutional Estates) have no numbering or icon treatment at all. The inconsistency between the two halves of the same page reads as unfinished rather than as an intentional tiering device.

### The direction: icon-led, numbers removed
Drop the bare numeral treatment everywhere it currently appears as the primary sequence marker. Let a consistent icon system carry the sequence and category instead, the way the capability strip already partially does — but without the numeral. This applies to:

- **The six service pillars** — replace "01/02/03..." with a dedicated icon per pillar (Asset Intelligence & Strategic Management, Lifecycle Engineering & Performance, Capital Planning/Finance/Investment Advisory, Digital Asset Management & Intelligence, Risk/Resilience & Sustainable Infrastructure, Infrastructure & Economic Strategy). Design one cohesive icon family, consistent line weight and style, that reads clearly at both the compact preview-grid size and the larger services-page accordion size.
- **The six-stage capability strip** — already has icons; simply remove the redundant "01–06" numerals and let the existing icon + label + connecting-line treatment carry the sequence on its own. Keep the connecting arrows/lines between stages, they're doing real work showing this is a progression.
- **All eight sectors** (both Side 1 and Side 2) — design one icon per sector, in the same family/style as the service icons, and apply it consistently across both tiers. This resolves the Side 1/Side 2 inconsistency by design: both sides get an icon, neither side gets a numeral, and the existing size/prominence difference between Side 1 (featured) and Side 2 (secondary) continues to carry the tiering — it no longer depends on one side having numbers and the other not.

This icon set can draw on the icon-generation task already scoped in the original build brief (Section 9, "sector iconography") — if any of those were already produced, reuse and extend them into a matching service-pillar set rather than starting a second unrelated icon language.

**Where numerals may still remain:** if a numeral genuinely helps orientation somewhere not covered above (e.g., a future paginated list, a step-by-step form), that's fine — this instruction is specifically about the three sequence/category surfaces named above, not a blanket ban on numbers sitewide.

### The mobile bug (Services page, six pillars)
Confirmed: on mobile, the six-pillar list on `/asset-management/services` is clipping service titles down to one or two letters ("Li", "C", "D", "R" instead of "Lifecycle...", "Capital...", "Digital...", "Risk..."). This is a real layout bug, not a content issue — likely a fixed-width or overflow-hidden container that isn't accounting for full title length at narrow viewports. Fix it as part of this pass:
- Titles must wrap to multiple lines rather than being clipped or truncated with no ellipsis indicator, at every breakpoint down to the smallest supported mobile width.
- Verify the fix alongside the icon-led redesign above, since you're touching this component anyway — don't ship the new icon treatment without confirming the underlying text-clipping bug is also resolved.
- Check the equivalent compact preview cards on the `/asset-management` homepage-of-division for the same issue before calling this done; the bug may exist there too even though the screenshot only showed the full Services page.

### Verification
Before calling this pass complete, confirm on both the desktop and mobile automated test sizes already established in the project's test suite (1440×1000 and 390×844): all three surfaces (service pillars, capability strip, sectors) render the new icon-led treatment with no numerals, no clipped text, and no horizontal overflow — consistent with the verification standard already met in the original handoff.

---

## Summary of what changes vs. what doesn't

**Changes:** icon design and layout for the six service pillars, the six-stage capability strip (icons kept, numerals removed), and all eight sectors; the mobile text-clipping bug on the Services page; a softened (not removed) lean toward Derrick's tone preference only on genuinely new Engineering content.

**Does not change:** homepage structure and copy, Engineering's existing structure and features, any Asset Management copy, the ERB/mission/vision/services/sectors content corrections already specified in `ENGINEERING_UPDATE_BRIEF.md`, and the capability strip's existing connecting-line/arrow mechanic.
