# Launch polish: free-plan clarity, loading screen, guide items, full audit

## 1. Free plan is clear and never a dead end
Today the side menu shows every item to every member with no plan marking, so free members can open pages that only show an upgrade card.
- Tag every menu item in the shared menu list as Free, Full Access or Creator.
- Free members see included items normally. Paid items show a small lock and "Full Access" label, are greyed out, and open a short upgrade sheet instead of an empty page.
- A plan badge at the top of the menu ("Free plan · 2 readings included · Upgrade").
- My readings: the 2 free readings at the top, the locked ones grouped below under "Unlock with Full Access".
- The same rule applies on the server, so locked pages can't be reached by typing the address.
- The welcome tour gets a free-plan version that only points at included features.

## 2. Loading screen that people can find
- The writing progress shows as a fixed bar at the top of every page (always visible, no scrolling), with "3 of 38 ready · writing Love & Relationships" and an Open button.
- The full-screen view lists every page with Ready / Writing / Waiting, and each ready page is a link.
- Remove the progress block buried lower on My readings and the dashboard; replace it with a pointer to the top bar.
- Free members see "2 of 2" instead of a long list they can't finish.
- Clear paused messages (credits out, daily limit) with what happens next.

## 3. Remaining items from the two uploaded documents
Re-read both documents and finish everything not yet built, including:
- Homepage, About reading list, structured search data for blog articles and the AstroBook product, a social preview image.
- Contact and footer details, consistent page titles on every public page.
- Still skipped unless you say otherwise: invented ratings, counts and testimonials; moving pages under "/app"; replacing the current fonts and colours.

## 4. Full audit and fixes
Automated browser walkthroughs at phone and desktop size, with screenshots, for:
- Signed out: every public page, links, footer, sign-in, sign-up, password reset.
- New free member: sign-up → birth details → loading → 2 readings → locked items → upgrade.
- Paid member (test payment): all 38 readings, counselors, podcasts, Other Systems, timing, workbook.
- Creator: dashboard, chapter and podcast tools.
- Admin: every tab, April-view tab, Book orders.
- AstroBook: cover choice, PDF, order form.
Each page is checked for errors, blank or repeated content, broken links, overlap, clipped text, wide tables, contrast and keyboard use. Everything found is fixed and listed in the closing report. Then the security scan and database checks.

## Still needs you
- AI credits for paid members' readings to finish.
- A real Pixartprinting quote (prices stay estimates).
- Real social accounts, contact email, and any real reviews.
- Review of the Privacy and Terms text I wrote.

## Technical details
- Add `plan: 'free' | 'full' | 'creator'` to entries in `src/content/navigation.ts`; `AppShell` reads `useSubscription` + admin/shared-space checks (same rules as `canWriteAllReadings`) to render lock states; a `RequirePlan` route wrapper shows the upgrade sheet.
- `GenerationProgress`: replace corner badge with a sticky top bar inside `AppShell`, list from `ALL_READINGS` filtered by eligibility.
- Audit with Playwright scripts under `/tmp/browser/audit`, minted sessions for the test accounts.
