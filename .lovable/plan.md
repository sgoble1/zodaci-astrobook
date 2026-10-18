# Zodaci experience redesign and customer-flow plan

## Goal

Turn the existing experience into a coherent personal reading companion: easier to navigate, beautiful to read, clear about access and cost, and trustworthy from first chart to purchased book. **Experience Architect** is active for future UX, dashboard, flow and product requests.

This is a redesign proposal, not a claim that every production flow has been tested. The findings below come from current-code review; live checks are part of implementation.

## What the review found

| Priority | Finding | Proposed outcome |
|---|---|---|
| First | Reading failures can resemble missing content; waiting can continue without clear recovery. | Accurate requested/writing/preview/ready/stopped/failed states, bounded waits and explicit retry. |
| First | PDF storage, paid downloads and dispatch already exist, but a paid-order download remains unverified; customer emails remain blocked. | Verify the complete order journey; finish notifications after sender setup. |
| High | Several competing home/dashboard pages and a long sidebar with repeated destinations. | One member starting point with a clear next action and task-based groups. |
| High | Unrequested readings can be labeled “Writing”; Creator access uses inconsistent checks across screens. | Consistent status and effective access rules without changing paid entitlements. |
| High | Changing birth details leaves older readings without a strong freshness signal. | Clearly identify older results and offer selective rewriting, not a costly automatic rewrite. |
| Medium | Admin growth panels overshadow fulfillment; aggregate counts resemble a sequential conversion funnel. | Separate operations from growth; distinguish aggregate signals from actual cohort conversion. |
| Medium | Decorative gradients, universal glass surfaces and glowing navigation compete with text hierarchy. | Brand-led editorial layouts and restrained accents rather than a generic AI dashboard. |

## Visual direction: a personal celestial atlas

- Preserve the purple planet logo, deep-space palette, gold accents, DM Serif Display headings and Fira Sans reading/control text.
- Use clear chapter-like hierarchy, generous reading space, fine rules, purposeful illustrations and real chart/book previews. Numbers remain small reference badges beside meaningful artwork.
- Use glass sparingly for navigation and overlays, not every section. Remove universal gradient headings, unnecessary glows and card-within-card layouts from the redesigned member screens.
- Give each page an obvious title, relevant context and one primary action. Use consistent heading, body, caption and control sizes; prioritize reading comfort over density.
- Preserve extremely slow decorative cinematic motion, but never delay access to content; provide static reduced-motion states.
- Do not change April’s archived illustrations, documents or original private-edition presentation. Keep public Work → Process → Capabilities → Team → Contact ordering intact.

## Navigation and dashboard

**General member destinations:** Dashboard · My Chart · Readings · Reflect · Relationships · My Library.

- Group Planets, Houses, Aspects, Fixed Stars and Other Systems under My Chart/Explore; keep every existing destination discoverable through labeled groups and search.
- Group themes and deeper topic readings under Readings, with readable “Included,” “First-section preview” and plan-required indicators.
- Keep account, birth details, pricing and subscription management together in account controls. Show Creator Studio only where appropriate; Admin remains role-only.
- Keep public community, member workspaces and April/Shane’s restricted shared space distinct. Never expose the private shared menu to ordinary members.
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
- Keep setup answers when moving back; show a review before saving, including name, date, time and place.
- On completion, show the calculated chart immediately and recommend one useful starting reading. Respect existing generation-stop choices.

### 2. Explore → generate → return
- Keep on-demand writing, low reasoning effort and existing length targets. Do not automatically generate all 38 readings or increase free allowances.
- Separate not-requested, queued, writing, ready, first-section preview, stopped and failed states. Provide retry/resume and honest progress without invented completion times.
- Preserve two full free readings and one-section core-theme previews. Paid-only topics remain paid-only; opening a core preview after upgrading expands it according to existing rules.
- Distinguish calculated placements from interpretation; expose technical detail when wanted. Save reading position and make returning to the last page straightforward.
- Identify readings based on older birth details; explain selective regeneration and its usage implications before starting it.

