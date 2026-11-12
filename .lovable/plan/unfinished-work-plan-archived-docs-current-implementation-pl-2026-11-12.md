# Unfinished Work Plan — Archived Docs + Current Implementation Plan Doc

Sources compared: all 23 files in "Old Completed Archived Update Docs", plus "Zodaci Updtes Ops" and "ZODACI Master Platform Blueprint v1" (the Blueprint is a high-level outline of the same programs, so it adds no new line items). Findings already in the Ops doc are kept; items below marked NEW were not in it. Items confirmed in the code today are marked (checked).

Already done, so left out: the Kua solar-year and sex fix, the Workbook title, founder menu frame, shop cutouts, April's page image, store ordering, the Atomic collection, and the projector and TV styles.

## Wave 1 — Privacy and account switching (no AI credits)
1. Remove April's private placements from the Instructions search text (checked: `/topics/*` entries name April's Mercury and Moon).
2. Fix the Dashboard opening for Shane and Zac so they land on their own founder dashboard, not the member one.
3. Stop "view as" from mixing accounts: on-demand readings, Our Charts defaults, the Admin command panel (currently April-only), and the ActivityFeed default.
4. Keep the edition switch when a new tab opens (it is currently stored per tab).
5. NEW: Founder chart routes for Shane and Zac render their chart pages instead of the member fallback. Verify in the browser first, because an earlier report was wrong.
6. Stop the app from unmounting all pages during a background sign-in refresh, which wipes unsaved typing.

## Wave 2 — Member pages using April's chart (no credits)
Switch the 22 pages that still import April's chart (checked) to the signed-in member's own chart. April's own edition keeps hers. Pages: Topic, Timeline, Retrogrades, Reading, Purpose, Planets, Compendium, PlanetDetail, Houses, ChartGuide, Bagua, ChartElements, HouseDetail, Numerology, Aspects, BirthChart, FengShui, ChartCalculator, DataQuality, FlyingStars (plus AprilHome and AprilEdition, which stay April's). Also:
- Change the counselor prompts' hardcoded "she/her" to the member's own pronouns, or neutral ones.
- Explain the Compendium bounce to members instead of silently sending them to My Chart.
- Replace Workbook's privacy note that names Shane with wording that fits any member.

## Wave 3 — Founder edition experience (no credits)
- Fix `/april`, which opens outside the site shell: add the shared header and a way back.
- Add glyphs and badges to `/april#placements`, and link each placement to its chapter.
- Add April's Masterbook to Shane's Founder Editions menu.
- Use one name for Zac's edition, "Zac's Astrological Library", everywhere.
- Add Our Charts to Zac's menu, with Shane as his default comparison.
- Add founder and Official Edition breadcrumbs, and keep founders inside their edition on the mobile tab bar.
- Open the Illustrated AstroBook page to all three founders, not just Shane.
- Carry the founder's edition into Official AstroBook print orders.
- Fix the autosave race in Zac's Workbook when switching stations, and make the admin view clearly read-only.
- Fix Shane's comic script birth time: 1:55 PM, not 1:05.
- Add Shane's 24-panel AstroComic Issue #1 script to the app, reviewed and corrected.

## Wave 4 — Results and navigation flow (no credits)
- Add a "Next steps" panel to My Chart, and connect Results, Findings and RetroGOOD into one reading flow.
- Make Personal Context's "Create a chapter about this" link fill in My Masterbook's topic (checked: the `?topic=` link is not read).
- Fix the Wonderings anchor, and show an access message on `/shared/wonderings` when there is no shared space.
- Add filters to My Readings and "Recommended for you" cards based on the member's sign.
- Add a navigation path to Volume II.
- Group the Account dropdown, and add a short welcome intro for new members.
- Finish the Sibling Bureau relation filter and fix where its page leads next.

