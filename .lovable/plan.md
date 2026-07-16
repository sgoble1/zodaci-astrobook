## Goal

Push the site from "well-covered natal chart" to "exhaustive personal astrological reference" by mining every remaining insight derivable from April's birth data (Sept 6, 1990 · 11:14 AM · Geneva NY), transcribing the still-unparsed source documents, and adding new interpretive lenses + interactive modules.

## 1. Parse the documents not yet ingested

- Volume 2 Supplementary Astrological Guide (PDF + DOCX)
- Personal Astrological Timeline / Retrograde Guide / Purpose 1990–2060 (both PDFs, full)
- Feng Shui Guide (full, beyond the intro already in `april.ts`)
- Print-Ready April Art Direction Deck (PPTX) — for palette + art-direction content

Write new content modules:
- `src/content/retrogrades.ts` — every personal retrograde window 1990–2060 (Mercury, Venus, Mars, Jupiter, Saturn shadow periods) with verbatim guidance.
- `src/content/purpose.ts` — decade-by-decade purpose statements, soul contract, dharma themes.
- `src/content/fengShui.ts` — 9 bagua guas × room guidance × Kua-1 personal directions (Sheng Chi, Tien Yi, Nien Yen, Fu Wei + 4 negative), element cycles, annual flying stars 2026.
- `src/content/transits.ts` — outer-planet transits to natal points 2026–2035 (Pluto in Aquarius conjunct NN, Neptune in Aries square Sun, Saturn returns, Uranus opposition age ~42, Chiron return age ~50).
- `src/content/progressions.ts` — secondary progressed Sun/Moon/Ascendant timeline, progressed lunation phases.
- `src/content/derived.ts` — computed insights: midpoints (Sun/Moon, Asc/MC), antiscia, declinations & parallels, harmonic charts (5th, 7th, 9th), Draconic chart, Vertex activations.
- `src/content/numerology.ts` — full Pythagorean breakdown (Life Path 6, Expression, Soul Urge, Personality, Birthday, Personal Year cycle 2020–2035, Pinnacles, Challenges).
- `src/content/humanDesign.ts` — Type, Strategy, Authority, Profile, defined/undefined centers, incarnation cross (derived from Sept 6 1990 11:14 EDT).
- `src/content/chineseAstrology.ts` — Metal Horse: four pillars (year/month/day/hour), Ba Zi elements, luck pillars.
- `src/content/mayan.ts` — Tzolkin day-sign + galactic tone for Sept 6 1990.

## 2. New interactive modules & pages

Routes to add:
- `/transits` — scrollable outer-planet transit timeline 2026–2035 with clickable event cards (each opens drawer with full interpretation + affected natal point).
- `/progressions` — progressed chart wheel overlay on the natal wheel; slider by year → recompute progressed Sun/Moon/Asc sign & house.
- `/numerology` — interactive breakdown: click each number (Life Path, Expression, etc.) → drawer with meaning + how it interlocks with the chart.
- `/human-design` — bodygraph SVG with clickable centers/gates/channels.
- `/synastry` (optional stub) — "add a partner's data" form that computes basic synastry aspects (client-side).
- `/derived` — midpoints table, antiscia table, declinations chart, harmonic wheels (mini-wheels for H5/H7/H9/Draconic).
- `/chinese` — Ba Zi four-pillar chart.
- `/mayan` — Tzolkin day-sign card.

Enhance existing:
- **NatalWheel**: add toggles for aspect filters (major/minor/harmonic), progressed overlay, transit overlay for "today", declination strip.
- **AspectGrid**: add orb sliders, minor aspects (quintile, septile, semisquare, sesquiquadrate), separating/applying markers.
- **Timeline**: merge in retrograde bands and transit events from the new modules; add zoom + filter by planet.
- **Bagua**: use real 9-cell flying-stars overlay for 2026 with clickable stars; add Kua-1 four favorable/four inauspicious directions ring.
- **CommandPalette**: index every new content module so ⌘K searches transits, retrogrades, numerology, human design, etc.

## 3. Accuracy layer

- Add `src/lib/ephemeris.ts` using `astronomia` (or precomputed JSON) so progressions, transits, and harmonic positions are derived, not hand-typed — reduces drift error.
- Every derived insight (midpoint, antiscion, progressed position) shows the formula + source note so the user can audit.
- Extend `SourceRef` to every new module (doc, section, page) and add a "Derived · formula" variant for computed content.
- Add unit tests (`vitest`) for the ephemeris helpers + numerology reductions.

## 4. Cross-linking & UX polish

- Every planet/house/aspect page gets a "Related" rail linking to matching transits, progressions, profection beats, sabians, fixed stars, asteroids, retrograde windows.
- Breadcrumbs + prev/next navigation within Planets, Houses, Compendium sections.
- Print stylesheet so any page can be exported as a PDF "chapter".
- SEO: JSON-LD `Article` per detail page; per-route titles/descriptions.

## 5. Illustrations (Helquist style, premium tier)

Generate one hero illustration per new module: transit sky, progressed moon, numerology sigil grid, bodygraph vignette, Ba Zi pillars, Tzolkin glyph, flying-stars compass. Keep palette/brushwork consistent with existing assets.

## Build order

1. Parse remaining docs → write all new `src/content/*` modules.
2. `ephemeris.ts` + numerology/derived helpers + tests.
3. New pages + routes + sidebar nav entries.
4. Enhance existing modules (wheel/aspect grid/timeline/bagua).
5. Extend CommandPalette + drawer registry to every new item.
6. Generate illustrations, wire cross-links, SEO, print CSS.
7. Full QA pass across all routes.

## Technical notes

- No backend needed; all data stays in `src/content/*` + client-side compute.
- `astronomia` (~200KB) lazy-loaded only on `/transits`, `/progressions`, `/derived`.
- Human Design gate/line math is deterministic from tropical longitude → include a small lookup table.
- Ba Zi pillars require lunar-calendar conversion; use a static table for 1990.
