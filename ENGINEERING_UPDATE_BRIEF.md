# DRENIAK ENGINEERING — CONTENT UPDATE BRIEF
### Follow-up to the original build brief, now that the Engineering discovery questionnaire has come back

This is a targeted update, not a rebuild. The Engineering division was launched with placeholder/interim content pending this questionnaire (completed 10 September 2026 by Derrick Nkurunungi). It has now arrived. This brief tells you exactly what to correct, what to replace, what to add, and what to leave alone — plus a short list of gaps in the questionnaire itself that need a client answer before certain sections can be finalized.

---

## 0. FIX FIRST — unconfirmed regulatory claim currently live

**Pull or hold the ERB (Engineers Registration Board of Uganda) registration credential currently displayed on the Engineering division.** It was carried over from the original scraped pre-rebrand site as an assumption, not confirmed content. The questionnaire's actual answer on registrations (Q7) states only: *"Dreniak is registered with URSB, Uganda Revenue Authority and has a valid Trading license in the country."* No ERB mention. Replace the credential display with URSB registration, URA registration, and a valid trading license instead — these are the confirmed registrations — and do not reinstate any ERB claim unless Derrick or the directors explicitly confirm it in writing. This is a regulatory-adjacent claim on a live public site; treat it as the highest-priority fix in this update.

---

## 1. CORRECTED / CONFIRMED COMPANY FACTS

Replace placeholder company-background copy with the following, verbatim where marked:

- **Legal name:** DRENIAK (U) LIMITED. **"Dreniak Engineering" is the confirmed name to display across the site** — this matches what was already built, no change needed there.
- **Founded 2024, officially incorporated 2025.** (Earlier brief said "founded 2024" — now precise: found vs. incorporated are two different years, worth reflecting accurately, e.g. "Founded 2024, incorporated 2025.")
- **Confirmed registrations:** URSB, Uganda Revenue Authority (URA), valid trading license. (Replaces ERB — see Section 0.)
- **Rebrand scope confirmed as purely visual** — no change to services, positioning, or target market. No action needed, just confirms the existing content strategy was correctly framed.
- **One-line company description (use verbatim as the standard "what we do" line, e.g. in meta descriptions, About intro, or footer):**
  > "Dreniak Engineering is a Ugandan engineering consultancy providing innovative, sustainable and client-focused engineering solutions across infrastructure, consultancy, construction, asset management and related sectors. The company combines engineering expertise, technical advisory services, project support and practical problem-solving to help clients deliver safe, efficient and sustainable projects."

---

## 2. MISSION, VISION & VALUES — IMPORTANT CORRECTION TO THE ORIGINAL BRIEF

The original build brief assumed Engineering would share the parent company's origin story and five values (WINNING / THINK GENERATIONS / QUESTION EVERYTHING / BUILD BEYOND THE BRIEF / MAKE THE FUTURE PRACTICAL) — those actually belong to the Asset Management division's own strategy document. **Engineering has its own distinct mission, vision and values, supplied now for the first time.** Replace whatever values currently populate Engineering's About page with these, verbatim:

**Mission:** "To be at the forefront of engineering excellence in Uganda and beyond. We are dedicated to providing innovative, sustainable, and client-centric engineering consultancy services that empower our clients to thrive and make a positive impact on their communities."

**Vision:** "Our vision is to become the most trusted and sought-after engineering firm in Uganda, renowned for our unwavering commitment to quality, integrity, and innovation. We aspire to shape a better future through our engineering solutions."

**Values:** Delivering Excellence, Sustainability, Innovation, Integrity, Continuous Growth. (Five single-word/short-phrase values, not the five-manifesto-paragraph style used on the Asset Management side — keep Engineering's values presentation more concise and direct, matching the more restrained tone requested in Section 5 below, rather than forcing the AM division's longer editorial format onto them.)

The shared origin story and founder narrative built for the parent homepage/`/story` route can stay as-is — that's explicitly the parent-brand-level story, not division-specific, and nothing here contradicts it.

---

## 3. ABOUT PAGE STRUCTURE

Rebuild Engineering's About page to this confirmed structure and order:
1. Company overview (use the one-line description from Section 1, expanded)
2. Mission
3. Vision
4. Core values
5. Engineering philosophy
6. Areas of expertise
7. Leadership/team
8. Professional credentials and registrations (URSB, URA, trading license — see Section 0)
9. Commitment to quality, sustainability and innovation

