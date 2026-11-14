# Part 28 — Extensive Sweep Plan (42 batches + 11 pages), with Shopify and connections

One plan, continuing the sweep we started. It folds in the Shopify/connections work from the "API Integrations, Production, Suppliers, etc" collection and your latest asks (memory first, investor focus, demos early, product copy, calculation trust). Shopify keeps its product controls; shop arrangement happens in Zodaci admin.

## Step 0 — Memory and instructions (first)
- Remove leftover template memories that contradict the site (film-agency team, film production steps, festival laurels, Work/Process nav, hero video, old fonts).
- Rewrite brand, design system, founder privacy; add product naming, commerce split (Stripe = memberships/credits; Shopify = shop products, Shopify owns titles/prices/stock, Zodaci admin owns display order), calculation-trust wording rules, specs for planned modules.
- Ready-to-paste replacement for the placeholder sections of your project instructions.

## Step 1 — Finish the sweep record (Part 28)
- Go through every requirement in all 42 batches, the uploaded briefs, batch reports, the later chat and the collection; give each a status: Live / Partial / Planned / Blocked, plus investor impact (High / Medium / Later).
- Write it into the master document as Part 28 with full detail per batch (not one-liners) and the order of work below.
- Your own reference copy in Files ("Zodaci Implementation Reference", markdown + PDF): all phases, batches, details, status, dependencies, effort, so you can choose what to do when.
- Roadmap pointer line, developer activity log entry.

## Step 2 — High-impact gaps and bugs (main functionality)
From the sweep's half-built list:
1. Monthly credits top-up on membership renewal (Pro 25 / Cosmic 75).
2. My Comic issue switcher.
3. Public chart share that leaves out birth time, birth place detail and private notes.
4. Contact form spam guard (hidden trap field, 3 per hour).
5. Shopify orders shown on the member's orders page (matched to signed-in email).
6. Review of the 11 pages without a batch (phone + desktop, no overflow, working links, loading/empty/error states).
Plus a fresh bug pass on sign-in, dashboard, readings, shop, cart, checkout return, private editions.

## Step 3 — Demos and book previews (early)
- Demo screen complete, every section working, one fictional sample reader, clear sign-up step.
- Five-spread AstroBook showcase on the books page; page previews for every edition; AstroComic preview.

## Step 4 — Shopify and connections (from the collection)
- Catalog: fetch all variants (no cut-off at 100), exact edition/cover/format matching, sold-out handled cleanly, mapped to the canonical variant list.
- Personalization: recipient birth details on each cart line so two recipients never merge; Two-Sky second person; Solar Return year.
- Admin "Shop layout": order departments and featured products in Zodaci; Shopify stays in control of the products themselves.
- Order notification and packing slip fields (from the collection's templates), shipping/tracking shown on orders, account email matching.
- Emails that need a sender domain stay listed as Blocked.

## Step 5 — Products and marketability
- Rewrite all product descriptions in the plain human voice: what you get, how it's built from your chart, format, size, edition names, prices from the price files. Push to Shopify in one approved batch.
- Calculation trust: public "How we calculate" section and short blocks on home, pricing and books — ephemeris precision, historical time zones/daylight saving, unknown birth time, and how Western, Chinese, numerology and timing techniques combine in the Zodaci method. Accurate only, no invented accuracy figures.
- Update feature copy site-wide, including upcoming features marked "Coming".

## Step 6 — Investor page and developer dashboard
- Investor page: figures from live data and price files (members, readings, orders, credits), honest labels when numbers are small; full feature register with status for every feature, live and future; revenue per product; roadmap timeline. Zac's overview kept in sync.
- Developer dashboard: "Next implementations" board from the same register, with priority and blocker.

## Step 7 — Overnight items (after the above)
Installation banner, 15-point accuracy check, launch checklist, profection wheel, Retrograde Radar tones, BaZi/Lo Shu, cassette podcast player, one-question context flow.

## Parked (low visibility, later)
Developer founder-document upload/check, Investigations "Confidential"/"Verified" stamps, 382-chapter list loading only visible rows, community pen names completion, Lulu production switch, comic printing.

## Technical details
- One feature register module feeds Part 28 statuses, investor page, developer board and your reference copy.
- Investor figures via an investor/admin-gated function; never public.
- Shop layout in admin-only platform settings, read through the allowlisted public settings.
- Credit top-up handled in the verified payments webhook on renewal invoices; ledger keyed by invoice to avoid double grants.
- Tests: top-up amounts, share stripping, spam limit, variant pagination, cart-line separation, investor prices match price files. Browser checks at 393px and 1280px; full test run.

## Needs your input
Real testimonials (none invented), any investor figures beyond live data, sender email domain, Lulu production keys.
