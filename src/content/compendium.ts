import { registerPrivateValue } from '@/lib/privateEditionStore';
// Additional reference material for April's chart, transcribed verbatim from
// "April — The Complete Master Astrological Compendium" (PDF) and
// "April — Supplementary Volume II" where noted.
// Every entry carries a `source` pointer to the underlying PDF section/page
// so accuracy can be verified against the originals.

export interface SourceRef {
  doc: string;      // short document name
  section: string;  // section / chapter title
  page?: string;    // page number or range in the PDF
}

export interface SabianEntry {
  id: string;
  point: string;
  degree: string;
  symbol: string;
  interpretation: string;
  notes?: string;
  source: SourceRef;
}

const SRC_MASTER = 'Master Astrological Compendium';

export let SABIAN_SYMBOLS: SabianEntry[] = [];

export interface FixedStar {
  id: string;
  name: string;
  degree: string;
  conjunct: string;
  orb: string;
  meaning: string;
  activation: string;
  // Approximate sky-map coordinates (0..100 for both), for the interactive diagram.
  x: number;
  y: number;
  magnitude: number; // visual brightness for the diagram (1 = brightest)
  source: SourceRef;
}

export let FIXED_STARS: FixedStar[] = [];

export interface Asteroid {
  id: string;
  name: string;
  glyph: string;
  placement: string;
  archetype: string;
  expression: string;
  source: SourceRef;
}

export let ASTEROIDS: Asteroid[] = [];

export interface SpecialAspect {
  id: string;
  name: string;
  planets: string;
  orb: string;
  significance: string;
  source: SourceRef;
}

export let SPECIAL_ASPECTS: SpecialAspect[] = [];

export interface ArabicPart {
  id: string;
  name: string;
  position: string;
  meaning: string;
  source: SourceRef;
}

export let ARABIC_PARTS: ArabicPart[] = [];

export let PROFECTION_35: { readonly id: "profection-35"; readonly age: 35; readonly window: "September 2025 – September 2026"; readonly house: 12; readonly houseSign: "Scorpio (from Sag ASC in Whole Signs)"; readonly traditionalLord: "Mars (traditional ruler of Scorpio)"; readonly modernLord: "Pluto (modern ruler of Scorpio, natal H10 domicile)"; readonly lordPosition: "Pluto Scorpio 15°28′ H10 — in domicile"; readonly interpretation: "The Twelfth House Profection Year is one of the most misunderstood in all of astrology. A limiting reading calls it self-undoing and isolation; a transformative reading names it the house of internal alchemy and the unconscious made conscious — work done in solitude that becomes the foundation for public emergence, and the release of what no longer serves before the next first-house year of rebirth. With Scorpio ruling your 12th and Pluto in domicile Scorpio H10 as Time Lord, this year's theme is excavation of what is hidden, transformation of power structures, and the underground work that makes the next public emergence possible. September 2025 – September 2026 is a year to go deep — not to perform, but to excavate. The hidden material of your career — the work you haven't shown anyone, the ideas you haven't voiced, the power you haven't yet claimed — all of it is surfacing now. The 12th house profection year is preparation. The first house year that follows (age 36, beginning September 2026) will be the emergence."; readonly alchemicalTheme: "What was hidden becomes above-ground. What was carried in secret becomes the offering. The underground becomes the cathedral floor everyone else will eventually walk on. This is not a year to rush the surface. This is a year to honor the deep."; readonly source: SourceRef; } = {"id":"","age":0,"window":"","house":0,"houseSign":"","traditionalLord":"","modernLord":"","lordPosition":"","interpretation":"","alchemicalTheme":"","source":{"doc":"","section":"","page":""}};

export let PRENATAL_ECLIPSE: { readonly id: "prenatal-eclipse"; readonly date: "July 22, 1990 (46 days before birth)"; readonly position: "29°04′ Cancer · H7"; readonly interpretation: "An anaretic degree eclipse in the house of partnership and Chiron Cancer. Prenatal eclipses seed the soul's most important unfinished business from before birth. The 29° Cancer eclipse seeded the mother wound — the question of emotional belonging, of whether it is safe to need, of whether home is a place you are allowed to inhabit fully. The entire Chiron Cancer H7 story was already written in the sky before you arrived. You came ready to heal it."; readonly source: SourceRef; } = {"id":"","date":"","position":"","interpretation":"","source":{"doc":"","section":"","page":""}};

// Quarterly beats within the age-35 profection year, used by the interactive
// profection module. Kept short and interpretive — verbatim excerpts sit in
// the main `interpretation` above.
export interface ProfectionBeat {
  id: string;
  label: string;
  window: string;
  focus: string;
  detail: string;
}

export let PROFECTION_BEATS: ProfectionBeat[] = [];

// -----------------------------------------------------------------------------
// A single searchable index used by the ⌘K command palette. Every entry knows
// its title, body text, route, and (optionally) which drawer item to open.
// -----------------------------------------------------------------------------

