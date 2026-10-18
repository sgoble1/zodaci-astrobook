# Zodaci: public launch, trust and sustainable revenue

## Decision and scope
Repair purchase, privacy and generation reliability before increasing acquisition. Then clarify the offer and polish the customer journey. This is a proposed implementation plan, not a declaration that the site is finished. No prices, allowances, campaigns or payment behavior have been changed by this review.

Use **Brand & Revenue Strategist** for coordinated design, SEO, marketing and cost decisions. Preserve April's original edition, authorized Shane access, owner-only charts, protected sources, consent and server-enforced entitlements.

## Evidence baseline — 18 October 2026
- **Observed:** 35 tests pass; latest preview build OK. Public pages render without captured runtime errors; books has no overflow at 390px. This is not full device/accessibility coverage.
- **Observed:** Expanded says $89; selecting digital leaves its edition card saying “softcover $89” beside a $19.99 format price. Fictional PDF opens with 14 pages, not proof of 250/400-page manuscripts.
- **Observed live rules:** Orders still require $45/$80 and US addresses, incompatible with $59/$89/$19.99 digital. Paid-plan helper accepts sandbox OR live. Onboarding self-description disappears after one character.
- **Observed:** SEO foundations pass; deep security scan is stale. Sep 19–Oct 18: 108 visits, 858 pageviews; 81 mobile/26 desktop attributed; 103 Direct/5 Search. Not customer/conversion counts.
- **Observed AI samples:** Successful calls cost 0.16–0.79 credits and take 12–76 seconds. Not mapped to feature jobs; earlier per-reading estimates remain unvalidated.
- **Blocked/unknown:** No verified Zodaci Search Console property, supplier quote, paid-delivery proof or branded sender. An unrelated verified email domain must not be silently reused. Actual fees, AI dollars, CAC and retention unavailable; empty aggregate order reads do not prove historical sales elsewhere.

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

Technical source references: `topic-readings/index.ts:105–150`, `AutomaticChapters.tsx:13–39`, `useAprilSpace.ts:18–46`, `Onboarding.tsx:80–81`, `create-checkout/index.ts:44–91`, `payments-webhook/index.ts:45–77`, `bookManuscript.ts:36–45`, `ManuscriptPreview.tsx:16–25`, `Dispatch.tsx:17–29`, `PrintOrders.tsx:24–27`, and live `book_orders` policies/`has_paid_plan`/`guard_book_delivery`. Browser evidence confirmed pricing, sample and input behavior. Current tests cover helpers, not these end-to-end behaviors.

## Clear printed and digital prices
Keep the requested retail prices; do not silently alter them:
- **Printed Standard AstroBook — $59**
- **Printed Expanded AstroBook — $89**
- **Digital PDF — $19.99, Standard or Expanded**
- Optional distinct extra sections: **$6.99 each, up to two**. Current code charges extras on digital too; label $19.99 as its base price unless owner approves a different rule.

Choose format first, then edition. Edition cards must use the selected format's price and must not describe a digital edition as softcover. A persistent order summary shows edition/format, base, extras, free US shipping for print, applicable tax calculated at checkout, and subtotal; after payment, show actual tax and total paid. Example: Expanded print $89 + one extra $6.99 + US shipping $0 = **$95.99 before applicable tax**. Apply identical labels to product pages, preview, checkout, customer receipts and admin orders.

Show actual manuscript pages before payment. Keep 250/400 pages as unfulfilled targets, not guaranteed deliverables. Explain that a book is a one-off purchase and does not silently include a subscription.

## Visual direction and flows
Keep planet logo, violet/gold/ivory tokens, DM Serif Display/Fira Sans, illustrated badges and slow cinematic motion. Quiet surfaces, readable line lengths and consistent editorial hierarchy; improve cover title typography rather than replacing artwork. Preserve required Work → Process → Capabilities → Team → Contact order; no unapproved navigation rebrand.

Repair these journeys:
1. Public offer → intent-preserving sign-in → birth data → calculated chart → included readings/previews → upgrade.
2. Request → visible progress → saved result or retry; return to reading; Stop prevents future work.
3. Format/edition → approved chapter/cover manifest → actual PDF review → print address → payment → immutable download → approved print job → tracking/email.
4. Creator payment → verified access → chart/reading management → visible allowance; cancellation/refund reflected accurately.

## Economics and generation
Standard estimate: $59 − ($24 print + $9 shipping + $2.20 fees) = **$23.80 / 40.3%**. Expanded: $89 − ($38 + $11 + $3.10) = **$36.90 / 41.5%**. These exclude AI/support/refunds/reprints/overhead: not net profit or supplier quotes. Never use tax-inclusive receipts as revenue.

Measure each feature's credits/tokens/duration/retries without private message bodies. Map credits to dollars from actual billing. Keep on-demand deterministic facts and owner/chart/topic/version caching. Fix duplicate costs before reducing quality. Propose spend ceilings/transparent allowances for approval, not silently impose them.

Contribution = tax-exclusive revenue − fees − fulfillment − AI − delivery/storage − support/refund provision. Break-even = fixed cost ÷ positive measured contribution/order. Digital $19.99 is a lower-fulfillment hypothesis, not proven high-margin. Creator adds only $2/month over Full; benchmark heavy-user audio/cover costs before expanding perks.

## 30/60/90-day plan
**1–30:** P0 then payment/recovery P1, clear pricing, edition specifications, sender/supplier proof. Validate aggregate signup→birth-saved→reading-ready→checkout→verified-payment→PDF-ready→dispatch events. No acquisition campaigns while purchases fail.

**31–60:** Improve existing sourced guides and accessible fictional samples. Interview 5–8 consenting chart-curious/gift users. Test sample-first ordering and allowance clarity sequentially with low traffic. Measure completed charts/orders, failures and contribution, not invented uplift. Educational emails require consent/sender/unsubscribe proof.

**61–90:** Validate search hypotheses: free birth chart, reading a chart, unknown birth time, personalized astrology book/gift. Pilot partners/narrow paid intent only with approved budgets. Scale on retained cohorts and contribution, not visits. Stop for negative contribution, exceeded caps, purchase failures, privacy issues or complaints; small samples remain inconclusive.

## Technical acceptance and release gates
Test deployed authorization, sandbox/live separation, session/webhook replay/refunds, chapter/cover manifests, owner/admin downloads, concurrency/cancellation/retry/session races and timezone/DST/house fixtures. Mock paid providers; authorized purchase proof must read back paid status and download via UI. Recheck public/mobile/keyboard flows, build signals and fresh security before/after approved publishing.

Preserve sitemap mechanism; include only public indexable routes and authoritative page-specific lastmod. Protect private sources in samples/SEO/analytics. Route-specific metadata and initial public content may need a separately approved rendering upgrade. [Lovable's latest template supports SSR](https://lovable.dev/blog/building-apps-using-tanstack-start); ask for an upgrade or choose “Migrate to TanStack Start” from the chat slash menu.

## Owner decisions / external dependencies
Approval needed: this implementation scope; meaningful Expanded specification; actual printer quote and paid proof copy; branded sender; measured AI budget/allowances; book refund/production cancellation rules; optional rendering migration, campaigns and spend caps. No unsupported claims of “100% finished,” real supplier integration or guaranteed revenue.