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

## Order of work
1. Corrections and A (half-built items).
2. B (11 pages).
3. D: public access, books showcase, demo, product copy, calculation copy, variants, shop layout.
4. C (Part 28 final, reference v2 + PDF, roadmap, log).
5. Rest of D (overnight items, house explainer, uncertainty helper, Forecast TV).
Each step ends with tests, a build check and a browser check at 393px and 1280px. Any step that runs out of room is marked open in the roadmap with its next action.

## Technical details
- Feature register statuses update as each item lands.
- Founder-document check runs in the browser, compares counts with the platform_settings snapshot through the existing founderAudit, and uploads nothing.
- Pen names stored on profiles (owner-update only); public posts read the handle only.
- Chapter list windowing via a small intersection-based slice, no new library.
- Ephemeris/Chinese added to the signed-out page list and the navigation map; no private data on those pages.
- Shopify description updates through one batch update after you approve the text.
