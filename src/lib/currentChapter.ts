import type { ChartResult } from '@/lib/astro';
import type { TransitEvent, TransitHit } from '@/lib/transitOverlay';
import type { StaffId } from '@/lib/observatory';

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

/* ── Broadcast Engine: five retro-TV channels, all from real transits and upcoming sky events. ── */

export type ChannelId = 'chapter' | 'career' | 'relationship' | 'window' | 'growth';
export interface BroadcastChannel { id: ChannelId; number: string; name: string; host: StaffId; title: string; summary: string; hit: TransitHit | null; events: TransitEvent[] }

const CHANNEL_POINTS: Record<'career' | 'relationship', string[]> = { career: ['mc', 'sun', 'saturn', 'mars'], relationship: ['venus', 'moon', 'asc'] };
const GROWTH_PLANETS = ['jupiter', 'saturn'];
const strongest = (hits: TransitHit[]) => [...hits].sort((a, b) => b.weight - a.weight || a.orb - b.orb)[0] ?? null;
const label = (h: TransitHit) => `${h.transit.name} ${h.symbol} ${h.natalName}`;

/** Channels 01–05. Each shows its strongest live contact, or says plainly that the channel is quiet. Window lists the next 30 days' biggest events. */
export function broadcastChannels(hits: TransitHit[], events: TransitEvent[], now = new Date()): BroadcastChannel[] {
  const chapter = chapterFrom(hits);
  const career = strongest(hits.filter(h => CHANNEL_POINTS.career.includes(h.natalKey)));
  const rel = strongest(hits.filter(h => CHANNEL_POINTS.relationship.includes(h.natalKey)));
  const growth = strongest(hits.filter(h => GROWTH_PLANETS.includes(h.transit.key)));
  const horizon = now.getTime() + 30 * 864e5;
  const windowEvents = events.filter(e => e.date.getTime() >= now.getTime() - 864e5 && e.date.getTime() <= horizon).sort((a, b) => b.weight - a.weight || a.date.getTime() - b.date.getTime()).slice(0, 3).sort((a, b) => a.date.getTime() - b.date.getTime());
  return [
    { id: 'chapter', number: '01', name: 'Current Chapter', host: 'broadcaster', title: chapter.title, summary: chapter.summary, hit: chapter.hit, events: [] },
    { id: 'career', number: '02', name: 'Career', host: 'analyst', title: career ? `Career · ${label(career)}` : 'Career channel is quiet', summary: career ? career.text : 'No planet is closely touching your Midheaven, Sun, Saturn or Mars today. Steady work counts more than big moves.', hit: career, events: [] },
    { id: 'relationship', number: '03', name: 'Relationship', host: 'curator', title: rel ? `Relationship · ${label(rel)}` : 'Relationship channel is quiet', summary: rel ? rel.text : 'No planet is closely touching your Venus, Moon or Ascendant today. Ordinary time with people you trust.', hit: rel, events: [] },
    { id: 'window', number: '04', name: 'Forecast Window', host: 'navigator', title: windowEvents.length ? 'The next 30 days' : 'A calm month ahead', summary: windowEvents.length ? `${windowEvents.length} notable ${windowEvents.length === 1 ? 'event' : 'events'} in your sky this month.` : 'No exact slow-planet contacts, stations or sign changes in the next 30 days.', hit: null, events: windowEvents },
    { id: 'growth', number: '05', name: 'Growth', host: 'researcher', title: growth ? `Growth · ${label(growth)}` : 'Growth channel is quiet', summary: growth ? growth.text : 'Jupiter and Saturn, the slow teachers, are not closely touching your chart today.', hit: growth, events: [] },
  ];
}
