# Full sweep: every overnight item (Nov 12, 11pm – Nov 13, 4am) not yet in the master plan

## What this does
Goes through everything said in chat that night, line by line, and checks each item against the app. Anything missing from `docs/master-implementation-resource.md` gets added as a new **Part 28**, with a status for each item. Nothing already in the document is removed.

## Sources to sweep (all of them, in full, not summaries)
1. **#1176** Lulu, supplier and "Waves 1–10" audit. Covers the 5 open wave items and the supplier margin table.
2. **#1178** Automations: email domain, automatic print dispatch, shipping email, monthly credit refresh, Shopify order sync.
3. **#1179** Your uploaded "we need to consider the following" brief.
4. **#1180–#1192** All 42 batches. Each batch has 5–15 specific requirements and limits. The current document has only one line per batch, so most of these details are missing.
5. **#1194** The 11 pages that never got a batch: BrandLaunch, BrandLanding, Chat, Companion, ChartGuide, ChartElements, ChartCalculator, PublicLibrary, PublicThemes, PublicInfo, Results.
6. **#1195–#1261** Batch build reports (anything left partial or stopped), the v2 resource, the AstroBook blueprint (#1245), and your instructions. Part 26 already holds part of this; it gets a second check for missed details.
7. **#1262–#1375** Later chat: performance work, colour tuning, the cleanup rounds and the private-edition sign-in fix. This catches anything promised but never written down.

## First spot-check: items that look missing or only partly built
These come from a quick search of the app. The full sweep will confirm each one.
- Monthly credit top-up when a membership renews (Batch 5). No renewal handler was found.
- Comic issue switcher on My Comic (Batch 8)
- Upload and check area for founder documents on the Developer page (Batch 12)
- "Confidential / Verified" archive stamps on Investigations case files (Batch 13)
- Only showing the visible rows of the 382-chapter list, to save memory (Batch 18)
- Public chart share that leaves out birth time and private notes (Batch 28)
- Community pen names (Batch 28). Only partly found.
- Spam protection on the contact form: a hidden trap field plus a limit of 3 an hour (Batch 35). Not found.
- Shopify order sync back to the member's orders page (#1178)
- The 11 pages without a batch (#1194). Each needs a review.

## Output
- **Part 28** in the master resource, one table per batch or source. Columns: Item, Source message, Status (Done / Partial / Missing / Owner-blocked / Superseded), Proof in the app, What remains, Cost (free / low AI / high AI).
- Items that clash with current rules are marked Superseded with the reason, never deleted. Examples: Resend, old prices, fake testimonials, "Creator Studio" versus "Cosmic Studio".
- A new order of work for everything marked Partial or Missing. Free items come first, grouped 3–5 per build.
- One pointer line in roadmap.md, plus the developer activity log entry.
- No app code changes in this step. Building starts from the new order of work once you approve it.

## Technical details
- Full message texts are read from the saved chat files and every requirement bullet is extracted. Each one is checked with a code search (file, function, table, route, test) before it gets a status.
- Superseded rules come from the memory index and project rules: fonts, the Blend palette, Pro and Cosmic having the same features, account-only edition access, and Lovable email instead of Resend.
