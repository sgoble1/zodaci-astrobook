# Zodaci: public launch, trust and sustainable revenue

## Decision and scope
Repair purchase, privacy and generation reliability before increasing acquisition. Then clarify the offer and polish the customer journey. This is a proposed implementation plan, not a declaration that the site is finished. No prices, allowances, campaigns or payment behavior have been changed by this review.

Use **Brand & Revenue Strategist** for coordinated design, SEO, marketing and cost decisions. Preserve April's original edition, authorized Shane access, owner-only charts, protected sources, consent and server-enforced entitlements.

## Evidence baseline — 18 October 2026
- **Observed:** 35 tests across six files pass; latest preview build reports OK. Public welcome, books, pricing, sample and sign-in pages render without captured runtime errors. Books at 390px has no horizontal overflow. These checks are not a full accessibility or device audit.
- **Observed:** Expanded selection displays $89; choosing digital leaves the edition card showing “softcover $89” while the format choice says $19.99. The price changes, but the labels make the offer ambiguous.
- **Observed:** Fictional Jules Harbor PDF opens and renders 14 pages. It is a sample, not proof of a complete 250/400-page purchased manuscript.
- **Observed:** Onboarding's self-description input disappears after one typed character; no profile changes were saved during verification.
- **Observed live rules:** Order insertion still requires $45/$80 and a US address. Current $59/$89 and address-free $19.99 digital drafts conflict with this rule. The paid-plan helper also accepts sandbox OR live subscriptions.
- **Observed:** SEO HTTP/lint/metadata foundations pass. Deep security results are stale even though returned findings are empty; current security clearance is unverified.
- **Observed aggregate:** Sep 19–Oct 18: 108 visits, 858 pageviews; 81 mobile and 26 desktop visits attributed; 103 Direct and 5 Search. This is not a customer count or proven conversion funnel.
- **Observed cost samples:** Recent successful gateway calls include 0.16037 credits/11.9 seconds and 0.43197/43.1 seconds; another group ranges roughly 0.61–0.79 credits/63–76 seconds. Calls are not mapped to individual feature jobs, so earlier 0.20–0.25-credit-per-reading estimates are not validated.
- **Blocked:** No verified Zodaci property returned from Shawn's Google Search Console. No confirmed Pixartprinting quote, real paid delivery test or Zodaci sender setup. A verified unrelated workspace email domain exists; do not silently use it for Zodaci.
- **Unknown:** Aggregate order/subscription reads returned no records, but do not establish total historical sales elsewhere. Actual AI dollars, fees, retention, CAC and complete customer cohorts are unavailable.

## Prioritized findings and remedies
Labels: **O** = observed browser/live rule; **S** = source-supported gap/risk, production behavior not reproduced; **H** = hypothesis; **B** = blocked proof. High-confidence O/S findings precede lower-confidence H recommendations. Effort S/M/L is relative, not a delivery promise.

