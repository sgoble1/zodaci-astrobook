# Zodaci Master Implementation Resource — v3 (Nov 13 2026)

v3 keeps all of v1 and v2 unchanged and adds Parts 7–24 (status, credit method, and every topic from the latest conversations).

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

---

# Part 7 — Status check (Nov 13 2026, what is done vs open)

**Done and saved:** R1 Track A fixes, R2 reliable Shopify basket, R3 contact/newsletter on Lovable email (sender domain still needed), R4 payment webhook recovery log, R5 developer board (edit, undo delete, paging), real-title breadcrumbs, podcast phone layout and clean titles, folded founder edition links, full audit log paging/export, Learn "Recommended for you", community sign-in return, Zac "Astrological Library" naming.
**Built, not yet browser-checked or committed when credits ran out:** welcome tour using registry labels + Back button, Sibling Bureau (twins/half/step, "Add sibling" preset and return), member Compendium guide, MOBILE_TABS in the registry. First step of the next session: verify these three in the browser, then commit.
**Blocked on owner:** email sender domain; Lulu keys (`LULU_CLIENT_KEY`, `LULU_CLIENT_SECRET`, optional `LULU_ENVIRONMENT`, `LULU_CONTACT_EMAIL`, `LULU_SHIPPING_LEVEL`); legal review of Privacy/Terms; referral reward choice.

# Part 8 — How to use this file with Lovable for the fewest credits

1. Ask for one batch at a time by its ID, e.g. "Implement batch B1 from the master resource." Each batch lists files, rules and checks, so no rediscovery is needed.
2. Never combine a free batch with an AI batch in one request.
3. Each batch ends with: run related tests, one browser pass at 393px and 1280px, commit. Update founder notes, developer timeline and investor page every fifth batch (batched, not per change).
4. Don't re-audit. If a batch says "verify", check only the named files.
5. Deterministic first: any text that can be built from chart math, registries or tables is code, not AI.

# Part 9 — Preview and performance (Batches P1–P5, free, do first)

- **P1 Grain and animation relief.** `src/index.css`, `src/components/fx/CinematicVideo.tsx`. Replace live `feTurbulence` grain with a static noise image; pause continuous flicker/scanline loops when `prefers-reduced-motion` or the tab is hidden; remove permanent `will-change` from static panels. Keep the look; keep animations extremely slow. Check: scroll in 950×634 without stutter.
- **P2 `/my-comic` deferral.** `src/pages/MyComic.tsx`, `src/components/comic/*`, `src/lib/comic.ts`. Render the shell first, compute chart + issue in `startTransition`/idle callback, memoize on primitive keys (birth id, month ISO), render the first 4 pages then the rest on demand. Output must be byte-identical (comic tests).
- **P3 Vite.** `vite.config.ts`: `optimizeDeps.include` for astronomy-engine, pdf-lib, pdfjs-dist, xlsx, qrcode; `manualChunks` for pdf, spreadsheet and astro vendors.
- **P4 Transit cache.** `src/lib/astro.ts` / `currentChapter.ts`: memoize sky positions per hour key; shape-matched Suspense fallbacks in AppShell.
- **P5 Verify.** Chart regression tests unchanged (Shane/April 15-point check), developer timeline entry.

# Part 10 — Founder editions: consolidation without loss ("Harvest & Fold")

- **Rule:** nothing personal is deleted. Only repeated textbook introductions and repeated raw degree lists are folded; the first instance stays, later ones link to it.
- **Never removed:** Shane's lived narrative, April's degrees/orbs/rulers, Zac's reflection prompts, affirmations, feng shui cures, practices.
- **Master section shape (also the AstroBook and member-generation shape):** Placement facts (computed) → Core meaning (April depth) → Lived voice (Shane tone, no invented biography) → Two reflection questions + practical cues (Zac style).
- **Duplicate finder (free):** a script compares chapter paragraphs by normalized sentence hash and lists exact/near duplicates per edition for admin review in Founder Audit. Counts only, never shows text to non-owners. Merges happen only after owner approval.
- **Classic view parity check:** every founder-only section maps to a member-route equivalent (memberRoutes + onlyInFullEdition); list gaps on the developer board.
- **"Retry" states:** audit every `LoadError`/"Retry" in founder pages; replace with automatic one-time retry + skeleton, and a plain message only if the second try fails. Private-edition 401/403 stay explicit access states.