### 3. Preview → upgrade → paid access
- Explain exactly what a selected plan unlocks and what remains usage-limited. Avoid suggesting that unlimited generation is included.
- Keep an upgrade’s originating page so a completed payment returns the member to that task after verified entitlement refresh.
- Support cancelled and pending payments without losing context. Never unlock content on a client-side success redirect alone.
- Measure upgrade interest and verified subscription completion without collecting typed text or private messages.

### 4. Sample → configure book → payment → PDF → fulfillment
- Structure configuration as edition/digital-or-print → cover → manuscript review → address when printed → final total → payment.
- Preserve both digital editions at **$19.99**, printed Standard **$59**, Expanded **$89**, and existing extras. Clearly distinguish one-off purchases from subscriptions.
- Show actual reviewed manuscript length; never fake 250/400 pages or claim the sample is the customer’s book.
- Keep drafts and selected covers through recoverable failures. Freeze the reviewed PDF before checkout and finalize it only after verified payment, as the existing order process requires.
- Digital journey: Pending payment → PDF ready → authorized download. No address or dispatch step.
- Printed journey: Pending payment → PDF ready → fulfillment status → dispatched with carrier, tracking and address. Do not display “Printing” unless fulfillment actually records it.
- Verify customer/admin PDF downloads and dispatch updates with an authorized test order. Do not submit a real charge without explicit authorization.
- Finish PDF-ready and dispatch emails after a verified sender domain is configured. Payment confirmation must not imply dispatch or contain invented tracking.
- Keep printer costs labeled as estimates until an actual quote is supplied. No automatic Pixartprinting job or real shipping quote is promised without a supported, verified integration.

### 5. Administrator → operational resolution
- Create distinct Operations, Content and Growth views using existing administration, orders and dispatch tools rather than duplicating them.
- Operations leads with paid orders needing attention, PDF failures and dispatch readiness; add clear loading/retry/empty states.
- Growth shows real customers, subscription conversions and book sales; separate test transactions and aggregated events from cohort conversion.
- Content review stays separate from private counselor histories and preserves current role checks.

## Product recommendations to validate

These are optional hypotheses, not guaranteed revenue improvements or new pricing commitments.

| Recommendation | Smallest useful version | Success signal / guardrail |
|---|---|---|
| Continue Reading | Last page/section with a single resume action | More returning members resume reading; private to account |
| Guided discovery | A few goal-based paths using existing topics | Faster first useful result; no bulk generation or invented personal biography |
| Book readiness | Honest checklist of selected finished readings and reviewed PDF | Fewer failed checkouts; no false target page count |
| Usage transparency | Included versus limited generation before starting | Fewer surprise waits/cost questions; no unsupported exact credit promises |
| Chart confidence | Clear birth-time uncertainty and older-reading labels | Fewer incorrect expectations; chart facts remain calculated |
| Responsible feedback | Optional usefulness feedback without chat text | Identify weak results without collecting sensitive writing |

Start with Continue Reading and Book Readiness; defer additional features until the core journeys are reliable.

## Delivery phases

1. **Trust and flow:** validate current journeys; repair generation state/recovery, entitlement inconsistencies and misleading conversion labels.
2. **Organization:** shared navigation grouping, one member starting point, role-appropriate menus and admin operations hierarchy.
3. **Visual and reading experience:** implement the celestial-atlas design on dashboard/readings first, then chart, library, book and result pages; protect April’s edition.
4. **Commerce and retention:** refine book configuration/status, returning-reading experience and upgrade handoff; finish emails when sender setup allows.
5. **Release verification:** authorized account matrix, responsive/accessibility checks, focused regression tests and current security/SEO review. Publishing requires a separate explicit request.

## Technical implementation notes

- Extend the existing navigation registry; preserve routes and synchronize Instructions/search. Use semantic CSS tokens and existing interface controls.
- Align Creator/dashboard presentation with effective plan checks; do not weaken server-side subscription, role, row or storage authorization.
- Model generation states explicitly in the existing on-demand hook/progress displays; avoid a second competing queue. Validate concurrency against the actual generation implementation before changing it.
- Reuse existing book PDF freeze/finalization/download and Dispatch functionality. Review current delivery settings before assuming integrations are configured.
- Keep complete protected edition payloads out of public bundles; retain authorized hydration, sign-out clearing and Shane’s approved edition switch.
- Add focused tests only for changed state/money/access rules; use browser verification for layout and interactions.

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