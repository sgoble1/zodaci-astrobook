# Zodaci comprehensive UX and production-quality overhaul

## Direction and boundaries
Keep the existing Astral Research Authority identity: painted observatory scenes, Atomic Zodiac book/comic artwork, current fonts, hand-cut panel corners and established hero slides. This is a usability overhaul, not a theme switch.

Preserve every route, feature, saved item, entitlement, founder edition boundary and chart calculation. No speculative content generation, new charges or payment/access-rule changes. `roadmap.md` remains the sole work index; launch plans remain untouched.

## Baseline findings
Extend existing public pillars, member registry, founder trails and readers. Confirmed gaps: public breadcrumbs, small close/touch targets, 500ms drawers and stepped film effects. Initial phone checks were blank: diagnose startup before layout verification. Evidence: `docs/ux-overhaul-audit-2026-11-22.md`.

## Phase 1 — Complete coverage and wayfinding
- Inventory all registered routes and navigation surfaces: public, Free, paid, founder and admin; label primary/secondary/detail/utility destinations and visibility rules.
- Make current page and parent station unmistakable in headers, dropdowns, mobile tabs, sidebars and section tabs; use accessible current-page semantics and preserve query-specific views.
- Extend existing breadcrumbs/back paths to calculators, articles, lessons, sources, placements, chapters, readings and book previews. Use stable internal parent links that work on direct entry, not history-only back buttons.
- Preserve useful next steps and core-view recovery; unknown/missing routes and failed pages offer an immediate safe destination.
- Close navigation on route changes; retain scroll behavior, keyboard focus and search context without exposing private titles to unauthorized accounts.

## Phase 2 — Overlays, readers and safe actions
- Audit dialogs, drawers, glossary popovers, menus and book/comic/PDF readers, including custom overlays.
- Ordinary overlays support a visible named close control, backdrop click, Escape, focus trapping/restoration and scroll lock. Unsaved work gets a discard confirmation rather than accidental loss.
- Destructive actions require an explicit confirmation naming the item and consequence; cancel performs no mutation. Confirmation dialogs intentionally require a choice rather than backdrop dismissal.
- Keep complete book/comic pages and readable side text; test rapid turns, resize/orientation changes, enlarged text, portrait phones, opening/closing and PDF parity. Preserve the recent clipping fix.

## Phase 3 — States, forms and recovery
- Audit data-driven pages for loading, empty, error, validation, partial and completed states. Differentiate “not created yet” from “could not load.”
- Use stable shape-matched skeletons and accessible loading announcements. Empty states offer one useful next action.
- Add associated field labels, concise requirements, inline errors, invalid-field focus and disabled/busy submit states. Preserve unknown-time, historical timezone and consent behavior.
- Prevent duplicate submissions; preserve failed input and offer human retry/access guidance. Never present source denials as answers or unconfirmed saves/payments as success.

## AstroBook addition — Full chapters in language people understand
The current 28-page preview selects one 60–135-word face for many topics. Expand the actual chapters, not just their layout.

- Expand existing six-volume chart-derived chapters: introduction, measured interacting placements, practical interpretation and reflections. No repeated filler.
- Start with ordinary-language headings and explanations: what someone may recognize, which measured chart factors support the interpretation, and what remains uncertain. Explain terms such as ruler, aspect, decan, profection, nodes and hidden stems when first introduced; keep technical measurements available in the ledger/glossary rather than leading the narrative.
- Preserve Shane’s personable narrative and April’s precise directness across the three existing tones. Possibility-framed examples are not claims about the reader’s biography; saved personal observations remain opt-in and owner-only.
- Separate chapter length from face capacity: chapters span multiple coherently paginated faces. Replace the rigid 28-page primary-experience contract with actual chapter/page counts and a dynamically generated contents list; explicitly limited excerpts remain labelled excerpts, not “the full book.”
- Respect existing edition coverage and full-book target ranges: Digital 45–70, Pocket 50–75, Classic 75–120, Signature 90–150, Linen 100–180 pages. Do not pad text or promise a page count unsupported by generated content. World Systems remains excluded from Pocket.
- Keep chart-relative plates facing the relevant narrative, current Atomic Zodiac jackets, custom uploads, names/dedications and consistent browser/PDF text. No added comic imagery inside the AstroBook.
- Untimed charts receive meaningful element, planetary and aspect/cycle chapters without invented Ascendant or houses; Moon uncertainty remains explicit.
- Share the fuller model across fictional public samples, member readers, customizer/drawers and authorized founders; never expose founder content publicly or substitute viewer charts.
- Keep existing founder masterbook source chapters intact. Test expanded chapter substance, concrete chart differences, edition exclusions, timed/untimed boundaries, tone consistency, dynamic TOC, pagination and PDF parity. Verify chapter navigation and complete pages on phone and desktop before marking this addition done.

