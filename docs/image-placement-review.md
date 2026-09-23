# Proposed photograph placement review

Date: 2026-09-23. Scope: public page/component audit and two conservative placements. Read both supplied manifests before editing. Existing originals and manifests are unchanged.

## Gap audit

Routes below are code-audited, including shared renderers and dynamic route templates. An absent photograph is not automatically a design gap.

| Route | Component/file | Section / current imagery | Would a proposed photo help? |
|---|---|---|---|
| `/` | `src/app/page.tsx`, `FounderCard` | Graphic hero, founder portrait, two conceptual division panels, graphic closing | No: intentional graphics and existing imagery |
| `/engineering` | `DivisionHome` in `division-pages.tsx` | Conceptual hero; text introduction and four service previews; standards/CTA graphics | Construction preview is plausible, but keep the compact four-card rhythm; detailed service gets the image |
| `/asset-management` | `DivisionHome`, `CapabilityJourney`, `Assessment` preview | Conceptual hero, lifecycle graphics, text services, assessment art | No: buildings cannot explain portfolio intelligence or economic value |
| `/engineering/about` | `EngineeringAbout` in `engineering-pages.tsx` | Text overview, mission/vision, values, lifecycle diagram, icon expertise, portraits, credentials, footprint | No: unconfirmed buildings beside company history could imply ownership; diagrams/icons are intentional |
| `/asset-management/about`, `/story` | `AboutContent`, `LeadershipSection`, `CompanyFootprint` | Text story/mission/values; convergence diagram, leadership imagery, footprint graphic | No: no verified connection between these buildings and the company story |
| `/engineering/approach` | `DivisionPage` | Nairobi Expressway photograph beside physical delivery | No: already illustrated |
| `/asset-management/approach` | `DivisionPage`, `CapabilityJourney` | Tanger Med photograph and lifecycle graphics | No: already illustrated |
| `/engineering/services` | `ServiceAccordion` in `interactions.tsx` | Four text accordion panels with icons; no photos | Yes for Construction only; site work directly supports the service meaning |
| `/asset-management/services` | `ServiceAccordion` | Six text pillars with category icons | No: unverified apartment photos cannot explain these advisory services |
| `/engineering/sectors` | `EngineeringSectors` | Construction lead has no image; highway/structural/water have real photos; project management/geotechnical are icons | Yes for the Construction lead only. Preserve existing photos; no apt subject for remaining gaps |
| `/asset-management/sectors` | `Sectors` in `shared.tsx` | Energy/transport/cities/real estate/logistics have photos; other sectors use icons | No: supplied buildings do not establish institutional/health/education use |
| `/engineering/projects` | `ProjectGallery`, `ProjectApproach` | Existing construction-progress photo and AG Rosa rendering; approach diagram/text | No: preserve existing images; unrelated photos would imply project provenance |
| `/asset-management/projects` | `DivisionPage`, `ProjectApproach` | Named case-study cards and framework, no photos | No: would imply an unconfirmed project/client/location |
| `/asset-management/projects/[slug]` | `src/app/[division]/projects/[slug]/page.tsx` | Named case-study text and labels, no photo | No: no matching confirmed provenance. Engineering detail routes return not-found |
| Both divisions `/insights` | `DivisionPage` | Text listings/newsletter; requested conceptual component currently returns null | No: no article-specific subject relationship established |
| Both divisions `/insights/[slug]` | `src/app/[division]/insights/[slug]/page.tsx` | Dynamic text article template | No: select imagery per verified article, not globally |
| Both divisions `/standards` | `Standards` | ERB/ISO graphic and governance text | No: photograph cannot substantiate registration/governance |
| Both divisions `/contact`, `/engineering/consultation` | `DivisionPage`, `EnquiryForm` | Contact details, mark, form | No: task-focused layout |
| `/engineering/careers` | `EngineeringCareers` | Vacancy/empty state and brand mark | No: buildings do not demonstrate people or employment |
| `/asset-management/assessment` | `AssessmentPage`, `Assessment` | Interactive questions/results | No: avoid distraction |
| `/portal` | `PortalPage` | Intentional future-portal panel and motif | No: no photographic purpose |
| `/privacy` | `src/app/privacy/page.tsx` | Legal text | No |
| Shared across routes | `Header`, `Footer`, `CTA`, `PageIntro`, `Breadcrumb`, `RouteLoading`, error/not-found, `brand.tsx` | Logos/motifs/navigation/forms/status | No: functional or intentional graphic treatment |
| Shared leadership | `LeadershipSection`, `LeadershipCard`, `FounderCard`, `TeamPortraitFallback` | Portraits and branded missing-portrait treatment | No: building photos cannot substitute for people |
| `/design-review`, `/admin/**` | Review/admin interfaces | Portrait review / content management | Not public photographic placement surfaces; unchanged |

Code correction to historical context: `ConceptualImage` now resolves through `sectorPhotographs` in `photography.ts`; unmapped IDs return null. Neither editorial insights images nor the conceptual project intervention currently render. Existing Approach images are real photographs. Public content sections use light paper with dark shell/header/footer; no user-selectable light/dark theme was found. Match those existing treatments rather than repainting them.

