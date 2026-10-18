# Zodaci experience redesign and customer-flow plan

## Goal

Turn the existing experience into a coherent personal reading companion: easier to navigate, beautiful to read, clear about access and cost, and trustworthy from first chart to purchased book. **Experience Architect** is active for future UX, dashboard, flow and product requests.

This is a redesign proposal, not a claim that every production flow has been tested. The findings below come from current-code review; live checks are part of implementation.

## What the review found

Current-code findings, subject to live verification:

1. **Generation recovery:** failures can resemble missing content; waiting lacks clear recovery. Add accurate states, bounded waits and retry.
2. **Commerce readiness:** paid PDF downloads and dispatch exist, but paid-download verification and customer emails remain open.
3. **Organization:** competing dashboards, repeated links and a sprawling sidebar need a task-led hierarchy.
4. **Access/status:** unrequested readings can say “Writing”; Creator screens use inconsistent entitlement checks.
5. **Freshness:** changed birth details need older-reading labels and selective regeneration.
6. **Admin clarity:** fulfillment competes with growth panels; aggregate counts should not imply a sequential conversion funnel.
7. **Visual hierarchy:** universal glass, glows and gradient headings compete with reading and navigation.

## Visual direction: a personal celestial atlas

Preserve the purple planet logo, deep-space/gold palette, DM Serif Display headings and Fira Sans body. Use chapter hierarchy, fine rules, generous reading space, purposeful illustrations and real chart/book previews. Numbers become small reference badges beside meaningful art.

Use brand-required glass primarily in navigation/overlays, not every section. Replace universal gradients/glows and nested cards with clear titles and one primary action. Keep cinematic decoration extremely slow, content access immediate, and reduced-motion states static.

Protect April’s archived illustrations, documents and original presentation. Preserve public Work → Process → Capabilities → Team → Contact ordering.

## Navigation and dashboard

**General member destinations:** Dashboard · My Chart · Readings · Reflect · Relationships · My Library.

- Group chart details and Other Systems under My Chart/Explore; retain every destination through labeled groups and search.
- Group themes and deeper topic readings under Readings, with readable “Included,” “First-section preview” and plan-required indicators.
- Keep account, birth details, pricing and subscription management together in account controls. Show Creator Studio only where appropriate; Admin remains role-only.
- Keep public community, workspaces and the restricted April/Shane shared space distinct.
- Use visible main destinations on desktop and a compact labeled menu on smaller screens. Preserve deep links, current-page highlighting, keyboard navigation and search.

**Member dashboard hierarchy:**
1. Finish setup or continue the last meaningful activity.
2. Current reading and accurate generation status.
3. Personal chart snapshot, including unknown-time limitations.
4. Saved readings, notes and recent audio.
5. Active book purchases/downloads/tracking.
6. Optional discovery and context-relevant upgrade suggestions.

Adapt these sections to Free, Full and Creator; do not produce three disconnected dashboards or overwhelm an empty first visit.

## Flow and process enhancements

### 1. Visitor → account → first result
- Preserve sign-in before birth details. Make public discovery, sample book and plan comparison easy to reach without exposing private material.
- Preserve answers when going back; review birth details before saving.
- Show the calculated chart immediately and recommend one reading; respect generation-stop choices.

### 2. Explore → generate → return
- Keep on-demand writing, low effort and existing length targets; no bulk 38-reading generation or increased free allowances.
- Separate not-requested, queued, writing, ready, first-section preview, stopped and failed states. Provide retry/resume and honest progress without invented completion times.
- Preserve two full free readings and one-section core-theme previews. Paid-only topics remain paid-only; opening a core preview after upgrading expands it according to existing rules.
- Distinguish calculated placements from interpretation; expose technical detail when wanted. Save reading position and make returning to the last page straightforward.
- Label readings based on older birth details; explain selective regeneration usage first.

### 3. Preview → upgrade → paid access
- Explain plan access and usage limits; do not imply unlimited generation.
- Return upgrades to their originating task after verified entitlement refresh.
- Preserve cancelled/pending context; never unlock from a success redirect alone.
- Measure upgrade interest and verified subscription completion without collecting typed text or private messages.

