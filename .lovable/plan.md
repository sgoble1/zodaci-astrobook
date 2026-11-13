# Zodaci Master Implementation Resource — plan

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
