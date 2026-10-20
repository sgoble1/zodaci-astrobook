import type { BodyPos, ChartResult } from '@/lib/astro';

/** Deterministic chart-pattern detection (Debug Report anomaly codes + RetroGOOD). No AI involved. */
export type PatternCode =
  | 'FULL_MOON_BIRTH' | 'NEW_MOON_BIRTH' | 'ANARETIC_ASC' | 'ANARETIC_PERSONAL_PLANET'
  | 'STELLIUM' | 'H1_STELLIUM' | 'OUTER_PLANET_H1_STELLIUM' | 'BUCKET_CHART' | 'BUNDLE_CHART'
  | 'RETROGRADE_HANDLE' | 'DIRECT_HANDLE' | 'GRAND_TRINE' | 'T_SQUARE' | 'GRAND_CROSS';
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

export function detectPatterns(chart: Pick<ChartResult, 'bodies' | 'asc' | 'cusps'>): Pattern[] {
  const out: Pattern[] = [];
  const pl = chart.bodies.filter(b => PLANETS.includes(b.key));
  const get = (k: string) => pl.find(b => b.key === k);
  const sun = get('sun'), moon = get('moon');

  if (sun && moon) {
    const d = sep(sun.lon, moon.lon);
    if (d >= 172) out.push({ code: 'FULL_MOON_BIRTH', title: 'Born at a Full Moon', detail: `Sun and Moon are ${d.toFixed(1)}° apart — a life-long pull between what you want and what you need.`, bodies: ['Sun', 'Moon'], weight: 8 });
    if (d <= 8) out.push({ code: 'NEW_MOON_BIRTH', title: 'Born at a New Moon', detail: `Sun and Moon are ${d.toFixed(1)}° apart — will and feeling start from the same place.`, bodies: ['Sun', 'Moon'], weight: 7 });
  }
  if (chart.asc != null && inSign(chart.asc) >= 29) out.push({ code: 'ANARETIC_ASC', title: 'Ascendant at the last degree', detail: 'The Rising sign sits at 29° — an urgent, finishing quality to how you meet the world.', bodies: ['Ascendant'], weight: 6 });
  pl.filter(b => PERSONAL.includes(b.key) && inSign(b.lon) >= 29).forEach(b => out.push({ code: 'ANARETIC_PERSONAL_PLANET', title: `${b.name} at 29°`, detail: `${b.name} in the final degree of ${b.sign} — mastery and completion around this planet's themes.`, bodies: [b.name], weight: 6 }));

  // Stelliums: 3+ planets in one sign, or in one house.
  const bySign = group(pl, b => b.sign);
  bySign.forEach((bs, sign) => { if (bs.length >= 3) out.push({ code: 'STELLIUM', title: `${sign} stellium`, detail: `${bs.length} planets in ${sign}: ${names(bs)}.`, bodies: bs.map(b => b.name), weight: 5 + bs.length }); });
  if (chart.cusps) {
    const h1 = pl.filter(b => b.house === 1);
    if (h1.length >= 3) {
      const outerCount = h1.filter(b => OUTER.includes(b.key)).length;
      out.push(outerCount >= 2
        ? { code: 'OUTER_PLANET_H1_STELLIUM', title: 'Outer planets crowd the 1st house', detail: `${names(h1)} in the 1st house — generational forces show up in your personality.`, bodies: h1.map(b => b.name), weight: 9 }
        : { code: 'H1_STELLIUM', title: '1st-house stellium', detail: `${names(h1)} in the 1st house — a strong, self-directed presence.`, bodies: h1.map(b => b.name), weight: 8 });
    }
  }

  // Shape: bundle (all within 120°) or bucket (9 within 180° plus one handle opposite).
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

  // Aspect configurations among the ten planets.
  for (let i = 0; i < pl.length; i++) for (let j = i + 1; j < pl.length; j++) for (let k = j + 1; k < pl.length; k++) {
    const [a, b, c] = [pl[i], pl[j], pl[k]];
    if (near(a.lon, b.lon, 120, 7) && near(b.lon, c.lon, 120, 7) && near(a.lon, c.lon, 120, 7)) out.push({ code: 'GRAND_TRINE', title: 'Grand Trine', detail: `${names([a, b, c])} form a triangle of trines — natural, easy talent.`, bodies: [a.name, b.name, c.name], weight: 8 });
    for (const [x, y, apex] of [[a, b, c], [a, c, b], [b, c, a]] as const) {
      if (near(x.lon, y.lon, 180, 8) && near(x.lon, apex.lon, 90, 7) && near(y.lon, apex.lon, 90, 7)) out.push({ code: 'T_SQUARE', title: `T-Square with ${apex.name} at the apex`, detail: `${x.name} opposes ${y.name}, both square ${apex.name} — pressure that drives achievement.`, bodies: [x.name, y.name, apex.name], weight: 8 });
    }
  }
  const crosses = new Set<string>();
  for (const a of pl) for (const b of pl) for (const c of pl) for (const d of pl) {
    const set = new Set([a, b, c, d]); if (set.size < 4) continue;
    if (near(a.lon, c.lon, 180, 8) && near(b.lon, d.lon, 180, 8) && near(a.lon, b.lon, 90, 8) && near(b.lon, c.lon, 90, 8) && near(c.lon, d.lon, 90, 8)) {
      const key = [a, b, c, d].map(p => p.key).sort().join(); if (crosses.has(key)) continue; crosses.add(key);
      out.push({ code: 'GRAND_CROSS', title: 'Grand Cross', detail: `${names([a, b, c, d])} form a cross of squares and oppositions — strong tension and endurance.`, bodies: [a.name, b.name, c.name, d.name], weight: 9 });
    }
  }
  return out.sort((x, y) => y.weight - x.weight);
}

export type RetroTier = 'none' | 'light' | 'notable' | 'strong' | 'dominant';
/** RetroGOOD: which planets are retrograde and how strongly retrograde energy shapes the chart. */
export function retroGood(chart: Pick<ChartResult, 'bodies'>) {
  const retro = chart.bodies.filter(b => RETRO_ABLE.includes(b.key) && b.retro);
  const personal = retro.filter(b => PERSONAL.includes(b.key)).length;
  const score = retro.length + personal; // personal retrogrades count double
  const tier: RetroTier = score === 0 ? 'none' : score <= 2 ? 'light' : score <= 4 ? 'notable' : score <= 6 ? 'strong' : 'dominant';
  return { planets: retro.map(b => b.name), personal, score, tier };
}

function group<T>(xs: T[], f: (x: T) => string) { const m = new Map<string, T[]>(); xs.forEach(x => m.set(f(x), [...(m.get(f(x)) ?? []), x])); return m; }
const names = (bs: BodyPos[]) => bs.map(b => b.name).join(', ');
/** Smallest arc (degrees) containing all longitudes. */
function minArc(lons: number[]) {
  const s = lons.map(norm).sort((a, b) => a - b);
  let maxGap = 0; for (let i = 0; i < s.length; i++) { const gap = i === s.length - 1 ? s[0] + 360 - s[i] : s[i + 1] - s[i]; maxGap = Math.max(maxGap, gap); }
  return 360 - maxGap;
}
