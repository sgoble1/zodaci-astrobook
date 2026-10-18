# Zodaci: public launch, trust and sustainable revenue

## Decision and scope
Repair purchase, privacy and generation reliability before increasing acquisition. Then clarify the offer and polish the customer journey. This is a proposed implementation plan, not a declaration that the site is finished. Prices and payment behavior remain unchanged.

Use **Brand & Revenue Strategist** for coordinated design, SEO, marketing and cost decisions. Preserve April's original edition, authorized Shane access, owner-only charts, protected sources, consent and server-enforced entitlements.

## Evidence — 18 October 2026
**Observed:** 35 tests pass; preview build OK; public pages render; books has no overflow at 390px. Sample PDF renders 14 fictional pages. Expanded/digital labels conflict; onboarding self-description disappears. Live order rules require old $45/$80 prices and US addresses; paid helper accepts sandbox OR live.

SEO foundations pass but deep security is stale. Monthly analytics: 108 visits/858 pageviews, mostly Direct; not customer/conversion counts. AI call samples cost 0.16–0.79 credits/12–76 seconds, not mapped to reading jobs. Earlier per-reading estimates remain unverified.

**Blocked/unknown:** verified Zodaci Search Console property, printer quote, paid-delivery proof, branded sender, actual AI dollars/fees/CAC/retention. Do not reuse an unrelated verified email domain silently or interpret empty order reads as historical sales proof.

## Prioritized findings
**O** observed browser/live rule; **S** source-supported risk, not reproduced in production; **B** blocked proof; **H** hypothesis. High-confidence O/S precede H. Effort S/M/L is relative. Customer impact includes failed purchases, wrong access, lost work, cost waste and unclear offers.

| Priority / evidence | Gap → action | Effort / dependency |
|---|---|---|
| P0 O Purchase | Old prices/address rule → canonical format-aware owner/draft policy | S; migration tests |
| P0 O/S Access | Sandbox qualifies for live AI → server-selected environment | M; entitlement matrix |
| P0 S Fulfillment | Test payments enter dispatch/PDF queue → isolate sandbox | M; webhook tests |
| P0 S Product | Expanded has same chapters; 250/400 pages unsupported → distinct specification/actual pages; block unsupported sale | L; owner specs |
| P0 S Spend | Concurrent/duplicate jobs overspend → atomic quota/job reservations and reconciliation | L; concurrency tests |
| P0 S Privacy | Pending download/session change may leave stale data → immediate clear/version guards | M; authorized race tests |
| P0 B Payment | No paid checkout→receipt→PDF proof → sandbox then authorized live test | M; approval |
| P1 S Recovery | Jobs fail only in logs; polling indefinite → persisted terminal states/bounded retry | M; failure mocks |
| P1 S Stop | Starter queue ignores cancellation/sign-out → session-bound server cancellation | M; deferred tests |
| P1 S Retry | Existing failed/writing/hidden row blocks recovery → explicit state transitions | M; state tests |
| P1 S Queue | Tab-wide flag ignores owner/chart/upgrade → scoped persisted jobs | M; switch tests |
| P1 S Identity | Late plan/chart response can overwrite new account → clear/version guards | M; race tests |
| P1 O Onboarding | Description disappears after one character → separate mode/text | S; input test |
| P1 S Sign-in | OAuth/confirmation lose destination → validated internal handoff | M; callback tests |
| P1 S Entitlement | Admin/shared UI and server disagree → one documented policy | M; role matrix |
| P1 S Checkout | Replaced environment leaves payable sessions → pin/serialize/reconcile | M; replay tests |
| P1 S Refund | Refund/dispute/async failure not handled → idempotent lifecycle/halt production | L; owner policy |
| P1 S Payment fields | Admin can bypass payment/production sequence → service-only evidence/state machine | M; denial tests |
| P1 S Receipts | Recomputed historical totals; unvalidated lookup prices → immutable currency/tax snapshots | M; price matrix |
| P1 S Manuscript | All ready chapters/duplicated extras → approved fresh manifest/distinct extras | L; PDF fixtures |
| P1 S Cover | Upload changes may retain stale preview; MIME assumptions → version/decode/re-review | M; file tests |
| P1 S Dispatch | Inconsistent readiness/date/stale-state checks → one guarded operation | M; transition tests |
| P1 S Print desk | Mixed labels/fee column/deep link misleading → format-specific actions/costs | S; browser tests |
| P1 S Bounds | Word prompts lack hard budgets → token/input/time/retry caps and correction safety | M; mocks |
| P1 S Loader | Private fetch/decompression failure can block app → safe state/retry/public access | M; corrupt/503 fixtures |
| P1 B Security | Deep scan stale → fresh pre/post-release scan; resolve verified findings | M; scanner |
| P1 B Email | Branded delivery unverified → sender setup/deduplicated PDF and dispatch emails | M; DNS approval |
| P2 O Pricing | Edition/format labels contradict → itemized format-aware totals | S; prices unchanged |
| P2 S SEO | Root/welcome/sitemap/metadata differ → verified entry/self-canonicals/route metadata | M; existing mechanism |
| P2 O Crawl/share | Initial HTML generic/empty root → evaluate public rendering support | L; migration approval |
| P2 S Claims | Launch/in-stock/tour/allowance copy conflicts → verify every promise | M; allowance facts |
| P2 O/S Access/design | Canvas lacks text alternative; hierarchy/cover panel/stale vellum copy → accessible excerpts and identity-preserving polish | M; rendered audit |
| P2 H/B Growth | Search/funnel/retention/spend evidence incomplete → measure before scaling | M; access |

