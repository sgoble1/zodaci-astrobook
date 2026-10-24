import * as Astronomy from 'astronomy-engine';
import type { BodyPos, ChartResult } from '@/lib/astro';
import { dignityOf } from '@/lib/retrogood';

/**
 * Deterministic chart-pattern detection (Unified Master Specification §6; Debug Report anomaly codes). No AI involved.
 * PatternCode is the ChartFeature enumeration (PE-005): code compares these values, never free text.
 */
export type PatternCode =
  | 'FULL_MOON_BIRTH' | 'FULL_MOON_PHASE' | 'NEW_MOON_BIRTH' | 'ANARETIC_ASC' | 'ANARETIC_PERSONAL_PLANET'
  | 'STELLIUM' | 'HOUSE_STELLIUM' | 'H1_STELLIUM' | 'OUTER_PLANET_H1_STELLIUM' | 'BUCKET_CHART' | 'BUNDLE_CHART'
  | 'RETROGRADE_HANDLE' | 'DIRECT_HANDLE' | 'GRAND_TRINE' | 'T_SQUARE' | 'GRAND_CROSS' | 'YOD' | 'KITE' | 'MYSTIC_RECTANGLE'
  | 'DOMICILE_PLUTO_10';
export interface Pattern { code: PatternCode; title: string; detail: string; bodies: string[]; weight: number }

const PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const PERSONAL = ['sun', 'moon', 'mercury', 'venus', 'mars'];
const OUTER = ['uranus', 'neptune', 'pluto'];
const RETRO_ABLE = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const norm = (x: number) => ((x % 360) + 360) % 360;
/** Smallest angular separation 0..180. */
export const sep = (a: number, b: number) => { const d = Math.abs(norm(a) - norm(b)); return d > 180 ? 360 - d : d; };
const near = (a: number, b: number, target: number, orb: number) => Math.abs(sep(a, b) - target) <= orb;
const inSign = (lon: number) => norm(lon) % 30;

/** §6.1 multi-body pattern orbs (proposed values adopted as constants). */
export const PATTERN_ORBS = {
  grandTrine: { trine: 8 },
  tSquare: { square: 6, opposition: 8 },
  yod: { sextile: 4, quincunx: 3 },
  grandCross: { square: 6, opposition: 8 },
  kite: { trine: 8, opposition: 8, sextile: 4 },
  mysticRectangle: { opposition: 8, trine: 8, sextile: 4 },
} as const;
/** §2.7: a Full Moon birth is within roughly 10–12° of exact opposition at the birth moment. */
export const FULL_MOON_ORB = 12;
export const NEW_MOON_ORB = 12;

export type LunarTiming = { phaseAngle: number; nearestFull: Date | null; hoursFromFull: number | null };
/**
 * §2.7 (PE-001): the lunar phase angle at the birth moment and the nearest actual Full Moon event,
 * rather than a natal aspect test. Without a birth moment the angle falls back to the natal longitudes.
 */
export function lunarTiming(chart: Pick<ChartResult, 'bodies'> & { utc?: Date | null }): LunarTiming | null {
  const sun = chart.bodies.find(b => b.key === 'sun'), moon = chart.bodies.find(b => b.key === 'moon');
  if (!chart.utc) return sun && moon ? { phaseAngle: norm(moon.lon - sun.lon), nearestFull: null, hoursFromFull: null } : null;
  const t = chart.utc;
  const phaseAngle = Astronomy.MoonPhase(t);
  const full = Astronomy.SearchMoonPhase(180, new Date(t.getTime() - 15 * 86400000), 30);
  const nearestFull = full ? full.date : null;
  return { phaseAngle, nearestFull, hoursFromFull: nearestFull ? (t.getTime() - nearestFull.getTime()) / 3600000 : null };
}

const fmtDay = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const hoursText = (h: number) => { const a = Math.abs(h); return a < 36 ? `${Math.round(a)} hour${Math.round(a) === 1 ? '' : 's'}` : `${(a / 24).toFixed(1)} days`; };

type PatternChart = Pick<ChartResult, 'bodies' | 'asc' | 'cusps'> & { utc?: Date | null; mc?: number | null };

