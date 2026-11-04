import type { ChartResult } from '@/lib/astro';
import type { TransitHit } from '@/lib/transitOverlay';

/**
 * Current Chapter + Life Compass, derived only from today's transits to the natal chart.
 * Deterministic: no AI, no biography. The chapter is the strongest slow-planet transit.
 */
const SLOW = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'mars'];
const TITLE: Record<string, string> = {
  jupiter: 'Widening the circle', saturn: 'Building long-term structure', uranus: 'Making room for change',
  neptune: 'Learning to trust the fog', pluto: 'Deep renovation', mars: 'Acting on what matters',
};

export const COMPASS_DOMAINS = {
  Career: ['sun', 'saturn', 'mc', 'mars'],
  Relationships: ['venus', 'moon', 'asc'],
  Finances: ['venus', 'jupiter', 'saturn'],
  Purpose: ['sun', 'jupiter', 'mc'],
  Health: ['moon', 'mars', 'asc'],
  Creativity: ['venus', 'neptune', 'sun', 'mercury'],
} as const;
export type CompassDomain = keyof typeof COMPASS_DOMAINS;

export interface CurrentChapter { title: string; hit: TransitHit | null; summary: string }

export function chapterFrom(hits: TransitHit[]): CurrentChapter {
  const hit = hits.filter(h => SLOW.includes(h.transit.key)).sort((a, b) => b.weight - a.weight || a.orb - b.orb)[0] ?? null;
  if (!hit) return { title: 'A quiet stretch in the sky', hit: null, summary: 'No slow planet is closely touching your chart today. A good time to read, reflect and plan.' };
  return { title: `${TITLE[hit.transit.key]} · ${hit.natalName}`, hit, summary: hit.text };
}

/** 0–10 per domain: summed weight of current transits touching that domain's natal points, capped at 10. */
export function compassFrom(hits: TransitHit[]): Record<CompassDomain, number> {
  const out = {} as Record<CompassDomain, number>;
  (Object.keys(COMPASS_DOMAINS) as CompassDomain[]).forEach(d => {
    const keys = COMPASS_DOMAINS[d] as readonly string[];
    const sum = hits.filter(h => keys.includes(h.natalKey)).reduce((n, h) => n + h.weight, 0);
    out[d] = Math.min(10, Math.round(sum / 2));
  });
  return out;
}

export type { ChartResult };