| Priority / domain | Evidence and customer/business impact | Action | Effort / dependency |
|---|---|---|---|
| P0 Purchase | O: old order policy rejects current prices/digital addresses | Align live rules with canonical format-aware prices; preserve owner/draft restrictions | S; migration + rejection tests |
| P0 Access | O/S: sandbox entitlement qualifies for paid production readings | Server-select environment; prevent test entitlement unlocking live AI | M; role/environment matrix |
| P0 Fulfillment | S: sandbox books mix into dispatch/PDF eligibility | Separate sandbox queue; prevent real production from test payments | M; webhook/dispatch tests |
| P0 Trust | S: Expanded composes same chapters as Standard; 250/400-page targets unsupported | Define and implement genuinely different manuscript specifications; show actual reviewed page count. If not ready, block unsupported edition purchase | L; owner specification decision |
| P0 Spend | S: no atomic reservation; duplicate jobs and concurrent limits can overspend | Unique jobs, atomic quota reservations, leases and actual-call reconciliation | L; concurrency tests |
| P0 Privacy | S risk: pending private download/account switch can leave stale state | Immediate clear, versioned checks, session-bound downloads; test delayed responses | M; authorized privacy matrix |
| P0 Payment proof | B: no completed paid checkout→PDF→receipt proof | Isolated sandbox transaction first, then explicitly authorized live proof | M; payment authorization |
| P1 Reliability | S: failed topic work only logs; progress can wait indefinitely | Persist queued/running/failed states; bounded polling, clear retry | M; provider-failure mocks |
| P1 Cancellation | S: starter queue ignores Stop and may continue after sign-out | Session-bound cancellation in both queues and server | M; deferred-job tests |
| P1 Retry | S: existing failed/writing/hidden rows can block recovery | Explicit retry transitions; distinguish hidden access from failed work | M; state fixtures |
| P1 Queue | S: tab-wide started flag is not account/chart/plan scoped | Key resumable work to owner, chart revision and entitlement | M; switch/upgrade tests |
| P1 Account state | S risk: late birth/plan responses overwrite current account | Clear immediately and ignore superseded responses | M; account-switch tests |
| P1 Onboarding | O: self-description field disappears | Separate selection mode from typed text; verify save/re-edit | S; input test |
| P1 Sign-in | S: OAuth/confirmation lose intended page | Validated internal destination across all sign-in methods | M; callback tests |
| P1 Permissions | S: admin/shared effective plan differs from raw-subscription checks | One documented entitlement policy across menu/page/function | M; role tests |
| P1 Payment integrity | S: switching environment leaves older payable checkout sessions | Pin order environment; serialize/reconcile sessions | M; duplicate/out-of-order tests |
| P1 Refunds | S: book refunds/disputes/async failures lack lifecycle handling | Verified idempotent transitions; halt unfulfilled production | L; owner book-return policy |
| P1 Payment fields | S/live guard review: payment metadata/printing transitions not fully service-only | Protect payment evidence and valid state transitions server-side | M; direct-update denial tests |
| P1 Receipts | S: history recomputes catalog price; checkout lookup amounts not validated | Snapshot line prices/currency/tax and show verified immutable paid total | M; amount matrix |
| P1 Manuscripts | S: all ready pages included; extras can duplicate chapters | Explicit owner-approved, fresh chapter manifest; extras must be distinct | L; PDF fixtures |
| P1 Covers | S: upload/revision may not invalidate preview; MIME assumptions | Version cover identity; decode/validate files; force re-review on changes | M; corrupt/change tests |
| P1 Dispatch | S: readiness/date/expected-state checks differ across pages | One guarded operation with PDF/preflight/date/tracking approval | M; stale-form tests |
| P1 Operations | S: mixed labels, misleading estimated-cost column, all-order link ignored | Format-specific desk, separate costs, honor authorized deep link | S; browser checks |
| P1 Generation bounds | S: word prompts are not output/input/time/retry caps | Explicit bounded budgets, preserve safety through correction, validate before TTS | M; overlength/error mocks |
| P1 Private loader | S: failed fetch/decompression can block entire app | Safe failure state, bounded retry; public pages remain usable | M; corrupt/503 fixtures |
| P1 Security | B: deep scan stale | Fresh scan before release and after publication; resolve verified findings only | M; scanner completion |
| P1 Email | B: branded sender and real delivery unverified | Configure approved sender; PDF-ready/dispatch emails, retry and deduplication | M; DNS/sender approval |
| P2 Pricing clarity | O: edition/format prices visually contradict | Itemized edition-aware summary everywhere; see design below | S; price rules unchanged |
| P2 Discovery | S: root/welcome roles, sitemap root omission and metadata persistence differ | Verify signed-out entry; align self-canonicals/sitemap and route metadata | M; preserve sitemap mechanism |
| P2 Crawl/share | O initial HTML: generic title, empty app root | Decide public rendering upgrade; truthful per-page share/crawl support | L; migration approval |
| P2 Marketing copy | S: launch/in-stock, automatic-writing tour and credit allowances conflict | Audit public claims against actual behavior; explain usage and book/subscription separation | M; verified allowances |
| P2 Accessibility | O sample canvas; broader review incomplete | HTML excerpts/text alternative, keyboard/contrast/reduced-motion/mobile audit | M; rendered checks |
| P2 Brand polish | O/S: strong book art but heavy cover title panel, repetitive purple surfaces, stale vellum copy | Refine existing identity, hierarchy and product preview, not a new rebrand | M; existing tokens |
| P2 Growth evidence | H/B: low search share; no verified funnel/retention/cost cohorts | Validate events, Search Console and per-feature spend before channel scaling | M; owner access |

## Clear printed and digital prices
Keep the requested retail prices; do not silently alter them:
- **Printed Standard AstroBook — $59**
- **Printed Expanded AstroBook — $89**
- **Digital PDF — $19.99, Standard or Expanded**
- Optional distinct extra sections: **$6.99 each, up to two**. Current code charges extras on digital too; label $19.99 as its base price unless owner approves a different rule.

Choose format first, then edition. Edition cards must use the selected format's price and must not describe a digital edition as softcover. A persistent order summary shows edition/format, base, extras, free US shipping for print, applicable tax calculated at checkout, and subtotal; after payment, show actual tax and total paid. Example: Expanded print $89 + one extra $6.99 + US shipping $0 = **$95.99 before applicable tax**. Apply identical labels to product pages, preview, checkout, customer receipts and admin orders.

