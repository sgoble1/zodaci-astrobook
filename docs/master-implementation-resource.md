# Zodaci Master Implementation Resource — v2 (Nov 13 2026)

v2 keeps every item from v1 and adds Part 6 (about 90 new items from a second pass). Work order is unchanged: do Part 6 Track A items alongside Track A.

## What you get
One markdown file, `Zodaci_Master_Implementation_Resource.md`, saved to Files (and linked from roadmap.md as the single source to follow). It merges:
- The 3 current plan docs (Master Platform Blueprint, Updates Ops, Public Audit)
- All 23 archived docs (AstroBook specs, AstroComic print guide, Admin spec, AI cost architecture, Results & Readings, redesign/audit reports, print reports)
- Every unfinished item in roadmap.md (49 open lines) and the 42-batch plan from chat
- Gaps found by checking the code against each document

Each item gets: what it is, source, status (Done / Partial / Missing / Blocked / Superseded), what remains, credit cost (Free / Low AI / High AI / Owner-only), and the order to do it.

## Sources reviewed
- All 26 documents in both collections (read in full and checked against the code by three audits)
- Full chat history (1,207 messages), roadmap.md (49 open lines), the 42-batch plan, project rules and memory

## Removed because it no longer applies
- **Resend**: all email (shipping notices, newsletters, welcome, digests) moves to Lovable's built-in email from your own sender domain. Existing Resend code is swapped out, not extended.
- **Stripe admin tooling from old docs**: refunds, disputes, coupons, failed-payment retries, MRR dashboards built on Stripe. Shopify handles shop payments, refunds and discounts in its own admin. Stripe stays only for what still runs through it (memberships and credit packs), and is reviewed to confirm which products still need it.
- Old prices, old fonts/colors, Mystic Ink/Helquist, Fallout, purple/teal rebrands, fake reviews/scarcity, separate admin tables, old `/app/*` URLs, AstroComic-by-title personalization (Issue #1 is a fixed story).

## How it is organized

1. **Rules that override old docs** — current theme, fonts, prices (plans.ts / books.ts), privacy, "never invent" rules. Old doc items that conflict are listed as Superseded so they are never rebuilt (old prices, purple/Mystic Ink styles, Fallout, fake testimonials/scarcity, parallel admin tables).
2. **Cost-saving method** — do free (no-AI) code work first; batch related files per build; deterministic text before AI; reuse a reviewed placement library instead of per-user long writes; cap AI by job claiming; verify with tests + one browser pass per batch; update logs every 5 rounds.
3. **Work tracks, in order**

### Track A — Bugs and privacy fixes (free, first)
- Shared-edition reading hook can show the viewer's own saved reading before the edition check
- AstroComic FAQ promises current-month start but code always starts next month
- Comic "CMYK" promise vs RGB preflight wording
- Mystic Ink scene template wording left in prompts
- Onboarding self-description typing loss regression test; stale A→B account response tests
- Lulu error busy-state; Chiron out-of-range notice; admin audit log 1,000-row cap (server paging + multiselect)
- Newsletter scheduling 15-min rule, unsaved-change warning, duplicate campaign
- Swap Lulu shipped email and newsletter sender from Resend to Lovable email
- Podcast player overlapping progress bar; chat safe-area on phones; workbook eyebrow label
- Instructions/search must never surface private text (regression test)
- Onboarding returns to the edition the person came from; community sign-in returns to the page
- Delete retired demo podcast file after next publish
- Shopify settings (store domain/token) moved to one config place
- Clean stale duplicate unchecked lines in roadmap.md (older entries already done)

### Track B — Finish partial features (free)
- Batches 9–42 remaining (Masterbook 3-column parity, Creator exports, ingestion engine, Investigations/Museum depth, Keepsakes PDF, Sibling Bureau, Ask Sources, SEO/fonts, shared-space privacy, Other Systems, cover customizer, 393px audit, referrals/PWA, Observation Log patterns, community pseudonyms, accuracy tests, launch checklist, transits/profection, calculators, contact, Forecast TV, synastry matrix, BaZi/Flying Stars, Purpose/Nodes, document vault, Social Integration, Data quality)
- Chart engine: station (SR/SD) motion, seven chart shapes, true/mean node choice, richer chart-ruler analysis, fingerprint includes node/tone/library version
- Perception Engine typed report blocks; Professional tone; tone debounce
- Recommended-for-you on all five hubs; no-chart banner + badges; breadcrumbs everywhere; guided first tour
- Archive pagination + version history; Zac "Astrological Library" naming; founder calmer frame and full walkthrough
- Admin: skeletons, per-user AI usage table, cache/cost stats, Stripe MRR/churn, failed payments/disputes view (read-only; refunds stay in provider)
- Public: prerendered initial HTML for public pages, real 404s, FAQ completion, structured data, programmatic sign/compatibility guides
- Gift AstroBook flow, social share cards, personal lunar calendar, PWA install (no private caching)
- Official section visibility: April and Zac see only their own book/comic; Shane sees all three (server checked) — verify and test
- Zac workbook prompts served privately, answers saved to his account (verify)
- Unified spec items: Full Moon birth by real lunar timing, spec orbs + Yod, significance ranking, Opening Letter, keep readings when birth unchanged (verify each)
- Signup-first call to action, theme CTAs, interactive demo chart
- "Create a chapter about this" on topics; Wonderings link
- Member character shown on dashboard/header, not only comic covers
- Compendium view for ordinary members (explains it's April's reference)
- Shane dedicated workbook parity; Sibling aliases (twins, half/step) and return flow
- Founder recent-updates feeds kept current (April plain words, Zac with his account details)
- Comic approval blocked until art + preflight pass
- Print report facts in admin production notes and investor page
- AstroComic golden-age restyle and site-wide image consistency (Stage 1b)
- Stage 1.3–1.7 founder frame, shared card look, naming
- Solar return location choice; progressed chart for members (calculation only)
- Shop: personalised listings use the "personalized" tag; one shop audit for Shopify checkout of books/comics vs our own checkout (decide which owns AstroBook/AstroComic payment)
- docs/updates-verification.md checklist of every Updates Ops item

### Track C — Low-AI work (small credit use)
- Reviewed placement library (216 valid planet/sign/state entries, not 240) + transit templates, generated once and reused
- Daily sky precompute; report assembler; model routing (cheap fill, premium synthesis)
- Shane sm-29 correction; podcast/voice daily sky

### Track D — High-AI work (only when credits allow)
- 18 long chapters per member, Volumes IV–VI depth, book page-depth targets
- Shane/Zac artwork matching April; Zac 24-panel comic; buyer Issue #1/#2 art; fictional sample comic redraw
- Zac document extraction / six-volume expansion

### Track E — Owner-only / blocked (listed with exact ask)
- Lulu production keys + proof order; AstroComic printer; Mixam/sticker supplier quotes
- Email sender domain set up in Lovable email → then digests, welcome series, newsletter sending, shipping emails
- April's archive unlock + signed-in April check; Shane birth-detail confirmation for 23 chapters
- One approved test purchase (membership, credit pack, shop order)
- Search Console; social accounts; real testimonials/counts; licensed Sabian text; asteroid reference degrees
- Decisions: World Systems starting edition, page-depth promises, maintenance mode block vs notice, referral reward type, auto print dispatch go-ahead, international shipping, new products (coffee-table book, coil journal, year-ahead, couples book, gift subscription, bundle)

### Track F — Not recommended now
Stripe refunds/disputes/coupons admin (Shopify/Stripe dashboards cover it), Resend, native app, multi-language, Google Drive/Calendar/Contacts/Gmail connectors, birth-certificate OCR, vector semantic cache — kept as optional with reasons.

4. **Per-batch checklist** — tests to run, 393/1280 browser checks, update siteUpdates / devTimeline / founderNews (April in plain words, Zac with account info) / investor page every 5 rounds.
5. **Appendix** — full item ledger table (~300 rows) with source doc and code evidence.

## Technical details
- File: `/mnt/documents/Zodaci_Master_Implementation_Resource.md`; roadmap.md gets one pointer line and its stale duplicate unchecked lines are reconciled into the resource.
- Built from the three code audits already completed this turn (current docs, archived build specs, AstroBook/Comic specs) plus roadmap.md and chat batch list.
- No app code changes in this step; implementation starts with Track A after approval.

---

# Part 2 — Rules that override every old document

| Topic | Current rule (wins over any doc) |
|---|---|
| Name | Zodaci is the site; AstroBook is only the printed book |
| Look | 1950s atomic-age observatory ("Astral Research Authority"): cream #EFE3C8, indigo #1E1E5A, yellow #FFC61A, red #E23B44, brass, black. No Fallout/Vault Boy, fantasy, crystals, cyberpunk |
| Fonts | Alfa Slab One, Libre Franklin, Bebas Neue, Yellowtail |
| Hero | Slide 1 Cartographer woman; slide 2 faces looking up; "Take the Sky Home" untouched; never remove slides |
| Prices | Only in `src/lib/plans.ts` (Pro $9/$89yr, Cosmic $19/$179yr) and `src/lib/books.ts` (Digital $24.99, Pocket $34.99, Classic $59.99, Signature $129, Linen $189); AstroComic Issue #1 print $18.99 |
| Plans | Pro and Cosmic share features; Cosmic differs only in credits |
| Email | Lovable built-in email from your sender domain. No Resend |
| Payments | Shopify for shop goods (checkout, refunds, discounts in Shopify admin). Stripe only for memberships and credit packs |
| Privacy | Founder editions open only to owner or explicit share; admin role alone never opens an edition; April and Zac never see each other's content |
| Truth | No invented testimonials, counts, quotes, scarcity, biographies, degrees. Show uncertainty (April Kua 1 vs 8) |
| Children | Never named; Brandon (1989) only as April's former partner |

# Part 3 — Cost-saving method (same quality, fewer credits)

1. Free code work first (Tracks A, B). AI work (C, D) only after.
2. One batch = related files edited together, one build, one test run, one browser check.
3. Deterministic text and calculations before AI. AI writes only the synthesis paragraph.
4. Generate shared libraries once (placement library, transit templates) and reuse across members; never reuse personal context across people.
5. Claim jobs before AI calls; stop on failure; no retries without a cap.
6. Small pages read in ranges; no re-reading files already open.
7. Every 5 rounds: update siteUpdates, devTimeline, founderNews, investor page — in one edit.
8. Commit after each batch.

# Part 4 — Per-batch checklist
- [ ] Read only the files the batch touches
- [ ] Edit, then check build log
- [ ] Run related tests; add one test per new rule (prices, limits, access)
- [ ] Browser check at 1280 and 393 when layout changes
- [ ] Update roadmap.md line; commit
- [ ] Every 5th batch: updates feeds + investor page

# Part 5 — Ledger (code checked against documents)

Status: Done / Partial / Missing / Blocked / Superseded. Cost: F free, L low AI, H high AI, O owner.

## 5.1 Bugs and privacy
| Item | Source | Status | Cost | Remains |
|---|---|---|---|---|
| Shared-edition reading shows viewer's saved reading first | Ops | Partial | F | Check edition before loading rows (`useOnDemandReading`) |
| Comic FAQ current-month vs next-month start | Comic print | Bug | F | Align FAQ and `comic.ts` |
| CMYK promise vs RGB preflight | Comic print | Partial | F | Correct wording |
| Mystic Ink scene wording | Style guide | Partial | F | Remove from `mysticInk.ts` scene template |
| Onboarding typing loss | Audit | Partial | F | Regression test |
| Stale account responses (birth/plan/subscription) | Audit | Partial | F | Fence + tests |
| OAuth/confirm return to `next` | Audit | Partial | F | End-to-end check |
| Lulu error busy state | Ops | Partial | F | Clear and show error |
| Chiron out-of-range note | Ops | Partial | F | Visible note |
| Audit log 1,000 cap | Admin | Partial | F | Server paging, multi-filter, full export |
| Admin RPC rate limit | Admin | Missing | F | Server limit |
| Effective entitlement consistent (admin/shared) | Audit | Partial | F | Audit UI/RPC/RLS together |
| Referral links keep environment | Ops | Partial | F | Verify preview/custom domain |
| Shopify config hard-coded | Ops | Partial | F | One config place |
| Resend usage in shipped email/newsletter | Chat | Superseded | F | Move to Lovable email |

## 5.2 Navigation and flow
| Item | Source | Status | Cost | Remains |
|---|---|---|---|---|
| Recommended for you on 5 hubs | Ops | Partial | F | Consistent block |
| No-chart banner + badges | Ops | Partial | F | All destinations |
| Breadcrumbs on deep pages | Ops | Partial | F | Zac, official, lessons, systems |
| Guided first tour | Ops | Partial | F | Tool-location walkthrough |
| Results suite flow, RetroGOOD discoverability | Ops | Partial | F | Exit links |
| Sources search + type filters | Ops | Partial | F | Verify |
| Account settings grouped | Ops | Partial | F | Menu cleanup |
| Compendium member view | Ops | Partial | F | Explainer page |
| Sibling aliases/return | Ops | Partial | F | Twins, half/step |
| Member character visible | Ops | Partial | F | Dashboard/header |
| Zac "Astrological Library" naming | Ops | Partial | F | All pages |
| Founder calmer frame, walkthrough | Ops/Chat | Missing | F | Signed-in review each edition |
| Mobile founder Book/Readings | Ops | Partial | F | 393px check |
| Archive pagination + versions | Blueprint | Partial | F | Paging, history |
| Structured personal context propagated | Blueprint | Partial | F | Invalidation + provenance |

## 5.3 Chart engine and readings
| Item | Source | Status | Cost | Remains |
|---|---|---|---|---|
| Station (SR/SD) motion | RetroGOOD | Partial | F | Speed/station metadata |
| RetroGOOD scoring per spec | Unified | Partial | F/O | Approve or align |
| Seven chart shapes | Unified | Partial | F | Bowl, Locomotive, Seesaw, Splash, Splay |
| True vs mean node | Unified | Partial | F/O | Option + disclose |
| Unknown-time solar chart | Unified | Partial | O | Decide policy |
| Fingerprint incl. node/tone/library | Unified | Partial | F | Extend |
| Perception typed report blocks | Unified | Partial | F | Contract |
| Professional tone, debounce | Unified | Partial | F | Full transform |
| Chart ruler analysis | Unified | Partial | F | Dignity/aspects |
| Yod, spec orbs, significance, Opening Letter | Roadmap | Verify | F | Tests |
| Solar return location | Debug | Partial | F | Location choice |
| Progressed chart for members | Debug | Missing | F | Calculation module |
| Placement library (216 entries) | AI arch | Missing | L | Generate once, review |
| Transit templates (top 50) | AI arch | Missing | L | Generate once |
| Daily sky precompute | AI arch | Missing | F | Scheduled, idempotent |
| Report assembler + model routing | AI arch | Missing | F | Static + library + synthesis |
| AI cost/provenance logging | AI arch | Partial | F | Model, tokens, cache hit |
| 18 long chapters per member | Ops | Partial | H | Generate + validate |
| Volumes IV–VI depth / page targets | Ops | Partial | H/O | Deepen or revise promises |
| Asteroids, Sabian | Roadmap | Blocked | O | Reference degrees, licensed text |

## 5.4 Founder editions
| Item | Status | Cost | Remains |
|---|---|---|---|
| Official visibility (April/Zac own only; Shane all) | Verify | F | Server test |
| First-ten-page previews | Done (Nov 13) | — | — |
| Accurate illustrated covers per founder | Partial | H | Art |
| Shane/Zac artwork matching April | Missing | H | Art |
| Shane sm-29 correction; 23-chapter birth confirmation | Blocked | L/O | Owner confirms |
| Zac documents / six volumes | Partial | H | Extract |
| Zac 24-panel comic; Shane private script | Partial | H | Art/script |
| Shane dedicated workbook | Partial | F | Parity |
| Zac workbook prompts private | Verify | F | Test |
| Founder update feeds | Done (Nov 13) | F | Keep current |
| Founder preservation reconciliation | Partial | F | Re-run audit |

## 5.5 Products and shop
| Item | Status | Cost | Remains |
|---|---|---|---|
| Personalised shop listings (tag) | Done (Nov 13) | — | Tag listings in Shopify |
| Decide AstroBook/AstroComic checkout owner (Shopify vs own) | Open | O | Decision |
| Gift AstroBook flow | Partial | F | Recipient + message |
| Share cards | Partial | F | Image cards |
| Comic approval gated by art + preflight | Partial | F | Block |
| International shipping | Partial | O | Countries, quotes |
| Buyer Issue #1/#2 art; fictional sample redraw | Partial | H | Art |
| Lulu auto dispatch | Blocked | O | Keys + go-ahead |
| New products (coffee-table, coil journal, year-ahead, couples book, gift subscription, bundle) | Missing | O | Approve first |
| Physical proofs, printer, sticker supplier | Missing | O | Quotes, samples |

## 5.6 Admin
| Item | Status | Cost | Remains |
|---|---|---|---|
| Loading skeletons | Partial | F | Growth, Credits |
| Newsletter: duplicate, toolbar, test send, SEND confirm, 15-min rule, unsaved warning, reports | Partial/Missing | F | After Lovable email |
| Per-user AI usage table, reset/restrict | Partial | F | Paging, drawer |
| Tier AI config | Missing | F | Keep synced with plans.ts |
| Cache stats | Missing | F | With assembler |
| Maintenance block vs notice | Partial | O | Decide |
| Growth/retention metrics (non-Stripe) | Partial | F | Active readers, cohorts |
| Activity drill-down/export | Partial | F | Export |
| Stripe refunds/disputes/coupons/retries | Superseded | — | Use provider/Shopify admin |

## 5.7 Public site, SEO, growth
| Item | Status | Cost | Remains |
|---|---|---|---|
| Prerendered public HTML | Missing | F | Public routes |
| Real 404s, robots/noindex at edge | Partial | F | Verify |
| FAQ full inventory + structured data | Partial | F | Formats, gifts, credits |
| Programmatic sign/compatibility guides | Missing | F | Unique content |
| Signup-first CTA, theme CTAs, demo chart | Partial | F | Finish |
| Shipping windows/returns copy | Partial | O | Vendor facts |
| Conversion analytics events | Partial | F | Sample, product clicks |
| Lead magnet newsletter | Partial | F | Real guide |
| Learn cadence, bylines | Partial | O | Real authors |
| Testimonials, counts, social accounts | Missing | O | Owner supplies |
| PWA install (no private caching) | Missing | F | Manifest + worker |
| Digests, welcome series, reactivation | Missing | F | After Lovable email domain |
| Transit push alerts | Missing | F | Later |
| Community starter posts | Missing | O | Real posts only |
| Search Console | Blocked | O | Connect |

## 5.8 Batches 9–42 (from chat plan)
9 Masterbook 3-column parity · 10 Personal context & podcast fences · 11 Creator exports · 12 Document ingestion engine · 13 Investigations dossiers · 14 Museum & microfilm Archive · 15 Keepsakes/Star Scroll PDF · 16 Sibling Bureau synastry · 17 Ask Sources citations & 402 · 18 Metadata/SEO/fonts · 19 Shared spaces/audio/counselor privacy · 20 Observatory AI · 21 Other systems/Kua 1 vs 8 · 22 Developer status/build cost · 23 Cover customizer & spine · 24 Mobile 393px audit · 25 Referrals & PWA · 26 Newsletter console (Lovable email) · 27 Observation Log patterns · 28 Community pseudonyms & chart share · 29 Accuracy regression tests · 30 Launch checklist · 31 Transits/profection · 32 Retrogrades/affirmations · 33 Calculators/house systems · 34 Custom pages & workbook protection · 35 Contact bureau & dispatch · 36 Forecast 5-channel TV · 37 Synastry matrix/timeline · 38 BaZi/Feng Shui/Flying Stars/Numerology · 39 Purpose/Nodes/Star map · 40 Document vault/PDF/audio · 41 Social Integration counselor & Wonderings · 42 Data quality/Deductions/rectification. Audit existing code first; many are partly built.

## 5.9 Superseded — never rebuild
Old subscription and book prices · Cormorant/Inter/DM Serif fonts · purple/teal/nebula themes · Mystic Ink/Helquist/Celestial Noir · Fallout imagery · Resend · Stripe refund/dispute/coupon admin · fake reviews/counts/scarcity/loading delays · client email allowlists or `admins` table · `/app/*` URLs · forcing demos to a named founder · title-based comic personalization.

---

# Part 6 — Deep analysis additions (v2, Nov 13 2026)
Everything above is kept. These items were found in a second pass over all 26 documents, the code and chat history. None repeat Parts 1–5. Resend, Stripe refund/dispute admin, and old styles stay excluded.

## 6.1 From code checked against documents
### Shop cart (Shopify) — Track A, free
| Item | Where | Status | Remains |
|---|---|---|---|
| Cart create/add/update/remove failures are silent (logged only) | cartStore.ts | Bug | Show a clear message and retry to the buyer |
| Overlapping cart clicks use stale data | cartStore.ts | Bug | Queue cart actions |
| Lines without a Shopify line ID can't be changed or removed | cartStore.ts | Bug | Rebuild those lines |
| Expired cart clears everything | cartStore.ts | Partial | Recreate cart and repeat the action |
| Sync checks only quantity; prices can go stale | cartStore.ts | Partial | Refresh lines and prices from Shopify |
| Only first 100 cart lines / 20 variants / 20 catalog pages read | cartStore.ts, shopify.ts | Partial | Page through; flag truncation |
| No timeout or retry on shop requests | shopify.ts | Missing | Bounded timeout + retry |
| Buyers can see Shopify billing instructions meant for the owner | shopify.ts | Bug | Neutral "shop unavailable" for buyers; detail for admins |
| Cart failure tests | — | Missing | Rejected, expired, overlapping, missing-ID cases |

### Contact form and newsletter (moving to Lovable email) — Track A, free
| Item | Status | Remains |
|---|---|---|
| No rate limit on newsletter signup or contact form | Missing | Per-address/IP limit before saving or sending |
| Size limit trusts the request header only | Partial | Limit actual bytes read |
| Re-signing up resends the welcome email | Bug | Send only on a new subscription |
| No address confirmation (double opt-in) | Missing | Confirm before marketing sends |
| Unsubscribe is "reply to unsubscribe" | Partial | One-click unsubscribe link + suppression list |
| Consent time/form version not stored | Partial | Store with the signup |
| Delivery failures not recorded; missing admin notify address silent | Bug | Record status; show warning in Admin |
| Contact form returns "invalid" after the message was already saved | Bug | Return saved; retry the notice separately |
| Contact form also still uses Resend | Superseded | Include in the Lovable email switch |
| Tests for repeat signup, size, throttle, email down | Missing | Add |

### Memberships and credit packs (Stripe) — Track A, free
| Item | Status | Remains |
|---|---|---|
| Rejected credit-pack events only logged | Partial | Save a failure record visible in Admin |
| Subscription with no linked account only logged | Partial | Hold for matching + Admin reconcile list |
| Failed referral award not retried | Partial | Save and retry |
| Webhook partial-failure and replay tests | Missing | Add |
| Masterbook copy implies only Cosmic can write chapters/podcasts | Bug | Fix: Pro and Cosmic share features |
| Prices typed directly in MyTopicReading, PublicInfo, Books, AstroComic page descriptions | Partial | Read from plans.ts / books.ts |

### Developer dashboard — Track A/B, free
| Item | Status | Remains |
|---|---|---|
| Load errors show as an empty board; stats skeleton never ends | Bug | Error + retry |
| Every save error says "Only the developer…" | Bug | Separate permission vs network errors |
| Access-check failure looks like "no access" | Partial | Retry option |
| Double add on Enter + click; delete with no confirm/undo | Partial/Missing | Guard + undo |
| Can't edit an item's title/details/priority/blocker/cost | Partial | Edit drawer |
| "Show all" only shows loaded rows; refresh bursts reload everything | Partial | Server paging; debounce |
| Saved layout read can crash in private browsing; 28px buttons | Bug/Partial | Safe read; larger touch targets |
| Developer board tests | Missing | Add |

### Admin image library — Track B, free
Keyboard arrows on area tabs · description on the enlarged image · reliable download · broken-image fallback · rename "used on the site" to "in the image archive" unless usage is actually checked.

### Founder update feeds — Track A, free
"Your account at a glance" shows "…" forever if credits/orders fail (add error + retry) · include bought credit packs in the balance · Show all/fewer accessible and reset per edition · stable note IDs instead of titles.

### Investor page — Track A, free (one item owner)
| Item | Status | Remains |
|---|---|---|
| Creator Studio downloads listed as both future and live | Bug | Split "live now" from "planned" |
| "One tap turns any design into a framed print/deck/planner" | Partial | Mark planned unless built |
| Two different scenario models (page vs economics panel) | Partial | One model, or explain the difference |
| Profit view excludes salaries, ads, shipping, artwork | Partial | Owner supplies cost budget (O) |
| Universal promises ("every reading cites its facts") | Partial | Tie to what tests prove, or soften |

### Scan results (no action unless noted)
- No image tags missing alt text; no migration table without row security (policies themselves still need the Track A audit).
- 72 page files don't call page titles directly — check which are covered by shared wrappers before the SEO batch (Batch 18).
- Newsletter and contact are intentionally open to signed-out visitors; the fix is abuse limits, not sign-in.
- Limits: deployed settings (email domain, gateway limits) can't be seen from code; check them before marking items missing.

## 6.2 From chat history — interrupted or untested sessions (verify, then close)
Many of these were finished later; each needs one check, not a rebuild.
| Item | Chat source | Status | Cost | Remains |
|---|---|---|---|---|
| Shared Media Library folders (create/rename/delete, drag-to-folder, move, uploader-only delete) | Oct 4 (credits ran out, untested) | Verify | F | One signed-in check as Shane + April |
| Relationship "coincidences" section (birthplaces, matching placements, shared numbers) | Oct 4 | Verify | F | Confirm present in April's Relationships; facts only |
| Public footer, public AstroBook page, FAQ, Privacy, Terms | Oct 14 | Verify | F/O | Privacy and Terms were AI-drafted: owner/legal review before launch |
| Plan comparison table on Pricing; community preview for visitors; About reading list | Oct 14 | Verify | F | Confirm live |
| zodaci.com lands on the home page, not sign-in | Oct 14 | Verify | F | Check signed-out on custom domain |
| Community "members can read all posts" scan warning | Oct 14 | Open | F | Mark as intended in security findings |
| Admin "View April's content here" + return | Oct 19 | Verify | F | Must respect current rule: admin role alone never opens an edition |
| /april shared report (now account-shared, no passwords) | Oct 19 | Verify | F | Old password wording removed everywhere |
| Topic illustrations in chat results | Oct 19 | Missing? | L | Confirm or drop |
| AstroComic product + subscriber pages (pause/skip/history/tracking) | Oct 20 | Verify | F | All routes reachable, no dead home links |
| Referral award (friend 7 days Pro, referrer 30 days on first payment) | Oct 20 | Verify | F/O | Confirm switched on; reward type still an owner decision |
| Academy 14 lessons reachable | Oct 20 | Verify | F | Link check |
| Compatibility page (Master Build formula) | Oct 20 | Verify | F | Page exists + tests |
| Section guide on long readings; book order tracking stages; honesty note in footer | Oct 20 | Verify | F | Confirm each |
| Rename "Creator Studio" to "Cosmic Studio" | Oct 20 | Partial | F | Only 2 places use the new name; pick one name and apply everywhere (owner confirm) |
| Character voices and "how we make every reading" copy written by AI | Oct 20 | Open | O | Owner review |
| Promo film plays on published site (WebM + MP4) | Oct 21 | Verify | F | Press play on live welcome page |
| April classic-view Masterbook finishes loading; Timeline next links; Escape closes menus | Oct 21 | Verify | F | Signed-in April check at 1280 and 393 |
| Film numbers test (38 readings, 4 house systems, 14 lessons) | Oct 21 | Keep | F | Update film or numbers together |
| Contact form email still uses Resend | Code check | Superseded | F | Move contact-message to Lovable email with Lulu + newsletter |

## 6.3 Updated order of work (first five free batches)
1. Privacy/bug fixes from Track A + shared-edition reading hook + Masterbook plan-copy fix
2. Shop cart reliability (6.1 cart table) + tests
3. Lovable email switch for Lulu, newsletter and contact + abuse limits, confirmation, unsubscribe
4. Payment webhook recovery records + Admin reconcile list + tests
5. Developer dashboard, founder feed and investor accuracy fixes; then update activity logs, founder feeds and investor page (5-round rule)
Then Track B batches 9–42, then the 6.2 verification sweep in one signed-in browser session, then Tracks C–D.

## 6.4 Still excluded (no longer applies)
Resend (all four places it is used get switched, not extended) · Stripe refund/dispute/coupon admin · old prices, fonts, themes, Fallout · invented testimonials/counts · edition passwords (accounts and shares only now) · /app URLs · admins table.
