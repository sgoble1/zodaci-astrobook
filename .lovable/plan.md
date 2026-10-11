# Pre-launch plan: gaps, fixes and enhancements (excluding Stripe)

Goal: walk every flow from start to finish, fix what breaks, and make sure all automatic writing works. Items marked "Verify" are suspected problems. Each one is confirmed with a real test before it gets fixed.

## Phase 1 — First impression and sign-in (highest priority)
1. Hide the side menu and mobile menu until the visitor is signed in. Signed-out visitors get only the Zodaci public header (Welcome, Blog, Community, Books, Sign in). The side menu currently shows for everyone.
2. Signed-out visitors who open `/` go to `/welcome`. Signed-in members without birth details go to `/start`. Members with a chart go to their home.
3. Any private link opened while signed out goes to sign-in, then returns to the page they wanted.
4. Verify that new accounts can sign up (an earlier security pass disabled open sign-up). Fix this if sign-up is still off.
5. Verify the email confirmation link brings people back into the app, and add a clear "check your email" screen.
6. Add a "Forgot password" link and a password reset page.
7. Verify Google sign-in works in preview and on the published site.
8. Make sure the sign-in page never asks twice: after sign-in, go straight to the next step.
9. Remove "Sign in to…" cards from inner pages once the menu is hidden (they become unreachable while signed out).
10. Add a sign-out item to the menu, and clear private data from memory on sign-out (verify for April's edition and for the admin's April-view tab).
11. Give the session-expired case one friendly "Please sign in again" banner instead of a blank screen, on every page.
12. Catch every crash with one shared message instead of a blank screen.

## Phase 2 — Onboarding and chart accuracy
13. Add a progress screen after "Create my chart": calculating → saving → writing readings, so new members see something happening.
14. Verify that birthplace search handles non-US cities, accents and duplicate names; show the country and region.
15. Verify historical daylight-saving handling for births before 2007 (US) and outside the US.
16. Unknown birth time: hide houses, angles and house-based sections everywhere, not only on My Chart.
17. Let members edit their birth details later, and rewrite their readings after a change (with a confirmation).
18. Show the saved birth facts and house system at the top of every personal page.
19. Add a Data Quality check for each member (the same recalculation tool April has).
20. Verify the house-system switch updates readings, the chart wheel and the printed book.
21. Remove the "saved on this device" path for signed-in users, now that sign-in comes first.

## Phase 3 — Automatic writing (topic readings, chapters, podcasts)
22. Test topic-readings end to end on a real test account with birth details, and confirm that all 18 readings save.
23. Check reading quality against April's books: length, a table of the placements used, specific houses and how the planets link up. Compare 3 different test charts so the pages don't say the same things.
24. Feed each reading the closest matching passages from the general astrology reference library (not April's private text), so readings are grounded the way hers were.
25. Add a "quality check" pass after writing that rejects readings mentioning placements the chart doesn't have.
26. Add a rewrite button for each reading (members) and a "rewrite for member" button (admin).
27. Run the queue in the background through a server job, so readings keep being written after the tab closes.
28. Show readings in progress across the whole app (a small status badge), not only on My readings.
29. Show the out-of-credits message once, in plain words, and resume automatically when credits return.
30. Starter Masterbook chapters: verify they trigger for paid plans and don't overlap with topic readings (merge the topic lists where they're the same).
31. Generate unique artwork for each topic and member (the app's own illustration style, no reuse of April's images).
32. Podcasts: verify script, audio, cover, length presets, private/shared choice and the player end to end.
33. Ask the Sources: verify streaming answers with citations for public members, using only their own documents and readings.
34. Social Counselor / Oracle Within: verify they work for public members using their own chart, and that April's profile never leaks to them.
35. Generated custom pages: verify they're filed under the right menu group and stay sorted.
36. Personal context: verify the "suggest a new topic page" action, and that the context is used in writing.
37. Wonderings suggestions: verify they work for workspace members.
38. Workbook feedback: verify for public members.
39. Record each AI action in the Usage feed (feature, time), never the content.

