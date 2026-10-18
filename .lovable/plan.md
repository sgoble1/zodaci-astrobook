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