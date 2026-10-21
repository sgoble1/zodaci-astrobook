# Zodaci Complete Plan: Navigation, April's Edition, Design Quality and Business

This plan pulls together the navigation guide, the design and quality checklist, and the brand and revenue review. It also covers a full audit of April's edition and every unfinished item found. Nothing is removed. April's edition stays her own richer, more detailed version. It gets improved, not replaced with the member layout.

## Part 1. Navigation for members (guide items still missing)

1. **New members with no chart yet:** a single banner on member pages, "Add your birth details to get started", with a button. Chart, Readings and Book items show a small "Needs your chart" note instead of opening empty pages.
2. **"Recommended for you" card** at the top of My Chart, My Readings, Book, Explore and Learn. It is based only on the saved chart (Moon, Rising), the last reading opened and what was bought. With no chart, it asks for one.
3. **My Readings:** filter buttons (Personal, Relationships, Timing, Career, Spiritual). Any list over 8 items shows 8 plus "Show all".
4. **Book pages:** Masterbook chapters in folding sections, a reading-progress line and an edition status card on the Book page, and search plus a type filter on Sources.
5. **Breadcrumbs:** added to Masterbook chapters, Academy lessons, the source reader, single reading/topic pages, Other Systems detail pages and timing pages. Every other non-main page gets a "Back to [section]" link that points to a real page, never "go back in history".
6. **Account page:** chart completeness (birth time known or not), order status, next suggested reading, and quick links to Settings, Orders and Plans.

## Part 2. April's edition: improve and fix (keeps her own design and menu)

### Errors found and fixed first
- **Silent failures:** when a document fails to load, these pages currently show "Section not found" or an empty page. Each will show "This couldn't load — Try again" instead:
  - Masterbook
  - Masterbook chapter
  - Masterbook sources
  - Sources list
  - Source reader
  - Topic pages
  - The shared "source chapters" block at the end of Transits, Timeline, Retrogrades, Feng Shui, Purpose and Volume 2
- **Missing error handling:** add error handling to the background requests that currently have none. These are the sign-in check, the Sources index, the source reader index, the chapter index, the shared-space member list, shared media and recommendations, and the signed audio and image links. A failure then shows a clear message instead of nothing.
- **Topic page:** the "Summarize" button can be pressed when there is nothing to summarize. It will be disabled with an explanation.
- **Source chapter lists:** one list ignores its "how many to show" setting after the first load; this will be fixed.

### Wayfinding in her edition
- Add breadcrumbs and a "Continue exploring" ending to April's deep pages, built from her own menu. Her private pages never appear in member menus. The member layout's wayfinding pieces get a founder mode instead of being copied.
- Fix the dead end at the bottom of the source reader: add next and previous document plus "Back to sources".
- Add proper page titles (shown in the browser tab) to every page in her edition: home, Compendium, Transits, Timeline, Retrogrades, Feng Shui, Bagua, Purpose, Birth Chart, Masterbook pages, Sources, Topic, Reading and Volume 2.

### Richer, clearer content
- **Home:** keep the hero, wheel, planets row and chart title. Add a "Pick up where you left off" card (last page she opened) and a "This month in your chart" card from her current transits.
- **Compendium, Birth Chart, Reading:** add the glowing planet artwork to planet tables and lists, and short jump links at the top of long pages.
- **Timeline and Home:** replace the "Phase 3 ·" labels above titles with the phase name and years in plain text, per the no-numeric-labels rule.
- **Shared space:** one consistent error and retry message across conversations, posts, media and recommendations, plus empty states that suggest a next action.

### Accessibility and polish in her side menu
- Visible focus rings on every side-menu link, submenu and the phone logo (one currently removes its outline).
- Size information added to shared chat and media images so pages do not jump while loading.
- Typed data access in the shared space, replacing two untyped shortcuts.

### Kept exactly as is
- Her original menu items, now ordered by purpose.
- Her private archive, workbook, Compendium and the Kua 1 versus 8 discrepancy display.
- The classic view switch (side menu and account menu), the password protection, and Shane's separate access.

## Part 3. Design and build quality (whole app)
- Hard-coded colors: a scan found none in pages or components, so no work is needed there.
- Check every changed page at phone and desktop sizes for sideways scrolling, overlap with the bottom tab bar, and focus visibility.
- Check readable contrast on muted text inside cards in both editions, and adjust tokens only where text falls below the readable standard.
- Confirm loading placeholders match the shape of what loads, on the hub pages.
- Results go into the experience notes.

## Part 4. Brand and revenue (evidence-based)

Current live signals (checked today): 7 accounts, 8 active in the last 30 days (6,949 recorded page events), 0 book orders, 0 active paid subscriptions. Prices are unchanged and come only from the plan and book price lists.

- **Biggest gap:** visitors are not yet reaching purchase. Measure each step: welcome page, free chart, preview reading, pricing, checkout. Use the existing anonymous activity events only, never typed text.
- **Admin "Funnel this month" panel:** sign-ups, chart saved, preview opened, pricing viewed, checkout started, paid. No new tracking of private content.
- **Smallest experiments (no price changes):** clearer "See your full reading" step after a free preview; an AstroBook "see your cover" step from My Chart (uses the free chart title and cover match); and a pricing-page FAQ link next to the refund policy.
- **Costs:** add a simple cost-per-paying-member view in the admin to the existing credit ledger. It shows AI spend by feature against plan revenue, so margins are visible before any marketing spend.
- **Not done without your approval:** price or allowance changes, ads, email campaigns (blocked anyway until there is a sender domain), and any public claims, testimonials or user counts.

## Part 5. Everything else unfinished

| Item | Status |
|---|---|
| Browser check of April's edition and classic switch | Needs a founder sign-in during the check |
| Asteroids Ceres, Pallas, Juno, Vesta | Needs reference degrees (Astrodienst/AstroSeek) for tests |
| Gift subscriptions (FAQ says unavailable) | Owner decision; stays honest until decided |
| International book shipping (FAQ says unavailable) | Depends on Lulu account and shipping quotes |
| Sky Notes email | Needs email sender domain |
| Automatic book printing | Lulu keys |
| AstroComic printing | Printer account |
| Testimonials, user counts, social links | Real owner-provided content |
| Sabian symbols | Licensed source text |

## Technical details
- Load failures: a small shared `LoadState` (loading / error with retry / empty) used by the April pages and `SourceChapters`. `.catch` is added to the listed promise calls.
- Founder wayfinding: `WayfindingTop` and `NextStepPanel` gain a founder source that reads the private `APRIL_NAV_GROUPS` at runtime; registry tests confirm no founder path enters member menus.
- Page titles: `usePageMeta` added to each April page with `noindex` kept.
- Shared space: replace the `any` table helper with typed table names.
- Funnel: a has_role-checked admin RPC over `activity_events` and payment records, returning aggregate counts only.
- Cost view: extends the existing credit ledger RPC output; no new spending.
- Tests: load-error states, founder breadcrumb isolation, funnel counts (no private fields), recommendation rules, Topic summarize disabled state.

## Order of work
```text
1 April error fixes -> 2 April wayfinding + titles -> 3 April content polish + accessibility
-> 4 member navigation (no-chart banner, breadcrumbs, back links)
-> 5 recommendations + Readings filters + Book pages + Account page
-> 6 admin funnel + cost view -> 7 design/quality pass
-> 8 browser checks (signed out, member, new member, Shane, April if possible) and notes update
```
