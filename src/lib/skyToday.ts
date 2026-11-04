import { transitPositions, type TransitPos } from './transitOverlay';
import { moonPhase } from './currentChapter';

/** A general sky event anyone can see, calculated from planetary positions (no birth chart needed). */
export type SkyEvent = { date: Date; kind: 'new-moon' | 'full-moon' | 'ingress' | 'station'; title: string; detail: string };

const DAY = 86_400_000;
const elong = (sky: TransitPos[]) => {
  const sun = sky.find(p => p.key === 'sun'), moon = sky.find(p => p.key === 'moon');
  return sun && moon ? ((moon.lon - sun.lon) % 360 + 360) % 360 : NaN;
};

/** Today's measured sky: every body's sign and degree, retrograde flags and the Moon's phase. */
export function skyToday(now = new Date()) {
  const sky = transitPositions(now);
  const sun = sky.find(p => p.key === 'sun')!, moon = sky.find(p => p.key === 'moon')!;
  return { at: now, bodies: sky, phase: moonPhase(sun.lon, moon.lon), retrograde: sky.filter(p => p.retro) };
}

/**
 * Upcoming general events in the next `days`: New and Full Moons, planets changing sign (the Moon
 * excluded — it changes every two to three days) and planets stationing retrograde or direct.
 * Sampled once per UTC day; each event carries the UTC day on which it happens.
 */
export function skyEvents(from = new Date(), days = 30): SkyEvent[] {
  const start = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  const out: SkyEvent[] = [];
  let prev = transitPositions(new Date(start));
  for (let i = 1; i <= days; i++) {
    const day = new Date(start + (i - 1) * DAY);
    const next = transitPositions(new Date(start + i * DAY));
    const a = elong(prev), b = elong(next);
    if (a > 300 && b < 60) out.push({ date: day, kind: 'new-moon', title: 'New Moon', detail: `Moon and Sun meet in ${next.find(p => p.key === 'sun')!.sign}.` });
    if (a < 180 && b >= 180) out.push({ date: day, kind: 'full-moon', title: 'Full Moon', detail: `Moon in ${next.find(p => p.key === 'moon')!.sign}, opposite the Sun.` });
    for (const p of next) {
      const q = prev.find(x => x.key === p.key);
      if (!q || p.key === 'moon') continue;
      if (q.sign !== p.sign) out.push({ date: day, kind: 'ingress', title: `${p.name} enters ${p.sign}`, detail: `${p.name} moves from ${q.sign} into ${p.sign}${p.retro ? ' while retrograde' : ''}.` });
      if (q.retro !== p.retro && p.key !== 'sun' && !/node/i.test(p.key)) out.push({ date: day, kind: 'station', title: `${p.name} stations ${p.retro ? 'retrograde' : 'direct'}`, detail: `${p.name} appears to pause at ${Math.floor(p.deg)}° ${p.sign}, then moves ${p.retro ? 'backwards' : 'forwards'}.` });
    }
    prev = next;
  }
  return out;
}
