# Navigation & Information Architecture Audit — 2026-10-20

Scope: the member app shell (signed-in, non-April), the signed-out shell, public layouts, account menu, search, Instructions and in-page navigation. April's private edition keeps its original menu (her archive's own structure, loaded only for approved accounts) and is audited only for leaks.

Prime directive: no page, route or feature is removed. Only placement changes.

## 1. Navigation sources (before)

| Source | File | Shown to | Links | Mobile/desktop |
|---|---|---|---|---|
| Sidebar header | `layout/AppShell.tsx` SidebarInner | Signed in | Logo, Account button, Admin edition switch (admin email), name + birth line, "Open my chart" / "Get started" | Desktop sidebar `lg:`; same content in full-screen mobile menu |
| Free-plan banner | AppShell | Free members | /pricing | Both |
| Search + bookmark + chat-about + Instructions | AppShell, `BookmarkButton`, `ChatAboutButton` | Signed in | ⌘K search, bookmark toggle, chat chooser, /instructions | Both |
| "Main destinations" | AppShell | Members | /dashboard, /my-chart, /my-readings, /explore, /my-astrobook, /creator (Cosmic), **/admin (admin)** | Both |
| Shane block | AppShell | Shane's account | /shane, /topics, /workbook, /shared | Both |
| Site menu (5 collapsible sections) | `content/navigation.ts` NAV_GROUPS via MEMBER_SECTIONS | Members | ~75 links: Readings, My Chart, Reflect, Relationships, My Library (see §3) | Both |
| April menu | APRIL_NAV_GROUPS (private payload) | April edition only | Her original groups | Both |
| Account dropdown | `common/AccountButton.tsx` | Signed in | /dashboard, /start, /personal-context, /workspaces, /pricing, /creator (Cosmic), /orders, /instructions, /about, Sign out | Both |
| Signed-out header | AppShell (signed-out branch) | Signed out on /auth, /pricing, /books, /reset-password | /welcome, /about, /blog, /community, /books, /pricing, Sign in | Both (wrapping row) |
| Public header | `brand/PublicSiteLayout.tsx` | Everyone on public pages | /welcome, /academy, /compatibility, /astrobook, /astrocomic, /pricing, Sign in / Open my Zodaci | Both (wrapping row) |
| Public footer | `brand/GlobalFooter.tsx` | Public pages | 18 links in 3 columns + Contact | Both |
| Member footer | AppShell | Signed in | None (brand line only) | Both |
| Homepage header | `pages/BrandLanding.tsx` (/welcome) | Everyone | Own sheet menu; kept separate by project rule | Both |
| Member search | `common/MemberSearch.tsx` | Members | NAV_GROUPS + created pages + /dashboard + /orders | ⌘K / trigger |
| Instructions | `pages/Instructions.tsx` | Members: MEMBER_SECTIONS lists; April: guide | Every menu link | Page |
| Dashboard | `common/MemberDashboard.tsx` | Members | Continue reading, /my-chart, /my-readings, orders, /explore, /books, /creator | Page |
| Explore | `pages/ExploreDiscover.tsx` | Members: 10 cards; April: trails | Mixed destinations | Page |
| In-page back links | e.g. MemberSystem "← Other Systems", MemberChartSection chips | Members | Local | Page |
| Breadcrumbs | none | — | — | — |

## 2. User contexts

- **A Public** (signed out): `/welcome`, public layout pages (about, blog, academy, compatibility, astrobook, astrocomic, themes, faq, privacy, terms, demo, book-preview, community, lp), and four AppShell paths (auth, pricing, books, reset-password). Every other app path redirects to `/auth?next=`. Verified rule: no member menu renders signed out.
- **B Free member**: everything in the member menu; Pro/Cosmic items show a lock + plan badge in the sidebar and open a plan explanation page.
- **C Paid member** (Pro/Cosmic): same menu without locks; Cosmic adds Cosmic Studio and creation tools.
- **D Admin / founders**: Shane (admin) additionally saw Admin in "Main destinations", the Shane block, and the edition switch; approved April/Shane accounts see shared-space links.

## 3. Pain points found