## Final selections and written justification

One B-rated original: `public/images/projects/proposed/building-a-concrete-apartments-plastering-front-01.jpeg`.

Optimised copy: `public/images/projects/building-a-plastering-front.webp` (1080 × 810, quality 80, 166,582 bytes). No enlargement. Sharp default metadata stripping, with metadata checked separately. Original files retained untouched.

| Placement | Alt text | Why this image beats alternatives |
|---|---|---|
| `/engineering/services`, expanded Construction panel | Unfinished apartment building with open balconies, timber scaffolding and construction materials in front | Shows actual ongoing building work rather than a completed facade. `building-a-concrete-apartments-plastering-front-02.jpeg` is portrait, with a steeper upward view and less site context. Broad front-01 is clearer at a modest landscape size |
| `/engineering/sectors`, Construction Engineering lead | Same factual alt text | Shows the lead sector's physical subject. `building-b-stone-apartments-masonry-wide-01.jpeg` has a cropped roofline, prominent blank side wall and dense scaffolding; front-01 has a more legible whole-building composition |

Crop: 4:3 at every breakpoint, matching the source; maximum 540 CSS pixels wide. Centered `object-position: 50% 50%`, `object-fit: cover`; no meaningful crop beyond border rounding. Full balcony/scaffold context remains on mobile. Original 1080px width supports 2x at the maximum slot size. `sizes` uses 80vw on mobile and 540px above 760px. Static import supplies intrinsic dimensions and blur placeholder. Both images are below the fold and use default lazy loading, no priority.

Visual consistency: neutral grey concrete, blue daytime sky and muted red earth fit the existing natural infrastructure photographs and Engineering red accent. No colour grading or artificial dark overlay. Existing conceptual figure/image/caption classes and border token are reused; text stays outside the photo. Added only a width cap, margin, 4:3 ratio and border. Existing loading and reveal behavior is unchanged.

Reuse: twice sitewide, once on each page. About's shared sector renderer is gated out by its existing `imagery=false` setting. Construction matching uses the service name, not its CMS position.

## Rejections and deliberate omissions

- Full-resolution visual review: `building-a-concrete-apartments-plastering-front-02.jpeg` rejected for portrait framing and stronger upward perspective; no need for a near-duplicate.
- Full-resolution visual review: `building-b-stone-apartments-masonry-wide-01.jpeg` rejected for weaker composition: roofline cut, blank wall, congested scaffold. No second-best image added just to increase count.
- Full-resolution visual review: `building-d-apartment-block-complete-wide-01.jpeg` does NOT match its manifest description. It shows red-roof buildings with scaffolding/open unfinished areas, not the stated finished brown/cream/maroon blocks. Excluded from any asset-in-use placement. The manifest has not been silently corrected.
- Manifest exclusions: all C-rated files; all flagged Building E signage views and scaffold/worker view; distant Building F views because of softness and possible workers. These were not promoted to candidates or re-certified visually.
- Remaining A/B variants were not selected: no additional compelling empty slot after the two construction placements; avoid same-building repetition and unsuitable portrait/shallow crops. They are not certified safe by this review.
- Consultancy, Supervision and Contract Management remain text/icon based: scaffolding alone does not demonstrate advice, inspection or contract work.
- About/story remain without new building imagery: no proven company-history connection. All existing approach/sector/project/homepage images are preserved.
- Asset Management remains unchanged: no verified asset-in-use candidate and no photograph linked to named case studies.
- Four to eight placements was an aim, not a quota; only two were justified.

## Images I placed that need the owner to confirm provenance before launch

- `building-a-concrete-apartments-plastering-front-01.jpeg` → `building-a-plastering-front.webp`, used on `/engineering/services` and `/engineering/sectors`. Owner must confirm source, permission to publish, and any relationship to Dreniak before launch. Both captions say only “Site photograph”; neither asserts client, project name, location or Dreniak delivery.

## Uncertainty

Provenance remains unconfirmed. The manifest's demonstrated subject mismatch means other uninspected files must not be trusted from filenames alone. No attempt was made to identify a location or client. Browser checks cover locally rendered content, not every possible future CMS revision.

## Verification

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.
- Production rendering was checked at approximately 390px, 768px and 1440px viewport widths on `/engineering/services` and `/engineering/sectors`.
- The optimized image loaded at all checked sizes with its intrinsic 1080 × 810 dimensions, remained a 4:3 crop, and did not produce horizontal overflow. The construction subject remained fully visible on mobile, tablet and desktop.
- The optimized WebP was checked with `sharp`: format `webp`, 1080 × 810, no EXIF block and no GPS metadata.
- No unused optimized image files were added. The only new image referenced by code is `public/images/projects/building-a-plastering-front.webp`.
- No broken image paths were observed in the touched pages. A development-server stylesheet MIME warning was observed during an initial dev-server check; production rendering was used for the final visual checks and loaded normally.