export function detectPatterns(chart: PatternChart): Pattern[] {
  const out: Pattern[] = [];
  const pl = chart.bodies.filter(b => PLANETS.includes(b.key));
  const get = (k: string) => pl.find(b => b.key === k);

  // Lunation at birth (§2.7).
  const lt = lunarTiming(chart);
  if (lt) {
    const fromFull = Math.abs(lt.phaseAngle - 180);
    const fromNew = Math.min(lt.phaseAngle, 360 - lt.phaseAngle);
    const when = lt.nearestFull && lt.hoursFromFull != null ? ` Born ${hoursText(lt.hoursFromFull)} ${lt.hoursFromFull < 0 ? 'before' : 'after'} the Full Moon of ${fmtDay(lt.nearestFull)}.` : '';
    if (fromFull <= FULL_MOON_ORB) out.push({ code: 'FULL_MOON_BIRTH', title: 'Born at a Full Moon', detail: `The Moon was ${fromFull.toFixed(1)}° from exact opposition to the Sun.${when} A life-long pull between what you want and what you need.`, bodies: ['Sun', 'Moon'], weight: 8 });
    else if (lt.phaseAngle > 180 && lt.phaseAngle <= 225) out.push({ code: 'FULL_MOON_PHASE', title: 'Born in the Full Moon phase', detail: `The Moon had passed full and was ${(lt.phaseAngle - 180).toFixed(1)}° beyond opposition — still in the Full Moon phase of the cycle.${when} Awareness of both sides comes before integration.`, bodies: ['Sun', 'Moon'], weight: 6 });
    if (fromNew <= NEW_MOON_ORB) out.push({ code: 'NEW_MOON_BIRTH', title: 'Born at a New Moon', detail: `Sun and Moon were ${fromNew.toFixed(1)}° apart — will and feeling start from the same place.`, bodies: ['Sun', 'Moon'], weight: 7 });
  }
  if (chart.asc != null && inSign(chart.asc) >= 29) out.push({ code: 'ANARETIC_ASC', title: 'Ascendant at the last degree', detail: 'The Rising sign sits at 29° — an urgent, finishing quality to how you meet the world.', bodies: ['Ascendant'], weight: 6 });
  pl.filter(b => PERSONAL.includes(b.key) && inSign(b.lon) >= 29).forEach(b => out.push({ code: 'ANARETIC_PERSONAL_PLANET', title: `${b.name} at 29°`, detail: `${b.name} in the final degree of ${b.sign} — mastery and completion around this planet's themes.`, bodies: [b.name], weight: 6 }));

  // Stelliums: 3+ planets in one sign, or in one house (§6 StelliumDetector), with the outer-planet variant (PE-012).
  const signSets = new Set<string>();
  group(pl, b => b.sign).forEach((bs, sign) => { if (bs.length >= 3) { signSets.add(keyOf(bs)); out.push({ code: 'STELLIUM', title: `${sign} stellium`, detail: `${bs.length} planets in ${sign}: ${names(bs)}.`, bodies: bs.map(b => b.name), weight: 5 + bs.length }); } });
  if (chart.cusps) {
    group(pl.filter(b => b.house != null), b => String(b.house)).forEach((hs, h) => {
      if (hs.length < 3) return;
      const house = Number(h); const outerCount = hs.filter(b => OUTER.includes(b.key)).length;
      if (house === 1) out.push(outerCount >= 2
        ? { code: 'OUTER_PLANET_H1_STELLIUM', title: 'Outer planets crowd the 1st house', detail: `${names(hs)} in the 1st house — generational forces show up in your personality.`, bodies: hs.map(b => b.name), weight: 9 }
        : { code: 'H1_STELLIUM', title: '1st-house stellium', detail: `${names(hs)} in the 1st house — a strong, self-directed presence.`, bodies: hs.map(b => b.name), weight: 8 });
      else if (!signSets.has(keyOf(hs))) out.push({ code: 'HOUSE_STELLIUM', title: `${ordinal(house)}-house stellium`, detail: `${names(hs)} share the ${ordinal(house)} house — its themes carry unusual weight.`, bodies: hs.map(b => b.name), weight: 5 + hs.length });
    });
    // Named dignity configuration (PE-013).
    const pluto = get('pluto');
    if (pluto && pluto.sign === 'Scorpio' && pluto.house === 10) out.push({ code: 'DOMICILE_PLUTO_10', title: 'Pluto at home in the 10th house', detail: 'Pluto in its own sign at the top of the chart — a career and public role built through transformation.', bodies: ['Pluto'], weight: 7 });
  }

  // Shape: bundle (all within 120°) or bucket (9 within 180° plus one handle opposite), with both handle cases (RG-006).
  const span = (bs: BodyPos[]) => minArc(bs.map(b => b.lon));
  if (pl.length === 10) {
    if (span(pl) <= 120) out.push({ code: 'BUNDLE_CHART', title: 'Bundle chart', detail: 'All ten planets fall within 120° — concentrated focus.', bodies: [], weight: 5 });
    else for (const h of pl) {
      const rest = pl.filter(b => b !== h);
      if (span(rest) <= 180 && rest.every(b => sep(b.lon, h.lon) >= 60)) {
        out.push({ code: 'BUCKET_CHART', title: `Bucket chart with ${h.name} as the handle`, detail: `Nine planets gather in one half; ${h.name} stands alone and steers the chart.`, bodies: [h.name], weight: 8 });
        out.push(h.retro
          ? { code: 'RETROGRADE_HANDLE', title: `Retrograde handle: ${h.name}`, detail: `The handle planet is retrograde — its drive turns inward and is reworked before it is expressed.`, bodies: [h.name], weight: 7 }
          : { code: 'DIRECT_HANDLE', title: `Direct handle: ${h.name}`, detail: `The handle planet is direct — its drive acts outward straight away.`, bodies: [h.name], weight: 5 });
        break;
      }
    }
  }

  // Aspect configurations among the ten planets, with §6.1 orbs.
  const O = PATTERN_ORBS;
  const trines: [BodyPos, BodyPos, BodyPos][] = [];
  for (let i = 0; i < pl.length; i++) for (let j = i + 1; j < pl.length; j++) for (let k = j + 1; k < pl.length; k++) {
    const [a, b, c] = [pl[i], pl[j], pl[k]];
    if (near(a.lon, b.lon, 120, O.grandTrine.trine) && near(b.lon, c.lon, 120, O.grandTrine.trine) && near(a.lon, c.lon, 120, O.grandTrine.trine)) {
      trines.push([a, b, c]);
      out.push({ code: 'GRAND_TRINE', title: 'Grand Trine', detail: `${names([a, b, c])} form a triangle of trines — natural, easy talent.`, bodies: [a.name, b.name, c.name], weight: 8 });
    }
    for (const [x, y, apex] of [[a, b, c], [a, c, b], [b, c, a]] as const) {
      if (near(x.lon, y.lon, 180, O.tSquare.opposition) && near(x.lon, apex.lon, 90, O.tSquare.square) && near(y.lon, apex.lon, 90, O.tSquare.square)) out.push({ code: 'T_SQUARE', title: `T-Square with ${apex.name} at the apex`, detail: `${x.name} opposes ${y.name}, both square ${apex.name} — pressure that drives achievement.`, bodies: [x.name, y.name, apex.name], weight: 8 });
      if (near(x.lon, y.lon, 60, O.yod.sextile) && near(x.lon, apex.lon, 150, O.yod.quincunx) && near(y.lon, apex.lon, 150, O.yod.quincunx)) out.push({ code: 'YOD', title: `Yod pointing to ${apex.name}`, detail: `${x.name} and ${y.name} sextile each other and both make a quincunx to ${apex.name} — a recurring call to adjust and specialise.`, bodies: [x.name, y.name, apex.name], weight: 8 });
    }
  }
  // Kite: a Grand Trine plus a fourth planet opposite one corner and sextile the other two.
  for (const t of trines) for (const d of pl) {
    if (t.includes(d)) continue;
    const opp = t.find(p => near(p.lon, d.lon, 180, O.kite.opposition));
    if (opp && t.filter(p => p !== opp).every(p => near(p.lon, d.lon, 60, O.kite.sextile))) out.push({ code: 'KITE', title: `Kite anchored by ${d.name}`, detail: `${d.name} opposes ${opp.name} inside the Grand Trine of ${names(t)} — talent given a direction.`, bodies: [...t.map(p => p.name), d.name], weight: 8 });
  }
  const fours = new Set<string>();
  for (const a of pl) for (const b of pl) for (const c of pl) for (const d of pl) {
    if (new Set([a, b, c, d]).size < 4) continue;
    const key = [a, b, c, d].map(p => p.key).sort().join(); if (fours.has(key)) continue;
    const cross = near(a.lon, c.lon, 180, O.grandCross.opposition) && near(b.lon, d.lon, 180, O.grandCross.opposition) && near(a.lon, b.lon, 90, O.grandCross.square) && near(b.lon, c.lon, 90, O.grandCross.square) && near(c.lon, d.lon, 90, O.grandCross.square);
    if (cross) { fours.add(key); out.push({ code: 'GRAND_CROSS', title: 'Grand Cross', detail: `${names([a, b, c, d])} form a cross of squares and oppositions — strong tension and endurance.`, bodies: [a.name, b.name, c.name, d.name], weight: 9 }); continue; }
    const R = O.mysticRectangle;
    const rect = near(a.lon, c.lon, 180, R.opposition) && near(b.lon, d.lon, 180, R.opposition) && near(a.lon, b.lon, 60, R.sextile) && near(b.lon, c.lon, 120, R.trine) && near(c.lon, d.lon, 60, R.sextile) && near(d.lon, a.lon, 120, R.trine);
    if (rect) { fours.add(key); out.push({ code: 'MYSTIC_RECTANGLE', title: 'Mystic Rectangle', detail: `${names([a, b, c, d])} form two oppositions held together by sextiles and trines — tension that works productively.`, bodies: [a.name, b.name, c.name, d.name], weight: 7 }); }
  }
  return out.sort((x, y) => y.weight - x.weight);
}

