# Zodaci Implementation Brief — Full Build Plan

Every item in the brief is grouped into 8 waves, done in order. Some items in the brief are already finished. Those get a check, not a rebuild. Items that need something only you can supply are listed at the end. Your preserved choices stay as they are: the home faces hero, the projector and paper chart looks, the animated TVs, founder chapters (organized, never removed) and privacy rules.

## Already done (verify only, no rebuild)
- Zac's "dad… 33/6" workbook passage: already rewritten in his account. I'll re-check it and fix any other copy that turns up.
- Branded sign-in emails: deployed and waiting on DNS for notify.zodaci.com. I'll check the newsletter and contact forms.
- Projector / ink-on-paper chart looks and the My Chart toggle: these exist. I'll add the automatic look choice (projector on live pages, paper on books and printables) and the matching table styles.
- TV channels use real sky data: this exists. I'll check them on desktop and phone.

## Wave 1 — Critical bugs
1. Founders keep being asked for birth details. When the member has no saved birth, the shared birth lookup will use the founder's own official-edition birth facts. The "Enter my birth details" prompt and the /start redirect will stop showing to April, Shane and Zac. Onboarding will fill in from those facts. It will never show another person's chart.
2. The Learn page scrolls sideways on phones: fix the 24px overflow.
3. After onboarding, people go to My Chart, or back to the page they came from.
4. The podcast player covers content on phones: fix the overlap with the bottom dock.

## Wave 2 — Navigation and shop
- Add AstroComic to the public top menu, the member menu and the founder sidebars. Add Forecast, Characters and Sibling Bureau to the member menu.
- Use the same "My Official AstroBook" label in all three founder editions. April's sidebar gets a loading fallback. Admins see a clear banner showing "Viewing: April / Shane / Zac edition".
- Shop: books and comics come first, then atomic zodiac stickers, then bags, then everything else. Top categories get side-scrolling rows. Book and comic photos use a portrait shape. Signed-in buyers see their next unordered comic issue. Signed-out visitors see the title "Issue #1".
- Product images on the home page and shelf link to the real shop product pages. Pricing links go to the right products.

## Wave 3 — 3D book, product pages, personalization
- The 3D book preview uses the current Collector Taurus shop image everywhere it's promotional. A member's own cover and founder covers stay unchanged. Add touch rotation on phones.
- Show the personalization story on the AstroBook page and on shop product pages. Add the personalization section on the home page and a callout on the AstroComic page. Add concrete examples taken from the public sample edition. No private Masterbook text is used.
- AstroBook page as a collector piece, AstroComic page layout, and AstroComic plan cards that scroll on phones.

## Wave 4 — Home slideshow and mosaic
- Use the AstroComic cutout on the press slide. Add starbursts in the empty space above the Cartographer. The showcase slide runs full width on phones.
- Split the right side into a tall Explore plate with a short Forecast plate below it. Size the text to fit each plate.
- Expand the motto rail from 4 to 7 words, each with a short descriptor. Expand "How it works".

## Wave 5 — About, Pricing, Demo, trust
- About page: the updated atomic mural, small drawings on the pillar cards, a fifth personalization pillar, "How we calculate" (what we calculate, without exposing formulas), "Why this is different", and a founders section (no invented quotes).
- Pricing page: a trust and difference section.
- Restyle Demo, the AstroBook public page, BookPreview and the public themes pages in the observatory style. Close the six Demo gaps the brief lists.

## Wave 6 — Art, icons, animation
- Finish the 1950s icon set. Add box drawings to every feature card. Add the missing place illustrations and empty-state art. Use the brief's Mystic Ink style prompt and colors for all new images.
- Add a logo and wordmark lockup and a site-wide social share image.
- Animations: the missing projector, paper, observatory and shelf-reveal effects. Keep them extremely slow, with reduced-motion fallbacks. Fix the problems the animation audit lists.

## Wave 7 — Founder editions and member tools
- Restyle April's home and Shane's and Zac's edition homes to match. Bring Zac's menu up to April's depth, organized by volume, without removing chapters. Use plate art for April's images. Link Shane and Zac in the Sibling Bureau.
- AstroBook reader in three columns. Restyle podcasts, counselors, workbooks and private editions.
- Phone Field Observatory dock styling. Timeline Hall as an archive wall. A new Observation Log (date, place, notes; private to the owner) shown in the Timeline Hall. Edit personal context from Current Chapter.
- Calculation fixes: the full moon detector and the Nodes/Chiron handling, each with tests.

## Wave 8 — Admin, search visibility, quality
- Restyle the Admin and Developer pages in the observatory style.
- Add search-engine page data on About, Pricing, Demo and the themes pages. Run an accessibility pass.
- Run a clean build, the full tests, and phone and desktop checks. Update the roadmap and the developer activity log.

## Waiting on you
- Zac's illustrated comic pages, personal Issue #1 and #2 for buyers, and Shane's chapter corrections: these need AI credits and your review.
- Lulu print connection: needs Lulu login keys.
- DNS for notify.zodaci.com: you need to add the records.
- Real testimonials: you need to collect and approve them.
- Licensed Sabian text: needs a license.
- Portrait generation (Phase 6) and OS phases 2–12: these stay roadmap entries, not built in this pass.

## Technical notes
- Founder birth fallback: `useMyBirth` falls back to `my_official_editions()` birth only for `is_own` rows. RLS stays authoritative.
- Shop order uses `shopPresentation.productPriority` with title and tag matching. Items that don't match keep the current order. Tests cover the order rule.
- Observation Log: a new owner-only table with RLS and grants. The Timeline Hall reads it.
- Each wave ends with the build log, the relevant tests and Playwright screenshots at 393px and 1280px.