Sources: current Books/Onboarding browser checks, live order/entitlement rules, topic-reading and starter queues, private loader, checkout/webhook, manuscript and dispatch source. Existing tests mostly cover helpers, not these flows.

## Clear printed and digital prices
Keep the requested retail prices; do not silently alter them:
- **Printed Standard AstroBook — $59**
- **Printed Expanded AstroBook — $89**
- **Digital PDF — $19.99, Standard or Expanded**
- Optional distinct extra sections: **$6.99 each, up to two**. Current code charges extras on digital too; label $19.99 as its base price unless owner approves a different rule.

Choose format first, then edition. Edition cards must use the selected format's price and must not describe a digital edition as softcover. A persistent order summary shows edition/format, base, extras, free US shipping for print, applicable tax calculated at checkout, and subtotal; after payment, show actual tax and total paid. Example: Expanded print $89 + one extra $6.99 + US shipping $0 = **$95.99 before applicable tax**. Apply identical labels to product pages, preview, checkout, customer receipts and admin orders.

Show actual manuscript pages before payment. Keep 250/400 pages as unfulfilled targets, not guaranteed deliverables. Explain that a book is a one-off purchase and does not silently include a subscription.

## Visual direction and flow
Preserve logo, violet/gold/ivory tokens, DM Serif Display/Fira Sans, illustrated badges and slow cinematic motion. Quiet surfaces, readable line lengths and consistent hierarchy; refine cover typography. Keep required Work → Process → Capabilities → Team → Contact order.

Repair public offer→intent-preserving sign-in→birth chart→included reading→upgrade; reading→progress→result/retry/Stop; book→manifest→PDF review→payment→download→approved production→tracking; Creator payment→verified access→visible allowance/cancellation.

## Economics and generation
Standard estimated contribution: $59 − $35.20 costs = **$23.80 / 40.3%**. Expanded: $89 − $52.10 = **$36.90 / 41.5%**. Not quotes/net profit; excludes AI/support/refunds/reprints/overhead. Exclude tax from revenue.

Measure feature credits/tokens/duration/retries without message bodies; convert using actual billing. Keep on-demand deterministic facts and owner/chart/topic/version caching. Fix duplicate costs before reducing quality. New spend ceilings/allowances require approval.

Contribution = tax-exclusive revenue minus all variable costs. Break-even = fixed costs divided by positive measured contribution. Digital margin is unproven; Creator adds only $2/month over Full, so benchmark heavy audio/cover usage before expanding perks.

## 30/60/90-day execution
**1–30:** Resolve P0 and payment/recovery P1, price clarity, edition specs, sender/supplier proof. Validate signup→birth-saved→reading-ready→checkout→paid→PDF→dispatch aggregate funnel. No campaigns while purchase failures remain.

**31–60:** Improve existing sourced guides/accessible fictional samples. Interview 5–8 consenting chart-curious/gift users. Sequentially test sample-first ordering and clearer allowances with current low traffic. Measure failures/completed charts/orders/contribution; no invented uplift. Emails require consent/sender/unsubscribe proof.

**61–90:** Validate free-chart, unknown-birth-time and personalized-book/gift keyword hypotheses. Pilot partners/paid intent only with approved caps. Scale on retained cohorts/contribution, not visits. Stop for negative margin, exceeded caps, purchase/privacy failures or complaints; small samples stay inconclusive.

## Technical acceptance and release gates
Test deployed authorization, sandbox/live separation, webhook/refund/session replay, manifests, owner/admin downloads, concurrency/cancellation/retry/session races and timezone/DST/house fixtures. Mock paid providers; an authorized purchase must read back paid status and download via UI. Verify public/mobile/keyboard flows, build and fresh pre/post-release security.

Preserve sitemap mechanism and authoritative page-specific lastmod; exclude private routes/sources. Accurate initial public content/share metadata may need a separate [latest-template SSR upgrade](https://lovable.dev/blog/building-apps-using-tanstack-start), available through “Migrate to TanStack Start” in the slash menu.

## Owner decisions / external dependencies
Approval needed: this implementation scope; meaningful Expanded specification; actual printer quote and paid proof copy; branded sender; measured AI budget/allowances; book refund/production cancellation rules; optional rendering migration, campaigns and spend caps. No unsupported claims of “100% finished,” real supplier integration or guaranteed revenue.