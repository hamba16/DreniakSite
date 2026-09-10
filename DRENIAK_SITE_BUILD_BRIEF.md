# DRENIAK — WEBSITE BUILD BRIEF
### A duo-brand experience for Dreniak Engineering and Dreniak Asset Management
Prepared for the build agent. Read this whole document before writing any code. This is not a generic corporate site brief — Dreniak's brand system already hands us an extraordinary creative hook (a logo mark built from layered, repeating arcs) and a genuine business duality (two divisions, one origin). The job is to make those two facts feel inevitable together. Treat this as a flagship portfolio piece, not a template job.

---

## 1. THE BIG IDEA

Dreniak Limited is one company that thinks in two disciplines: **Dreniak Engineering** (the founding practice — physical infrastructure, ERB-registered, build-and-deliver) and **Dreniak Asset Management** (the evolution — economics, data, lifecycle value, ISO 55000). The client explicitly wants a "duo site": one shared home page that establishes the parent brand with restraint, then physically divides into two equal halves near the bottom of the page, each representing a division. Selecting a half carries the visitor into that division's full site.

Don't build this as two brochures bolted together. Build it as **one brand telling one story from two angles**. The homepage's job is to make that duality feel deliberate and confident, not like an unfinished decision the visitor has to make for you.

**The signature move:** Dreniak's logo mark is already a set of concentric, repeating arcs — the brand guideline turns this into a motif by mirroring and repeating it (see Section 3.4). That same mark, split down its own centerline, IS the visual metaphor for two-divisions-one-origin. Use it literally as the mechanism of the split-screen and the transition animation described in Section 4. This is the detail that will make a client who already loved the NK Udada site sit up.

---

## 2. WHO DRENIAK IS (verbatim source material — use this language, don't paraphrase it away)

**Origin story** (from the founder, to be used on the shared About/Story surface and adapted into the Asset Management About page):

> Dreniak began with a boy who grew up in Africa with a simple but ambitious belief: Africa can build, manage and own world-class infrastructure — and take its rightful place on the global economic stage. For me, engineering was the beginning. It taught me how we build. My love for economics made me ask a bigger question: how do the things we build create lasting value? That question shaped Dreniak. We evolved from engineering into Infrastructure & Asset Management — bringing together engineering, technology, data, finance and economics to help organisations and governments understand what they own, protect its value, invest intelligently and make infrastructure work harder for the economies it serves. Our ambition goes beyond maintaining assets. We want to create infrastructure harmony: where buildings, transport, utilities, institutions and investment work together to strengthen businesses, communities and entire economies. The vision is global, but Africa remains deeply personal. We started with engineering. We are building towards economies.

**Brand-guideline story (shorter, punchier — good for hero copy / meta descriptions):**

> Infrastructure is the foundation of civilisation, but its true value lies in how long it can serve, adapt, and create value. Dreniak exists to engineer that longevity. By combining engineering, intelligence, technology, economics, and sustainability, we transform infrastructure into resilient, optimised systems built to serve generations. **Dreniak — Engineering the Longevity of Civilisation.**

**Founded:** Summer 2024.

**Company structure:** Dreniak Limited, divided into Dreniak Engineering and Dreniak Asset Management.

**Master tagline (on logo lockup, every touchpoint):** "Live the Future"
**Secondary campaign line (pull-up banners, brand collateral):** "Build. Connect. Deliver."
**Brand-guideline descriptor line:** "Engineering the Longevity of Civilisation."