## Phase 4 — Privacy and separation of April's content
40. Audit the public code bundle for any remaining April text, chart numbers or image links. Move whatever is left into the private edition.
41. Verify the private-edition loader works for April, the admin's April tab, and Shane's second account, and is refused for everyone else.
42. Verify that signed-out access to protected documents, shared space tables and storage is refused (automated test script).
43. Run the security scan and database linter, then fix every finding.
44. Check that the April subdomain has no-index rules, and that the main site has a public sitemap for the public pages only.
45. Clear cached private data when switching accounts in the same tab.
46. Admin April-view tab: label it clearly with a banner so it's never confused with your own view.

## Phase 5 — Admin
47. Member charts tab: add search, filters, a word count for each reading, and "rewrite" and "delete" actions.
48. Add a topic editor: change topic titles and focus prompts without code (stored in the database).
49. Publish/unpublish: confirm hidden readings disappear for the member immediately.
50. Usage feed: add AI usage totals per member and per day.
51. Book orders: verify the fulfillment statuses, tracking number entry and the member's view.
52. Newsletter list: verify export and deletion.
53. Community moderation: admin delete, and a report button for posts.

## Phase 6 — Shared workspaces
54. Verify invite by email, accepting the invite, a member list and removing members.
55. Verify shared podcasts, media library, folders and comments for non-April workspaces.
56. Verify that relationship pages and needs analysis work for added people.
57. Add notifications (an in-app badge) for invites and new shared items.

## Phase 7 — Printed AstroBook (non-payment parts)
58. Build manuscripts from the member's topic readings, with a contents page and page numbers, aiming for about 250 and about 400 pages.
59. Verify that the three cover previews are generated from the member's chart.
60. Show a PDF preview before ordering; checkout stays blocked until printer specifications are confirmed.

## Phase 8 — Design, mobile and accessibility
61. Check every page at phone width: menus, tables (scrolling sideways), chat input, players.
62. Keyboard and screen-reader pass on the new pages (topic readings, admin tabs, onboarding).
63. Consistent loading skeletons instead of "Loading…" text.
64. Make sure all box grids use unique artwork (Explore, Topics, Readings, Library).
65. Check colour contrast on the glass panels.
66. Apply the Zodaci logo, favicon and page titles on every route, plus social-preview titles and descriptions.
67. Clear empty states with a next step on every list (no podcasts, no readings, no posts).

## Phase 9 — Reliability and performance
68. Split the app into smaller chunks that load per page to speed up first load.
69. Retry calls automatically on brief network errors.
70. Add rate limits to AI functions for each member to prevent runaway credit use.
71. Check error logs for every server function after the walkthrough, and fix anything that fails.
72. Re-read every database access rule against what each page does (owner, workspace, admin).
73. Back up generated content before any bulk rewrite.

## Phase 10 — Full walkthrough (verification)
Automated browser runs, each with screenshots, for:
- a new visitor: welcome → sign up → confirm → birth details → readings written → open a reading → podcast → workspace invite
- a returning member, mobile and desktop
- April's account: her original edition is intact
- the admin: April tab, member charts, edit/publish, usage feed
- signed out: no menu, no private data, private links go to sign-in

Every failure found in the walkthrough is added to this list and fixed before you publish.

## Still needed from you
- AI credits in the workspace, for writing readings in volume
- printer specifications for the printed books
- verified social accounts and an email sender address
- April's full legal birth name, for name-based numerology

## Technical details
- `AppShell`: render `SidebarInner` and the mobile drawer only when there's a session; otherwise render `PublicSiteLayout` chrome. Add a `RequireAuth` wrapper around private routes, keeping a `next` parameter.
- Add the `/reset-password` route; confirm email/password auth settings with the auth configuration tool.
- Topic queue: move it to a server job, either a `topic_reading_jobs` table processed by a scheduled function or chained invocations. Store topic definitions in a `topic_definitions` table (admin-editable), seeded from the current list.
- Ground readings with BM25 over the public reference corpus only. Add a validation step that compares the placements mentioned against the chart JSON.
- Privacy: scan the `dist` bundle with search patterns for April's birth facts, then move any matches to the private edition segments.
