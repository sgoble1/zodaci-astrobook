# Zodaci Final Master Plan — everything still unfinished

Sources combined: "Current Implementation Plan Doc", the 23 "Old Completed Archived Update Docs", the Nov 12 unfinished-work plan (Waves 1–10), every open line in the roadmap, and open requests from chat. Items already finished and verified (Keepsakes, Museum, Investigations, Archive, gift shelf, Related panels, Admin rail, founder inventory, new book prices and page counts) are left out.

Order: free fixes first, then a verification sweep, then credit work in small batches, then outside-account items. Founder content is touched last, after a fresh inventory, and nothing is removed.

## Stage 1 — Founder editions look and feel the same (no credits)
1. April's report (/april): swap the flat placeholder planet and house pictures for the same planet spheres Shane and Zac use, with sign, degree and house badges.
2. Make each April placement open its matching chapter, as it already does for Shane and Zac.
3. Put /april inside the normal site frame, with the header, breadcrumbs and a way back.
4. Use one shared look for edition cards, chapter lists and the TV across all three founders. Each founder keeps their own topics and chapters.
5. Founder chart pages for Shane and Zac: check them in the browser and fix any that show the member fallback.
6. Keep the "view as" choice when a new tab opens. Clear it on sign-out.
7. Name Zac's edition the same everywhere. Add Our Charts to Zac's menu, with Shane as the default comparison.

## Stage 2 — Leftover free items from the archived docs (no credits)
1. Signup-first buttons on public pages. Signing in from Community brings you back where you were. Theme buttons. A working interactive chart on Demo.
2. Workbook label, Wonderings link, the "Create a chapter about this" topic, onboarding returning to the right edition, and the podcast player overlapping the progress bar.
3. Unified Spec rules: Full Moon birth judged by lunar timing, spec orbs including Yod, significance ranking, and keeping readings when birth facts are unchanged. First check each one, then build only what is missing.
4. Official section visibility checked on the server: April and Zac see only their own Masterbook and AstroComic, and Shane sees all three.
5. Zac's workbook prompts served privately instead of shipped in the public code.
6. Print report facts shown in Admin production notes and on the Investor page, with unverified facts labelled.
7. Audit the whole AstroBook and AstroComic purchase path: product page, preview, checkout, return page, order list, Admin queue.
8. Page depth: add per-house ruler aspects and decan/term chapters, so Digital (about 38 pages now) and the larger editions get closer to their page targets. These are written from the chart in code, so they cost no credits.
9. Write docs/updates-verification.md, a checklist that ties every update-document item to the place it is built or the reason it is blocked.

## Stage 3 — Verification sweep (no credits)
1. Browser walkthrough signed in as Shane, viewing April, Shane and Zac. Check the menus, TVs, chapter links, Our Charts, shared spaces and classic view.
2. Phone (393px) and desktop (1280px) check of every main page, including both chart-wheel looks.
3. Regression tests for each rule changed above: edition isolation, which chart each page uses, official visibility, order guards, spec rules.
4. Fresh security scan. Fix only real findings.

## Stage 4 — AI-credit work, cheapest first
Ways to keep credits low:
- Patch only the flagged sentences instead of rewriting whole chapters.
- Make one sheet of 9–16 pictures and cut it into separate images. This method was already used for April.
- Use the fast image tier. Use premium only for covers that show text.
- Save every result once and never generate it twice. Run batches of 5–10, and stop when credits run out.

Order, with rough cost:
1. Shane chapter sm-29 correction: one patch, small.
2. Confirm Shane's birth details (owner), then fix the 23 chapters that use other placements: patches, small to medium.
3. Shane's 63 chapter pictures: about 5 sheets, medium.
4. Zac's six-volume content organized from his 198 existing chapters. This is mostly sorting in code, with AI only for headings and summaries: medium.
5. Zac's chapter pictures: about 13 sheets, medium.
6. Redraw the sample AstroComic for a fictional reader instead of a founder: one sheet plus a script, small.
7. AstroBook Volumes IV–VI writing, and the 18 long topic readings including "Sex & Attraction". Generated once per member when they open them, so no upfront cost.
8. Personal AstroComic Issue #1, then #2: runs automatically when the first comic buyer joins.
9. Intelligence Layer: one shared summary of chart, transits and context feeding Current Chapter, forecasts and books. Built mainly in code, with one short AI summary per member, saved and reused.

## Stage 5 — Larger later programs (own small plans when reached)
- Living AstroBooks that refresh when context changes.
- Portrait system: photo to observatory character.
- Event system: one activity record so pages update together. This extends the existing activity log.

## Blocked outside the app (owner action)
- Email sender DNS for notify.zodaci.com. Lovable email replaces Resend, so Resend is not needed.
- Google Search Console connection.
- Lulu account keys and one printed sample. An AstroComic printer account.
- Licensed Sabian symbol text. Asteroid reference degrees for Ceres, Pallas, Juno and Vesta.
- Real testimonials and member counts. One approved test purchase.
- April unlocks her archive once in preview, so her Masterbook chapters can be checked signed in.
- After the next publish, delete the old demo podcast file.

## Wrap-up for every stage
- Update the Developer and member activity logs at the end of each stage.
- Update roadmap.md: close items that are done, and give each open item its reason.

## Technical details
- April planet spheres: reuse `PlanetOrb` and the placement-to-chapter mapping from `EditionInner` in `AprilEdition.tsx`. Keep the protected loader and the `aprilOnly()` rules.
- Server visibility: use `can_open_edition` / `can_open_chapter` in protected-content for the official sections. Move Zac's prompts behind protected-content.
- Chart-derived chapters (decans, terms, ruler aspects) are built as deterministic functions in `src/lib`, tested against fixed birth fixtures.
- Credit jobs use the existing claim-token queue. Before each batch, check `credit_status`, and stop on any 402.
- Picture sheets are cut with the existing sheet-splitting script, and the plates are stored in private storage for founders.