/** §6.2 typed output of the significance ranking (PE-004). */
export type BlockTarget = 'BigThree' | 'AnareticCallout' | 'OuterPlanetStellium' | 'PlanetaryInterpretation' | 'ChartSnapshot' | 'ShadowBreakthrough' | 'CareerAndVocation';
export type SignificantPattern = { pattern_id: PatternCode; label: string; detail: string; score: number; affected_planets: string[]; narrative_priority: number; block_target: BlockTarget; factors: string[] };

/** §6.3 proposed weights, fixed as constants. */
export const SIGNIFICANCE_POINTS = { bigThree: 30, nearAngle: 20, stellium: 20, anaretic: 20, dignity: 15, aspectPattern: 15, handleOrFullMoon: 15, amplifiedRetro: 10 } as const;
const STELLIUMS: PatternCode[] = ['STELLIUM', 'HOUSE_STELLIUM', 'H1_STELLIUM', 'OUTER_PLANET_H1_STELLIUM'];
const ASPECT_PATTERNS: PatternCode[] = ['GRAND_TRINE', 'T_SQUARE', 'YOD', 'GRAND_CROSS', 'KITE', 'MYSTIC_RECTANGLE'];
const HANDLE_OR_FULL: PatternCode[] = ['BUCKET_CHART', 'RETROGRADE_HANDLE', 'DIRECT_HANDLE', 'FULL_MOON_BIRTH', 'FULL_MOON_PHASE'];
const BLOCK: Partial<Record<PatternCode, BlockTarget>> = {
  FULL_MOON_BIRTH: 'BigThree', FULL_MOON_PHASE: 'BigThree', NEW_MOON_BIRTH: 'BigThree', ANARETIC_ASC: 'AnareticCallout', ANARETIC_PERSONAL_PLANET: 'AnareticCallout',
  OUTER_PLANET_H1_STELLIUM: 'OuterPlanetStellium', STELLIUM: 'PlanetaryInterpretation', HOUSE_STELLIUM: 'PlanetaryInterpretation', H1_STELLIUM: 'PlanetaryInterpretation',
  BUCKET_CHART: 'ChartSnapshot', BUNDLE_CHART: 'ChartSnapshot', RETROGRADE_HANDLE: 'ChartSnapshot', DIRECT_HANDLE: 'ChartSnapshot', DOMICILE_PLUTO_10: 'CareerAndVocation',
};

