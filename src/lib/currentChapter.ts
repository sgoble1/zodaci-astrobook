import type { ChartResult } from '@/lib/astro';
import type { TransitEvent, TransitHit, TransitPos } from '@/lib/transitOverlay';
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

/* ── Broadcast Engine: five retro-TV channels, each wired to its specialist's slice of the real sky. ── */

export type ChannelId = 'chapter' | 'career' | 'relationship' | 'window' | 'growth';
/** One dial on a channel's sky readout, e.g. "Saturn · 25° Pisces ℞". Always computed, never written. */
export interface SkyReading { label: string; value: string }
export interface BroadcastChannel {
  id: ChannelId; number: string; name: string; host: StaffId; title: string; summary: string;
  /** Strongest live contact for this channel, if any. */
  hit: TransitHit | null;
  /** Up to three live contacts on this channel, strongest first. */
  contacts: TransitHit[];
  /** Upcoming events on this channel within 30 days, in date order. */
  events: TransitEvent[];
  /** Today's positions of the bodies this channel's specialist watches. */
  sky: SkyReading[];
}

const CAREER_POINTS = ['mc', 'sun', 'saturn', 'mars'];
const REL_POINTS = ['venus', 'moon', 'asc'];
const GROWTH_PLANETS = ['jupiter', 'saturn'];
const rank = (hits: TransitHit[]) => [...hits].sort((a, b) => b.weight - a.weight || a.orb - b.orb);
const label = (h: TransitHit) => `${h.transit.name} ${h.symbol} ${h.natalName}`;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** Locale-independent short date (events are dated at UTC noon). */
export const shortDay = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
const PHASES = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];

/** Moon phase from the Sun–Moon elongation: name, percent lit and whether it is growing. */
export function moonPhase(sunLon: number, moonLon: number): { name: string; lit: number; waxing: boolean } {
  const a = ((moonLon - sunLon) % 360 + 360) % 360;
  return { name: PHASES[Math.floor(((a + 22.5) % 360) / 45)], lit: Math.round((1 - Math.cos((a * Math.PI) / 180)) * 50), waxing: a < 180 };
}

const pos = (sky: TransitPos[], key: string): SkyReading[] => {
  const p = sky.find(s => s.key === key);
  return p ? [{ label: p.name, value: `${Math.floor(p.deg)}° ${p.sign}${p.retro ? ' ℞' : ''}` }] : [];
};
const moonReading = (sky: TransitPos[]): SkyReading[] => {
  const sun = sky.find(s => s.key === 'sun'), moon = sky.find(s => s.key === 'moon');
  if (!sun || !moon) return [];
  const ph = moonPhase(sun.lon, moon.lon);
  return [{ label: 'Moon phase', value: `${ph.name} · ${ph.lit}% lit` }];
};
const nextLine = (events: TransitEvent[]) => events[0] ? ` Next on this channel: ${events[0].title} on ${shortDay(events[0].date)}.` : '';

