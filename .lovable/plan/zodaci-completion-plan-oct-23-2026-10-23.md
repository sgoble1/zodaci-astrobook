# Zodaci completion plan (Oct 23)

One plan covering everything still unfinished: April's two views, Shane, members, money/AI safety, design, marketing and verification. Nothing is removed; prices and allowances stay as they are.

## 1. April's edition (both views)
- **Full edition load failures**: today a network hiccup silently drops April into the member layout. Show a clear "Your edition couldn't open — Try again" message instead, keeping her menu once it loads.
- **Classic view contract**: classic currently swaps some of her pages for unrelated member pages (e.g. Masterbook shows My Readings, Feng Shui/Bagua/Volume 2 fall through). Make classic change the menus and layout only; April's own pages keep their content, with the existing banner and "Back to your full edition".
- **Search and home follow the chosen view** (classic uses member search/home styling; full uses her own).
- **Wayfinding from her real menu**: section trail and "next page" use the same menu the sidebar shows, including Shared, Relationships, custom pages and sub-links; single-page sections get a "back to section" link.
- **Phone menu**: close button inside the menu, focus lands on the new page after tapping a link, no overlap with the top bar on notched phones or large text.
- **/april shared report page**: add a contents list with jump links; wording says "shared report" rather than "complete" archive. Stop it from refilling private data after navigating away or switching accounts.

## 2. Shane
- Offer the same classic/full switch on Shane's own view.
- Browser-check Lulu print controls and the launch checklist on his admin page.

## 3. Money and AI safety
- **Podcasts**: the podcast maker currently writes April-specific scripts for any signed-in caller. Make it use the caller's own chart, check plan and credits before any AI work, and prevent double charges on repeated clicks; clean up on partial failure.
- **Credits**: reserve credits before AI calls across counselors/chat; if the credit check itself fails, refuse rather than let it through.
- **Counselors**: replay the newest messages (not the oldest 200) and show a retry when history fails to load; remove April-specific placements from general counselor descriptions.

## 4. Launch checklist accuracy
- Separate "provider reachable" from "proven": show dated proof slots for test payment, PDF delivery, print sample, email sender, security scan. Unknown stays unknown.

## 5. Design, marketing, imaging
- Cover preview: button "Create my AstroBook" and note "Preview only — your name, date and design aren't saved"; keyboard-friendly design choice; "Use recommended" reset; long names fit on phone.
- Chart titles: never show blank/undefined words; tied elements described as balanced; unknown birth time never guesses Rising. Tests for all 12 signs and ties.
- Planet orbs: intentional looks for Nodes/Chiron and unknown bodies; no clipping at small sizes.
- Promo film: retry when playback fails; confirm downloads work.
- Marketing admin: real loading/error states, labeled fields, no duplicate saves, "Copied" only on success.
- Unpublished/missing landing pages hidden from search engines.
- Social share image: ask owner for (or generate) a public brand share image.
- Replace the absolute "not even an admin" privacy claim with accurate wording; fix theme notes in styles.

## 6. Records and verification
- Reconcile roadmap (Lulu implemented vs. unchecked Phase 5, stale old prices, retired Pixartprinting) and record dated results.
- Run full tests plus backend function tests; refresh dependency and security scans.
- Browser matrix at 393px and 1280px: April full + classic (Masterbook, Timeline, phone menu), Shane own + April view + admin, regular member, signed out.

## Still blocked on you / outside services
- April's Masterbook chapters unlock: I can't read the saved password — please unlock once in the preview, or tell me the value to test.
- Lulu credentials and a real print sample; email sender domain; AstroComic printer; licensed Sabian text; asteroid reference degrees; real testimonials; a live test purchase (needs your OK).

## Technical details
- `useAprilSpace` returns `loading | member | founder-ready | founder-error`; AppShell renders error + retry for founder-error.
- AppShell classic: render `<Outlet/>` for founder-authorized routes instead of `PublicChartFallback`; separate "content edition" from "presentation" flags used by App search and Home.
- `founderPlace` consumes the normalized groups built in `SidebarInner` (dynamic + nested).
- `AprilEdition.tsx`: local state only, AbortController + auth-generation fence; no `hydratePrivateEdition`.
- `make-podcast`: derive profile from caller; entitlement + atomic credit reservation + idempotency key before script/TTS.
- `_shared/credits.ts`: reservation RPC, fail closed. `chat-guard.savedHistory`: order desc limit N then reverse.
- `usePageMeta` noindex for `/lp/:slug` until published content resolves.
- Tests: chartTitle edge cases, credit fail-closed rule, founderPlace with dynamic groups, classic renderer selection.
