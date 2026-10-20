---
name: zodaci-chart-accuracy
description: Verify and fix Zodaci astrological calculations — natal positions, Ascendant/MC, Placidus houses, aspects and orbs, retrogrades, transits, solar returns, progressions, Kua and Flying Stars — for Shane, April and member charts. Use whenever chart math, birth data handling, timezone conversion or chart regression tests change.
---

# Zodaci Chart Accuracy

Source spec (Section A, E.2 regression test, Appendix tables): `references/source-vol2.md`.

## Precedence
Project rules win: ChartWheel renders computed charts; readings use saved birth facts only; never infer biography from symbolism; April Kua shows source-reported 1 vs formula 8 discrepancy — do not "fix" it away. Read `src/lib/AGENTS.md` before editing `src/lib`.

## Rules
- Primary engine: astronomy-engine. Geocentric, aberration on, UTC `Date` input.
- Convert local birth time with the birth place's HISTORICAL offset (DST at that date), never today's offset.
- Never hardcode degree tables or sun-sign-only shortcuts; birth data comes from its canonical source (e.g. `myBirth.ts`), never duplicated.
- Unknown birth time: no houses/Ascendant/Moon-sign claims; label uncertainty clearly.
- Tolerance ±1° for every checked point vs Astrodienst and AstroSeek; Ascendant moves ~1° per 4 min, Moon ~0.5°/hr.

## Workflow
1. Before changing math, run the existing chart tests (`bunx vitest run` on chart-related test files) to get a baseline.
2. Make the change.
3. Run the 15-point check (Section A.2/A.3) for Shane and April: Sun–Pluto, Node, Ascendant, MC, retrograde flags, house cusps.
4. Compare against reference values stored in tests; if references are missing, ask the user for Astrodienst/AstroSeek values — never invent them.
5. Add/update regression tests asserting concrete degrees within tolerance.
6. Run the cascade check (see zodaci-edge-function-integrity skill, trigger "astro.ts changed"): readings freshness, ChartWheel, transits, compatibility, PDFs/book manifests, cached readings.