### 4. Sample → configure book → payment → PDF → fulfillment
- Structure configuration as edition/digital-or-print → cover → manuscript review → address when printed → final total → payment.
- Preserve both digital editions at **$19.99**, printed Standard **$59**, Expanded **$89**, and existing extras. Clearly distinguish one-off purchases from subscriptions.
- Show actual reviewed manuscript length; never fake 250/400 pages or claim the sample is the customer’s book.
- Preserve drafts on failure; freeze the reviewed PDF before checkout and finalize only after verified payment.
- Digital journey: Pending payment → PDF ready → authorized download. No address or dispatch step.
- Printed journey: Pending payment → PDF ready → fulfillment status → dispatched with carrier, tracking and address. Do not display “Printing” unless fulfillment actually records it.
- Verify customer/admin PDF downloads and dispatch updates with an authorized test order. Do not submit a real charge without explicit authorization.
- Finish PDF-ready and dispatch emails after a verified sender domain is configured. Payment confirmation must not imply dispatch or contain invented tracking.
- Keep printer costs labeled as estimates until an actual quote is supplied. No automatic Pixartprinting job or real shipping quote is promised without a supported, verified integration.

### 5. Administrator → operational resolution
- Create distinct Operations, Content and Growth views using existing administration, orders and dispatch tools rather than duplicating them.
- Operations leads with paid orders needing attention, PDF failures and dispatch readiness; add clear loading/retry/empty states.
- Growth distinguishes real customers, test transactions, aggregate events and cohort conversion.
- Content review stays separate from private counselor histories and preserves current role checks.

## Product recommendations to validate

Optional hypotheses, not promised revenue or new pricing:

- **Continue Reading:** resume the last section; measure returning members completing a reading.
- **Guided discovery:** a few goal-based paths using existing topics; measure time to a useful result without bulk generation.
- **Book readiness:** finished-reading checklist and honest PDF length; measure fewer failed checkouts, never fake page counts.
- **Usage transparency:** distinguish included and limited actions before generation; reduce cost confusion without invented credit promises.
- **Chart confidence:** birth-time uncertainty and older-reading labels; reduce incorrect expectations.
- **Responsible feedback:** optional usefulness ratings without private writing; identify weak results safely.

Start with Continue Reading and Book Readiness; defer extras until core journeys are reliable.

## Delivery phases

1. **Trust:** validate journeys; fix recovery, status/access inconsistencies and misleading funnel labels.
2. **Organization:** shared task-based navigation, member starting point and admin operations hierarchy.
3. **Visuals:** dashboard/readings first, then charts/library/books/results; protect April’s edition.
4. **Commerce/retention:** configuration, statuses, reading resume and upgrade handoff; emails after sender setup.
5. **Release checks:** authorized account matrix, accessibility, regression tests and fresh security/SEO review. Publish only on explicit request.

## Technical implementation notes

Extend the existing navigation registry and synchronize search/Instructions. Reuse semantic tokens, controls, on-demand generation, PDF delivery and Dispatch rather than duplicating systems. Align effective plan checks without weakening server-side authorization. Preserve April’s authorized loading and sign-out clearing. Add focused rule tests; verify interactions in the browser.

## Acceptance checks and blockers

- Every existing destination remains reachable; no dead ends or private/shared navigation leaks across signed-out, Free, Full, Creator and Admin states.
- A free member can read the first core-theme section but cannot retrieve paid content through the redesigned flow; Love/Career retain current paid locks.
- A requested reading reaches ready or a recoverable failure; stopped generation stays stopped. Unrequested readings never appear as actively writing.
- Desktop, phone, tablet, 320px reflow, 200% text sizing, long labels, keyboard focus and reduced motion remain usable; no clipping, blank charts or overlapping audio/navigation.
- An authorized paid test order shows the correct product/total, finalized downloadable PDF and customer-visible dispatch update where applicable.
- **External gates:** verified sender domain for emails; approved test transaction for payment/download confirmation; real printer quote/integration for actual print automation. No complete-launch claim until these are verified.

## Evidence informing the proposal

- [Visible navigation and discoverability](https://www.nngroup.com/articles/hamburger-menus/)
- [Progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
- [Accessible typography hierarchy](https://design-system.service.gov.uk/styles/type-scale/)
- [WCAG 2.2 guidance](https://www.w3.org/WAI/WCAG22/Understanding/)
- [Clear form questions and headings](https://design-system.service.gov.uk/get-started/labels-legends-headings/)

These are established usability references, not an invented “latest 2026” trend claim. The celestial-atlas direction is a brand-specific design hypothesis to validate against real tasks.