# Part 11 — Five consolidated hubs (navigation, free)

Pages and routes are kept; the menu groups them. Old URLs keep working and open the hub tab.
1. **Your Chart** `/my-chart`: Wheel · Placements · Houses · Aspects & stars · What stands out (RetroGOOD + Findings).
2. **Timing** `/timeline`: Today (Current Chapter, transits, retrogrades) · This year (profection, return) · Lifetime (70-year arc). `/forecast` stays public.
3. **World Traditions** `/other-systems`: one pavilion with a tradition selector (Vedic, Chinese, numerology, Mayan, Tibetan, Nine Star Ki, Celtic, tarot birth cards, Kua/Bagua/Feng Shui).
4. **Consultation Desk** `/consult`: one entry with modes — Sources (Ask the Sources/SmartChat), Counselors (incl. Social Integration, still separate history), Reflection (Oracle Within), Dreams (Part 13). Each mode keeps its own storage and privacy rules.
5. **Archive & Journal** `/archive`: Journal (workbook, observation log), Reading history, Personal context & privacy, Dream ledger.
- Mobile tabs: Chart, Readings, Book, Explore, Account (already in registry).
- Bureaus (Investigations, Museum, Keepsakes, Characters) become featured doors in the Research Library and dashboard.
- All print goods appear under the Shop with tabs: AstroBook · AstroComic · Keepsakes · Catalog.

# Part 12 — The AstroBook as the full product

- **Fullest edition (Linen/Signature) = founder-edition depth:** all six volumes, every topic April's compendium covers, written in plain human language with the same precision.
- **Reader's Compass** (front matter, deterministic): plain glossary of every technical term used in that book (only terms that appear), "What you're holding" page, how to read a chapter.
- **Every chapter opens with "In this chapter"** — 3 bullet outcomes in plain words — and renames jargon titles (e.g. "Hermetic Lots" → "Your Hidden Points of Fortune (Hermetic Lots)").
- **Edition contents** come only from `BOOK_VERSIONS.inside` and `buildVolumes()`; `VersionCompare` must state exactly what each edition contains.
- **Preview fix:** the "first three pages" preview is replaced by a 5-spread showcase (title/seal, wheel + Big Three, a house chapter, an aspect chapter, a timeline page) from the fictional sample reader. The same leaves feed the 3D preview so preview = product.
- **Cost:** structure, glossary, chapter outcomes are code. Long prose uses the reviewed placement library + small per-chart stitching, not full per-user writing.

# Part 13 — Dreams and past-life reading tool (new)

- **Where:** Consultation Desk "Dreams" mode and Archive "Dream ledger".
- **Input:** dream text, date (default last night), clickable feeling chips (calm, afraid, chased, water, flying, familiar person, old place), optional "recurring".
- **Free deterministic part:** the night's transits to natal 12th house, Neptune, Moon, South Node, Pluto, 8th house; motif → chart-factor table (water → Neptune/Moon/12th; chase → Mars/Pluto; houses/rooms → 4th; teeth/falling → Saturn). Output a "Sky that night" slip with exact aspects and orbs.
- **Paid AI part (on request, Pro/credit-gated, claim job first):** a reading in Shane's Masterbook tone citing only those computed facts and the member's own words. Never predicts events, never states past lives as fact — framed as symbolic tradition.
- **Saving:** owner-only table `dream_entries` (RLS owner); opt-in flags `use_in_readings`, `use_in_book`, `use_in_comic`.
- **Book:** a "Dreams and the inner sky" section in Volume IV built from the chart; dream entries only if `use_in_book`.
- **Comic:** recurring motifs may appear as one dream-sequence panel only if `use_in_comic`.
- **Founders:** Shane's existing Dreams/Past Lives chapters stay as written; April and Zac get the chart-derived section in their classic view.