Show actual manuscript pages before payment. Keep 250/400 pages as unfulfilled targets, not guaranteed deliverables. Explain that a book is a one-off purchase and does not silently include a subscription.

## Visual direction and customer flow
Retain the planet logo, deep-space violet/gold/ivory tokens, DM Serif Display/Fira Sans, small illustrated badges and slow cinematic motion. Unify spacing, readable line lengths and editorial hierarchy; use gold for orientation, violet for primary actions, and quieter neutral surfaces. Refine cover typography without replacing chart artwork.

Preserve the explicitly required Work → Process → Capabilities → Team → Contact welcome order; do not adopt the audit's proposed replacement without approval. Align labels and destinations across public/member menus while keeping member information private.

Priority journeys:
1. Public offer → sign-in preserving intent → birth details → immediate calculated chart → included readings/previews → clear upgrade.
2. Reading request → visible state → saved result or recoverable failure → return to last reading; Stop really stops future jobs.
3. Book format/edition → explicit chapter/cover manifest → review actual PDF → address only for print → verified payment → immutable owner download → reviewed print job → tracking/email.
4. Creator purchase → verified entitlement → chart/reading management → visible remaining allowance; cancellation and refund reflected accurately.

## Sustainable economics and generation
Estimated Standard contribution: $59 − ($24 print + $9 shipping + $2.20 fees) = **$23.80 / 40.3%**. Expanded: $89 − ($38 + $11 + $3.10) = **$36.90 / 41.5%**. These are estimates, NOT net profit or supplier quotes; exclude AI, support, refunds, reprints and overhead. Do not subtract costs from tax-inclusive receipts.

Measure per-feature tokens/credits, duration, retries and failures without private message bodies. Benchmark full reading, teaser, counselor, cover and audio separately; credit-to-dollar conversion must come from actual billing. Retain on-demand generation and deterministic chart facts; cache by owner/chart/topic/version, not across private users. Fix duplicate costs before reducing quality. Propose per-user/workspace monthly spend budgets and transparent allowances for approval; no new limits in this plan.

Net contribution = tax-exclusive revenue − actual fees − fulfillment − AI − storage/delivery − expected support/refund cost. Break-even orders = fixed monthly costs ÷ measured contribution/order, only when positive. Digital $19.99 is a useful lower-fulfillment offer, but not proven high-margin until generation and support costs are measured. Creator is only $2/month above Full; benchmark heavy-user audio/cover usage before expanding perks or advertising unlimited use.

## 30/60/90-day sequence
**Days 1–30: earn launch trust.** Resolve P0 then payment/recovery P1; price clarity; actual edition specs; sender and supplier proof. Validate aggregate signup→birth-saved→reading-ready→checkout→verified-payment→PDF-ready→dispatch events. Release only after denied-access, concurrent-spend and paid-delivery proofs pass. No acquisition campaign during known purchase failures.

**Days 31–60: test product value.** Improve existing guides with genuine sourced fictional examples; accessible sample excerpts; interview 5–8 consenting chart-curious users/gift buyers. Test sample-first book journey and clearer allowance copy sequentially given low traffic. Success: fewer observed failures, completed charts/orders and measured contribution; do not invent uplift targets. Optional educational email requires consent, authenticated sender and unsubscribe proof before sending.

**Days 61–90: scale what pays.** Validate keyword hypotheses (free birth chart, reading a birth chart, unknown birth time, personalized astrology book/gift) using actual query/SERP evidence. Pilot relevant partners and narrow paid-intent campaigns only with an approved spending cap. Compare retained paid cohorts and tax-exclusive contribution, not visits alone. Stop on negative contribution, exceeded approved budget, checkout failures, privacy concerns or complaints; inconclusive small samples do not justify scaling.

## Technical acceptance and release gates
Expand tests beyond helpers: live database authorization, sandbox/live isolation, webhook/session replay, refunds, chapter/cover manifests, owner/admin PDF downloads, queue concurrency/cancellation/retry, session races, and historical timezone/DST/house fixtures. Use mocks for paid providers; one authorized purchase proof verifies UI read-back and download. Re-run public/mobile flows, keyboard checks, build signals and fresh security scans before/after approved publishing.

Preserve existing sitemap mechanism; add only public indexable routes and authoritative page-specific lastmod values. Never expose private pages/source text through SEO, samples or marketing analytics. Accurate initial public content/share metadata may require a rendering upgrade; evaluate that separately before structural migration.

## Owner decisions / external dependencies
Approval needed: this implementation scope; meaningful Expanded specification; actual printer quote and paid proof copy; branded sender; measured AI budget/allowances; book refund/production cancellation rules; optional rendering migration, campaigns and spend caps. No unsupported claims of “100% finished,” real supplier integration or guaranteed revenue.