Leadership bios and photographs are confirmed as **pending client approval** — keep the current honest placeholder/pending treatment already used elsewhere on the site (the same pattern used for Asset Management's leadership section) rather than inventing names or bios.

English only, confirmed — no change needed.

---

## 4. SERVICES & SECTORS — REPLACE PLACEHOLDER CONTENT

**Services (confirmed list, but thin — see open question 1 below):**
Engineering Consultancy & Research, Construction, Supervision, Contract Management.

These four came through as names only, without the fuller "Includes / Economic value"-style descriptions the Asset Management division has. Draft a short (2–3 sentence), plainly-worded description for each based on standard, non-specific engineering-practice language — do not invent specific claims, project counts, client names, or capabilities not implied by the service name itself. Present these drafted descriptions in a way that's clearly editable (e.g. flagged in a CMS/content layer as "drafted, pending client refinement") rather than as if they were client-supplied verbatim text, since they weren't.

**Sectors (confirmed list):** Highway and Transportation Engineering, Architecture and Structural Engineering, Water Resources Engineering, Project Management, Materials and Geotechnical Engineering.

**Construction Engineering is confirmed as the predominant/lead focus** — give it the most prominent visual weight on the Sectors page, the way Asset Management's Side 1 sectors got featured treatment over Side 2. Note: "Construction Engineering" as a phrase doesn't appear as one of the five listed sector names above — see open question 2 below on how to reconcile this before finalizing the sector hierarchy.

Related services/sectors may be grouped on shared pages rather than requiring a dedicated page each (confirmed, Q12) — a single well-built Services page and a single Sectors page is sufficient; no need to split into per-service subpages the way this was left open for Asset Management.

Certifications/standards/compliance frameworks (Q13) were **left blank** in the questionnaire — do not display any specific standards badge (no ISO references, no generic "safety compliant" claims) on the Engineering side until this is answered. See open question 3.

---

## 5. DESIGN TONE — DIAL BACK INTERACTIVITY ON ENGINEERING'S OWN PAGES

This is a real course-correction from the original master brief, not a minor style note. The client was explicit and specific (Q30, Q32):

> "Preferred direction is a modern, professional and technically sophisticated engineering aesthetic, combining corporate credibility with selected industrial/technical visual elements... should stay closer to a clean informational site" — no 3D, interactive, or data-driven elements (explicitly ruled out: project maps, live dashboards, animated diagrams).

Keep Engineering's own Services, Sectors, Projects, About and Contact pages **cleaner and more restrained than Asset Management's** — no interactive tool equivalent to the Maturity Assessment, no animated data visualisations, no heavy scroll-driven set-pieces within Engineering's own page content. The shared parent-brand homepage (the split-screen entry and motif transition) is a parent-level experience representing the whole company and can stay exactly as built — that instruction isn't reversed by this. The correction is scoped to pages that belong to Engineering once a visitor has entered that division.

Reference points given: general "high-quality modern engineering and technical consultancy websites" that combine strong visual design with technical credibility, explicitly avoiding "generic corporate templates" — so restrained doesn't mean plain; it means confident typography, strong photography (once available), and clean structure doing the work instead of interaction flourishes.

---

## 6. NEW/CONFIRMED PAGES

- **Careers** — confirmed as a core page. No job listings were supplied. Build with the same honest-empty-state pattern already used for Projects ("no current openings" rather than fabricated listings), structured to be easy to populate once real openings exist.
- **Request a Consultation / Project Inquiry** — confirmed as an additional page beyond a standard Contact page. See open question 4 on whether this should be a distinct route or a specialised version of the existing Contact page, since the questionnaire lists it as a separate core-structure item.
- Confirmed core structure overall: Home, About Dreniak, Services, Sectors, Projects/Portfolio, Insights/Info Hub, Careers, Contact, Request a Consultation/Project Inquiry.

---

## 7. INFO HUB / INSIGHTS

Content categories confirmed: Engineering insights, Infrastructure insights, Construction and materials, Asset management, Pavement and road engineering, Engineering project updates, Industry developments, Company news.

Cadence: monthly or as-needed initially, with a designated internal content owner (not yet named — this can go in the same "author" slot pattern used for Asset Management's Insights, updated once a name is supplied). Build the same clean, extensible template already used for Asset Management's Insights section — no content population needed yet beyond category structure.

---

## 8. AUDIENCE, CONTACT & LEAD GENERATION

- Primary audience confirmed: government (central and local), investors, private developers.
- Primary desired action confirmed: **Book a Consultation** — make this the dominant CTA across Engineering's pages, consistent with how Asset Management foregrounds "Start a Conversation About Your Assets."
- Current inbound channel is referral; the site should actively promote **email, WhatsApp, and phone** as multiple parallel channels (not funnel everything into one).
- Forms should be framed as service-specific consultation requests ("marketing and selling" framed, per Derrick's answer) rather than a generic contact form — mirror the Asset Management side's commercial framing ("Tell us about your assets, portfolio or infrastructure challenge") with an Engineering-appropriate equivalent, e.g. "Tell us about your project, site or engineering challenge."
- No client portal for now (confirmed as Phase 2, consistent with what's already built for Asset Management) — no change needed, current scaffold-only treatment is correct.

---

## 9. SEO — CONFIRMED KEYWORD SET

Build Engineering's metadata, headings and URL structure around this confirmed keyword list (mirror the location-combination approach already used for Asset Management): Engineering consultancy Uganda, Engineering consultants Uganda, Engineering company Uganda, Engineering services Uganda, Engineering consultancy Kampala, Infrastructure engineering Uganda, Construction engineering consultancy Uganda, Mining engineering consultancy Uganda, Mining engineering services Uganda, Asset management Uganda, Asset integrity Uganda, Pavement engineering Uganda, Road engineering consultancy Uganda, Agricultural engineering Uganda, Industrial engineering consultancy Uganda, Project management Uganda, Construction supervision Uganda.

(Note: "mining" and "agricultural" engineering appear in the SEO keyword list but not in the confirmed services/sectors lists in Sections 4 — likely aspirational/adjacent search terms rather than active service lines. Safe to target in metadata/SEO copy without claiming them as active named services. Flag to Hamba if this reads as inconsistent once implemented.)

---

## 10. ANALYTICS, SOCIAL & INTEGRATIONS

- Google Analytics and Google Search Console confirmed as the minimum requirement — this matches what's already built (GA4, consent-gated); no change needed, just confirmation.
- WhatsApp contact should be **prominently available** on Engineering pages specifically, not just present in the footer.
- Social integration confirmed for LinkedIn, Facebook, Instagram, and X — but **handles/links are explicitly not yet provided** ("should be provided before launch"). Do not assume the `@dreniak_limited` handle used on the Asset Management side automatically applies to Engineering — confirm whether it's a shared company-wide handle or Engineering needs its own. See open question 5.

---

## 11. TECHNICAL

- Domain ownership and DNS: confirmed owned, no change.
- Hosting/email preservation question was left blank in this document — no new information, continue operating on the assumption already established from the Asset Management side (Microsoft 365 tied to the domain, must be preserved).
- Maintenance: confirmed Hamba's team handles updates post-launch, no CMS training needed — matches what's already built.
- Accessibility/device priority: confirmed no formal WCAG target, but the site should work well on any device — matches the responsive-parity standard already applied sitewide, no change needed.
- Timeline: "as soon as possible" — treat this update as high priority.
- Budget: Derrick's answer was "there's a budget, scope options and avail to us" — this is a request for Hamba to present cost/scope options, not a number. The existing itemised quotation already covers the whole build; if a separate line item or change order makes sense for this update pass, scope it as a small add-on against that quotation rather than a new full proposal.
- Sign-off: confirmed as "the directors" collectively, rather than the three named individuals previously listed — worth a quick confirmation of whether that changes the review-rounds contact list.

---

## OPEN QUESTIONS — please get these answered before final polish (don't block the content replacement work above on them)

1. **Service descriptions:** the four services came through as names only. Is Hamba's team clear to draft short descriptive copy for each (clearly marked as drafted/pending approval), or does the client want to supply their own fuller descriptions first?
2. **"Construction Engineering" as predominant sector:** this phrase isn't one of the five listed sector names (Highway & Transportation, Architecture & Structural, Water Resources, Project Management, Materials & Geotechnical). Should "Construction Engineering" be added as its own featured sector card, or does one of the existing five (most likely Architecture & Structural, or Project Management) represent it and should simply be visually promoted?
3. **Certifications/standards (Q13) was left blank.** Are there any standards or compliance frameworks (safety, environmental, engineering codes) Engineering wants referenced, or should this section simply be omitted for now?
4. **"Request a Consultation / Project Inquiry"** — was this meant as its own distinct page/route, or as the name/framing for an enhanced version of the existing Contact page?
5. **Social handles** — confirm whether `@dreniak_limited` (already used for Asset Management) is the shared company-wide handle for Engineering too, or whether Engineering will have separate accounts.
6. Confirm whether the existing Engineering contact number already live on the site (+256 704 175 005) is still correct and whether a dedicated WhatsApp number is needed alongside it.

---

*Source: Dreniak Engineering Discovery & Content Questionnaire, completed by Nkurunungi Derrick, 10 September 2026. Nothing in this update should be read as license to fabricate services, certifications, project history, or client names beyond what's stated above or already confirmed on the Asset Management side — where the questionnaire left a gap, this brief says so explicitly rather than filling it in.*
