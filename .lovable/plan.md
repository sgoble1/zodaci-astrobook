# Navigation and Menu Plan: Finish the Remaining Guide Items

I compared the navigation guide against what the app has today. Every page and feature stays. Only the way people find things changes.

## Already in place (no work needed)
- Five main menus (Chart, Readings, Book, Explore, Learn) and Account. Each has a large panel menu with descriptions, and closes on Escape, an outside click or a page change.
- On phones: five tabs at the bottom, each opening a sheet for its section. Learn lives inside Account.
- Admin tools appear only in the Account menu.
- Section shortcut rows on every main page and sub-page. Breadcrumbs on planet, house, counselor, workbook, relationship and Shane chapter pages.
- "Continue exploring" at the bottom of member pages.
- Lock badges instead of hidden items.
- Signed-out visitors see only public pages.
- Checked as a regular member, as Shane, and signed out, on phone and desktop.

## What is still missing

### 1. New members with no chart yet (guide 5.1, Level 1)
- If someone has signed in but has no birth details saved yet, show one clear banner on every member page: "Add your birth details to get started" with a button to that page.
- Chart, Readings and Book menu items show a small "Needs your chart" note instead of opening empty pages.

### 2. "Recommended for you" on every main page (guide 9.3)
- Show one personal suggestion card at the top of My Chart, My Readings, Book, Explore and Learn. It is based only on the member's saved chart (Moon sign, Rising), their last-opened reading, and what they have bought.
- If someone has no chart, the card asks them to add one. No invented suggestions.

### 3. Readings page organization (guide 6.2, 9.2)
- Add topic filter buttons at the top of My Readings: Personal, Relationships, Timing, Career, Spiritual. All topics stay; the filter only narrows the list.
- Any list longer than 8 items shows the first 8 plus a "Show all" button.

### 4. Book pages (guide 6.2, 9.2)
- Masterbook chapter list grouped into folding sections (opening first).
- Book main page: a simple progress line (chapters read) and an edition status card.
- Sources page: a search box and a filter by source type.

### 5. Breadcrumbs and "Back to…" links (guide 10.1, 10.2)
- Add breadcrumbs to the pages that still lack them: Masterbook chapters, Academy lessons, the source reader, single reading/topic pages, Other Systems detail pages, and timing pages under Explore.
- On any other non-main page without breadcrumbs, add a "Back to [section]" link. It always points to a real page, so it works from shared links too.

### 6. Account main page (guide 6.2)
- Dashboard shows chart completeness (birth time known or not), book order status if there is one, the next suggested reading, and quick links to Settings, Orders and Plans.

### 7. April's and Shane's menus
- April's private side menu keeps her original items, now ordered by purpose. Add the same "Continue exploring" block and breadcrumbs to her deep pages, using her own menu so private pages never show in member menus.
- Shane's admin tools stay only in Account.

### 8. Verify and record
- Browser checks at phone and desktop sizes: signed out, a regular member, a new member with no chart, and Shane. April's edition is checked too if a founder sign-in is available.
- Confirm every page is still reachable. Confirm menus open and close by keyboard and mouse. Confirm nothing overflows sideways.
- Results go into the navigation notes, and the task list is updated.

## Technical details
- All menu, search and help destinations keep coming from the one shared navigation list. New breadcrumb patterns and the "needs chart" flag are added there, with tests (no route lost; every new breadcrumb is at most 3 levels deep; back links never use browser history).
- Recommendations are worked out from saved birth data, plan and last visit. No typed text or private chat is read.
- Topic filter and "Show all" are reusable pieces shared across pages. Colors use existing theme tokens.
- April's founder pages keep their own guard so they never appear in member menus.

## Order of work
```text
1 no-chart banner -> 2 breadcrumbs/back links -> 3 recommendations
-> 4 Readings filters + Show all -> 5 Book pages -> 6 Account page
-> 7 April deep-page wayfinding -> 8 verify and record
```