1. **No real top level.** Members faced up to 7 "main destination" buttons *plus* 5 collapsible sections holding ~75 links, plus a Shane block — 13+ top-level choices in one column. Above the 7-item cap.
2. **Context collapse.** `/admin` sat in "Main destinations" next to member features. `/data-quality` ("Data Quality", April's input audit) sat in the member *Library* section and, for members, rendered their readings list instead — a broken, admin-flavoured link. `/dispatch` was reachable from nowhere.
3. **Duplicates.** `/my-readings` appeared three times (Main destinations, "Your personal themes", "My Readings"). `/birth-chart` and `/chart-guide` render the member's own My Chart, duplicating `/my-chart`. `/` immediately redirects members to `/dashboard`, duplicating Dashboard. `/workspaces` appeared in both Account and nowhere else.
4. **Scattered similar features.** Timing lived under Readings while Transits-style tools were also linked from Explore; Other Systems sat under "My Chart"; Counselors and chats were split between Reflect and the Begin list; Podcasts, orders, comic, referrals and blog were all in "Library".
5. **Orphans for members.** Core-theme readings (12, free first-section previews) were reachable **only** through a sidebar submenu — `/my-readings` did not list them. `/faq`, `/demo`, `/themes`, `/community`, `/book-preview`, `/verify` (only via Other Systems), `/dispatch` had no member entry point.
6. **Dead ends.** Most member pages end without a "what next" path (My Chart, My Readings, topic readings, timing pages, systems, relationships). Only the dashboard has an "Explore next" row.
7. **No breadcrumbs.** Detail pages (topic readings, planet/house detail, relationship reading/timeline, counselor sessions, system pages, created pages) relied on the menu or ad-hoc "← back" links.
8. **Mobile.** The phone menu was a full-screen copy of the long sidebar behind a hamburger; no persistent tab bar.
9. **Route change.** Scroll-to-top existed; focus was not moved to the main content after navigation.
10. **Explore hub** did not follow a domain-hub structure (no timing / relationships / systems / community rows).
11. **Stale copy.** Welcome tour and help text refer to "the side menu" and "Library → Podcasts".

## 4. Target architecture (member shell)

```text
[Zodaci]  Chart  Readings  Book  Explore  Learn        [search] [bookmark] [chat] [Account]
Phone:    top bar [Zodaci] [search] [bookmark] [Account]
          bottom tabs [Chart] [Readings] [Book] [Explore] [Account]  (each opens a domain sheet)
```

Five domains + Account. Desktop: full-width mega-menu per domain (click, switch on hover while open, Escape/outside click/route change close, arrow-key navigation). Phone (< md): fixed 5-tab bar; each tab opens a bottom sheet with the domain hub link and every grouped item; Learn lives in the Account sheet. Admin tools appear **only** in the Account menu for admins.

| Domain | Hub | Groups |
|---|---|---|
| Chart | /my-chart | Your chart (My Chart, Planets, Houses, Aspects, Star Map) · Go deeper (Results, Key Findings, Elements, Calculator, Birth details, Our Two Charts†) |
| Readings | /my-readings | My readings (All, Big Three, Personality, Love, Career, Purpose, every topic) · Ask & talk (SmartChat, Wonderings, Counselors, Social Counselor, Oracle Within) · Reflect (Workbook, Check-in, Reframe, Journal, RetroGOOD, Create a page) |
| Book | /my-astrobook | My AstroBook (Masterbook, Printed AstroBook, Orders, Book preview) · Library (My Library, Podcasts, AstroComic) · Editions† (Shane's Masterbook, All themes & topics) |
| Explore | /explore | Timing (Transits, Timeline, Retrogrades, Profection, Key Years) · Relationships (All, Compatibility, people) · Other systems (Dashboard, Chinese, Vedic, Maya, Numerology, Purpose…) · Community (Community, Workspaces, Invite, Shared Space†) |
| Learn | /academy | Academy (Academy, Core themes) · Reference & help (Instructions, FAQ, Verify the sources, Demo) · Read (Community Journal, About) |
| Account | /dashboard | Dashboard, Birth details, Personal context, Workspaces, Plans, Orders, Cosmic Studio (Cosmic), Instructions, About · Admin† (Admin, Dispatch, April edition switch) · Sign out |

† shown only to the accounts the database already authorizes (founder/admin checks unchanged).

Contextual layers: domain quick-access row on hub and section pages; breadcrumbs (Domain › Section › Item) on detail pages; "Continue exploring" panel with one personalized step on every member page except utility/admin/chat-session pages; focus moves to main content on route change.

## 5. Discovery levels (Appendix A, member app)

- **Primary (1 click)**: Chart, Readings, Book, Explore, Learn hubs; Account → Dashboard.
- **Secondary (mega-menu / sheet)**: every item listed in §4.
- **Tertiary (hub)**: all 19 in-depth topics and 12 core themes (Readings hub), remaining systems (Tibetan, Nine Star Ki, Chaldean, Tarot, Celtic via Other Systems), each relationship's reading/timeline, counselor profiles/sessions, workbook modules, planet/house detail.
- **Utility (Account / direct URL)**: /start, /personal-context, /workspaces, /pricing, /orders, /creator, /instructions, /about, /checkout/return, /auth, /reset-password; admin: /admin, /dispatch.
- **Documented duplicates (route kept, not listed again)**: `/` (redirects to dashboard), `/birth-chart`, `/chart-guide` (render My Chart for members), `/data-quality` (April's input audit; renders readings for members).
- **April / founder only (her menu)**: /masterbook*, /contents, /read*, /sources*, /ask, /compendium, /reading, /volume-2, /feng-shui*, /bagua-reading, /guides/*, /topics/:slug, /shared/*, /shane/:id.
- **Public only**: /welcome, /lp/:slug, /brand-launch, /april (password link), /astrobook, /astrocomic.

The machine-checked version of this table is `ROUTE_INVENTORY` in `src/content/memberNav.ts`; `src/content/memberNav.test.ts` fails if any App route is unclassified or any former menu destination is lost.

## 6. Verification plan

Playwright at 393px and 1280px: signed out (public chrome only, private paths redirect), member (5 domains, mega-menu open/close via click, Escape, outside click and route change; arrow keys; tab bar visible < md and hidden on admin pages; no horizontal overflow; content not covered by the tab bar), admin (Admin/Dispatch only inside Account). Results are appended below.

## 7. Results

- 12 navigation tests pass (route inventory: no route unclassified, no former menu destination lost); full suite 275 tests pass.
- Shane (admin), desktop 1280px and phone 393px: five menu buttons, menu panels close on Escape, outside click and page change, arrow keys work, admin tools only in Account, phone tab bar hidden on admin pages, no sideways overflow.
- Fixed after first pass: hub pages (/my-chart, /my-readings, /my-astrobook, /explore, /academy) now show the section shortcut row; "Continue exploring" no longer repeats breadcrumb links.
- Founders can switch to the classic member layout and back (banner on every page).
- Regular member (2026-10-21), 393px and 1280px: Explore, Book and Chart shortcut rows show on hub pages; My Library loads (the earlier "Opening Zodaci…" capture was a timing artifact); header stays at the top after scrolling; no admin links; no overflow; no page errors.
- Signed out: private pages redirect to sign-in; no member menu; no overflow.
- Not yet verified in a browser: April's own account and Shane inside April's edition (needs a fresh founder session).
