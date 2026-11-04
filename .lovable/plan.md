# Zodaci OS — Astral Research Authority Redesign (full plan, Phase 1 first)

Sources: the conversation document, the concept board, and the new Phase 1 notes. Later decisions win over earlier ones; your answers in this chat win over the document.

## Decisions kept
- **World:** Zodaci Astral Research Authority — a retro-futurist astrology observatory. Users should think "this feels like a personal observatory", not "another astrology website" or "a creative agency".
- **Style:** 1950s educational posters, NASA graphics, astronomy textbooks, science museums, observatories; modern editorial and app polish on top. Small retro TV/CRT touches. Never fantasy, crystals, witch shop, cyberpunk, Fallout characters or Vault Boy (the pointing boy in the concept image is replaced).
- **Colors — your "Blend" choice:** archive cream `#EFE3C8` paper, deep indigo `#1E1E5A`, shop yellow `#FFC61A`, shop red `#E23B44`, plus brass gold and black. The document's navy/amber/constellation-blue set is used only as supporting tones (constellation blue for links/diagrams, brass for frames).
- **Fonts:** keep DM Serif Display + Fira Sans (your saved choice; the document's Cinzel/Inter suggestion is not used). Add one condensed poster font only for small panel labels.
- **Logo:** "ZODACI" with the O as an observation lens (8-point star, orbit ring, faint zodiac wheel); separate star-in-orbit icon for favicon and products. Line: "Astral Research Authority · Same skies. Brighter answers."
- **Characters:** Staff — Director, Cartographer, Archivist, Navigator, Analyst, Broadcaster, Researcher, Historian, Curator (departments, no mascot). Member characters — Stargazer (required: Black girl, two braids, observatory apprentice, featured), Explorer, Builder, Scholar, Inventor, Dreamer, Storykeeper, Artist, Visionary, plus three more to reach twelve.
- **Places (every page belongs to one):** Current Chapter → Broadcast Studio; AstroBooks → Cosmic Archive; Charts → Astral Mapping Center; Forecasts → Navigation Chamber; Timeline → Timeline Hall; Learn → Research Library; plus Grand Observatory, Blueprint Hall, Reflection Garden.
- **Animations (slow, no bounce or big scaling, reduced-motion safe):** signal sweep, relay activation, mechanical deploy, constellation draw, transmission online/loading, archive retrieval, retro TV switch-on.
- **Social proof:** the notes require testimonials, but your rule is never to invent them. The section shows only real reviews and stays hidden until you supply them.

## Structure
- **Public:** Home, How It Works, AstroBooks, Pricing, Research Library, About, Shop.
- **Home order:** Hero ("Discover your cosmic blueprint · Understand your story · Build your future") with live chart generation above the fold → How It Works (Birth data → Chart mapping → Personal insight) → Features (38+ readings, forecasts, AI Observatory, Life Compass, AstroBooks, Current Chapters) → large AstroBook section → real testimonials (hidden until supplied) → Pricing (from existing plan prices) → Explore the Zodiac (12 poster cards) → Latest Transmissions → Join the Observatory → footer.
- **Member Observatory Console (sidebar):** Current Chapter, My Chart, Life Compass, Forecast Center, Cosmic Archive, Relationship Bureau, Observation Log, Timeline Hall, Research Library, Broadcast Network. Status lights, signal markers, active-route marker. All existing pages stay, grouped under these. Phone: "Field Observatory" bottom dock focused on reading, reflection, exploring.
- **Current Chapter (replaces Dashboard, members land here):** illustration on a retro TV, chapter title, summary, current themes, career, relationships, finances, purpose, forecast outlook, recommendations. Built from the member's own chart and timing only; shared-edition view rules unchanged.
- **AstroBook reader:** three columns — chapters, reading, insights panel. AstroBooks become "Astral Dossiers issued by the Zodaci Astral Research Authority" with stamps and archive styling, same chapters.
- **AstroBook product page:** collector-artifact feel — book preview, format choice from existing prices, sample pages, character preview, gift option.

## Current gaps and bugs folded in
1. **Selected buttons look unselected** (Project monitoring finding): Admin tabs, shared-space reactions, April monitor and filter chips — add a clear "selected" style. Fixed in Phase 1 step 1.
2. Brighten home artwork overlay (superseded by the new home, check text contrast).
3. Verify edition-view switch: My Chart/Current Chapter show the selected edition's chart, read-only.
4. One account switcher — merge the remaining switch controls into the console.
5. Admin grouping verification and Developer link without reload.
6. Verify Zac's rewritten 33/6 passage reads correctly.
7. Brother comparison hub for Shane & Zac (from saved charts, no invented biography).
8. AstroComic: fix Issue #1 title/link mismatch, delivery dates on the comic shop, Zac's comic art update; personal Issue #1 per buyer and Issue #2 — **needs AI credits**.
9. Shane's 63 chapter corrections — **blocked: AI credits** (sm-10, sm-30, sm-33, sm-45, sm-47, sm-60 plus regenerating the rest).
10. Testing pass: regression tests, phone (393px) and desktop (1280px), signed in and out; `docs/updates-verification.md`.
11. **Waiting on you/outside services:** Resend and Google Search Console connections, store price sign-off, Lulu live keys, comic printer account, licensed Sabian text, real testimonials and user counts, live payment test.

## Phase 1 build order
1. Theme colors, paper/brass textures, label font, fix selected-button style everywhere.
2. Logo, icon, favicon.
3. Shared pieces: retro TV, signal meter, status light, dossier frame, poster card, stamp, plus the animation set.
4. Observatory Console sidebar, header, phone dock — from the single shared navigation list (search and Instructions follow it).
5. New home page.
6. Current Chapter landing and Life Compass (six signal meters: career, relationships, finances, purpose, health, creativity — from chart timing).
7. Astral Mapping Center (My Chart), AstroBook reader and product page, Shop, Research Library, blog restyle.
8. Staff and member character artwork; character picker saved to the member's account.
9. Gaps 3–7 and 8 (title/link + delivery dates) above.
10. Full testing pass (gap 10).

## Later phases
2 Context Engine (owner-only goals, challenges, life stage, focus areas) · 3 Intelligence Layer (one system feeding chapter, forecasts, compass, books) · 4 Living AstroBooks · 5 AstroComics with staff/member characters · 6 Photo-to-character portraits · 7 Relationship Bureau · 8 Broadcast Engine (TV channels: Current Chapter, Career, Relationship, Forecast, Growth) · 9 Timeline Hall (past/current/emerging chapters from chart timing and your own entries only) · 10 Founder Command (admin + developer tools joined) · 11 Event system · 12 AI Observatory ("Consult the Observatory"). Phases that write or draw need AI credits.

## Technical notes
- Tokens in `src/index.css`/`tailwind.config.ts`; memory updated from "Indigo Signal" to the Blend palette.
- Button variants get an explicit `selected`/`aria-pressed` style; Admin, SharedSpace, AprilMonitor, ShaneEdition chips use it.
- New components in `src/components/observatory/`; CSS keyframe motion with `prefers-reduced-motion`.
- Character choice: small owner-only table with RLS and grants.
- Navigation regroup changes the registry only; no route removed; April-only and admin items keep their gates.
- Generated artwork as project images; no Fallout characters, suits or poses.
- Record the structure rule in `AGENTS.md`; roadmap.md stays the sole index with these phases and gaps.
