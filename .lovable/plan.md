# Investor-Ready Polish Plan

Order matters: memory and instructions first, then the things investors and buyers see first. Later-only polish is listed but parked.

## Step 1 — Memory and instructions refresh (first)
- Delete leftover template memories that contradict the site: film-agency team "Most Wanted", 5-step film production process, festival laurels, Work/Process nav order, background hero video, old Instrument Serif/Fira design system.
- Rewrite brand identity, design system (Alfa Slab One / Libre Franklin / Bebas Neue / Yellowtail, Blend palette, hand-cut corners, slow motion) and founder privacy boundaries.
- Add memories: product naming, commerce split (Stripe = memberships, credits; Shopify = shop products), "Shopify keeps product controls; arrangement of the shop display is done in Zodaci admin", calculation trust wording rules, future module specs (cassette podcasts, 12-spoke profection wheel, Retrograde Radar tones, 5-spread book showcase).
- Provide a ready-to-paste replacement for the placeholder sections of your project instructions (routes, stack, tables, theme, performance guardrails, AI credit protection).

## Step 2 — Your reference copy of the full resource
- New file in Files: "Zodaci Implementation Reference" (markdown + PDF), separate from the working doc.
- Every phase and batch, with: what it does, who sees it, status (Live / Partial / Planned / Blocked), what it depends on, effort, and investor impact (High / Medium / Later), so you can pick what to do when.
- Includes the overnight items (installation banner, private share stripping, 15-point accuracy check, launch checklist, profection wheel, radar tones, BaZi/Lo Shu, cassette podcasts, one-question context flow, five-spread showcase) and the Shopify phases.

## Step 3 — Gaps and bugs affecting main use
- Sweep sign-in, dashboard, readings, shop, cart, checkout return, orders, demos and private editions on phone and desktop; fix anything broken.
- Monthly credit top-up on subscription renewal (25 Pro / 75 Cosmic), private chart share stripping birth time/place/notes, contact form spam guard.

## Step 4 — Demos and book previews finished early
- Demo screen: complete every section, consistent fictional sample reader, clear next step to sign up.
- AstroBook and AstroComic previews: five-spread showcase on /books, page-turn previews for every edition, comic issue switcher.

## Step 5 — Products and marketability
- Rewrite every product description (books, comics, keepsakes, almanac, synastry, shop items) in the plain human voice: what you get, how it's made from your chart, format, size, edition labels, prices from the price files.
- Shopify keeps titles/prices/stock control; push the new descriptions to Shopify (one approval) and add an admin "Shop layout" panel in Zodaci to order departments and featured products.
- Fix variant truncation (paginate variants) and keep recipient details separate per cart line.

## Step 6 — Calculation trust and feature copy
- New "How we calculate" section (public page + short blocks on home, pricing, books): ephemeris precision, historical time zones and daylight saving, unknown birth time handling, and how Western placements, Chinese systems, numerology and timing techniques feed one Zodaci method — described accurately, no invented accuracy claims.
- Update feature copy site-wide (home, pricing, about, instructions) including upcoming features marked "Coming".

## Step 7 — Investor page enhanced
- Numbers derived live from the price files and real database counts (members, readings, orders, credits) instead of fixed figures; clear labels where data is still small.
- Full feature register with status for every feature, live and future, grouped by area; roadmap timeline; revenue model per product.
- Zac's plain-language overview kept in sync.

## Step 8 — Developer dashboard
- "Next implementations" board fed from the same feature register, with status, priority and blocker per item.

## Parked for later (low visibility)
Chapter list virtualization, investigation case stamps, community pen names, Lulu production cutover, comic printing, merged Shopify order history on /orders, email templates (needs sender domain).

## Technical details
- Single feature register module (src/lib/featureRegister.ts) feeds investor page, developer board and the reference doc to keep statuses identical.
- Investor counts via an admin/investor-gated RPC; never public.
- Shop layout stored in platform_settings (admin-only), read via allowlisted public settings.
- Tests: credit top-up amounts, share stripping, variant pagination, investor figures match plans.ts/books.ts.
- Verify at 393px and 1280px with browser checks; full test run.

## Needs your input later
Real testimonials (none will be invented), investor figures you want shown beyond live data, any calculation claims you want added.
