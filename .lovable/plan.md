# Zodaci comprehensive UX and production-quality overhaul

## Direction and boundaries
Keep the existing Astral Research Authority identity: painted observatory scenes, Atomic Zodiac book/comic artwork, current fonts, hand-cut panel corners and established hero slides. This is a usability overhaul, not a theme switch.

Preserve every route, feature, saved item, entitlement, founder edition boundary and chart calculation. No speculative content generation, new charges or payment/access-rule changes. `roadmap.md` remains the sole work index; launch plans remain untouched.

## Baseline findings
The four public pillars, member registry, founder trails and shared readers already exist. Improve their coverage instead of introducing competing systems. Confirmed gaps include public detail breadcrumbs, small close/touch controls, 500ms drawer opening and stepped film effects. Initial phone-sized checks remained blank; diagnose startup/loading before treating any layout as verified. Detailed evidence is in `docs/ux-overhaul-audit-2026-11-22.md`.

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
- Use shape-matched skeletons with stable dimensions and accessible loading announcements; never keep content hidden behind decorative transitions.
- Give empty states one relevant next action: add birth details, create a reading, clear filters or return to the relevant library.
- Add associated field labels, concise requirements, inline errors, invalid-field focus and disabled/busy submit states. Preserve unknown-time, historical timezone and consent behavior.
- Prevent duplicate submissions; retain user input on failure. Translate expected errors into human explanations with retry or an appropriate sign-in/access recovery.
- Keep source-answer denials distinct from generated answers; do not claim a save or payment succeeded before confirmation.

## AstroBook addition — Full chapters in language people understand
The current primary preview enforces 28 numbered pages and selects a single 60–135-word face for many topics. That is an excerpt contract, not a full-chapter reading experience. Expand the primary AstroBook reader rather than merely stretching its layout.

- Build substantive multi-page chapters from the existing six-volume chart-derived content model, with an introduction, the reader’s actual placements and their interaction, a grounded practical interpretation, and relevant reflection prompts. Length follows meaningful content, not repeated filler.
- Start with ordinary-language headings and explanations: what someone may recognize, which measured chart factors support the interpretation, and what remains uncertain. Explain terms such as ruler, aspect, decan, profection, nodes and hidden stems when first introduced; keep technical measurements available in the ledger/glossary rather than leading the narrative.
- Preserve Shane’s personable narrative and April’s precise directness across the three existing tones. Possibility-framed examples are not claims about the reader’s biography; saved personal observations remain opt-in and owner-only.
- Separate chapter length from face capacity: chapters span multiple coherently paginated faces. Replace the rigid 28-page primary-experience contract with actual chapter/page counts and a dynamically generated contents list; explicitly limited excerpts remain labelled excerpts, not “the full book.”
- Respect existing edition coverage and full-book target ranges: Digital 45–70, Pocket 50–75, Classic 75–120, Signature 90–150, Linen 100–180 pages. Do not pad text or promise a page count unsupported by generated content. World Systems remains excluded from Pocket.
- Keep chart-relative plates facing the relevant narrative, current Atomic Zodiac jackets, custom uploads, names/dedications and consistent browser/PDF text. No added comic imagery inside the AstroBook.
- Untimed charts receive meaningful element, planetary and aspect/cycle chapters without invented Ascendant or houses; Moon uncertainty remains explicit.
- Use the same fuller model for public fictional samples, member personalized previews, customizer/drawers and authorized founder touchpoints. Never publish founder text/chart facts as a public sample or substitute the viewer’s chart for another edition.
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
- Run every existing Vitest suite and targeted regression tests after each coherent batch; add behavioral tests for changed dismissal, confirmation and navigation rules, not styling snapshots.
- Use the automatic preview build/typecheck results; resolve current errors and finish with a clean build log and diff check.
- Browser-test central flows with real authorized saved-chart state: navigation/search, form invalid→valid→pending→result, reading retry, book/comic turns and dismissal. Test forced network failure and slow loading where safe.
- Validate desktop/phone screenshots, runtime errors, keyboard-only navigation, Escape/backdrop/focus restoration, reduced motion and accessibility checks.
- Track every registered route in a coverage matrix with role, state, result and evidence. A redirect or blank screen is not a page pass; inaccessible founder/paid/admin states stay explicitly unverified until authorized.
- No real order, email or print dispatch during checks. Report external dependencies separately; they do not prevent finishing presentation work.
- Commit the completed work and provide a concise delivered/blocked summary. Publishing remains a separate action.

## Technical approach
Make focused, shared-first changes to the existing navigation registry, shells/wayfinding, Radix controls, form/state components, global tokens/motion and route metadata, then fix remaining page-specific exceptions. Keep chart math, backend permissions, payment confirmation and source content unchanged. Avoid broad CSS overrides that silently alter charts, books or devices.

## Completion criteria
All six requested areas have a route/state coverage record; no known critical usability defect is left without a named blocker. Tests and the automatic build pass. Mobile pages have no document-level horizontal overflow, complete reader pages remain reachable, ordinary overlays dismiss three ways, destructive actions require confirmation, and reduced motion disables decorative animation.
The added AstroBook requirement is complete only when the primary reader contains actual multi-page, plain-language chapters with matching contents and PDF output, not merely larger one-page summaries.