export interface SearchDoc {
  id: string;
  kind: 'sabian' | 'star' | 'asteroid' | 'aspect' | 'part' | 'profection' | 'eclipse' | 'number' | 'transit' | 'pillar' | 'vol2';
  title: string;
  subtitle: string;
  body: string;
  route: string;   // where to navigate on select
  drawer?: string; // optional drawer/hash id to open (e.g. `#sabian-sun`)
  source: SourceRef;
}

export let SEARCH_INDEX: SearchDoc[] = [];

// -----------------------------------------------------------------------------
// Extended search entries — numerology numbers, outer-planet transits, Ba Zi
// pillars. Kept in this file so the ⌘K palette stays a single index.
// -----------------------------------------------------------------------------
import { CORE_NUMBERS, PINNACLES, CHALLENGES, NUMEROLOGY_SOURCE } from './numerology';
import { TRANSITS, TRANSITS_SOURCE } from './transits';
import { PILLARS, CHINESE_SOURCE } from './chinese';

import { VOL2_ENTRIES, VOL2_SOURCE } from './volume2';

SEARCH_INDEX.push(
  ...CORE_NUMBERS.map(n => ({
    id: n.id, kind: 'number' as const, title: `${n.label} · ${n.value || '—'}`,
    subtitle: n.headline,
    body: `${n.meaning} ${n.chartLink} ${n.formula}`,
    route: '/numerology', drawer: `#${n.id}`, source: NUMEROLOGY_SOURCE,
  })),
  ...PINNACLES.map(p => ({
    id: p.id, kind: 'number' as const, title: `${p.label} · ${p.value}`,
    subtitle: p.ageRange, body: `${p.meaning} ${p.formula}`,
    route: '/numerology', drawer: `#${p.id}`, source: NUMEROLOGY_SOURCE,
  })),
  ...CHALLENGES.map(c => ({
    id: c.id, kind: 'number' as const, title: `${c.label} · ${c.value}`,
    subtitle: c.ageRange, body: `${c.meaning} ${c.formula}`,
    route: '/numerology', drawer: `#${c.id}`, source: NUMEROLOGY_SOURCE,
  })),
  ...TRANSITS.map(t => ({
    id: t.id, kind: 'transit' as const, title: t.title,
    subtitle: `${t.window} · ${t.transiting} ${t.aspect} ${t.natalPoint}`,
    body: t.body, route: '/transits', drawer: `#${t.id}`, source: TRANSITS_SOURCE,
  })),
  ...PILLARS.map(p => ({
    id: p.id, kind: 'pillar' as const, title: `${p.romanized} · ${p.stem}${p.branch}`,
    subtitle: p.label, body: `${p.element} ${p.animal} ${p.meaning}`,
    route: '/chinese', source: CHINESE_SOURCE,
  })),
  ...VOL2_ENTRIES.map(v => ({
    id: v.id, kind: 'vol2' as const, title: v.title,
    subtitle: `${v.section} · ${v.eyebrow}`,
    body: v.body, route: '/volume-2', drawer: `#${v.id}`, source: v.source,
  })),
);



registerPrivateValue("compendium", "SABIAN_SYMBOLS", value => { SABIAN_SYMBOLS = value as typeof SABIAN_SYMBOLS; }, []);
registerPrivateValue("compendium", "FIXED_STARS", value => { FIXED_STARS = value as typeof FIXED_STARS; }, []);
registerPrivateValue("compendium", "ASTEROIDS", value => { ASTEROIDS = value as typeof ASTEROIDS; }, []);
registerPrivateValue("compendium", "SPECIAL_ASPECTS", value => { SPECIAL_ASPECTS = value as typeof SPECIAL_ASPECTS; }, []);
registerPrivateValue("compendium", "ARABIC_PARTS", value => { ARABIC_PARTS = value as typeof ARABIC_PARTS; }, []);
registerPrivateValue("compendium", "PROFECTION_35", value => { PROFECTION_35 = value as typeof PROFECTION_35; }, {"id":"","age":0,"window":"","house":0,"houseSign":"","traditionalLord":"","modernLord":"","lordPosition":"","interpretation":"","alchemicalTheme":"","source":{"doc":"","section":"","page":""}});
registerPrivateValue("compendium", "PRENATAL_ECLIPSE", value => { PRENATAL_ECLIPSE = value as typeof PRENATAL_ECLIPSE; }, {"id":"","date":"","position":"","interpretation":"","source":{"doc":"","section":"","page":""}});
registerPrivateValue("compendium", "PROFECTION_BEATS", value => { PROFECTION_BEATS = value as typeof PROFECTION_BEATS; }, []);
registerPrivateValue("compendium", "SEARCH_INDEX", value => { SEARCH_INDEX = value as typeof SEARCH_INDEX; }, []);
