import * as Astronomy from 'astronomy-engine';
import { eclLon, type ChartResult } from '@/lib/astro';

/**
 * Generational and personal cycles found by searching the real ephemeris: the dates when a transiting planet returns to,
 * squares or opposes its own natal position. Each event is the first exact pass inside the age window it belongs to.
 */
export type CycleEvent = { key: string; title: string; planet: string; angle: 0 | 90 | 180; age: number; date: Date; meaning: string };

const DAY = 86400000;
const YEAR = 365.2422 * DAY;
const norm = (x: number) => ((x % 360) + 360) % 360;
/** Signed distance from `target`, in (−180, 180]. */
const off = (lon: number, target: number) => { const d = norm(lon - target); return d > 180 ? d - 360 : d; };

/** First moment in [from, to] when `body` passes exactly over `target` (moving forward), by scan then bisection. */
export function firstPass(body: Astronomy.Body, target: number, from: Date, to: Date, stepDays = 5): Date | null {
  let t0 = from.getTime(), d0 = off(eclLon(body, from), target);
  for (let t = t0 + stepDays * DAY; t <= to.getTime(); t += stepDays * DAY) {
    const d1 = off(eclLon(body, new Date(t)), target);
    if (d0 < 0 && d1 >= 0 && d1 - d0 < 30) {
      let lo = t0, hi = t;
      for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; if (off(eclLon(body, new Date(mid)), target) < 0) lo = mid; else hi = mid; }
      return new Date(hi);
    }
    t0 = t; d0 = d1;
  }
  return null;
}

type Spec = { key: string; title: string; planet: string; body: Astronomy.Body; natal: string; angle: 0 | 90 | 180; window: [number, number]; meaning: string };
const SPECS: Spec[] = [
  ...[12, 24, 36, 48, 60, 72, 84].map((age, i) => ({ key: `jupiter-return-${i + 1}`, title: `Jupiter return ${i + 1}`, planet: 'Jupiter', body: Astronomy.Body.Jupiter, natal: 'jupiter', angle: 0 as const, window: [age - 1.5, age + 1.5] as [number, number], meaning: 'Jupiter comes home about every twelve years: a year to widen the circle, learn, travel or take a generous risk.' })),
  { key: 'uranus-square', title: 'Uranus square', planet: 'Uranus', body: Astronomy.Body.Uranus, natal: 'uranus', angle: 90, window: [18, 24], meaning: 'The first push for independence: what you were given starts to feel too small.' },
  ...[{ n: 1, w: [26, 31] }, { n: 2, w: [55, 61] }, { n: 3, w: [84, 90] }].map(({ n, w }) => ({ key: `saturn-return-${n}`, title: `Saturn return ${n}`, planet: 'Saturn', body: Astronomy.Body.Saturn, natal: 'saturn', angle: 0 as const, window: w as [number, number], meaning: n === 1 ? 'The first Saturn return asks you to choose a life you can stand behind as an adult, and let go of what was only borrowed.' : n === 2 ? 'The second Saturn return reviews what you built: what to keep, hand on or finally put down.' : 'The third Saturn return is an elder’s return: wisdom gathered, authority shared.' })),
  { key: 'neptune-square', title: 'Neptune square', planet: 'Neptune', body: Astronomy.Body.Neptune, natal: 'neptune', angle: 90, window: [36, 46], meaning: 'Old certainties soften; meaning matters more than proof. A time to dream honestly and check the dream against reality.' },
  { key: 'uranus-opposition', title: 'Uranus opposition', planet: 'Uranus', body: Astronomy.Body.Uranus, natal: 'uranus', angle: 180, window: [38, 46], meaning: 'The midlife awakening: the unlived parts of you ask for room, often through a sudden change of direction.' },
  { key: 'pluto-square', title: 'Pluto square', planet: 'Pluto', body: Astronomy.Body.Pluto, natal: 'pluto', angle: 90, window: [30, 95], meaning: 'A deep reckoning with power and control; what no longer has life in it is released so something truer can grow.' },
];

/** Every cycle event in a lifetime (to age 90), in date order. */
export function lifeCycles(c: ChartResult): CycleEvent[] {
  const birth = c.utc.getTime();
  const out: CycleEvent[] = [];
  for (const s of SPECS) {
    const natal = c.bodies.find(b => b.key === s.natal);
    if (!natal) continue;
    const from = new Date(birth + s.window[0] * YEAR), to = new Date(birth + s.window[1] * YEAR);
    const date = firstPass(s.body, norm(natal.lon + s.angle), from, to, s.planet === 'Jupiter' ? 3 : 6);
    if (date) out.push({ key: s.key, title: s.title, planet: s.planet, angle: s.angle, age: Math.floor((date.getTime() - birth) / YEAR), date, meaning: s.meaning });
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}
