## Goal

Make every insight on the site auditable (source + reasoning + confidence), individually shareable (deep links everywhere), and complete (ingest the four uploads still only partially transcribed).

---

## 1. Input validation & confidence layer

New module `src/content/confidence.ts`:
- `BIRTH_CONFIDENCE`: per-input status for date, time, timezone, place, ephemeris source.
  - date: confirmed
  - time: 11:14 AM vs. 3:38 PM discrepancy in existing files — flag as **needs reconciliation**
  - timezone: EDT (UTC−4) on Sept 6 1990 in Geneva NY — confirmed, but note DST edge
  - ephemeris: hand-transcribed vs. Swiss Ephemeris — mark as "documentary, ±0.5° drift"
- `Confidence` type: `'confirmed' | 'derived' | 'approximate' | 'ambiguous'` with `note` and `affects: string[]` (which insight IDs degrade).

New shared component `src/components/common/ConfidenceBadge.tsx`:
- Small pill (green/gold/amber/red) with hover tooltip citing the ambiguity and how the recommendation was adjusted (e.g. "Ascendant degree ±2° because birth time varies by 4h between sources → rising sign band shown instead of exact degree").

New page `/data-quality` (`src/pages/DataQuality.tsx`):
- Table of every input, status, source PDF page, and downstream insights it affects.
- Explicit "Reconcile birth time" callout with both candidate times and what changes under each (Asc, MC, houses, Moon degree, Ba Zi hour pillar).

Wire badges into: NatalWheel header, PlanetDetail, HouseDetail, Transits detail, Chinese hour pillar, Numerology (birth-date only → high confidence), Profection.

---

## 2. Deep links everywhere

Standardize on hash-based deep links already used by `DetailDrawer`. Extend:

- **Transits**: each `TransitEvent` gets `id` used as `/transits#transit-<id>`. On mount, `Transits.tsx` reads hash and sets `active`, scrolls the bar into view, and opens the detail card. Add "Copy link" button on the detail card (uses `navigator.clipboard`).
- **Timeline** (`/timeline`): each phase and retrograde band gets `id` + `#phase-<id>` link.
- **Numerology**: each core number, Pinnacle, Challenge, Personal Year → `#num-<id>`, opens drawer.
- **Chinese**: each pillar + luck-pillar row → `#pillar-<id>`.
- **Feng Shui**: each bagua cell → `#bagua-<gua>`.
- **Retrogrades**: each window → `#retro-<planet>-<year>`.
- **Purpose**: each decade block → `#purpose-<decade>`.
- **Planets/Houses/Aspects**: already routed, add a `<CopyLinkButton>` on each detail page and on any drawer.

New shared component `src/components/common/CopyLinkButton.tsx` — one-line, appears next to titles.

Update `CommandPalette` search index so every new deep-linked item is reachable via ⌘K.

---

## 3. "How this is calculated" reasoning panels

New shared component `src/components/common/ReasoningPanel.tsx`:
- Collapsible section titled "How this is calculated".
- Renders an ordered list of steps: `{ label, value, source }`.
- Every step cites either a PDF `SourceRef` or a `Derived · formula` ref.

New type in `src/content/compendium.ts`:
```ts
export interface Reasoning {
  inputs: { label: string; value: string; source?: SourceRef }[];
  steps: { label: string; detail: string }[];
  output: string;
  confidence: 'confirmed' | 'derived' | 'approximate' | 'ambiguous';
  caveats?: string[];
}
```

Attach `reasoning` to:
- **Numerology** entries — show the digit reduction (`9+6+1+9+9+0 = 34 → 3+4 = 7`).
- **Pinnacles/Challenges** — show which pair was summed and how the age window was derived.
- **Transits** — show transiting planet's ingress dates, orb applied, natal point longitude, retrograde passes.
- **Ba Zi pillars** — show Bailu solar-term cutoff for the month pillar, stem-branch lookup for day pillar (Sept 6 1990 → 丙子 Bing Zi), hour pillar derivation from day stem + local hour.
- **Profection** — show `(age + 1st house sign) mod 12` walk.
- **Aspects** — orb, applying/separating.
- **Progressions/Solar arc** (if added) — day-per-year formula.

Panel appears in every DetailDrawer body and inline on Transits/Numerology/Chinese pages.

---

