# Finish the Part 28 Sweep — everything remaining

Continues the approved sweep. Already done Nov 14: memory refresh, feature register, investor feature list, developer "Next implementations", Part 28 first draft, "Share my signs" link. This plan finishes the rest, and adds the items from our chats that weren't in it yet.

## Corrections to what was done
- The 11 pages that never had a batch are actually: Brand Launch, Brand Landing, Chat, Companion, Chart Guide, Chart Elements, Chart Calculator, Public Library, Public Themes, Public Info, Results. Last turn I reviewed a different list. These 11 get a proper review.
- Contact form: the server already blocks spam, but the form itself doesn't include the hidden trap field and shows no friendly message when the hourly limit is hit. Fix both.
- Monthly credits: the allowance already resets each month. Confirm renewals keep the plan active and add a test.

## A. The 9 half-built items
1. Monthly credit renewal: test plus check (above).
2. My AstroComic issue switcher: a retro issue picker that remembers the chosen issue in the link.
3. Developer founder-document check: upload a DOCX/JSON, compare word and chapter counts against the saved snapshot. Founder text is never stored or shown.
4. Investigations stamps: "Confidential" and "Verified calculation" rubber stamps on case files.
5. 382-chapter list: only the rows on screen are drawn; search still works.
6. Public chart share: done ("Share my signs").
7. Community pen names: save and edit your handle inline; posts show the handle and optional placement badge.
8. Contact form trap field and limit message.
9. Shopify orders on My Orders: blocked until the store owner creates a Shopify admin app. The page shows a clear "Shop orders: see your Shopify email receipt" note until then.

## B. The 11 unbatched pages review
For each page: phone and desktop, loading/empty/error states, working links, a clear next step, page title. Fix what's found.

## C. Part 28 completed in the master document
- 28.1 Status for every batch 1–42 (Done / Partial / Missing / Blocked / Superseded), rebuilt from the master document, roadmap, build reports and remaining chat summaries.
- 28.2 The 9 items with what was built and how it was checked.
- 28.3 Shopify control and connections: Shopify owns products; Zodaci admin arranges the display; cart-line birth details; order and packing-slip fields; emails blocked on the sending domain.
- 28.4 Suppliers: Lulu, sweatshirt fulfilment, jewelry, salt, incense, 12-sign bundle recipes (from the collection files).
- 28.5 Order of work with stop conditions.
- Your Files reference copy updated to a new version, plus a PDF.
- Roadmap pointer and developer log entry.

## D. Items from our chats not yet in the plan
- Public access decision for Ephemeris and the Chinese page (your notes say public: make them open signed out).
- Five-spread AstroBook showcase on the books page; demo polish.
- Product descriptions rewritten in the human voice and pushed to Shopify (one approval).
- "How we calculate" section and calculation-trust copy on home, pricing and books.
- Admin shop layout (department order, featured items).
- Load every product variant (no 100 cut-off).
- Alternative house system explainer on My Chart.
- Birth-time uncertainty helper (when a planet would change house).
- Five-channel Forecast TV selector.
- Remaining overnight items: install banner styling, 15-point accuracy check, launch checklist export, profection wheel, Retrograde Radar tones, BaZi/Lo Shu views, cassette podcast player, one-question context flow.
- Owner sign-off items listed, not built: legal pages review, AstroComic Issue #1 sample redraw for the fictional reader, testimonials, Lulu production keys, sending domain.

## Order of work — investor readiness first
Reviewed the last four hours of chat (memory, instructions, Shopify collection, sweep, investor focus). Work is ordered by what an investor sees first.

Tier 1 — what investors open (do first)
1. Investor page: live figures with honest labels, every feature with status (done), revenue by product, clear "what's needed" list matching the blockers; Zac's overview in sync.
2. Demo screen and book/comic previews finished: five-spread AstroBook showcase, demo polish, the AstroComic sample.
3. Product descriptions in the human voice (pushed to Shopify after your approval) and the admin shop layout.
4. "How we calculate" and calculation-trust copy on home, pricing, books and the investor page.
5. Ephemeris and Chinese page open to signed-out visitors (so investors can try them without signing in).

Tier 2 — main features working cleanly
6. The half-built items (A), contact form fix, renewal test.
7. The 11 unbatched pages review (B).
8. Load every product variant; cart-line details checked.

Tier 3 — records
9. Part 28 final (C), reference v2 + PDF, roadmap, developer log.
10. Paste-ready text for your project instructions, including the guardrails we discussed: speed and size safeguards, Stripe vs Shopify split, protecting AI credits on free and demo pages.

Tier 4 — later (rarely noticed yet)
11. Overnight items, house system explainer, birth-time uncertainty helper, Forecast TV channels, investigation stamps, chapter list windowing, founder-document check, pen names.

Each step ends with tests, a build check and a browser check at 393px and 1280px. Anything that runs out of room is marked open in the roadmap with its next action. The roadmap gets this order as its first edit when building starts.

## Technical details
- Feature register statuses update as each item lands.
- Founder-document check runs in the browser, compares counts with the platform_settings snapshot through the existing founderAudit, and uploads nothing.
- Pen names stored on profiles (owner-update only); public posts read the handle only.
- Chapter list windowing via a small intersection-based slice, no new library.
- Ephemeris/Chinese added to the signed-out page list and the navigation map; no private data on those pages.
- Shopify description updates through one batch update after you approve the text.
