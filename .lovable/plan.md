# Zodaci OS — Astral Research Authority Redesign (12-phase roadmap)

Source: the attached conversation (final decisions only) + the concept board. Where the conversation changed its mind, the later decision wins.

## Final decisions taken from the document
- **Not a Fallout clone.** Earlier "Pathfinder", "Future Workshop", industrial ruins, agency sections and Fallout green were all replaced. Final world: **Zodaci Astral Research Authority** — a retro-futurist astrology observatory.
- **Style mix:** 40% vintage astronomy, 25% retro-futurism, 20% observatory/planetarium, 10% NASA educational posters, 5% retro UI textures (CRT screens, transmission panels). Not fantasy, crystals, tarot, cyberpunk, neon or galaxy wallpaper.
- **No mascot.** The concept image's pointing boy is too close to Vault Boy and will be replaced. Instead: **Observatory Staff** — Director, Cartographer, Archivist, Navigator, Analyst, Broadcaster, Researcher, Historian, Curator — plus **12 member characters** to choose from, with **The Stargazer** (a Black girl with two braids) featured.
- **Logo:** keep "ZODACI"; the "O" becomes an observation lens (8-point north star, orbit ring, faint zodiac wheel). A separate star-in-orbit icon for favicon, covers and products. Tagline "Astral Research Authority · Same skies. Brighter answers."
- **Colors (your choice: Blend):** archive cream `#EFE3C8` paper panels, deep indigo `#1E1E5A` structure, shop yellow `#FFC61A` highlights, shop red `#E23B44` buttons. Brass and black as supporting tones. Less dark overall than today.
- **Fonts:** keep DM Serif Display headings and Fira Sans body; add a condensed poster face only for panel labels (as in the concept).
- **Dashboard becomes Current Chapter** — members land there.
- **Sidebar becomes the Observatory Console:** Current Chapter, My Chart, Life Compass, Forecast Center, Cosmic Archive, Relationship Bureau, Timeline Hall, Research Library, Broadcast Network. Mobile: "Field Observatory" bottom dock.
- **AstroBooks become Astral Dossiers** (stamps, archive look) keeping the real chapter structure.
- **Animations — feeling, not bounce:** signal sweep, relay activation, observatory deploy, constellation drawing, transmission loading, archive retrieval, plus retro TV switch-on/static. Slow, with reduced-motion fallbacks.
- **Homepage order:** hero (CRT/observatory with rotating chart) → What we offer (Birth Charts, AstroBooks, Relationships, Forecasts, Learn) → Cosmic Archive → How Astrology Works (5 steps) → Latest Transmissions → Explore the Zodiac (12 collectible poster cards) → Join the Observatory → footer.

## Nothing is removed
Every existing page, private edition, shared space, admin tool, shop and price stays. Privacy rules are unchanged; this is a re-skin and re-organisation.

## The 12 phases
1. **Observatory UI (build first)** — new colors, paper/brass panels, logo and icon, Observatory Console sidebar, mobile dock, new homepage, Current Chapter landing, Life Compass meters, restyled My Chart, AstroBook reader and product pages as dossiers, character selection, staff illustrations, retro TV component, all animations, accessibility and phone layouts.
2. **Context Engine** — owner-only profile: goals, challenges, life stage, focus areas, questions.
3. **Intelligence Layer** — one shared system feeding Current Chapter, forecasts, Life Compass and books from chart + transits + context + journal.
4. **Living AstroBooks** — dossiers that refresh when context or forecasts change.
5. **AstroComics** — staff and member characters in the existing comic issues.
6. **Portrait generation** — upload a photo, turned into your observatory character.
7. **Relationship Bureau** — existing relationships/compatibility re-housed.
8. **Broadcast Engine** — retro TV channels (Current Chapter, Career, Relationship, Forecast) with real signals.
9. **Timeline Hall** — your life story as past / current / emerging chapters on retro TVs and an archive wall, built only from chart timing and your own entries, never invented biography.
10. **Founder Command** — admin and developer tools re-skinned and joined.
11. **Event system** — every major action recorded so the pages update together.
12. **AI Observatory** — "Consult the Observatory": questions answered using your chart, chapter, journal and goals.

Phases 2–12 that write text or draw pictures need AI credits; Phase 1 needs only a little for artwork.

## Phase 1 build order
1. Theme tokens, textures, panel/brass frames, label font.
2. Logo, icon, favicon (artwork generation).
3. Retro TV, signal meter, status light, dossier, poster card components + animation set.
4. App shell: Console sidebar, header, mobile dock (shared navigation list, so search and Instructions follow).
5. Homepage per the order above.
6. Current Chapter landing (replaces dashboard view, keeps shared-edition view rules).
7. My Chart, AstroBook reader/product, shop, Learn, blog restyle.
8. 9 staff + 12 member characters; character picker saved to the account.
9. Check every page at phone and desktop size, signed out and signed in; run tests.

## Technical notes
- Tokens in `src/index.css` / `tailwind.config.ts` replace "Indigo Signal" with the Blend palette; memory updated accordingly.
- New components under `src/components/observatory/`; motion via CSS keyframes with `prefers-reduced-motion`.
- Character choice: small owner-only column/table with RLS.
- Images generated as project assets; no copied Fallout characters, suits or poses.
- Record the new structure rule in `AGENTS.md`; add the phases to `roadmap.md` (sole index).
