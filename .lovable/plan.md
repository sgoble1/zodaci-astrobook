## Goal

Turn the current AI film-studio one-pager into a multi-page, fully explorable analysis tool that presents 100% of the content in the uploaded documents — accurately, interactively, and beautifully — with custom Brett Helquist-style illustrations replacing all existing imagery and animations.

## Source documents (all will be parsed verbatim into TS content files)

- Complete Birth Chart Analysis + Feng Shui Guide (Sept 6 1990, Geneva NY) — 2 PDFs
- Complete Personal Astrological Timeline / Retrograde Guide / Purpose 1990–2060 — 2 PDFs
- The Complete Master Astrological Compendium
- Volume 2 Supplementary Astrological Guide (PDF + DOCX)
- Illustration Reference Guide – Brett Helquist Style
- Print-Ready April Art Direction Deck (PPTX)

## Information architecture (React Router, replaces one-pager)

```text
/                     Home — hero + interactive natal chart wheel + navigation to all modules
/birth-chart          Full natal chart analysis (Sun, Moon, Rising, chart shape, hemispheres)
/planets              Every planet: sign, house, aspects, interpretation — one card per planet, click to detail
/planets/:planet      Detail page per planet with all uploaded interpretation text
/houses               12 houses overview grid
/houses/:house        Detail page per house (ruler, cusp, planets inside, life-area meaning)
/aspects              Interactive aspect grid (click any cell for full interpretation)
/timeline             Scrubbable 1990–2060 timeline: transits, progressions, life phases
/retrogrades          Retrograde guide by planet + personal retrograde periods
/purpose              Purpose & fulfillment strategies (per decade / life stage)
/feng-shui            Interactive bagua overlay + room-by-room guidance
/compendium           Full searchable Master Compendium (all reference tables, dignities, decans)
/compendium/:section  Deep dives (dignities, sabian symbols, fixed stars, decans, etc.)
/art-direction        Illustration reference guide + art deck presented as a visual gallery
```

Global: header with sidebar/nav, breadcrumbs, in-page search across all content, dark celestial theme.

## Interactive modules

1. **Natal chart wheel** (SVG) — 12 houses, zodiac ring, planet glyphs at exact degrees, aspect lines. Hover highlights, click a planet/house/sign to route to its detail page. Central hub on `/`.
2. **Aspect grid** — 10×10 sortable/filterable matrix; cells colored by aspect type; click opens interpretation drawer.
3. **Planetary dignities table** — sortable table (domicile, exaltation, detriment, fall, triplicity, terms, faces) from the Compendium.
4. **Timeline scrubber 1990–2060** — horizontal draggable timeline with markers for major transits, progressions, retrograde windows, life phases; click a marker for full guidance text.
5. **Feng shui bagua overlay** — 3×3 grid mapped to life areas, click each gua for the uploaded room/element/color guidance; toggleable overlay onto a floor-plan illustration.
6. **Compendium search** — client-side fuzzy search (Fuse.js) across all parsed content with jump-to-section.

Every card, glyph, timeline marker, table row, and bagua cell is clickable and opens either a detail route or a side drawer with the full verbatim content.

## Content pipeline

1. Parse each PDF and the PPTX with `document--parse_document`.
2. Write structured TypeScript content modules under `src/content/` — one file per domain (`planets.ts`, `houses.ts`, `aspects.ts`, `timeline.ts`, `retrogrades.ts`, `fengShui.ts`, `compendium/*.ts`, `artDirection.ts`). Each entry preserves the full source text (no summarization) plus metadata (degrees, dates, categories) so components can render it directly.
3. A tiny `search-index.ts` builds a Fuse index from all content at load.

## Illustrations (Brett Helquist style, per uploaded reference)

- Parse the Illustration Reference Guide to extract the exact palette, brushwork, and mood cues.
- Generate a cohesive set of hero + section illustrations with `imagegen--generate_image` (premium tier for text-adjacent pieces): celestial vignettes for each planet, house archetypes, retrograde motifs, timeline era scenes, bagua room illustration, and a Home hero.
- All existing film reel / studio imagery + the hero background video are removed and replaced.
- Motion: keep motion tasteful (framer-motion parallax on illustrations, gentle wheel rotation, aspect-line draw-in on hover). No stock video.

## Design system

- Rewrite `index.css` tokens: deep indigo/night-sky background, warm parchment fg, gold + oxblood accents (from Helquist palette).
- Typography: distinctive display serif (e.g. Cormorant Garamond) + humanist sans body (e.g. Inter Tight) via `@fontsource`.
- All shadcn components re-themed via CSS variables; no hardcoded colors in components.
- Framer-motion for animations.

## Components to remove / replace

Delete: `Hero.tsx` (video studio hero), `Portfolio.tsx`, `Services.tsx`, `Team.tsx`, `Awards.tsx`, `About.tsx`, `AnimationShowcase.tsx`, `Contact.tsx`, `Footer.tsx` (film studio version).

Add: `layout/AppShell.tsx`, `layout/AppSidebar.tsx`, `chart/NatalWheel.tsx`, `chart/AspectGrid.tsx`, `chart/DignitiesTable.tsx`, `timeline/TimelineScrubber.tsx`, `fengshui/BaguaOverlay.tsx`, `common/ContentDrawer.tsx`, `common/SearchCommand.tsx` (⌘K), plus one page component per route above.

## Technical notes

- Router: React Router already installed; expand `App.tsx` with all routes.
- Data is static TS — no backend needed. Lovable Cloud not required.
- SEO: per-route `<title>` + meta description with April's data (private but descriptive), single H1 per page, JSON-LD `Article` per detail page.
- Performance: lazy-load detail routes, code-split large content files, lazy-load illustrations.

## Build phases (one large build, delivered in this order)

1. Parse all docs → write `src/content/*` modules.
2. Design tokens + typography + AppShell + sidebar routing skeleton.
3. Generate the full illustration set.
4. Build interactive modules (wheel → aspects → timeline → bagua → dignities).
5. Build all detail pages wired to content modules.
6. Global search (⌘K), breadcrumbs, SEO metadata.
7. Remove all legacy film-studio components and assets; QA every route.
