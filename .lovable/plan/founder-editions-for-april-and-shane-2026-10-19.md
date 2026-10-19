# Founder Editions for April and Shane

## Goal
April's and Shane's accounts become "Founder" accounts: unlimited access, every category and topic filled from their own source books and charts, a connected shared workspace, and Shane can let April read his full chart and content.

## What each person gets
- **Founder access**: everything unlocked (all 38 readings, Other Systems, Masterbook, counselors, Creator tools, podcasts, AstroBook PDFs) with no daily or monthly caps.
- **Expanded edition**: a long-form version of every category and topic, built from their own books first, then from their calculated charts where the books are silent (clearly marked as "calculated from your chart", never invented biography).
  - April: current edition plus the re-uploaded Master Compendium (already stored; checked for differences).
  - Shane: his full ~200,000-word Masterbook split into chapters (natal chart, houses, aspects/lots/midpoints/Sabian, Vedic, and the remaining parts), mapped to the same menus and topics April has.
- **All topics filled**: every topic and theme page shows passages from that person's own book plus a full chart-specific reading, generated once and saved.

## Connected workspace
- One linked Founder workspace for both, joined to the existing Shared Space (Reading Together, chat, notes, media, wonderings).
- A "Our two charts" page in the shared space showing both charts side by side with a link to the existing relationship/synastry pages.

## Shane shares his chart with April
- New "Share my chart" switch on Shane's account page: when on, April can open Shane's full edition (chart, Masterbook chapters, readings, topics) read-only.
- Shane can turn it off at any time; access ends immediately.
- Sharing is enforced by the database and the private content service, not just hidden in the menu. Nobody else can see either edition.
- April keeps her existing rule: her original edition stays visible only to her (and Shane's admin view).

## Order of work
1. Founder access flag and unlimited limits for the two accounts.
2. Import Shane's Masterbook into protected storage, split by chapter, and link chapters to menus/topics.
3. Chart-sharing switch and enforcement; April's "Shane's chart" entry in her menu.
4. Linked workspace + side-by-side charts page.
5. Fill every topic/category for both (saved once; uses AI credits once per page, roughly 10-15 credits total for both accounts).
6. Walk through both accounts end to end and confirm April can read Shane's content only while sharing is on.

## Technical details
- `chart_shares(owner_id, viewer_id, enabled)` table, owner-managed RLS; `can_view_edition(owner, viewer)` security-definer helper used by `private-edition`/`protected-content`.
- Founder entitlement via `user_roles` (new `founder` enum value) checked in `has_paid_plan` and quota functions; no client-side flags.
- Shane's Masterbook entries stored as protected `sm-XX` entries split on DOCX Heading2, mirroring the `bcb-XX` pattern; `edition` parameter selects April or Shane.
- Topic/reading generation reuses the claim-token job queue, prompt sourced from the owner's own passages plus computed placements.
