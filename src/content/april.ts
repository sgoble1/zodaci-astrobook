import { registerPrivateValue } from '@/lib/privateEditionStore';
// April's complete natal chart data, sourced verbatim from the uploaded
// birth chart analysis, timeline guide, retrograde guide and feng shui report
// (Sept 6 1990, 3:38 PM EDT, Geneva NY, 42°52'N 76°59'W).
//
// All interpretation text is preserved from the source documents so that every
// section of the site presents the material accurately, not summarized.

export type ZodiacSign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo'
  | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export const ZODIAC: { name: ZodiacSign; glyph: string; element: string; modality: string; ruler: string }[] = [
  { name: 'Aries', glyph: '♈', element: 'Fire', modality: 'Cardinal', ruler: 'Mars' },
  { name: 'Taurus', glyph: '♉', element: 'Earth', modality: 'Fixed', ruler: 'Venus' },
  { name: 'Gemini', glyph: '♊', element: 'Air', modality: 'Mutable', ruler: 'Mercury' },
  { name: 'Cancer', glyph: '♋', element: 'Water', modality: 'Cardinal', ruler: 'Moon' },
  { name: 'Leo', glyph: '♌', element: 'Fire', modality: 'Fixed', ruler: 'Sun' },
  { name: 'Virgo', glyph: '♍', element: 'Earth', modality: 'Mutable', ruler: 'Mercury' },
  { name: 'Libra', glyph: '♎', element: 'Air', modality: 'Cardinal', ruler: 'Venus' },
  { name: 'Scorpio', glyph: '♏', element: 'Water', modality: 'Fixed', ruler: 'Pluto' },
  { name: 'Sagittarius', glyph: '♐', element: 'Fire', modality: 'Mutable', ruler: 'Jupiter' },
  { name: 'Capricorn', glyph: '♑', element: 'Earth', modality: 'Cardinal', ruler: 'Saturn' },
  { name: 'Aquarius', glyph: '♒', element: 'Air', modality: 'Fixed', ruler: 'Uranus' },
  { name: 'Pisces', glyph: '♓', element: 'Water', modality: 'Mutable', ruler: 'Neptune' },
];

export let BIRTH: { readonly name: string; readonly date: string; readonly time: string; readonly place: string; readonly coords: string; readonly lifePath: number; readonly kuaNumber: number; readonly kuaElement: string; readonly chineseZodiac: string; readonly personalYear2026: number; readonly chartShape: string; readonly currentAge: number; } = {"name":"","date":"","time":"","place":"","coords":"","lifePath":0,"kuaNumber":0,"kuaElement":"","chineseZodiac":"","personalYear2026":0,"chartShape":"","currentAge":0};

export type PlanetKey =
  | 'sun' | 'moon' | 'mercury' | 'venus' | 'mars'
  | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto'
  | 'chiron' | 'northNode' | 'southNode' | 'vertex' | 'lilith' | 'fortune';

export interface Placement {
  key: PlanetKey;
  name: string;
  glyph: string;
  sign: ZodiacSign;
  signGlyph: string;
  degree: number;      // 0-29
  minute: number;      // 0-59
  house: number;       // 1-12
  motion: 'Direct' | 'Retrograde';
  dignity: string;     // Domicile / Peregrine / Exaltation / Fall / etc
  notes: string;
  headline: string;
  interpretation: string;
}

// Full longitude in degrees (0-360) — used to place glyphs on the wheel.
export const signIndex = (s: ZodiacSign) => ZODIAC.findIndex(z => z.name === s);
export const longitudeOf = (p: Pick<Placement, 'sign' | 'degree' | 'minute'>) =>
  signIndex(p.sign) * 30 + p.degree + p.minute / 60;

export let PLACEMENTS: Placement[] = [];

// Ascendant / Midheaven (angles) — for the wheel
export let ANGLES: { ascendant: { sign: ZodiacSign; signGlyph: string; degree: number; minute: number; note: string; }; midheaven: { sign: ZodiacSign; signGlyph: string; degree: number; minute: number; note: string; }; } = {"ascendant":{"sign":"Aries","signGlyph":"","degree":0,"minute":0,"note":""},"midheaven":{"sign":"Aries","signGlyph":"","degree":0,"minute":0,"note":""}};