/** §6.3 significance ranking: scores each pattern, sorts by score (ties by detector weight) and assigns its report block. */
export function rankPatterns(patterns: Pattern[], chart: Pick<ChartResult, 'bodies' | 'asc'> & { mc?: number | null }): SignificantPattern[] {
  const P = SIGNIFICANCE_POINTS;
  const byName = new Map(chart.bodies.map(b => [b.name, b]));
  const angles = [chart.asc, chart.mc, chart.asc != null ? chart.asc + 180 : null, chart.mc != null ? chart.mc + 180 : null].filter((x): x is number => x != null);
  const amplified = new Set(chart.bodies.filter(b => b.retro && RETRO_ABLE.includes(b.key) && ['domicile', 'exaltation', 'domicile+exaltation'].includes(dignityOf(b.key, b.sign))).map(b => b.name));
  return patterns.map(p => {
    const factors: string[] = []; let score = 0;
    const add = (pts: number, why: string) => { score += pts; factors.push(why); };
    const bodies = p.bodies.map(n => byName.get(n)).filter((b): b is BodyPos => !!b);
    if (p.bodies.some(n => n === 'Sun' || n === 'Moon' || n === 'Ascendant')) add(P.bigThree, 'Involves the Sun, Moon or Ascendant');
    if (bodies.some(b => angles.some(a => sep(a, b.lon) <= 3))) add(P.nearAngle, 'Within 3° of an angle');
    if (STELLIUMS.includes(p.code)) add(P.stellium, 'Stellium of three or more bodies');
    if (p.code === 'ANARETIC_ASC' || p.code === 'ANARETIC_PERSONAL_PLANET') add(P.anaretic, 'Anaretic degree on a personal planet or angle');
    if (bodies.some(b => PERSONAL.includes(b.key) && ['domicile', 'exaltation', 'domicile+exaltation'].includes(dignityOf(b.key, b.sign)))) add(P.dignity, 'Personal planet in domicile or exaltation');
    if (ASPECT_PATTERNS.includes(p.code)) add(P.aspectPattern, 'Tight aspect pattern');
    if (HANDLE_OR_FULL.includes(p.code)) add(P.handleOrFullMoon, 'Chart handle or Full Moon birth');
    if (p.bodies.some(n => amplified.has(n))) add(P.amplifiedRetro, 'Amplified-tier retrograde');
    return { pattern_id: p.code, label: p.title, detail: p.detail, score, affected_planets: p.bodies, narrative_priority: 0, block_target: BLOCK[p.code] ?? 'ShadowBreakthrough', factors, weight: p.weight };
  }).sort((a, b) => b.score - a.score || b.weight - a.weight)
    .map(({ weight: _w, ...r }, i) => ({ ...r, narrative_priority: i + 1 }));
}