Use "Live the Future" as the permanent lockup with the logo (it's baked into the approved logo file — never substitute it). "Build. Connect. Deliver." and "Engineering the Longevity of Civilisation." are both fair game as rotating hero sub-headlines or section dividers — they read well split across the two divisions too: Engineering = **Build**, the connective/data layer = **Connect**, Asset Management = **Deliver** (value). That three-beat rhythm is worth exploring visually on the homepage split.

**Values** (must appear verbatim, ideally as five short manifesto-style statements — these are strong, don't compress them into a bullet list and lose the voice):

- **WINNING** — We compete to win. Winning means setting a world-class standard, delivering measurable value and refusing to accept that where we come from should determine how far we can go.
- **THINK GENERATIONS** — We don't optimise for today alone. Every asset, investment and decision should be considered against the organisations, communities and economies it will serve decades from now.
- **QUESTION EVERYTHING** — "That's how it's always been done" isn't a sufficient answer. We challenge assumptions, interrogate data and rethink engineering, investment and infrastructure from first principles.
- **BUILD BEYOND THE BRIEF** — We solve the immediate engineering problem while understanding the bigger system around it. A building affects an organisation. Infrastructure affects productivity. Investment decisions can shape entire economies.
- **MAKE THE FUTURE PRACTICAL** — Big ideas mean little without execution. We turn engineering, technology, data, finance and economics into solutions that can actually be built, managed, financed and scaled.

**Mission:** To establish Dreniak as a leading infrastructure asset management company, helping organisations understand, optimise and maximise the lifetime value of their built assets.

**Vision:** To redefine how infrastructure assets are understood, managed and valued — creating longer-lasting assets, stronger institutions and greater economic value for generations.

(Note: the brand-guideline PDF phrases mission/vision slightly differently — "To Engineer, Preserve, and Optimise infrastructure..." / "To become a global leader in infrastructure intelligence..." — treat the questionnaire wording above as the client's most recent and authoritative version since it was submitted after the brand deck; use the guideline phrasing only as flavour text elsewhere if needed.)

---

## 3. BRAND SYSTEM (from the approved brand guideline PDF and logo files — do not deviate)

### 3.1 Color
| Name | Hex | RGB | Role |
|---|---|---|---|
| Business Red | `#991923` | 153, 25, 35 | Primary brand red |
| Indigo (Xona) | `#0d3251` | 13, 50, 81 | Primary brand blue |
| Full Black | `#000000` | 0, 0, 0 | Backgrounds, text |
| Full White | `#ffffff` | 255, 255, 255 | Backgrounds, text |

Both red and indigo have full 5-step tint ramps in the guideline (red ramps light-to-dark through dusty rose tones; indigo ramps through slate-blue tones) — generate/derive these programmatically for hover states, tags, chart accents, and background washes rather than inventing new colors.

**Color-to-division assignment (recommended, flag for client confirmation):** The brand guideline and pull-up banner mockups present red and indigo as interchangeable brand variants rather than explicitly assigning one per division. Our recommendation — build it this way by default, but confirm with Darren before final launch:
- **Dreniak Engineering → Business Red.** It's the dominant color across every brand application in the guideline (logo, tote bag, t-shirt), reads as energy/construction/heat, and Engineering is the founding, ERB-registered discipline.
- **Dreniak Asset Management → Indigo.** Reads as trust, data, finance, analysis — fits the economics/technology/lifecycle-value positioning Asset Management is built around.

The overall parent-brand chrome (shared homepage, logo lockups, footer) should stay in black/white/grayscale with red as the primary accent (since red is the dominant brand color system-wide), only shifting fully into indigo once a visitor is inside the Asset Management half.

### 3.2 Typography
Logo typeface is **Sweet Sans Pro** (bold geometric sans, used in all guideline headings). License and source this for the site's primary typeface. If licensing Sweet Sans Pro for web use isn't feasible in the timeline, use a close geometric-sans substitute (e.g. a self-hosted variable font with similar proportions — Aktiv Grotesk, General Sans, or Inter with tightened tracking) and flag the substitution to Hamba/client rather than silently picking something looser. Weight range needed: Thin through Heavy, plus Italic — the guideline shows the full ramp is part of the approved system, so use weight contrast (Heavy headlines against Regular/Light body copy) as a deliberate design tool, not just for emphasis.

### 3.3 Logo
- Primary lockup: mark + "DRENIAK™" wordmark + "LIVE THE FUTURE" tagline (as supplied in `Dreniak_Final_Logo.png`).
- Standalone mark: the layered/mirrored "D" arc icon (as supplied in `Dreniak_Logo.png` and the transparent mark file) — use this alone at small sizes (favicon, app icon, social avatar, loading states) and as the source shape for the split/transition animation.
- Maintain clear space and don't crowd the mark — brand guideline specifies generous breathing room in every approved placement (top corner, bottom corner, and centered are the three sanctioned positions).
- Reversed/mono versions exist (white mark on dark, dark mark on light) — use the correct version for each background rather than applying opacity tricks to one file.

### 3.4 Motif (the brand's built-in secret weapon)
The brand guideline defines an official repeating pattern made by mirroring and stacking the logo mark, producing a dense, almost heart/wing-shaped textile pattern. It's approved for subtle use across backgrounds, dividers, presentations, stationery and digital assets, "without overpowering the main content." This is the single most distinctive asset in the whole system — lean on it hard, but exactly as specified: subtle, structural, never decorative clutter.

Build it as a reusable SVG/CSS pattern component with configurable color (red, indigo, black-on-black, white-on-white per the guideline's four approved combinations) and density, so it can appear as:
- A near-invisible full-bleed background texture on dark hero sections (black-on-black tint, ~4–8% opacity)
- A literal wipe/mask shape for the homepage split transition (Section 4)
- Section dividers between major content blocks
- A footer background treatment
- Loading/skeleton states

### 3.5 Photography treatment
The only photography reference supplied (pull-up banner mockup) shows construction-site photography desaturated to grayscale and then washed in a duotone tint matching the section's brand color (red-toned wash on the red banner, indigo-toned wash on the blue banner). Apply this exact treatment to every photographic image on the site — no full-color photography anywhere. This is both a strong unifying design device and forgiving of the fact that new photography hasn't been shot yet (see Section 9, asset generation tasks) — duotone treatment reads as intentional and premium even on placeholder or stock imagery, and will make the eventual real photography shoot slot in seamlessly.

### 3.6 Tone of voice
Corporate/formal with a modern touch (client's explicit instruction) — reference points given were Hatchet.com, AllianceBernstein.com, and Acadian, but built independently in Dreniak's own colors and motif rather than imitating their layouts. Read: confident, spacious, editorial, data-literate, unhurried. Avoid engineering-firm clichés (hard hats and cranes as the only visual language, stock "handshake" photography, gradient-heavy SaaS aesthetics). Avoid overclaiming — this is a young company (founded 2024) telling an ambitious but credible story; let the ideas carry the weight, not exaggerated proof points.

---

## 4. THE SHARED HOMEPAGE — DETAILED EXPERIENCE SPEC

This is the page that has to be "extremely marvellous." Build it as a single scroll-driven sequence, not a static split.

**Section A — Opening statement (first viewport):**
Full-bleed near-black background (`#000000` or the guideline's slightly warm off-black, with the subtle scratch/grain texture visible in the brand deck's own slide backgrounds — recreate that fine noise/scratch texture as a lightweight CSS/SVG overlay, it's part of the brand's visual signature, not just a slide decoration). Centered: the primary logo lockup animates in (mark draws on/traces in via SVG path animation, wordmark and tagline fade up after). Below it, the brand-guideline line sets the register: "Engineering the Longevity of Civilisation." No navigation clutter yet — let this breathe. A single subtle scroll-cue.

**Section B — The premise (second viewport):**
A short, confident statement of what Dreniak is, pulled from the origin story ("We started with engineering. We are building towards economies.") — large editorial type, generous whitespace, the motif pattern very faintly visible in the background at near-zero opacity. This section exists purely to earn the split that follows; keep copy to 2–3 lines maximum.

**Section C — The split (the centerpiece):**
The viewport divides into two equal vertical halves — left = Dreniak Engineering (red system), right = Dreniak Asset Management (indigo system). Each half:
- Shows a duotone-treated image relevant to its discipline, tinted in its division color
- Displays its own sub-mark treatment (the logo arc, cropped/cornered per the guideline's "bottom corner" or "top corner" placement rules) at small scale
- Displays the division name and a one-line positioning statement (Engineering: physical delivery / Asset Management: "We serve organisations, institutions and economies that own complex, long-life infrastructure.")
- On hover/focus (desktop) or tap-and-hold preview (mobile), that half expands slightly (a magnetic, weighted easing — not a jarring snap) while the other compresses, previewing dominance without committing
- A clear "Enter Engineering →" / "Enter Asset Management →" affordance

On selection, trigger a full-screen transition using the brand motif shape as a wipe mask (the repeating arc pattern sweeping across the viewport in the chosen division's color, mark scaling up and settling into that division's header position) into the respective microsite. This transition is the payoff of Section 1's "big idea" — the same mark that represents the whole company becomes the literal mechanism of choosing a half of it. Keep the whole sequence under ~900ms so it reads as premium, not laggy.

**Persistent behavior:** Once a visitor has entered a division, a small persistent control (in the header or footer) lets them jump back to the parent split or across to the other division without returning to the top of the homepage — don't trap people inside one half.

**Mobile:** The split becomes a vertical stack (Engineering panel, then Asset Management panel) rather than a side-by-side split, each full-width and tappable, preserving the same color/imagery/CTA logic. The transition can simplify to a color-wash fade rather than the full wipe animation if performance on mid-range Android devices demands it — the client was explicit that the site must "maintain its order and beauty on both computers and phone, no matter the interface," so never ship a degraded mobile experience to protect a desktop flourish.

---

## 5. DRENIAK ASSET MANAGEMENT MICROSITE — FULL CONTENT & STRUCTURE

This division's content is fully specified (questionnaire response received in full). Build this microsite to completion now.

### 5.1 Navigation
`Home / About` · `Asset Management` (also referred to as "Infrastructure & Economic Value" — use this as a page subtitle or secondary nav label rather than picking one and losing the other) · `Services` · `Sectors` · `Projects` · `Insights` · `Contact`

### 5.2 Home page
Hero: the six-stage capability journey — **UNDERSTAND → MANAGE → INVEST → DIGITISE → PROTECT → GROW** — is the strongest available organizing device for this division. Build it as a horizontal, scroll- or interaction-driven progress strip near the top of the page (each stage expands into a one-line explanation as the visitor scrolls or clicks through). This single sentence is effectively Dreniak Asset Management's entire value proposition in six words — treat it as a hero-level design element, not a footnote.

Below it: the umbrella statement — "We help organisations understand what they own, maximise how it performs, determine where capital should go, and ensure infrastructure creates value far beyond the asset itself." Then a condensed preview of the six service pillars (Section 5.4) and the ISO 55000 credential (Section 5.6), each linking through to their full pages. Primary CTA throughout: **"Book a Consultation"** and **"Start a Conversation About Your Assets"** (this second phrase is the client's preferred contact-page framing — reuse it as a homepage CTA too, it's stronger than a generic "Contact Us").

### 5.3 About page
Build exactly to this client-specified structure, in this order:
1. **WHO WE ARE** — "Infrastructure understood. Assets optimised. Value multiplied."
2. **OUR STORY** — "Engineering was where we started. Understanding the lifetime and economic value of what we build is where Dreniak is going." (expand into the full origin story from Section 2)
3. **MISSION + VISION** (Section 2 copy)
4. **HOW WE THINK** — "Engineering × Asset Management × Finance × Economics × Technology" — render this literally as a visual equation/venn/convergence diagram, it's a gift of a design brief in five words
5. **OUR VALUES** — the five value statements in full (Section 2), given real room each — don't cram them into a dense grid
6. **LEADERSHIP** — photos + credentials + responsibilities (photography pending — see Section 9 for placeholder treatment)
7. **OUR FOOTPRINT** — UK | East Africa (build as a simple, elegant two-point map or footprint graphic rather than a literal embedded map widget — keep it in brand monochrome, not a Google Maps iframe)
8. **STANDARDS & GOVERNANCE** — leads into Section 5.6

### 5.4 Services page — the six pillars
Each pillar needs: name, one-line role description, a bulleted "Includes" list, and a bolded "Economic value" takeaway line. Present as expandable/interactive cards (accordion or modal-on-click) rather than a dense wall of text — the "Economic value" line is the client's own strongest copywriting in this whole brief and deserves to be the payoff a visitor reaches by engaging, not a buried sub-bullet.

1. **Asset Intelligence & Strategic Management** — Understanding what assets you own, their condition, performance, risk and value to enable smarter long-term decisions. *Includes:* asset registers and portfolio mapping; condition and performance assessments; asset valuation and risk profiling; asset management strategies and plans; ISO 55000-aligned systems; governance, policies and reporting frameworks; estate and infrastructure portfolio strategies. **Economic value: Know what you own, what it is worth, what it needs and what it can become.**

2. **Lifecycle Engineering & Performance** — Optimising, maintaining and extending the useful life of infrastructure while improving performance and reducing whole-life costs. *Includes:* lifecycle assessments; structural and engineering reviews; preventative and risk-based maintenance strategies; reliability and serviceability planning; rehabilitation and refurbishment strategies; useful-life extension; performance optimisation; replacement and disposal planning. **Economic value: Make existing infrastructure perform better, cost less and last longer.**

3. **Capital Planning, Finance & Investment Advisory** — Combining engineering, financial and economic insight to direct capital towards the assets and interventions that create the greatest long-term value. *Includes:* whole-life costing; CAPEX and OPEX planning; maintenance versus replacement analysis; capital prioritisation; investment appraisal; infrastructure financial modelling; portfolio investment planning; long-term funding requirements and asset liability forecasting. **Economic value: Put capital where it creates the greatest long-term return.**

4. **Digital Asset Management & Intelligence** — Using data, digital systems and emerging technologies to transform physical assets into measurable, monitorable and intelligently managed portfolios. *Includes:* digital asset registers; BIM and digital-twin frameworks; asset management platforms; performance dashboards; data collection and integration; monitoring systems; predictive insights; decision-support tools; portfolio-level asset intelligence. **Economic value: Turn infrastructure data into intelligence — and intelligence into better decisions.**

5. **Risk, Resilience & Sustainable Infrastructure** — Protecting assets and organisations against operational, structural, environmental and future risks while strengthening long-term resilience. *Includes:* infrastructure risk assessments; structural and operational risk; resilience planning; climate and environmental considerations; business continuity; critical asset identification; sustainability strategies; compliance and safety considerations; long-term adaptation planning. **Economic value: Protect infrastructure, institutional continuity and capital from tomorrow's risks.**

6. **Infrastructure & Economic Strategy** — Looking beyond individual assets to understand how infrastructure portfolios influence organisations, communities and economies. *Includes:* institutional infrastructure master planning; estate transformation; infrastructure investment strategy; portfolio optimisation; socioeconomic impact analysis; infrastructure demand and capacity planning; productivity analysis; strategic advisory for large organisations and governments; interconnected infrastructure planning and "infrastructure harmony." **Economic value: Move from managing individual assets to building infrastructure systems that enable economic growth.** *(Client flagged this as intended to become one of Dreniak's defining, signature capabilities — consider giving it slightly more visual weight than the other five.)*

### 5.5 Sectors page — two explicit tiers, by client instruction
The client was explicit and specific here: **"Sectors on Side 1 should be encouraged. Sectors on Side 2 are the cashflow cows."** Build a visibly two-tier layout, not eight equal tiles — Side 1 should read as the strategic/aspirational focus (larger, more prominent placement), Side 2 as the substantial, currently-reliable business (still fully present and well-designed, just visually secondary).

**Side 1 (featured/encouraged):**
- **Government & National Infrastructure** — National portfolios of public buildings, infrastructure, land and strategic assets requiring coordinated long-term investment.
- **Energy & Utilities** — Power, water, renewables and utility networks containing some of the most critical and capital-intensive assets in an economy.
- **Transport & Mobility** — Roads, bridges, railways, airports and ports that connect economies and require continuous lifecycle investment.
- **Cities & Urban Infrastructure** — Interconnected transport, utilities, public spaces, buildings and municipal assets managed across entire cities and regions.

**Side 2 (present, substantial, secondary visual weight):**
- **Real Estate & Major Developments** — Large commercial, residential and mixed-use portfolios where asset performance directly affects investment value and returns.
- **Industrial, Manufacturing & Logistics** — Factories, industrial parks, warehouses and logistics infrastructure where asset reliability supports production and trade.
- **Healthcare & Social Infrastructure** — Hospitals, healthcare estates and critical facilities where asset performance directly supports essential public services.
- **Education & Institutional Estates** — Universities, school networks and campuses requiring coordinated management of buildings, land, utilities and supporting infrastructure.

Positioning line for the page intro: **"We serve organisations, institutions and economies that own complex, long-life infrastructure."**

### 5.6 Standards & Governance
ISO 55000 must visually dominate this section (client's explicit instruction — "the international framework most directly connected to what we are building the company around"). Present it as the headline credential with its own substantial visual treatment (badge, seal, or dedicated card), with ISO 19650, ISO 31000, ISO 14001, ISO 45001 and ISO 50001 listed as a secondary, smaller-format row underneath. Note: client confirmed Asset Management itself is not yet formally ERB or URSB registered (only the Engineering division is) — do not display or imply asset-management-side regulatory registration.

### 5.7 Projects / Insights / Portfolio
No past projects were available at questionnaire time (marked N/A) and no confidentiality constraints exist yet because there's nothing to constrain. Build the Projects page as a well-designed **"Case studies in progress"** structure using the client's own stated framework — **Problem → Intervention → Result → Long-term Value** — as the template for when real projects land, populated for now with 1–2 honest placeholder/coming-soon cards rather than fabricated case studies. Do not invent client names, project details, or outcomes anywhere on the site. The client did confirm they can help draft testimonials from real past client relationships on request — leave a structurally ready but empty testimonials component rather than filler quotes.

Insights/blog: monthly cadence, single author (Darren Kamunuga) for now. Build a clean, extensible blog/insights template (category tags for "industry insights," "project updates," links to external industry papers) rather than a fully populated content library — content itself will be supplied separately.

### 5.8 Contact
Frame as a commercial entry point, not a generic contact form — client's own words: **"Tell us about your assets, portfolio or infrastructure challenge."** Primary channel to promote: email (routes to `info@dreniak.com`). Also surface WhatsApp/phone as secondary channels: General **+44 7789 063938**, Dreniak Engineering Uganda line **+256 704 175 005** (both reachable on WhatsApp). Office hours: 08:00–18:00, site-local time. Form submissions should be clearly routed to reach Darren Kamunuga. Do not publish a physical office address unless/until the client supplies one (not provided in the questionnaire).

### 5.9 Client portal (scaffold only)
Client requested a login-gated area for document downloads and a project/portfolio status view eventually. Build the entry point and auth scaffold now (a clean "Client Portal — Sign In" surface reachable from the header/footer) but treat the authenticated experience itself as a Phase 2 build unless Hamba specifies otherwise — don't let this become scope-creep that threatens the launch date.

---

## 6. DRENIAK ENGINEERING MICROSITE — INTERIM CONTENT (structural parity now, content swap later)

The Engineering questionnaire response hadn't arrived at the time of this brief. **Do not leave this half of the site empty or "coming soon."** Build the full page architecture now, mirrored component-for-component against the Asset Management microsite (same navigation pattern, same card/section systems, re-skinned in the red theme), and populate it with the following confirmed facts so the division launches as a complete, credible site from day one. Swap in fuller content the moment Hamba delivers it.

**Confirmed content to use now:**
- Full name: Dreniak Engineering (division of Dreniak Limited)
- ERB (Engineers Registration Board of Uganda) registered — display this credential prominently, it's Engineering's equivalent of Asset Management's ISO 55000 badge
- Tagline: "Live the Future" / "Build. Connect. Deliver."
- Prior positioning (from the previous live site, useful as a scaffold for the services page): full project-lifecycle delivery — site assessment, planning and regulatory compliance, design integration, construction management (logistics, progress monitoring, safety/quality/engineering standards), and post-construction support (documentation, compliance reporting, asset management handover, infrastructure maintenance)
- Contact: Dreniak Engineering Uganda line **+256 704 175 005** (WhatsApp-enabled)
- Same values, same origin story, same founding date — Engineering shares the parent company's full brand DNA from Section 2, just told through a construction/delivery lens rather than an economics/data lens

**Navigation (mirror the Asset Management pattern):** `Home / About` · `Engineering` · `Services` · `Sectors` · `Projects` · `Insights` · `Contact`

Build the About page using the same shared origin story and values as Asset Management (they're one company's DNA), but let the "HOW WE THINK" and hero framing lean into physical delivery and build quality rather than the equation-of-disciplines framing used on the Asset Management side. Leave clearly-marked placeholder sections for services/sectors specific to Engineering (structured identically to the Asset Management service-pillar and sector-tier components) ready to receive real content within the day.

---

## 7. SHARED SYSTEMS & COMPONENTS

- **Header/nav:** Behaves differently by context — on the parent homepage, minimal/logo-only until the split; inside a division, full nav in that division's theme plus the persistent "switch division" control (Section 4).
- **Footer:** Shared across all three site contexts (parent, Engineering, Asset Management) — logo, both division links, social links (Instagram/Facebook `@dreniak_limited`, plus the client also gave `@dreniakltd` as the intended universal handle — confirm final handles with Darren before launch, use whichever is live), LinkedIn slot (not yet created — build the icon/link but point it at a "coming soon" or omit gracefully until it exists), newsletter signup field, office hours, both phone numbers, `info@dreniak.com`.
- **Newsletter signup:** Client confirmed they plan to run an email newsletter — build a signup component (footer + optionally an Insights-page inline prompt) that captures email addresses into whatever backend Hamba's agent sets up; don't wire it to a third-party ESP unless instructed.
- **Forms:** All enquiry/contact forms route to `info@dreniak.com`, attention Darren Kamunuga. Confirm the actual delivery mechanism (SMTP/API) with Hamba — do not hardcode any credentials into the codebase; use environment variables and flag any secrets needed as a setup step for Hamba rather than requesting them inline in this build.
- **Analytics/CRM:** Not yet decided by the client (question left open in the questionnaire) — wire in Google Analytics (GA4) as a sensible default via environment variable, structured so it's trivial to swap or extend with a CRM/pixel later.
- **Accessibility & responsiveness:** No formal WCAG target was requested, but the client was explicit that the site "should maintain its order and beauty on both computers and phones, no matter the interface" — treat this as a hard requirement: full responsive parity, no degraded mobile layouts, legible contrast even though the palette is dark-and-saturated by design, and sensible semantic HTML/alt text as good practice regardless.
- **Language:** English only.
- **CMS:** Not required — client confirmed Hamba's team will handle ongoing content updates, so content can be structured in code/config/a lightweight headless layer rather than needing a full editorial CMS UI.

---

## 8. SEO ARCHITECTURE

Build metadata, headings, and URL structure around five keyword families, each combinable with a location suffix. This is Asset Management-specific (Engineering SEO terms weren't supplied yet — apply the same locational pattern once they arrive).

**Keyword families:**
1. **Asset management** — asset management services · asset management company · asset management consultants
2. **Buildings & infrastructure** — infrastructure asset management · building asset management · infrastructure management
3. **Condition & maintenance** — building condition assessment · asset condition survey · infrastructure inspection · maintenance planning
4. **Money & investment** — whole life costing · CAPEX planning · infrastructure investment planning · asset investment planning
5. **Standards** (secondary layer, lower volume but high-intent) — ISO 55000 asset management · ISO 55001 asset management

**Locations to combine with the above:** Uganda · Kampala · East Africa · Africa · Kenya · African Continental Free Trade Area (AfCFTA) · UK

**Example combined targets** (use as inspiration for page titles/H1s/meta descriptions, don't force all of them onto one page): "Infrastructure Asset Management Company in Uganda," "Building Condition Assessment & Asset Management Services in Kampala," "Infrastructure Asset Management Consultants across East Africa," "Infrastructure Asset Management & Investment Planning in Africa."

Build proper OpenGraph/social meta cards per division (see Section 9 for the social-card image asset), sitemap.xml, and semantic heading structure throughout.

---

## 9. ASSET GENERATION TASKS (for the build agent — push hard here, this is where "extremely marvellous" gets made real)

No real photography exists yet. Rather than leaving gaps or using generic stock imagery that breaks the brand's premium tone, generate the following, all styled per Section 3.5's duotone treatment and Section 3.4's motif system:

1. **Hero imagery set** — large-format duotone (red-tinted for Engineering, indigo-tinted for Asset Management) images suggesting African infrastructure at ambitious scale: engineering/construction sites, cityscapes, transport and energy infrastructure, and — for Asset Management — more abstract/editorial imagery suggesting data, planning, and long-term value (blueprints, structural diagrams, skylines shot for permanence rather than action). Avoid literal hard-hat clichés; favor wide, architectural, slightly aspirational compositions.
2. **The motif pattern, as a proper reusable asset** — generate the repeating mirrored-arc pattern from Section 3.4 as clean, tileable SVG in all four approved color combinations (red-on-transparent, indigo-on-transparent, black-on-black tonal, white-on-white tonal), plus a version with adjustable density/scale for the split-transition wipe animation.
3. **The "HOW WE THINK" equation graphic** — a custom diagram rendering "Engineering × Asset Management × Finance × Economics × Technology" as a convergence/venn-style visual in brand type and color, not a generic icon row.
4. **The six-stage capability strip icon set** — six small, consistent-line-weight icons for Understand / Manage / Invest / Digitise / Protect / Grow, designed as one cohesive family.
5. **Sector iconography** — one distinct icon per sector (8 total) in a single consistent style, usable at both featured (Side 1) and secondary (Side 2) scale.
6. **ISO 55000 badge/seal treatment** — a custom-designed credential mark for ISO 55000 (and a smaller secondary-row treatment for the other five standards) that feels native to the Dreniak brand rather than a generic compliance badge.
7. **OG/social share card templates** — one per division plus one for the parent brand, using the logo, motif, and division color correctly.
8. **Favicon/app icon set** — derived from the standalone mark, tested for legibility at 16px.
9. **Placeholder leadership photography frames** — if real headshots aren't ready by build time, generate elegant placeholder silhouette/initial-based avatar treatments in brand colors rather than generic gray-person icons, so the Leadership section still looks intentional.
10. **The Asset Management Maturity Assessment tool (stretch goal, strongly encouraged)** — the client's own strategy notes flag this as a planned future differentiator: a short interactive questionnaire (asset data quality, maintenance approach, lifecycle planning, governance, risk, capital planning) that produces an indicative maturity score, turning the site from a brochure into a lead-generation and diagnostic tool. If timeline allows, build a first version of this now — it's exactly the kind of "outside the box" feature that will distinguish this launch. If timeline doesn't allow a fully scored/branching version, build the front-end UI/UX for it as a beautifully designed placeholder ("This tool is coming soon — join the waitlist") that can be wired up to real scoring logic in Phase 2.

---

## 10. TECHNICAL NOTES

- **Stack:** Given Hamba's existing build pattern on other Dreniak-adjacent and comparable projects (Next.js 14, component-driven, animation-forward), continue that approach here — Next.js + Tailwind + a motion library (Framer Motion or similar) suits the scroll-driven split/transition work in Section 4 well. Use your judgment if a different stack better serves the interaction requirements, but don't default to a static/template builder — this brief requires real interaction engineering.
- **Domain & hosting:** Client already owns `dreniak.com` via GoDaddy, with Microsoft 365 email tied to the domain that must be preserved through the rebuild. Do not request or handle domain/registrar credentials as part of the design/build process — that's a deployment-stage handoff between Hamba and the client directly, outside this brief's scope.
- **Launch target:** 1 October 2026 — tight. Sequence the build so the shared homepage split experience and the fully-specified Asset Management microsite are complete first (they're fully content-ready today), with the Engineering microsite's final content swapped in the moment it arrives, rather than letting Engineering block the whole launch.
- **Budget guidance:** Client indicated an informal ceiling, ideally kept lean — build efficiently, avoid unnecessary paid third-party services where a well-built native component will do.
- **Sign-off:** Final review/approval sits with Darren Kamunuga, Derrick Nkurunungi, and Melvin Ampeire (technical advisor). Build in a way that supports easy stakeholder review (a staging URL, clear preview states for the not-yet-content-complete Engineering pages).

---

## 11. OPEN QUESTIONS TO CONFIRM BEFORE OR DURING BUILD

- Final red/indigo-to-division color assignment (Section 3.1) — our recommendation is stated, but confirm before locking it into brand assets.
- Final social handles: `@dreniakltd` vs `@dreniak_limited` (both were mentioned) — confirm which is live per platform.
- LinkedIn page — not yet created; confirm whether to launch the site with it live or omit/placeholder the icon.
- Engineering division's full questionnaire response (services, sectors, SEO terms, visual reference preferences) — expected same day; the site must be built to receive it without structural rework.
- Whether the Asset Management Maturity Assessment tool ships fully functional at launch or as a "coming soon" placeholder, given the timeline.

---

*This brief consolidates: the original client discovery notes, the completed Dreniak Asset Management discovery questionnaire, the separate "AI Expansion to Web Requirements" strategy document, the approved Dreniak brand guideline (24-page PDF), and the final logo files. Nothing in this brief should be treated as final creative license to invent facts, client names, project outcomes, or credentials not present in this source material — where content is genuinely missing, the brief says so explicitly and specifies a placeholder treatment instead.*