## 4. Inline PDF source references in drawers

Extend `DetailDrawer` payload:
- `sources?: SourceRef[]` (multi-source) in addition to existing single `source`.
- Render a "Cited in" block listing every doc/section/page.
- Add per-paragraph inline citation superscripts using a new `<Cite source={...} />` component that opens a hover popover with the exact PDF snippet path.

Backfill citations for every entry in `numerology.ts`, `transits.ts`, `chinese.ts` (currently they share one `_SOURCE` — split into per-item refs from the actual PDF pages).

---

## 5. Ingest remaining upload content

Parse and transcribe into new content modules (verbatim where possible, with `SourceRef` per section):

- `src/content/volume2.ts` — from **Volume 2 Supplementary Guide** (PDF + DOCX). Sections: additional asteroid work, harmonic charts, midpoints, declinations, extended fixed-star list, additional Arabic parts.
- `src/content/retrogradesFull.ts` — replace/extend current retrograde stub with the full **Personal Retrograde Guide** (every Mercury/Venus/Mars/Jupiter/Saturn retrograde window 1990–2060 with verbatim guidance).
- `src/content/purposeFull.ts` — full **Purpose & Fulfillment 1990–2060** decade texts, soul contract, dharma themes.
- `src/content/fengShuiFull.ts` — full **Feng Shui Guide** beyond the intro: 9 guas × room guidance, Kua-1 four favorable / four inauspicious directions, element cycles, 2026 annual flying stars.
- `src/content/artDirection.ts` — from **Print-Ready Art Direction Deck** (PPTX): palette hex values, typography specs, motif library, page-layout templates. Feed into `/art-direction` page.

New pages/enhancements:
- `/volume-2` — index of supplementary sections, each opens drawer.
- `/feng-shui` upgraded: real 9-cell flying-stars grid for 2026, clickable stars; Kua-1 direction ring.
- `/retrogrades` upgraded: filter by planet, zoomable band chart with deep-link per window.
- `/purpose` upgraded: decade cards with deep links + reasoning (which progressed/transit cycle drives each decade).
- `/art-direction` upgraded: render actual palette swatches + type specimens from parsed deck.

Every new item indexed into ⌘K.

---

## 6. Cross-cutting wiring

- Extend `SEARCH_INDEX` with all new items and a `confidence` field so palette rows can show the badge.
- Add nav entries: **Data Quality**, **Volume 2**.
- Update `AppShell` sidebar order to group: *Chart · Interpretation · Timeline · Systems · Reference · Meta (Data Quality, Art Direction)*.
- Ensure every drawer footer shows: PDF citations block + Reasoning panel + Copy-link button + Confidence badge.

---

## Technical notes

- No new dependencies required; use existing `cmdk`, `fuse.js`, shadcn primitives (`Collapsible`, `Popover`, `Tooltip`, `Badge`).
- Parsing plan: run `document--parse_document` on each remaining upload in build mode; extract verbatim paragraphs into typed arrays keyed by stable slugs so citations and deep links remain stable.
- For the 11:14 AM vs 3:38 PM birth-time discrepancy: do **not** silently pick one — surface both in `BIRTH_CONFIDENCE`, mark Ascendant/MC/houses/hour-pillar as `ambiguous` until the user confirms, and show both derivations side-by-side on `/data-quality`.
- Reasoning panels are pure content (no runtime ephemeris compute) — they narrate the steps taken in the source PDFs, keeping the site zero-backend.

---

## Build order

1. Parse the four remaining uploads → write `volume2.ts`, `retrogradesFull.ts`, `purposeFull.ts`, `fengShuiFull.ts`, `artDirection.ts`.
2. Add `confidence.ts` + `ConfidenceBadge` + `/data-quality` page.
3. Add `ReasoningPanel`, `CopyLinkButton`, `Cite` components; extend `DetailDrawer` with multi-source + reasoning slots.
4. Backfill reasoning + per-item citations across numerology, transits, chinese, profection, aspects.
5. Add deep-link handling + copy buttons to Transits, Timeline, Retrogrades, Purpose, Feng Shui, Numerology, Chinese pages.
6. Upgrade Feng Shui / Retrogrades / Purpose / Art Direction pages with the new full content.
7. Extend ⌘K index and sidebar nav; QA every deep link and badge.
