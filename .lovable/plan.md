# Navigation audit, live data, UX states and visual options

## About the design question
Yes, the design is already set: the 1950s Astral Research Authority look (cream, indigo, yellow, red, slab headings). "Your sky, your story" is only the browser tab title now, not the home page look. So the visual steps below use the current 1950s direction. Step 5 gives you three options and stops. Nothing visual changes until you pick one.

## Filled-in targets (your prompts had placeholders)
- Live data module: **Moon Calendar** (/moon-calendar) plus a new **Today's Ephemeris** panel. There's no Ephemeris page yet, and there's no Famous Charts page at all.
- UX states page: **Birth chart result and saved charts** (/results, /my-chart, chart calculator). You pasted this prompt four times, so it's planned once.
- Visual work: **Compatibility** cards. Famous Charts gets listed as missing, not built.

## Step 1: Audit only, no code changes
- Read the router and every navigation source: header, mobile drawer, member sidebar, bottom tab bar, footer, home buttons, Continue Exploring blocks, and the shared nav registry.
- Build a table: Label | Where it appears (Header / Body / Footer) | Route | State (Complete / Partial / Stub / Broken).
- Overlaps found so far:
  - /learn is already the main page.
  - /academy redirects to /learn#lessons, but /academy/:slug lessons still exist.
  - /blog redirects to /learn#journal, and articles live at /learn/:slug.
- Check whether the "Knowledge Base" and "Articles" labels in your instructions still match real links.
- Recommend one route map:
  - Learn = /learn
  - lessons = /learn/lessons/:slug, with /academy/:slug redirected there
  - articles = /learn/:slug
  - Blog and Knowledge Base become labels only, both pointing to /learn.
- List every broken link, orphan page, and missing page (Ephemeris, Famous Charts).

## Step 2: Add the findings to both main documents
- Master resource: add Part 29, "Navigation audit and route map": the full table, the overlaps, the recommended map, and Steps 3–6 with their statuses.
- Your reference copy: make v3 (.md + PDF) with the same Part 29, and keep all of v2.
- Update the roadmap, the feature list (add Ephemeris page and Famous Charts as Planned), and the developer log.

## Step 3: Live data (Moon Calendar and Today's Ephemeris)
- Use only the chart engine's own calculations. No sample positions.
- Every date says whether it's UTC or your local time, e.g. "Full Moon · 14 Nov 2026, 13:41 UTC (8:41 AM your time)".
- Loading placeholders shaped like the content, a clear empty message, and an error banner with a Retry button. If a calculation fails, show the error and never fake positions.
- The header, footer and page addresses stay the same.

## Step 4: Navigation consolidation
- Apply the Step 1 map across the router, desktop header, mobile drawer, home buttons and footer, all from the shared registry.
- Old addresses (/academy, /blog, /academy/:slug) redirect, so no link breaks.
- New "not found" screen for bad lesson, article or theme addresses, with links back to Learn and search.
- Add a test that every link in the registry, header and footer goes to a real page.
- Page content, data and colors stay as they are.

## Step 5: Birth chart result and saved charts, all states
- Signed-out visitors and members both get:
  - loading placeholders
  - an empty state with a next step ("Calculate your first chart")
  - inline messages for date, time and place
  - an error banner with Retry
- When a signed-out visitor taps Save Chart:
  - the entered birth details are kept on the device only
  - they're sent to sign up or sign in, with a return address
  - after signing in, the chart is saved and the visitor lands back on it
  - the kept details are then cleared
- Unknown birth time still says what it affects.
- Tests: kept details survive the sign-in trip, get cleared afterwards, and are never sent before sign-in.

## Step 6: Compatibility visuals, proposal first
- Three options, each with real astrology wording (e.g. "Venus in Taurus trine Mars in Virgo"), covering headings, card surfaces, spacing and how the cards stack on phones.
- **I stop here until you choose.**
- After you choose, only the compatibility cards change:
  - three columns on desktop, one on phones
  - large tap areas
  - clear headings, then the aspect summary, then the reading text
  - a slow, gentle lift on hover, with reduced motion respected
- Data, calculations and links are left alone.

## Checks
Screenshots on phone and desktop, signed out and signed in, plus the full test suite and a clean build.

## Technical notes
- Router: src/App.tsx
- Nav registry: src/lib/memberNav.ts
- Public allowlist: SIGNED_OUT_PATHS in AppShell
- Moon/ephemeris math stays in src/lib; the UI only displays it.
- Kept details use sessionStorage, cleared on any sign-in change.
- New pages are added to usePageMeta, and the not-found pages are set to noindex.
