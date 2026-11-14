import { SIGNS } from './astro';

/**
 * Public chart share: carries planet signs only. Birth date, time, place, degrees,
 * houses, Rising, notes and journal never enter the link, so the link alone cannot
 * be turned back into someone's birth details.
 */
export const SHAREABLE = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'] as const;
export type ShareKey = typeof SHAREABLE[number];
export type SharedSigns = { name?: string; signs: Partial<Record<ShareKey, string>> };

export function encodeShare(bodies: { key: string; sign: string }[], name?: string): string {
  const parts = SHAREABLE.flatMap(k => { const b = bodies.find(x => x.key === k); const i = b ? SIGNS.indexOf(b.sign as never) : -1; return i >= 0 ? [`${k}.${i}`] : []; });
  const q = new URLSearchParams({ s: parts.join('-') });
  const first = name?.trim().split(/\s+/)[0]?.replace(/[^\p{L}'-]/gu, '').slice(0, 30);
  if (first) q.set('n', first);
  return q.toString();
}

export function decodeShare(search: string): SharedSigns | null {
  const q = new URLSearchParams(search);
  const signs: SharedSigns['signs'] = {};
  for (const p of (q.get('s') ?? '').split('-')) {
    const [k, v] = p.split('.'); const i = Number(v);
    if ((SHAREABLE as readonly string[]).includes(k) && Number.isInteger(i) && i >= 0 && i < 12) signs[k as ShareKey] = SIGNS[i];
  }
  if (!signs.sun) return null;
  const n = q.get('n')?.replace(/[^\p{L}'-]/gu, '').slice(0, 30);
  return { name: n || undefined, signs };
}