export type RetroTier = 'none' | 'light' | 'notable' | 'strong' | 'dominant';
/** RetroGOOD: which planets are retrograde and how strongly retrograde energy shapes the chart. Nodes are excluded (RG-004). */
export function retroGood(chart: Pick<ChartResult, 'bodies'>) {
  const retro = chart.bodies.filter(b => RETRO_ABLE.includes(b.key) && b.retro);
  const personal = retro.filter(b => PERSONAL.includes(b.key)).length;
  const score = retro.length + personal; // personal retrogrades count double
  const tier: RetroTier = score === 0 ? 'none' : score <= 2 ? 'light' : score <= 4 ? 'notable' : score <= 6 ? 'strong' : 'dominant';
  return { planets: retro.map(b => b.name), personal, score, tier };
}

function group<T>(xs: T[], f: (x: T) => string) { const m = new Map<string, T[]>(); xs.forEach(x => m.set(f(x), [...(m.get(f(x)) ?? []), x])); return m; }
const names = (bs: BodyPos[]) => bs.map(b => b.name).join(', ');
const keyOf = (bs: BodyPos[]) => bs.map(b => b.key).sort().join();
const ordinal = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`;
/** Smallest arc (degrees) containing all longitudes. */
function minArc(lons: number[]) {
  const s = lons.map(norm).sort((a, b) => a - b);
  let maxGap = 0; for (let i = 0; i < s.length; i++) { const gap = i === s.length - 1 ? s[0] + 360 - s[i] : s[i + 1] - s[i]; maxGap = Math.max(maxGap, gap); }
  return 360 - maxGap;
}
