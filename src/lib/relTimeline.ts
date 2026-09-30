// Transit timeline for a relationship: when slow planets aspect the composite chart and each person's key points.
import * as Astronomy from 'astronomy-engine';
import { eclLon, type ChartResult } from '@/lib/astro';
import { composite } from '@/lib/synastry';

const TRANSITERS: [string, string, Astronomy.Body][] = [
  ['jupiter', 'Jupiter', Astronomy.Body.Jupiter], ['saturn', 'Saturn', Astronomy.Body.Saturn],
  ['uranus', 'Uranus', Astronomy.Body.Uranus], ['neptune', 'Neptune', Astronomy.Body.Neptune], ['pluto', 'Pluto', Astronomy.Body.Pluto],
];
const ASP = [{ t: 'Conjunction', s: '☌', a: 0 }, { t: 'Opposition', s: '☍', a: 180 }, { t: 'Square', s: '□', a: 90 }, { t: 'Trine', s: '△', a: 120 }];
const TONE: Record<string, string> = {
  jupiter: 'growth, luck and opening up', saturn: 'commitment tests, structure and maturing',
  uranus: 'sudden change, freedom and surprises', neptune: 'idealism, blurred boundaries and spiritual bonding', pluto: 'deep transformation and power dynamics',
};
const TARGET_THEME: Record<string, string> = { sun: 'shared purpose / identity', moon: 'emotional bond and home', venus: 'love and affection', asc: 'how the couple meets the world', mars: 'desire and conflict' };

export interface TransitWindow { planet: string; planetKey: string; aspect: string; symbol: string; target: string; targetKey: string; whose: string; start: Date; end: Date; exact: Date; minOrb: number; text: string; }

const norm = (x: number) => ((x % 360) + 360) % 360;

export function relationshipTimeline(A: ChartResult, B: ChartResult, nameA: string, nameB: string, from: Date, years = 10, orb = 1): TransitWindow[] {
  const comp = composite(A, B);
  const targets: { key: string; name: string; lon: number; whose: string }[] = [];
  for (const k of ['sun', 'moon', 'venus', 'asc']) { const c = comp.find(x => x.key === k); if (c && !c.uncertain) targets.push({ key: k, name: c.name, lon: c.lon, whose: 'Composite' }); }
  for (const [R, who] of [[A, nameA], [B, nameB]] as const) for (const k of ['sun', 'moon', 'venus']) {
    if (k === 'moon' && !R.input.time) continue;
    const b = R.bodies.find(x => x.key === k)!; targets.push({ key: k, name: b.name, lon: b.lon, whose: who });
  }
  const step = 5 * 86400000, n = Math.ceil(years * 365 / 5);
  const lons = TRANSITERS.map(([, , body]) => Array.from({ length: n + 1 }, (_, i) => eclLon(body, new Date(from.getTime() + i * step))));
  const out: TransitWindow[] = [];
  TRANSITERS.forEach(([pk, pn], pi) => targets.forEach(tg => ASP.forEach(asp => {
    let cur: TransitWindow | null = null;
    for (let i = 0; i <= n; i++) {
      const d = Math.abs(norm(lons[pi][i] - tg.lon + 180) - 180);
      const o = Math.abs(d - asp.a);
      const date = new Date(from.getTime() + i * step);
      if (o <= orb) {
        if (!cur) cur = { planet: pn, planetKey: pk, aspect: asp.t, symbol: asp.s, target: tg.name, targetKey: tg.key, whose: tg.whose, start: date, end: date, exact: date, minOrb: o, text: '' };
        cur.end = date; if (o < cur.minOrb) { cur.minOrb = o; cur.exact = date; }
      } else if (cur) { out.push(cur); cur = null; }
    }
    if (cur) out.push(cur);
  })));
  out.forEach(w => { w.text = `Transiting ${w.planet} ${w.aspect.toLowerCase()} ${w.whose === 'Composite' ? 'the composite' : `${w.whose}’s`} ${w.target}: ${TONE[w.planetKey]} around ${TARGET_THEME[w.targetKey] ?? w.target}${w.aspect === 'Trine' ? ' — a supportive, easy flow' : w.aspect === 'Conjunction' ? ' — a new chapter begins' : ' — pressure that asks for adjustment'}.`; });
  return out.sort((a, b) => a.exact.getTime() - b.exact.getTime());
}