# Part 14 — Context feature: gathering, files, privacy and print

- **Gentle question flow:** one question at a time, clickable answers, "skip" always visible, max 3 per visit, progress saved. Topics: life focus now, work, relationships, home, health energy, goals. Answers are short tags, not essays.
- **"Ask me later" flags:** any reading can flag a topic to revisit; flags show in Personal Context.
- **Vague mode:** each item can be stored as "general" (e.g. "a family change") instead of specifics.
- **File uploads (staged):** photo of a diary page (OCR), audio memo (transcription), PDF/DOCX text. Extraction produces a review tray; nothing is used until the member approves each item. Files go to private storage; deletion removes file + extracted text. Small per-file caps and a daily limit to control cost. Start with text paste + PDF/DOCX (free parsing); add OCR/audio later as a Low-AI batch.
- **Scopes per item:** Readings · Printed book · Comic. Print scope defaults off.
- **Print review step:** before a book is frozen for checkout, list every context item that will appear; member can remove or "make general". No AI rewrite unless asked.
- **Where context is used (sparingly):** topic readings, counselor sessions, Current Chapter/Broadcast and retrograde notes add at most one line tying the computed transit to an approved context tag — template-built, no AI. Never overrides chart facts.

# Part 15 — Public demo and homepage

- **Old demo video:** remove from the home page; keep on Investors/About only if re-recorded. Replacement on home: an animated observatory screen (CSS/SVG, slow) inside the existing slide layout — the three protected slides stay untouched and in order.
- **Interactive demo:** a "mini screen" that runs the real member components (wheel, a reading section, a book spread, a comic page) on the fictional sample reader, so the demo equals the real experience. Signed-out only reads sample data. Text uses the human voice + precision standard.
- **AstroComic preview parity:** the hero preview and the issue reader render through the same `comicPrint` page geometry and component; no separate larger-image layout.
- **Sample Issue #1** redraw for the fictional reader (Low/High AI, when credits allow).

# Part 16 — Photo-to-comic characters

- Member uploads a photo → one stylized generation in the AstroComic house style (atomic-age four-colour, bold ink; no Fallout look) → saved to `member_characters` with art in private storage.
- Manage: rename, set default, regenerate (counts against a monthly cap), delete (removes photo and art). Photo deleted after generation unless kept.
- Used in previews and issues via `memberCharacter.ts`; generated once, reused every month (no per-issue portrait spend).
- Admin-only start at launch, then Pro/Cosmic with credit charge.

# Part 17 — Tier preview for founders and Zac

- A small "View as: Free · Pro · Cosmic" switch in classic view for Shane, April and Zac. Display-only: it changes what the page shows; server checks are untouched (it cannot unlock anything).
- Dismissible, remembered per device, off by default, with a one-line explanation of what each tier gets (from `plans.ts`).
- Zac's account: calm April-style updates feed in plain words plus his investor overview; workbook framed as optional.

# Part 18 — Investor page additions

- Live numbers only from registries: plan prices, book/comic prices, costs labeled estimates unless real Lulu costs saved.
- Add: product ladder (Free → Pro → Cosmic → AstroBook/AstroComic), what's live vs planned (already), milestone timeline from devTimeline, risks and blockers, cost controls (deterministic content, capped AI).
- No invented users, revenue, testimonials or market claims.

# Part 19 — Automatic updates without credits

- Founder notes, developer timeline and investor "recent updates" read one shared registry (`siteUpdates.ts`/`founderNews.ts`/`devTimeline.ts`). Each batch appends one entry; April's and Zac's versions use the plain `simple` text field.
- Developer stats come from database counts and test totals; no AI summaries.

# Part 20 — Shop: let Shopify drive the catalog

