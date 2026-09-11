# Engineering update and refinement handoff

Implemented 11 September 2026 from `ENGINEERING_UPDATE_BRIEF.md` followed by `REFINEMENT_PASS.md`.

## Agreed scope

- Implement the Engineering update first, then apply the refinement to that result.
- Retain ERB throughout, per the user's explicit override. Add the supplied URSB, URA and trading-license registrations alongside it.
- Feature Construction Engineering separately above the five confirmed sectors.
- Add `/engineering/consultation`, reusing the existing enquiry form and API, alongside `/engineering/contact`.
- Retain +256 704 175 005 for phone and WhatsApp and use the existing shared Instagram/Facebook accounts. No LinkedIn or X URLs were supplied; none were invented.

## Implemented

- Engineering About follows the requested nine-part order. Its company description, mission, vision and five values preserve the supplied wording. Founding and incorporation are distinguished as 2024 and 2025. Leadership remains pending approval; the existing convergence graphic, reveal behavior and footprint are retained.
- Four confirmed services feed both the preview cards, existing accordion and enquiry selector. Descriptions, includes and delivery-focus copy are editable in `src/content/engineering.ts`; each service carries `editorialStatus: "drafted, pending client refinement"`.
- Construction Engineering leads the sector page, with five supporting areas and contextual consultation links.
- Careers has an honest empty state and a typed collection for approved future openings. Insights has the eight confirmed categories and an unassigned content-owner field.
- Engineering metadata uses the supplied description and keyword set. Mining and agricultural terms occur in keyword metadata, not as named service offerings. New routes are in the sitemap and available only for Engineering.
- Book a Consultation is the Engineering CTA; WhatsApp is available in the hero, enquiry pages and Engineering CTA, alongside email and phone links.
- Asset Management's six service pillars reuse one Lucide icon family across preview cards and the accordion. The capability strip retains icons, arrows, keyboard interaction and explanations without numerals. Its mobile layout wraps the stages into a grid. Both sector tiers use consistent 1.5-stroke icons with their existing prominence preserved.
- Service titles use a flexible grid column with explicit wrapping and minimum-width handling. Parent homepage source and copy, `/story`, and the supplied Asset Management content file are unchanged.

## Local verification

- `npm run lint`: passed.
- `npm test`: all 8 tests passed, including exact supplied Engineering and Asset Management content checks.
- `npm run build`: passed after the final code change, including TypeScript and static route generation.
- Production browser suite: 25 of 26 checks passed initially. The new desktop header CTA failed contrast; its text was corrected to white. The remaining desktop accessibility check then passed on the rebuilt production server. All 26 checks therefore have passing results.
- Suite viewports: desktop 1440×1000 and mobile 390×844. Checks include routes, assets, page overflow, keyboard tabs, accordion deep links, assessment, automated WCAG A/AA analysis, metadata endpoints, content order and consultation context.
- Service-title and preview checks additionally passed at 320, 375 and 768 pixels. Extra Engineering route checks at 320, 375, 768 and 1024 pixels found no document or navigation overflow.
- Desktop/mobile screenshots of service headings, preview cards, capability strip and both sector tiers were inspected. Engineering About and consultation views were also reviewed. Local captures are under ignored `tmp/`.
- The consultation form sent the selected service, sector context, division and consent to the existing local API. With SMTP unconfigured, it returned HTTP 503 and showed the email fallback without claiming successful delivery. No real email was sent.

## Remaining content and launch dependencies

Client approval/refinement of drafted service copy, leadership biographies/portraits, the named Insights owner, articles, approved openings and real project material remain content inputs. Additional standards were not added. The existing shared social accounts were retained; additional platform URLs need actual account links.

No deployment, DNS change or external service configuration was performed. Email delivery, configured analytics/consent behavior and live social-account ownership were not externally verified in this pass. Microsoft 365 and hosting configuration remain unchanged.