## Wave 5 — Orders, checkout, admin (no credits)
- Verify that checkout return handles credit packs and AstroComic purchases, not only memberships, then fix it. Add recovery after the 60-second wait.
- Show digital orders in the admin queue. Guard against a missing shipping address. Report Lulu errors instead of swallowing them. Fix the manuscript storage location mismatch.
- Add bounded order polling with a stop and backoff.
- NEW: Add an admin reset for AI access pauses (checked: no screen uses them).
- Keep the referral code across page loads, and use the current site address instead of a hardcoded one.
- Add a simple status board to the Developer dashboard.

## Wave 6 — Art direction and SEO (no credits)
- Move the comic and cover art instructions from "Mystic Ink" to the 1950s Atomic Zodiac style (checked: still used in comic-art, book-cover, the AI Studio admin, OfficialComic, comic.ts and Investors). Keep the old file only as an archive.
- Show members' saved characters in their comics.
- Add page titles and descriptions to the 72 pages without them (checked: 56 of 128 have them). Add a public FAQ page using the existing FAQ block and structured data.

## Wave 7 — Needs AI credits (run last, in small batches)
- Shane's 63 chapter corrections (patch only flagged sentences).
- Personal Issue #1 and Issue #2 for each buyer.
- Shane and Zac atomic-style artwork (reuse the April sheet-splitting method).
- AI Observatory consult, the "Sex & Attraction" reading, the 18 long-form topic readings, and the AstroBook Volume IV–VI writing.
- Zac's six-volume content extraction (founder data last, as agreed).


## Wave 8 — Remaining Current Implementation Plan Doc items (no credits)
From "Zodaci Updtes Ops", not yet listed above:
- Remove April's details hardcoded into the Topic, Chinese and Numerology AI requests and filters. Each member's request uses their own chart.
- Ask for sex or gender at onboarding, which Kua needs (optional, with a "prefer not to say" choice). Make chart placements clickable everywhere they appear.
- Public shared workspaces from the pasted spec. They stay separate from private spaces, as the existing rule requires.
- The classic-view banner and breadcrumbs currently name April only. Make them work for each founder.
- Replace the empty AstroBook Volume IV–VI pages with honest "being written" pages. The writing itself is in Wave 7.

## Wave 9 — Master Platform Blueprint programs (new; none exist in the app yet)
The Blueprint names five sections. The app has none of these yet: no Museum or Agency pages, no content registry, no related-content panels, no Star Scroll, and no gift collections.
1. Content registry: a list of every page and content item, recording who owns it and how they cross-link. It drives the "Related" panels on readings and searches only titles, never private text.
2. Agency "Investigations": guided topics (relationships, purpose, career, money, health, spirituality, patterns), each built from existing readings and chart facts.
3. Museum galleries: childhood, relationships, purpose, future and legacy rooms, using saved readings and Observation Log entries. Owner-only; no invented biography.
4. Archive: one page for reports, books, the timeline, discoveries and earlier versions of readings, starting with the reading history already in the app.
5. Products: Star Scroll redesign, gift collections in the shop, and personalized certificates (the app already has some certificate pieces).
6. Admin: revenue and analytics in a sidebar layout, plus a founder audit view.

## Wave 10 — Founder preservation check
- Before any founder content migration, run a full inventory of Shane's, April's and Zac's chapters and assets. Compare counts against the source documents so nothing is lost.

## Blocked outside the app
- Resend and Google Search Console connections, and the email DNS records.
- Sabian symbols licensing; asteroid degree data.
- Lulu and commercial printer accounts for live print dispatch.
- Living AstroBooks, the Portrait System and the Event System are large programs that need their own plan.

## Technical notes
- Each wave ends with tests for the changed rules: account isolation, which chart each page uses, order guards. Then a browser check signed in as Shane while viewing April and Zac, and an update to the Developer and member activity logs.
- The Shopify storefront token in the code is a public storefront key, so it is not a leak. No change.
- `roadmap.md` gets these waves as its open-task list.