- Recommendation: Shopify is the source of truth for titles, prices, images, descriptions, variants, availability and collections; the site reads them live (cached ~15 min). Changes in Shopify appear automatically.
- Site code keeps only ordering/merchandising (featured order, Atomic Zodiac grouping by tags, `personalized` tag → birth-details drawer).
- AstroBook/AstroComic prices remain in `books.ts`/plans until the owner decides they move to Shopify (open question).
- Shop enhancements: flagship row (AstroBook, AstroComic, Keepsakes) on top, gift vs for-me toggle, itemized totals, delivery estimate, FAQ.

# Part 21 — Shared space and media library

- **Remove "Reading Together"** tab from the shared space menu (data kept, route redirects to the shared dashboard). Sharing editions/chapters stays via Share.
- **Mobile video thumbnails:** `<video src="...#t=0.1" playsInline preload="metadata">`.
- **Caption field:** don't auto-focus/select when the viewer opens; caption shown as readable text with an Edit button; multi-line, wraps, 300-char limit.
- **Conversations:** verify send, edit, reply, reactions, attachments, realtime in both spaces; fix what fails.

# Part 22 — Design review

- The Blend palette (archive cream, deep indigo, shop yellow, shop red, brass, black) is distinctive and on-brand; keep it. Tune: stronger card borders on dark indigo at phone width, fewer simultaneous accent colors per section, one yellow call-to-action per screen, consistent section backgrounds alternating cream/indigo instead of many tints.
- Effects: slow, few, purposeful; respect reduced motion; no effect should delay content.

# Part 23 — Other items not previously listed

- Creator Studio vs Cosmic Studio: lock one name (owner choice; default "Creator Studio").
- Birth-time uncertainty helper (house boundary times); house system explainer.
- Forecast TV channels (Sky Today, Life Compass, Retrogrades, Eclipses, Log).
- Community pseudonyms with chosen placements only.
- PWA offline reading for forecast and owned books.
- Canonicals to zodaci.com; member discussions noindex.
- Privacy/Terms legal review (owner).

# Part 24 — Batch list (v3 additions, in order)

| ID | Work | Cost |
|---|---|---|
| V0 | Verify + commit unfinished tour/Sibling/Compendium work | Free |
| P1–P5 | Performance | Free |
| B1 | Shared space: remove Reading Together, video thumbnails, caption fix, conversation check | Free |
| B2 | Five hubs menu grouping + redirects | Free |
| B3 | Founder "Retry" audit + auto-retry | Free |
| B4 | Tier preview switch | Free |
| B5 | AstroBook 5-spread preview + Reader's Compass + chapter outcomes | Free |
| B6 | Comic preview parity | Free |
| B7 | Dreams tool, deterministic part + table | Free |
| B8 | Context question flow, scopes, print review | Free |
| B9 | Shopify-driven catalog + shop enhancements | Free |
| B10 | Investor additions + update registry (every 5 batches) | Free |
| B11 | Duplicate finder for founder editions | Free |
| B12 | Homepage demo screen (replaces video) | Free |
| C1 | Dreams AI reading | Low AI |
| C2 | Context file extraction (PDF/DOCX free; OCR/audio low AI) | Low AI |
| C3 | Photo-to-comic characters | Low AI per member |
| D1 | Sample Issue #1 redraw | High AI |
| E1 | Lulu sandbox proof (needs keys) | Owner |

# Part 25 — Completeness pass (items found missing in the v3 check)

- **(Done Nov 13)** **Member character in header/dashboard:** show the member's chosen character (memberCharacter.ts) as a small badge on the dashboard opening and account menu. Free.
- **Account menu tidy:** group Account, Plan & credits, Shared with me, Settings, Sign out; admin/developer links only for admins. Free.
- **(Done Nov 13, April checked)** **Founder pages at phone size:** 393px pass on April, Shane and Zac edition pages (sidebar, chapter reader, TVs). Free.
- **Shane Masterbook corrections:** keep edition-correct deterministic find/replace with backup; run the remaining flagged chapters in small batches. Low AI.
- **Personal preview drawer:** keep the "see it with my chart" drawer on public product pages consistent with the new 5-spread book preview and comic parity. Free.
- **Custom pages (custom_pages):** admin-published pages appear in the right hub group after the five-hub regrouping; test that they still merge into menus. Free.
- **Dashboard updates for each founder:** April and Zac see the plain-language "What's new" (features, products, editions, activities); Shane sees the full developer view. Appended every fifth batch (Part 19).
- **Ask the Sources / SmartChat** inside the Consultation Desk keep the 402/denial handling (sourceResponse) — no denial ever saved as an answer.
- **Credit check after each AI batch:** record spend on the developer board so cost per feature is visible.