/** Channels 01–05. Each shows its live contacts, upcoming events and the sky its specialist watches; a quiet channel says so plainly. */
export function broadcastChannels(hits: TransitHit[], events: TransitEvent[], now = new Date(), sky: TransitPos[] = []): BroadcastChannel[] {
  const from = now.getTime() - 864e5, horizon = now.getTime() + 30 * 864e5;
  const soon = events.filter(e => e.date.getTime() >= from && e.date.getTime() <= horizon).sort((a, b) => a.date.getTime() - b.date.getTime() || b.weight - a.weight);
  const pick = (f: (e: TransitEvent) => boolean) => soon.filter(f).slice(0, 3);

  const chapter = chapterFrom(hits);
  const chapterContacts = rank(hits.filter(h => SLOW.includes(h.transit.key))).slice(0, 3);
  const chapterEvents = pick(e => (chapter.hit ? e.planet === chapter.hit.transit.key : false) || (!!e.natalKey && ['sun', 'moon', 'asc', 'mc'].includes(e.natalKey)));

  const career = rank(hits.filter(h => CAREER_POINTS.includes(h.natalKey))).slice(0, 3);
  const careerEvents = pick(e => (!!e.natalKey && CAREER_POINTS.includes(e.natalKey)) || (e.kind !== 'exact' && (e.planet === 'saturn' || e.planet === 'mars')));

  const rel = rank(hits.filter(h => REL_POINTS.includes(h.natalKey))).slice(0, 3);
  const relEvents = pick(e => (!!e.natalKey && REL_POINTS.includes(e.natalKey)) || (e.kind !== 'exact' && e.planet === 'venus'));

  const growth = rank(hits.filter(h => GROWTH_PLANETS.includes(h.transit.key))).slice(0, 3);
  const growthEvents = pick(e => !!e.planet && GROWTH_PLANETS.includes(e.planet));

  const windowEvents = [...soon].sort((a, b) => b.weight - a.weight || a.date.getTime() - b.date.getTime()).slice(0, 3).sort((a, b) => a.date.getTime() - b.date.getTime());
  const retro = sky.filter(p => p.retro).map(p => p.name);

  return [
    { id: 'chapter', number: '01', name: 'Current Chapter', host: 'broadcaster', title: chapter.title, summary: chapter.hit ? chapter.summary : chapter.summary + nextLine(chapterEvents), hit: chapter.hit, contacts: chapterContacts, events: chapterEvents,
      sky: [...moonReading(sky), ...pos(sky, 'moon').map(r => ({ ...r, label: 'Moon sign' })), ...pos(sky, 'sun')] },
    { id: 'career', number: '02', name: 'Career', host: 'analyst', title: career[0] ? `Career · ${label(career[0])}` : 'Career channel is quiet',
      summary: career[0] ? career[0].text : 'No planet is closely touching your Midheaven, Sun, Saturn or Mars today. Steady work counts more than big moves.' + nextLine(careerEvents),
      hit: career[0] ?? null, contacts: career, events: careerEvents, sky: [...pos(sky, 'saturn'), ...pos(sky, 'mars'), ...pos(sky, 'sun')] },
    { id: 'relationship', number: '03', name: 'Relationship', host: 'curator', title: rel[0] ? `Relationship · ${label(rel[0])}` : 'Relationship channel is quiet',
      summary: rel[0] ? rel[0].text : 'No planet is closely touching your Venus, Moon or Ascendant today. Ordinary time with people you trust.' + nextLine(relEvents),
      hit: rel[0] ?? null, contacts: rel, events: relEvents, sky: [...pos(sky, 'venus'), ...pos(sky, 'moon'), ...moonReading(sky)] },
    { id: 'window', number: '04', name: 'Forecast Window', host: 'navigator', title: windowEvents.length ? 'The next 30 days' : 'A calm month ahead',
      summary: windowEvents.length ? `${soon.length} notable ${soon.length === 1 ? 'event' : 'events'} in your sky this month; the ${windowEvents.length === 1 ? 'biggest is' : `${windowEvents.length} biggest are`} below.` : 'No exact slow-planet contacts, stations or sign changes in the next 30 days.',
      hit: null, contacts: [], events: windowEvents,
      sky: sky.length ? [{ label: 'Retrograde now', value: retro.length ? retro.join(', ') : 'None' }, { label: 'Events in 30 days', value: String(soon.length) }] : [] },
    { id: 'growth', number: '05', name: 'Growth', host: 'researcher', title: growth[0] ? `Growth · ${label(growth[0])}` : 'Growth channel is quiet',
      summary: growth[0] ? growth[0].text : 'Jupiter and Saturn, the slow teachers, are not closely touching your chart today.' + nextLine(growthEvents),
      hit: growth[0] ?? null, contacts: growth, events: growthEvents, sky: [...pos(sky, 'jupiter'), ...pos(sky, 'saturn')] },
  ];
}
