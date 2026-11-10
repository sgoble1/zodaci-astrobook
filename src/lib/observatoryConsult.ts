import type { TransitHit } from '@/lib/transitOverlay';

export type ConsultSource = { kind: 'chart' | 'sky' | 'chapter' | 'log' | 'context'; label: string };

/** Today's contacts as plain lines for the Observatory: strongest first, at most twelve, facts only. */
export function observatoryLines(hits: TransitHit[]): string[] {
  return [...hits]
    .sort((a, b) => b.weight - a.weight || a.orb - b.orb)
    .slice(0, 12)
    .map(h => `${h.transit.name} in ${h.transit.sign}${h.transit.retro ? ' (retrograde)' : ''} ${h.type} natal ${h.natalName}, orb ${h.orb.toFixed(1)}°, ${h.applying ? 'applying' : 'separating'}`);
}

const KINDS = new Set(['chart', 'sky', 'chapter', 'log', 'context']);
/** Reads the sources header; anything malformed is dropped rather than shown. */
export function parseSources(header: string | null): ConsultSource[] {
  if (!header) return [];
  try {
    const list: unknown = JSON.parse(decodeURIComponent(header));
    return Array.isArray(list) ? list.filter((s): s is ConsultSource => !!s && typeof s === 'object' && KINDS.has((s as ConsultSource).kind) && typeof (s as ConsultSource).label === 'string') : [];
  } catch { return []; }
}

export const OBSERVATORY_STARTERS = [
  'What is today’s sky asking of me?',
  'How should I approach work this week?',
  'What does my Current Chapter mean for my relationships?',
  'What patterns show up in my Observation Log?',
];