// ---------- HOUSES ----------
export interface HouseInfo {
  number: number;
  name: string;
  cusp: ZodiacSign;
  ruler: string;
  planets: string[];
  summary: string;
  interpretation: string;
}

export let HOUSES: HouseInfo[] = [];

// ---------- MAJOR ASPECTS ----------
export interface Aspect {
  a: PlanetKey;
  b: PlanetKey;
  type: 'Conjunction' | 'Opposition' | 'Square' | 'Trine' | 'Sextile';
  orb: string;
  interpretation: string;
}

export let ASPECTS: Aspect[] = [];

// ---------- LIFE PHASES ----------
export interface LifePhase {
  id: string;
  number: number;
  title: string;
  years: string;
  ages: string;
  summary: string;
  current?: boolean;
  interpretation: string;
}

export let PHASES: LifePhase[] = [];

// ---------- RETROGRADES (personal at birth) ----------
export interface RetrogradeAtBirth {
  planet: PlanetKey;
  meaning: string;
}

export let RETROGRADES_AT_BIRTH: RetrogradeAtBirth[] = [];

// ---------- FENG SHUI (Kua 1 — Water) ----------
export interface BaguaArea {
  gua: string;
  direction: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'Center';
  element: string;
  lifeArea: string;
  color: string;
  guidance: string;
  isBestForKua1: boolean;
}

export let KUA_INFO: { number: number; element: string; group: string; bestDirections: readonly string[]; worstDirections: readonly string[]; note: string; } = {"number":0,"element":"","group":"","bestDirections":[],"worstDirections":[],"note":""};

export let BAGUA: BaguaArea[] = [];

// ---------- TAROT + NUMEROLOGY ----------
export let NUMEROLOGY: { lifePath: { number: number; meaning: string; }; personalYear2026: { number: number; meaning: string; }; chineseZodiac: { animal: string; meaning: string; }; } = {"lifePath":{"number":0,"meaning":""},"personalYear2026":{"number":0,"meaning":""},"chineseZodiac":{"animal":"","meaning":""}};

// Two-color palette from the illustration reference guide.
export let PALETTE_NOTE: string = "";

registerPrivateValue("april", "BIRTH", value => { BIRTH = value as typeof BIRTH; }, {"name":"","date":"","time":"","place":"","coords":"","lifePath":0,"kuaNumber":0,"kuaElement":"","chineseZodiac":"","personalYear2026":0,"chartShape":"","currentAge":0});
registerPrivateValue("april", "PLACEMENTS", value => { PLACEMENTS = value as typeof PLACEMENTS; }, []);
registerPrivateValue("april", "ANGLES", value => { ANGLES = value as typeof ANGLES; }, {"ascendant":{"sign":"","signGlyph":"","degree":0,"minute":0,"note":""},"midheaven":{"sign":"","signGlyph":"","degree":0,"minute":0,"note":""}});
registerPrivateValue("april", "HOUSES", value => { HOUSES = value as typeof HOUSES; }, []);
registerPrivateValue("april", "ASPECTS", value => { ASPECTS = value as typeof ASPECTS; }, []);
registerPrivateValue("april", "PHASES", value => { PHASES = value as typeof PHASES; }, []);
registerPrivateValue("april", "RETROGRADES_AT_BIRTH", value => { RETROGRADES_AT_BIRTH = value as typeof RETROGRADES_AT_BIRTH; }, []);
registerPrivateValue("april", "KUA_INFO", value => { KUA_INFO = value as typeof KUA_INFO; }, {"number":0,"element":"","group":"","bestDirections":[],"worstDirections":[],"note":""});
registerPrivateValue("april", "BAGUA", value => { BAGUA = value as typeof BAGUA; }, []);
registerPrivateValue("april", "NUMEROLOGY", value => { NUMEROLOGY = value as typeof NUMEROLOGY; }, {"lifePath":{"number":0,"meaning":""},"personalYear2026":{"number":0,"meaning":""},"chineseZodiac":{"animal":"","meaning":""}});
registerPrivateValue("april", "PALETTE_NOTE", value => { PALETTE_NOTE = value as typeof PALETTE_NOTE; }, "");
