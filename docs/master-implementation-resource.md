

## Part 30 — Everything still missing from both plan collections, in slices (Nov 14 2026)

## Your Shopify question
You don't need to approve anything with me. If you write the descriptions directly in Shopify, the shop shows them on its own: it reads Shopify live and refreshes about every 15 minutes. I'll mark that item as done by you in Shopify.

## What the review covered
- 10 documents in "Current Implementation Plan Doc" and 23 in "Old Completed Archived Update Docs", checked against the actual site.
- Already-built items and anything superseded (old cosmic purple and Mystic Ink styles, old prices) are left out. Prices in the book price list win over older documents.
- About 80 unfinished items were found and merged with the v3 open list below. Duplicates are combined.

## Order (same priorities as before: investor readiness and main functionality first, polish later)
Each slice is finished, tested and checked in the browser before the next one starts. After every slice, these are updated in the same order:
- master resource Part 30
- your reference copy (v4, .md and PDF)
- the feature list, which the investor page and developer dashboard read
- the developer log
- the roadmap

### 30 · Tier 1: Investor and revenue-facing
0. **Documents.** Add Part 30 (this list, with a source document for each item) and reference v4. Every new item goes into the feature list with its status.
1. **Compatibility cards, option A.** Cream index cards, a slab heading, then the aspect line, then the reading. Three columns on desktop, one on phones, and a slow lift on hover. The scores and links don't change.
2. **Personal locked previews.** Every locked Pro section shows a short preview of the member's own calculated values instead of grey bars.
3. **AstroBook teaser, three pages.** Sun, Moon and Rising pages built from the visitor's own chart after they sign in, then the "continue in the book" step. Free visitors never use AI.
4. **Gift an AstroBook to someone else.** The book is made from the recipient's own birth details. It adds the recipient's email and a gift note. Scheduled surprise delivery and the recipient's claim step wait on the email domain.
5. **15-point accuracy tests.** Sun to Pluto, nodes, angles, retrograde flags and house cusps for the founder charts. Missing reference values are listed for you to supply, never invented.
6. **Admin AI spending.** Usage logs record the model, tokens and cost for each operation, with a projected monthly total, the biggest users and an overspend alert. Each member gets a usage history, a monthly reset and a "set to zero" control.
7. **Growth numbers for investors.** A month-by-month recurring revenue chart and sign-up retention at 1, 3, 6 and 12 months. These feed the investor page, so its numbers come from real records.
8. **Admin launch checklist (finish).** Live checks for payments, print, privacy and content, with an export.

### 30 · Tier 2: Main functionality and accuracy
9. **True node option and planet speed.** Choose true or mean node, saved per member. Planets show their daily speed and when they're stationary turning retrograde or direct. RetroGOOD uses the stationary states.
10. **The remaining chart shapes.** Bowl, Locomotive, Seesaw, Splash and Splay, with tests.
11. **Saved readings refresh properly.** Saved readings refresh when the node type, tone or text library version changes.
12. **One way of ranking what matters most in a chart.** The opening letter, Perception screen and book "Story of Your Sky" all use the same ranking.
13. **Cheaper reading generation (biggest credit saver).**
    - Readings are assembled from calculated facts plus reusable placement text and transit templates (top 50 first), with only a short AI summary.
    - Each kind of AI task uses a cheaper or stronger model as suited, with set spending limits.
    - The sky positions for each day are calculated once and shared.
    - Admin cache statistics.
    - The reviewed placement text needs your review; I prepare drafts for it.
14. **One-question personal context flow (finish).** Answers also refresh affected readings and record where each came from.
15. **Shane chapter sm-29 Moon correction.** Fix the remaining wrong Capricorn Moon placement in smaller pieces.
16. **Moving around the site.** "Recommended for you" blocks on all five hubs, "Needs your chart" badges everywhere relevant, breadcrumbs on the remaining deep pages, and a finished first-use tour.
17. **Profection wheel** (12 spokes) and **Four Pillars / Lo Shu grid** views from the member's own chart. April's pillars stay private, and the Kua difference stays shown.

### 30 · Tier 3: Content depth and founder editions
18. **Deeper content.**
    - Finish the 18 long topic chapters.
    - Deepen AstroBook Volumes IV–VI.
    - Zac document extraction and six-volume expansion.
    - Shane workbook to match April's.
    - Consistent "Zac's Astrological Library" naming.
19. **Artwork.**
    - Matching covers and illustrations for Shane's and Zac's editions.
    - Zac's 24-panel comic and buyer comic artwork.
    - AI image costs apply; I'll confirm a batch before spending.
20. **Article bylines.** Real author and reviewer names with published and updated dates, only once you supply the names.
21. **Retrograde Radar tone setting** (Gentle, Direct or Strategic) and a fuller Professional tone across the whole Perception report.

### 30 · Tier 4: Polish and later
22. Archive paging and past versions.
23. Activity drill-down with export, and April monitor history export (counts only, never private text).
24. Long chapter list speed, investigation stamps, community pen names, founder document check, and the cassette podcast player.
25. Newsletter editor extras: duplicate, formatting, test send, a typed SEND check, a 15-minute scheduling minimum, an unsaved-changes warning, and reports with CSV.
26. **Solar Return.** Choose where you'll be for your birthday, then get a full yearly report with an overlay on your birth chart.
27. Calculated progressed charts for members.
28. **Academy progress.** Lessons marked complete and a progress bar. Video lessons need video material.
29. Read-aloud reports section by section, and a full reader for purchased AstroBooks with notes and a glossary.
30. Ephemeris page, Famous Charts (needs sourced birth data), and the optional move of lesson addresses.

### 30 · Waiting on you or outside steps (listed, not built)
- **Verified email domain:** receipts, shipping emails, newsletter sending, daily digest, welcome and win-back emails, abandoned-checkout and birthday emails, gift delivery.
- **Lulu production credentials and a proofed sample:** live book printing.
- **Your decision:** comic printing (paused).
- **Shopify store-owned admin app:** Shopify orders on My Orders.
- **Licensing:** asteroids Ceres, Pallas, Juno and Vesta, and Sabian Symbols.
- **Real testimonials, verified usage numbers and social links** (never invented).
- **Optional extras:** Google Drive, Calendar, Gmail and Contacts links; birth certificate reading; similar-chart caching; Word export; other languages; other currencies and international shipping; Zodaci Social.

## Checks for every slice
- Tests for each rule it touches.
- Phone and desktop screenshots, signed out and signed in.
- A clean build before moving on.

## Technical notes
- Calculation work lives in src/lib with tests: node choice, speed and station states, shapes, fingerprint fields, the shared ranking, profection, pillars and progressions.
- The report assembler and model routing live in the edge functions. The shared daily sky runs on a schedule and runs safely more than once.
- AI usage logs get model, token and cost columns. Admin reads only go through role-checked functions.
- Growth metrics come from subscription and payment records through admin-only functions.
- The gift flow stores the recipient's chart on the order and never overwrites the buyer's profile.
- Card styling uses existing tokens and the corner utility only.
