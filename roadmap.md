# Zodaci — Active Project Index

## In progress (current request: UPDATES collection, Zac edition, store, investors)
- [x] Separate archive passwords for April, Shane, Zac (edition-scoped unlocks)
- [x] Zac full edition: 198 named chapters from Volumes I–VI, own sidebar/phone menu, classic switch, Diamond Workbook
- [x] Zac's edition granted to shanealecomptegoble@gmail.com (opens once he signs up and saves his birth details)
- [x] April + Shane chapter lists visible without unlock, descriptive titles
- [x] Official AstroBook section for April, Shane, Zac
- [x] Covers: remove Blue Cosmos/Gold Aurora; Midnight Ember variant; solid + gradient options
- [x] Shopify store: posters, stickers, notebooks (prices need owner confirmation)
- [x] /investors page, invite-only, admin-managed access
- [x] Reading Room: 7 illustrated articles, filters, glossary pop-ups, progress bar, save/share
- [ ] Official section visibility: April and Zac see only their own Masterbook + AstroComic; only Shane (admin) sees all three (server-checked)
- [ ] Official AstroComic per founder (built from that founder's chart) + Shane's Illustrated October 2026 PDF in a private page viewer
- [ ] Mystic Ink: shared style prefix/negative prompt, palette tokens, 12-sign guide, asset templates, prompt builder; three sample artworks placed
- [ ] Unified Spec: Full Moon birth by lunar timing, spec orbs + Yod, significance ranking, Shadow & Breakthrough library, Opening Letter, keep readings when birth facts unchanged
- [ ] Print report facts in admin production notes and investor page (UNVERIFIED kept)
- [ ] Zac's workbook prompts served privately (not in the public bundle); answers saved to his account
- [ ] Tests: edition password isolation, Zac chart vs Volume I, official visibility, cover list, spec rules
- [ ] Verify every UPDATES document item (checklist in docs/updates-verification.md)


## In progress (current request: navigation & information architecture skill)
- [x] Navigation audit written to docs/navigation-audit.md before code changes (sources, contexts, discovery levels, pain points).
- [x] Member menu rebuilt into five domains (Chart, Readings, Book, Explore, Learn) + Account: desktop mega-menus, phone bottom tabs with domain sheets, admin tools only in Account.
- [x] Wayfinding: domain quick-access row, breadcrumbs on detail pages, "Continue exploring" on every member page, focus/scroll on route change.
- [x] Hubs: Explore hub per spec, Book hub (My Library), Readings hub with core themes restored, Account hub quick links.
- [x] Search, Instructions and welcome tour use the new registry; route-inventory tests prove nothing is lost.
- [x] Verified as admin at 393px/1280px; regular member and April accounts still unverified (need those sign-ins).

## In progress (previous request: finish all remaining implementation)
- [x] Dependency advisories fixed; dependency scan clean (0 known vulnerabilities, 77 packages).
- [x] Lulu Print API integration (Phase 5): admin connection status, live quote per order, submit verified-paid orders, status/tracking sync and signed webhook. Goes live once Lulu keys are added. Remaining: full test run and admin browser check as Shane.
- [x] Admin launch-readiness checklist (Admin → Launch checklist) from live payment, printing, admin and settings signals (Phase 7 "global control checklist") from real system signals.

## Earlier current-request items
- [x] Complete interrupted marketing audit: prices/FAQ verification, route metadata, invitation sharing, honest public claims and mobile/desktop checks; evidence and external limits: docs/marketing-audit-2026-10-20.md.
- [x] Experience Architect audit and repairs; evidence, coverage limits and release gates: docs/experience-audit-2026-10-20.md.
- [x] Chapter readers use consistent navigation, h2/h3 anchors, account-remounted protected room, stale-load cancellation and retry. Founder content walkthrough requires authorized session/password.
- [x] Bookmark account isolation and failed-save feedback; 185 tests pass; actual saved member reading bookmark/reload/remove and phone navigation verified.
- [x] Preserve original upgrade destination through signup/checkout, fix /index welcome redirect, restore non-admin upload exclusion and label comic archive as issue plans.
- [x] Expand Shane’s own archive into chart, theme, system and workbook sections; cross-check source claims against calculated placements without borrowing April’s content.
- [x] Restored late-loaded April archive content; verified her 9 workbook chapters, 45 questions, 46 saved entries, 16 topics and Compendium in her own account; 4 privacy/hydration tests pass.
- [x] Failed lazy imports now show recovery instead of blanking; interrupted demo download, retry, and fresh welcome verified; 3 regression tests pass.
- [x] Requested homepage/demo publication; verified WebM playback and matching reduced-motion fallback; removed decorative numeric eyebrows. Final update requested after verification; deployment completion is not confirmed.
- [x] Admin walkthrough as shanegoble@gmail.com: April's edition opens in admin view; shared space opens without bouncing
- [x] April client page at /april (password link, no account needed)
- [x] Editable print/delivery/fee cost + margin table on Book orders
- [x] Interactive demo (/demo): full vs free reading, podcast sample, 3D AstroBook
- [x] 3D AstroBook mockup on AstroBook order page
- [x] Public core-theme pages (/themes) with titles, descriptions, sitemap entries
- [x] Clearer clickable-card styling
- [x] Cinematic marketing video on homepage, welcome, and AstroBook banners (grain + projector light)
- [x] Demo: Jules Harbor full 7-section reading, linked from Pricing and homepage hero
- [ ] Testimonials and user-count social proof (blocked: real customer quotes and numbers from the owner)

## Full document build (Goal run, from checklists in the 12 documents)
- [x] E1 Chart engine: 15 new deductions
- [x] E2 Results page (/results): six tabs with rank-based TierGate, Systems, Deep Dive, AI Readings
- [x] E3 RetroGOOD page: Explorer, tone saved to profile, affirmations carousel, transit overlay, numerology cross-reference
- [x] E4 Report section navigator (MOD-008) on long readings: sticky section list, reading progress, section bookmarks
- [x] S1 Public pricing: monthly/annual, plan intent through signup, FAQ, comparison table, AstroBook cross-sell
- [x] S2 Public homepage (/welcome): rebuilt, verified in browser; footer integrity note; facts strip with real product counts
- [x] S3 Academy learning hub (/academy) and public compatibility page (/compatibility) with Master Build score formula; sitemap/meta/FAQ schema
- [x] B1 AstroBook five versions in pricing, checkout, orders, costs
- [x] B2 AstroBook page: comparison, What's Inside, chapter tabs, 10-question FAQ, gift option, Olivia Chen sample; Lulu print brief
- [x] B3 Book order fulfillment stages (paid → print brief sent → printing → quality check → shipped → delivered) with stage history, customer progress line and CSV
- [x] C1 AstroComic: product page, checkout (monthly/yearly/single), webhook lifecycle, character bible art, chart+transit 24-page issue plan, subscriber archive/address/pause/skip, admin print queue + manifest CSV (physical printing waits on a printer account)
- [x] A1 Admin: grouped tabs (Content / Operations / Platform) with ?tab= persistence, Ctrl+K admin search, audit log viewer, platform settings (feature flags, maintenance, admin list), Activity filters + subscription column
- [x] A2 Admin: Stripe overview via admin-verified function, April activity monitor (activity only, never private text), newsletter drafts/segments (sending waits on email domain), member grants (plan days / bonus credits)
- [x] G1 Referrals page (ZOD- codes, ?ref= links, friend gets 7 days Pro, referrer gets 30 days Pro on friend's first payment), signup bonus claim; installable app (done: manifest/icons)
- [x] R1 Rename leftover "Creator Studio" labels to Cosmic Studio
- [x] D1 Debug Report / site-audit items checked; open only where real-world input is needed: testimonials/user counts, social media accounts
- [ ] Sabian symbols: needs a licensed source text (not invented)

## Ready next
- [x] Walked every admin tab and founder pages as Shane; fixed Document Index lock crash, names rewritten to "you" on admin/shared pages, payment mode label, audit empty state.
- [x] Shared podcasts: Whose filter with counts and assign menu work in Shane's own view (were April-view only); verified assign and restore; delete/rename/share report real failures.
- [x] AstroComic production pipeline: per-panel artwork via admin-triggered AI, proof and print PDF (5.5x8.5 + 0.125 bleed, embedded font, 300 DPI preflight), Mark printing requires the print file, illustrated subscriber reader and PDF download. Verified with one real cover (310 DPI) on a removed test issue.
- [x] Cosmic Studio opens for admins and the founders (matched the server rule; it showed an upgrade prompt).
- [x] AstroComic QR panel draws the real scannable code on screen as well as in print.
- [x] Section navigator on protected library chapters and Shane's edition chapters; shared reader exercised with an existing member reading, protected payload still gated.
- [ ] AstroComic physical printing (blocked: printer account; CMYK/PDF-X conversion happens in the printer's preflight).

## Launch plan
- .lovable/plan.md (mirrors launch-plan.md) — ongoing launch plan only

- [x] P1 Site settings: maintenance banner + feature switches read through public settings reader (security fix applied)
- [x] V1 Deployed checkout/webhook/admin payments; AstroComic prices created; tests + browser checks on public/member pages and every admin tab (197 tests passing)

## Known external blockers
- Email sender domain — newsletter sending, digests
- Lulu account/API keys — automatic AstroBook print orders
- AstroComic printer account — physical comic printing
- Social media accounts — footer links
- Real Pixartprinting quote (no published prices/API) — printed delivery cost stays an editable estimate
- AI credits top-up (owner action)

## Founder editions (April & Shane)
- [x] Classic view switch for April/Shane (member layout) with banner to return to the full edition.
- [x] April's menu ordered by purpose (chart, houses, timing, systems, books, shared, workbook); planets and personal chart title on her home page; classic view also in the account menu; Shane's edition panel labelled.
- [x] Planet artwork on Results, Deep Dive, Compendium, Transits and Our Two Charts.
- [ ] Browser check of April's edition and classic switch (needs a founder session).
- [ ] Asteroids Ceres/Pallas/Juno/Vesta (needs Astrodienst/AstroSeek reference degrees for tests).
- [x] Founder access + higher reading limits; Shane Masterbook (63 chapters) at /shane; share-with-April switch
- [x] Side-by-side "Our two charts" page
- [x] Map Shane chapters into topic pages; readings generate on demand from his calculated chart (generation resumed)
- [x] Signed-in April walkthrough: original workbook, saved-entry count, guided questions, topics and Compendium verified without runtime errors.

## Upgrade build (12 documents) — see .lovable/plan/zodaci-upgrade-one-combined-build-from-all-12-documents-2026-10-20.md
- [x] Phase 1a: admin default tab by role, non-admin upload panel removed, styled confirmation dialog replaces browser popups sitewide (retry/filter/subscription bugs were already fixed)
- [x] Phase 2a: Digital Sanctuary palette applied sitewide
- [x] Phase 1b-i: chart anomaly detection (full moon, 29°, stelliums, bucket/handle, grand trine, T-square, grand cross) on My Chart
- [x] Phase 1b-ii: Debug Report items; 15 site-audit issues (social proof and social links need real data)
- [x] Phase 2b-i: single-row welcome menu (About/Blog/Community moved to footer), credit amounts on Pricing
- [x] Phase 2b-ii: homepage section order (hero, facts strip, pillars, sample chart, reading room, process, plans + AstroBook/AstroComic, method, email)
- [x] Phase 3a: Pro $9 / Cosmic $19 (annual $89 / $179) checkout, legacy subscribers grandfathered, renamed sitewide
- [x] Phase 3b-i: monthly AI credits (Free 5 / Pro 60 / Cosmic 150), server-checked in counselors and cover previews, balance on dashboard
- [x] Phase 3b-ii: deduction engine + Key Findings page (/findings) with locked previews for Free
- [x] Phase 4a: RetroGOOD tier rating on My Chart
- [x] Phase 4b-i: RetroGOOD page (/retrogood) + Perception Engine (ranking, narrative, tone)
- [x] Phase 4b-ii: Shane×April synastry page (/our-charts, shared-space only)
- [ ] Phase 5: AstroBook 5 versions + Lulu (blocked: Lulu account/API keys)
- [x] Phase 6: AstroComic subscription, checkout and print queue (physical printing blocked: printer account)
- [x] Phase 7a: AI credit use tab
- [x] Phase 7b: Newsletter, April monitor, audit log, settings, Stripe tabs (newsletter delivery blocked: email sender domain)
- [x] Phase 8: PWA, referrals, Academy (email digests blocked: email sender domain)

## Navigation & April finish pass (Oct 21)
- [x] April edition: retry on failed loads, section trail + next page, focus rings, folding Masterbook parts
- [x] Member: get-started banner without chart, Recommended for you on hubs, reading filters + Show all
- [ ] April signed-in browser check (needs April's session)
- [ ] External: Lulu credentials, email sender domain, licensed Sabian text, real testimonials

## Completion pass (Oct 23)
- [x] April edition load failure shows "couldn't open — Try again" instead of silently switching views
- [x] Classic view: member-listed pages show the member version; April-only pages keep their own content (no unrelated fallbacks); classic search/home follow the member view
- [x] Podcast creation restricted to private-edition accounts; partial uploads cleaned up
- [x] AI credit check fails closed; counselors replay newest 200 turns
- [x] Chart titles never show blank words; ties handled; cover preview copy + "Use recommended"
- [x] Missing landing pages noindexed; privacy FAQ claim made accurate
- [x] Wayfinding from the full sidebar (Shared, Relationships, created pages, submenus, detail-route parents, singleton sections)
- [x] Phone menu: inner close button, background inert, measured header height, focus lands on the new page
- [x] /april shared report: contents list, "shared report" wording, local-only payload
- [x] Launch checklist: dated proof records (test purchase, PDF, print sample, email sender, security review ≤90 days)
- [x] Marketing admin: loading/error/retry, labeled fields, save/publish guards, safe clipboard
- [x] Planet graphics: chart points drawn as points, Chiron small body, unknown → starlight, name normalization
- [x] Promo film: retry + open-in-new-tab fallback
- [x] Cover preview: real-date validation, exact sign-change day detection, arrow-key design choice, long names fit
- [x] Counselors: retry on failed history, generic specialties, accurate privacy note
- [x] Dependency scan Oct 23: 0 known issues in 77 packages after DOMPurify 3.4.17 override (SheetJS CDN tarball unscanned)
- [x] Browser matrix Oct 23 (393/1280): April full + classic via admin edition tab, phone menu, Shane admin launch/marketing, signed-out /books /welcome /lp /april — no overflow, no page errors
- [ ] April's Masterbook chapters with the archive unlocked — blocked: archive password is hidden from the agent; owner unlocks once in preview
- [ ] Social share image — hosting adds the social preview; set a custom one only from an owner-provided public image URL
- [ ] Owner/external: Lulu keys + printed sample, email sender domain, AstroComic printer, licensed Sabian text, asteroid reference degrees, real testimonials, approved test purchase
