# Zodaci OS — Astral Research Authority: full 12-phase plan

Sources: the conversation document, the concept board and your Phase 1 notes. Later decisions win over earlier ones; your answers in this chat win over the documents. Everything below applies **globally** — every public page, member page, private edition, shop, admin and email — not just the home page.

## Global rules (apply to every phase and every page)
- **World:** Zodaci Astral Research Authority + Personal Cosmic Operating System. Visitors should feel they enter an observatory, library, broadcast network, research institute and personal archive. Goal reaction: "This feels like a personal observatory" — never "another astrology website" or "a creative agency".
- **Style:** 1950s educational graphics, NASA posters, astronomy manuals, science museums, research archives; modern editorial and app polish on top; small retro TV/CRT touches. Never fantasy, witch shop, crystals, cyberpunk, Fallout characters, Vault Boy, blue jumpsuits or thumbs-up poses (the concept image's pointing boy is replaced).
- **Colors (your Blend choice):** archive cream `#EFE3C8`, deep indigo `#1E1E5A`, shop yellow `#FFC61A`, shop red `#E23B44`; brass gold, black, and constellation blue for diagrams/links. Lighter overall than now.
- **Fonts:** DM Serif Display + Fira Sans (saved choice), plus one condensed poster font for small panel labels only.
- **Logo:** "ZODACI", O as observation lens (8-point star, orbit ring, faint zodiac wheel); separate star-in-orbit icon for favicon, covers, products. Line: "Astral Research Authority · Same skies. Brighter answers."
- **Every page belongs to a place:** Current Chapter → Broadcast Studio · AstroBooks → Cosmic Archive · Charts → Astral Mapping Center · Forecasts → Navigation Chamber · Timeline → Timeline Hall · Learn → Research Library · Relationships → Relationship Bureau · Journal → Observation Log · Planning/workbooks → Blueprint Hall · Reflection/counselors → Reflection Garden · Home/About → Grand Observatory · Admin → Founder Command. Each place gets its own header art, label and staff host.
- **Staff (departments, no mascot):** Director, Cartographer, Archivist, Navigator, Analyst, Broadcaster, Researcher, Historian, Curator. **Member characters (12):** Stargazer (required, featured: Black girl, two braids, observatory apprentice), Explorer, Builder, Scholar, Inventor, Dreamer, Storykeeper, Artist, Visionary, + Navigator-in-training, Healer, Wayfinder.
- **Motion (slow, no bounce or big scaling, reduced-motion safe):** signal sweep, relay activation, mechanical deploy, constellation draw, transmission online/loading, archive retrieval, retro TV switch-on with soft static. Used for page loads, loading states, menus and reveals site-wide.
- **Truth rules unchanged:** charts stay exact; no invented biography, testimonials, user counts or quotes; testimonials section stays hidden until you supply real ones; privacy and sharing stay enforced by the backend; nothing removed.

## Phase 1 — Observatory UI (everything visual, site-wide)
1. Theme colors, paper/brass textures, label font; fix the **selected-button bug** (Admin tabs, reactions, filter chips look unselected).
2. Logo, icon, favicon, social image line.
3. Shared pieces: retro TV, signal meter, status light, dossier frame, archive stamp, poster card, staff host badge, animated loaders.
4. Observatory Console sidebar (Current Chapter, My Chart, Life Compass, Forecast Center, Cosmic Archive, Relationship Bureau, Observation Log, Timeline Hall, Research Library, Broadcast Network) with status lights and active marker; public header (Charts, AstroBooks, Relationships, Forecasts, Learn, About, Blog, Shop + "Generate your chart"); phone "Field Observatory" dock. One shared navigation list feeds menus, search and Instructions; April-only and admin items keep their gates; one account switcher.
5. Home: hero with live chart generation above the fold → How It Works (birth data → chart mapping → personal insight) → features (38+ readings, forecasts, AI Observatory, Life Compass, AstroBooks, Current Chapters) → large AstroBook section → real testimonials (hidden until supplied) → pricing from saved plans → Explore the Zodiac (12 poster cards) → Latest Transmissions → Join the Observatory → footer.
6. Current Chapter (replaces Dashboard, landing after sign-in): retro TV illustration, title, summary, themes, career, relationships, finances, purpose, forecast outlook, recommendations — from the member's own chart and timing. Life Compass with six signal meters.
7. Restyle every remaining page into its place: My Chart, forecasts, readings, AstroBook reader (three columns: chapters, reading, insights) and product page (collector artifact), AstroComic pages, Shop, podcasts/library, counselors, workbooks, relationships, shared spaces, private editions (April/Shane/Zac), blog, Research Library, auth, errors, pricing, investors, Admin/Developer.
8. Staff and member character art; character picker saved to the member's account; staff hosts placed on each page.
9. Phone and desktop checks, signed out and signed in, all tests.

## Phase 2 — Context Engine
Owner-only profile: goals, challenges, life stage, relationship status, career, health focus, questions, focus areas. Edited from Current Chapter; never shared, never overrides chart facts.

## Phase 3 — Intelligence Layer
One shared system that combines chart + transits + context + Observation Log and feeds Current Chapter, Forecast Center, Life Compass, AstroBooks, Timeline and Broadcast. Observation Log entries become themes and patterns that update chapters and compass. Needs AI credits.

## Phase 4 — Living AstroBooks
Dossiers refresh sections when context, forecasts, journal or goals change; version history kept; printed copies frozen at purchase.

## Phase 5 — AstroComics
Staff and member characters in comics; panel/script templates, bubble rules, observatory locations and scene library; personal Issue #1 per buyer, Issue #2, delivery dates; fix Issue #1 title/link mismatch; update Zac's comic art. Needs AI credits.

## Phase 6 — Portrait generation
Upload a photo → your character in the observatory style; private storage, delete anytime; used in comics and books.

## Phase 7 — Relationship Bureau
Existing relationships and synastry re-housed; Shane & Zac brother comparison hub from saved charts; compatibility books.

## Phase 8 — Broadcast Engine
Retro TV channels: 01 Current Chapter, 02 Career, 03 Relationship, 04 Forecast Window, 05 Growth; podcasts play here; channel changes with static transition.

## Phase 9 — Timeline Hall
Your life story on an archive wall and retro TVs: past, current and emerging chapters from chart timing and your own entries only.

## Phase 10 — Founder Command
Admin and developer tools joined: analytics, publishing, forecast and research control, AI monitoring, revenue, orders, editions, shared spaces.

## Phase 11 — Event system
Every major action recorded (context updated, chapter generated, observation recorded, pattern detected, transmission created) with versioned formats so pages update together.

## Phase 12 — AI Observatory
"Consult the Observatory": answers using your question + chart + transits + chapter + journal + goals, with sources; expected denials shown inline.

## Current gaps and bugs (scheduled)
- Selected-button bug → Phase 1.1.
- Verify edition view switch (selected edition's chart, read-only), Admin grouping, Developer link, Zac's 33/6 passage → Phase 1.9.
- Shane's 63 chapter corrections (incl. sm-10, sm-30, sm-33, sm-45, sm-47, sm-60) → **blocked on AI credits**.
- Personal comic issues → Phase 5, **blocked on AI credits**.
- Waiting on you/outside: Resend and Search Console connections, store price sign-off, Lulu live keys, comic printer, licensed Sabian text, real testimonials/user counts, live payment test.

## Technical notes
- Tokens in `src/index.css`/`tailwind.config.ts` (memory updated from "Indigo Signal" to Blend); explicit selected style on Button.
- `src/components/observatory/` for shared pieces; place → art/host mapping in one registry; CSS keyframes with `prefers-reduced-motion`.
- Owner-only tables with RLS + grants for character choice (P1), context profile (P2), observation log (P3), events (P11).
- `roadmap.md` stays the sole index with these phases and gaps; structure rule recorded in `AGENTS.md`.