## Phase 4 — Hierarchy, contrast and responsive structure
- Consolidate spacing around the 4px/8px scale using existing tokens; consistent page gutters, section rhythm and breathing room.
- Establish primary/secondary/tertiary action hierarchy, readable fixed/rem type steps and clear H1–H4 structure. Preserve brand fonts and normal-weight display headings.
- Reuse semantic surfaces, 1px restrained borders, existing hand-cut card corners and intentional depth; no nested decorative cards or blanket theme replacement.
- Measure WCAG AA text contrast: 4.5:1 normal text, 3:1 large text; check focus and control boundaries on both light paper and dark painted surfaces.
- Fix underlying grid/flex/table overflow instead of globally hiding it. Long text wraps; tables may scroll inside their own labelled region.
- Check all route families at 375px, 393px, tablet and desktop, plus 320px reflow and 200% text enlargement. Navigation and primary touch controls meet 44×44px. Dialogs respect viewport/safe areas; mobile full-page readers remain dismissible.

## Phase 5 — Motion and tactile responsiveness
- Replace character/status blinking and single-frame film-speck toggles with smooth 3-second analog breathing, opacity 0.75–1.0. Keep decorative layers naturally faint through their existing surface opacity.
- Remove harsh stepped projector/film lighting while retaining slow scenic drift and the established cinematic atmosphere; investigate every applicable selector rather than only one instance.
- Calibrate control feedback and ordinary overlay transitions to 150–300ms; do not accelerate background scenery or autoplay storytelling.
- Respect reduced motion across CSS, pseudo-elements, Framer Motion, timers and readers; retain functionality with static decorative states and immediate state feedback.

## Phase 6 — Copy, accessibility and metadata
- Review waitlist/home, product introductions, About, pricing and investor introductions for a clear five-second answer: what Zodaci offers, what is personal and what the next step is.
- Retain calculation evidence, uncertainty, privacy reassurance, correct prices, legal disclaimer and Privacy/Terms links. No invented claims, biography, financial promises or testimonials.
- Correct heading order, landmarks, associated labels, icon names, meaningful/decorative alt text, visible focus and live announcements. Avoid duplicate IDs and multiple main landmarks.
- Reuse `usePageMeta` and route fallbacks for unique titles/descriptions, self-referencing public canonical/social URLs and private noindex boundaries. Check the static crawler fallback; no new placeholder share image or competing metadata library.

## Phase 7 — Comprehensive verification and release report
- Run the full Vitest suite and focused behavioral regressions, then check automatic build/typecheck signals and the final diff.
- Browser-test real authorized saved-chart journeys: navigation/search, form validation→submission→result, retry, complete reader turns and dismissal; include safe slow/offline cases.
- Check phone/desktop screenshots, runtime errors, keyboard/focus restoration, reduced motion and accessibility.
- Record each route’s role/state/evidence. Blank pages and redirects are not passes; name unavailable founder/paid/admin checks.
- Do not place real orders, send email or dispatch printing. Report external limits, commit changes and summarize delivered/blocked work; publishing is separate.

## Technical approach
Improve existing shared navigation, shells, Radix controls, states, tokens/motion and metadata before page exceptions. Preserve chart math, permissions, payment confirmation and source archives; avoid blanket CSS overrides.

## Completion criteria
All six requested areas have a route/state coverage record; no known critical usability defect is left without a named blocker. Tests and the automatic build pass. Mobile pages have no document-level horizontal overflow, complete reader pages remain reachable, ordinary overlays dismiss three ways, destructive actions require confirmation, and reduced motion disables decorative animation.
The added AstroBook requirement is complete only when the primary reader contains actual multi-page, plain-language chapters with matching contents and PDF output, not merely larger one-page summaries.