# Part 26 — Last-24-hours sweep (Nov 12–13 chat items not yet written down)

Checked against chat messages #1182–#1261. Everything below was said in chat but was missing or only touched on in Parts 1–25.

## 26.1 From the Batch 7–24 chat plans
- **Observatory consult (Batch 20):** staff avatars with quick-question chips. Pro/Cosmic only, 1 credit per question with double-spend protection, nothing remembered between sessions. It becomes a mode of the Consultation Desk (Part 11).
- **Keepsake formats (Batch 15):** "Official Star Scroll" (tall parchment) and "Observatory Natal Certificate" (landscape diploma). Made as print-quality PDF with pdf-lib, labelled as keepsakes, never as official records.
- **Creator Studio export presets (Batch 11):** 1950s poster, star scroll, tarot card and transit badge. Drawn in the browser, PNG/SVG export, saved as library_items kind 'creation'.
- **Investigations "Archive this case" (Batch 13):** saves to the member's observation log. Manila-folder dossiers with archival stamps, no neon.
- **Museum microfilm reader (Batch 14):** CSS-only phosphor/amber tint with brass pan/zoom dials, plus a searchable archive index. No video files.
- **Ask the Sources citation pills (Batch 17):** each pill opens a drawer with the original source text. A denial (402) shows a card and is never saved.
- **Long chapter list virtualized (Batch 18):** only visible rows mount (382 chapters). Preload the heading/body/label fonts. Private titles never appear in meta tags or sitemaps.
- **Developer cost ledger (Batch 22):** estimated cost per batch at $0.35/credit (owner's rate) next to the health gauges. No secrets or chat text in logs.
- **Cover customizer + spine preview (Batch 23):** spine width comes from page count × Lulu's paper caliper (lulu-rules), never typed by hand. Rotating 3D preview; the choice travels with the order.
- **Phone tab bar and touch (Batch 24):** 44×44px tap targets on chart glyphs, square chart container, no sideways scroll, body text never below 14px, and moving to a new page scrolls to the top and closes drawers.
- **Other Systems (Batch 21):** rotatable Bagua wheel, Flying Stars palace charts, and East/West group matches. April's Kua 1 vs formula 8 stays visible.

## 26.2 From the AstroBook blueprint (#1245)
- **Writing-prompt calibration (AI, one batch):** the chapter-writing prompt (topic-readings) enforces three rules:
  - April's precision: cite the degree and say plainly when something is uncertain.
  - Shane's kitchen-table voice: no AI clichés.
  - Zac's two reflective questions after each major placement.
  Test on the fictional sample reader before any member spend.
- **Cover suite:** Midnight Stars, Celestial Cartographer, Deep Orbit and Vintage Monogram, personalized with name, birth date and place. They are the cover choices in the customizer.
- **Instant digital copy:** the digital manuscript opens right after a verified payment while the print copy is made.
- **Order status steps:** Order placed → Interior frozen → Sent to press → Shipped (tracking link). Driven only by verified webhooks.
- **Print & Physical Goods Pavilion:** Books, Keepsakes and the Store share one shop entry with tabs. Old addresses keep working.
- **Lulu sandbox proof:** compile a 320-page Collector's manuscript and pass preflight once keys exist (E-track, waiting on keys).

## 26.3 Founder and account items said in chat
- Zac's dashboard matches April's plain-language style. His focus is the Private Astrological Library plus the investor overview, with no homework framing.
- The Stargazer (featured member character) stays the default face in member-character spots until a member picks their own.
- The five-hub consolidation (Part 11) keeps every founder-only page reachable through classic view; check this once per founder after the regrouping.

## 26.4 Owner decisions still open (unchanged, listed together)
- Email sender domain
- Lulu keys + go-ahead for production
- Legal sign-off on Privacy/Terms
- Referral reward: 7 days Pro or credits
- Creator Studio vs Cosmic Studio name
- Book/comic prices: Shopify or plans/books files
- Whether to keep the old demo video on Investors/About

## 26.5 Price check
- Collector's Linen is **$189** in the site's price list (confirmed); the older $149 note is out of date.

# Part 27 — UX pass status (Nov 13 2026)
- Parts 11, 12, 14, 15 verified built. Signed-in 393px pass done on nine member hubs; Explore founder crash fixed; topic chip tap size raised to 44px.
- Still open: prerendered public HTML, PWA install, Search Console (owner), Part 22 colour tuning per section (review with owner screenshots).


# Part 28 — Extensive sweep: 42 batches, 11 pages, Shopify and connections

## Order of work (approved Nov 14 2026)
| Step | What | Status |
|---|---|---|
| 0 | Memory and instructions refresh | Done Nov 14 |
| 1 | Part 28 record, feature register, your reference copy | Done Nov 14 |
| 2 | High-impact gaps and bugs (credit renewal, comic archive, share privacy, contact spam, Shopify orders, 11-page review) | Partly done — see register |
| 3 | Demos and book previews (five-spread showcase) | Open |
| 4 | Shopify and connections (variants, cart lines, admin shop layout, order fields, emails) | Open; emails blocked on sending domain, Shopify orders blocked on admin app |
| 5 | Product descriptions, calculation trust copy, feature copy | Open |
| 6 | Investor page register and developer "Next implementations" | Done Nov 14 |
| 7 | Overnight items (install banner, 15-point accuracy, launch checklist, profection wheel, radar tones, BaZi/Lo Shu, cassette player, context flow) | Open |
| Parked | Founder document check, case stamps, chapter list windowing, pen names, Lulu production, comic printing | Later |

## Sweep findings checked against the code (Nov 14)
- Monthly credits on renewal: already handled — the monthly allowance resets each month from the plan, and renewal invoices refresh the plan from the payment provider. Marked Live.
- Contact spam: already handled — hidden trap field plus a server rate limit. Marked Live.
- My Comic: released issues open from the archive; a separate issue switcher isn't needed. Marked Live.
- Public chart share without private details: not built. Planned.
- Shopify orders on My Orders: needs a store-owned Shopify admin app; app code can't read orders with the storefront key. Blocked.
- 11 pages without a batch (/privacy, /terms, /ephemeris, /moon-calendar, /chinese, /feng-shui, /famous-charts, /about, /profection, /timing, /instructions): included in the 22-page public sweep Nov 13 (no crashes, no sideways scroll). A dedicated loading/empty/error review is still open.
- The overnight chat copies were wiped, so the 42 batches are reconstructed from the master document, roadmap and build reports; anything that can't be traced is listed as Planned instead of being dropped.

## Feature register (45 features: 22 live, 6 partial, 11 planned, 6 blocked)

### Charts & calculation
| Feature | Status | Impact | Detail |
|---|---|---|---|
| Natal chart engine | Live | High | Planets, houses, angles, nodes, Chiron and asteroids from an astronomical ephemeris, with historical time zones and daylight saving. |
| Unknown birth time handling | Live | High | Houses and Rising are marked uncertain instead of silently assuming midnight. |
| Other Systems | Live | Medium | Vedic, Chinese Ba Zi, numerology, Feng Shui, Flying Stars, Nine Star Ki and Tzolk’in from the same birth data. |
| 15-point accuracy regression | Partial | High | Reference-ephemeris tests exist; the expanded 15-chart authoritative set is still to be added. |
| Interactive 12-spoke profection wheel | Planned | Medium | Annual profections on /profection and /timing as a turnable wheel. |
| BaZi Four Pillars and Lo Shu grid views | Planned | Medium | Dedicated visual pillars and grid on the Chinese and Feng Shui pages. |
| Retrograde Radar tone setting | Planned | Later | Gentle, Direct or Strategic wording, saved per member. |
| Licensed asteroid tables and Sabian Symbols | Blocked | Later | Extra points and degree symbols. **Waiting on:** Licensing permissions. |

### Readings & guidance
| Feature | Status | Impact | Detail |
|---|---|---|---|
| Personal readings by plan | Live | High | Readings written from each member’s calculated placements, with retry and freshness checks. |
| Chart-aware counselors | Live | High | Private sessions that replay the full conversation with the verified chart. |
| Ask the Sources with citations | Live | Medium | Every claim links to its source passage. |
| Dream Ledger | Live | Medium | Dreams logged against that night’s sky; optional one-credit reading. |
| One-question personal context flow | Partial | Medium | Tap-to-answer questions exist; the one-at-a-time flow with saved chips and skip is still to finish. |
| Reviewed placement text library | Blocked | Later | About 216 placement entries for free deterministic readings. **Waiting on:** Owner review and AI credits. |

### AstroBook & AstroComic
| Feature | Status | Impact | Detail |
|---|---|---|---|
| Six-volume AstroBook builder | Live | High | Five editions, cover designer, previews and print-ready PDFs. |
| Five-spread AstroBook showcase | Partial | High | Showcase and sample pages exist; a five-spread walk-through on the books page is next. |
| AstroComic Issue #1 and preview | Live | High | Drawn pages, 3D page-turn preview, read-through and pre-order. |
| My Comic issue archive | Live | Medium | Members open each released issue from their archive on My AstroComic. |
| Automated print fulfilment (Lulu) | Blocked | High | Book jobs run in sandbox today. **Waiting on:** Production credentials and a proofed sample. |
| Comic printing | Blocked | Medium | Paused by the owner. **Waiting on:** Owner decision. |

### Demos & previews
| Feature | Status | Impact | Detail |
|---|---|---|---|
| Interactive demo walk-through | Live | High | Birth details, chart, reading and book with one fictional sample reader. |
| Public book and comic samples | Live | High | All samples use the same fictional Collector-cover reader. |

### Shop & orders
| Feature | Status | Impact | Detail |
|---|---|---|---|
| Shopify storefront and cart | Live | High | Products, prices and stock come from Shopify; checkout runs on Shopify. |
| Rewritten product descriptions | Partial | High | Plain, specific descriptions for every listing, pushed to Shopify after owner approval. |
| Admin shop layout | Planned | Medium | Department order and featured products arranged in Zodaci admin; Shopify keeps the product data. |
| All variants loaded | Planned | Medium | Products with more than 100 variants load every option. |
| Shopify orders on My Orders | Blocked | Medium | Book orders show today; Shopify orders need a store-owned admin app. **Waiting on:** Shopify admin app credentials. |
| Receipts and notification emails | Blocked | Medium | Order and newsletter emails. **Waiting on:** Verified sending domain. |

### Membership & credits
| Feature | Status | Impact | Detail |
|---|---|---|---|
| Pro and Cosmic memberships | Live | High | Verified payments, plan changes, refunds; Pro and Cosmic share features and differ in credits. |
| Monthly credit renewal | Live | High | Each paid month gives the plan’s allowance again; renewals refresh the plan from the payment provider. |
| Credit packs and referrals | Live | Medium | One-time packs; 20 bonus credits per paying friend, up to 12 a year. |

### Privacy & sharing
| Feature | Status | Impact | Detail |
|---|---|---|---|
| Private founder editions | Live | High | Open only for the owner and people they share with, checked on the server. |
| Public chart share without private details | Planned | Medium | A shareable chart that leaves out birth time, exact place, notes and journal. |
| Contact form spam protection | Live | Later | Hidden trap field plus a server rate limit. |

### Media
| Feature | Status | Impact | Detail |
|---|---|---|---|
| Personal podcasts | Live | Medium | Written from each chart, voiced, saved to a private library. |
| Cassette-player podcast interface | Planned | Later | 1950s cassette player for listening. |
| Cosmic Studio | Live | Medium | Wallpapers, posters, journal pages and cards drawn from the saved chart. |

### Platform
| Feature | Status | Impact | Detail |
|---|---|---|---|
| Lighter, faster site | Live | High | Unused code removed, pages load when opened, public pages pre-rendered for sharing. |
| Home-screen install | Live | Later | Phone install prompt; a mid-century styled banner is planned. |
| Admin launch checklist | Partial | Medium | Live payment, print, privacy and content checks with export. |
| Founder document check on /developer | Planned | Later | Upload and compare founder documents privately. |
| Investigation archive stamps | Planned | Later | “Confidential” and “Verified” stamps on case files. |
| Long chapter list loads visible rows only | Planned | Later | Faster 382-chapter index. |

### Community
| Feature | Status | Impact | Detail |
|---|---|---|---|
| Community pen names | Partial | Later | Posting under a chosen handle and placement badge. |
| Zodaci Social | Planned | Later | Pseudonymous profiles, topic boards and opt-in full-synastry matching. |

## Next implementations, most visible first
1. **15-point accuracy regression** (Partial, High) — Reference-ephemeris tests exist; the expanded 15-chart authoritative set is still to be added.
2. **Five-spread AstroBook showcase** (Partial, High) — Showcase and sample pages exist; a five-spread walk-through on the books page is next.
3. **Rewritten product descriptions** (Partial, High) — Plain, specific descriptions for every listing, pushed to Shopify after owner approval.
4. **Automated print fulfilment (Lulu)** (Blocked, High) — Book jobs run in sandbox today. Waiting on: Production credentials and a proofed sample.
5. **One-question personal context flow** (Partial, Medium) — Tap-to-answer questions exist; the one-at-a-time flow with saved chips and skip is still to finish.
6. **Admin launch checklist** (Partial, Medium) — Live payment, print, privacy and content checks with export.
7. **Interactive 12-spoke profection wheel** (Planned, Medium) — Annual profections on /profection and /timing as a turnable wheel.
8. **BaZi Four Pillars and Lo Shu grid views** (Planned, Medium) — Dedicated visual pillars and grid on the Chinese and Feng Shui pages.
9. **Admin shop layout** (Planned, Medium) — Department order and featured products arranged in Zodaci admin; Shopify keeps the product data.
10. **All variants loaded** (Planned, Medium) — Products with more than 100 variants load every option.
11. **Public chart share without private details** (Planned, Medium) — A shareable chart that leaves out birth time, exact place, notes and journal.
12. **Comic printing** (Blocked, Medium) — Paused by the owner. Waiting on: Owner decision.
13. **Shopify orders on My Orders** (Blocked, Medium) — Book orders show today; Shopify orders need a store-owned admin app. Waiting on: Shopify admin app credentials.
14. **Receipts and notification emails** (Blocked, Medium) — Order and newsletter emails. Waiting on: Verified sending domain.
15. **Community pen names** (Partial, Later) — Posting under a chosen handle and placement badge.
16. **Retrograde Radar tone setting** (Planned, Later) — Gentle, Direct or Strategic wording, saved per member.
17. **Cassette-player podcast interface** (Planned, Later) — 1950s cassette player for listening.
18. **Founder document check on /developer** (Planned, Later) — Upload and compare founder documents privately.
19. **Investigation archive stamps** (Planned, Later) — “Confidential” and “Verified” stamps on case files.
20. **Long chapter list loads visible rows only** (Planned, Later) — Faster 382-chapter index.
21. **Zodaci Social** (Planned, Later) — Pseudonymous profiles, topic boards and opt-in full-synastry matching.
22. **Licensed asteroid tables and Sabian Symbols** (Blocked, Later) — Extra points and degree symbols. Waiting on: Licensing permissions.
23. **Reviewed placement text library** (Blocked, Later) — About 216 placement entries for free deterministic readings. Waiting on: Owner review and AI credits.

The live version of this register is src/lib/featureRegister.ts; the investor page and the developer dashboard read it directly.
