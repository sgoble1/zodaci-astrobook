import * as Astronomy from 'astronomy-engine';
import { eclLon, fmtLon, houseOf, type BodyPos, type ChartResult } from '@/lib/astro';

/**
 * Retrograde periods from the ephemeris (no AI, no biography). A planet is retrograde on a UTC day when its
 * geocentric ecliptic longitude decreases across that day. Periods are found by daily sampling, so station dates are
 * accurate to the day. Shadow dates (Mercury, Venus, Mars) are the days the planet first reaches the degree it will
 * later turn direct at (pre-shadow) and finally passes the degree it turned retrograde at (post-shadow).
 */
const DAY = 864e5;
const BODIES: [string, string, string, Astronomy.Body][] = [
  ['mercury', 'Mercury', '☿', Astronomy.Body.Mercury], ['venus', 'Venus', '♀', Astronomy.Body.Venus],
  ['mars', 'Mars', '♂', Astronomy.Body.Mars], ['jupiter', 'Jupiter', '♃', Astronomy.Body.Jupiter],
  ['saturn', 'Saturn', '♄', Astronomy.Body.Saturn], ['uranus', 'Uranus', '♅', Astronomy.Body.Uranus],
  ['neptune', 'Neptune', '♆', Astronomy.Body.Neptune], ['pluto', 'Pluto', '♇', Astronomy.Body.Pluto],
];
const SHADOW = new Set(['mercury', 'venus', 'mars']);
const norm = (x: number) => ((x % 360) + 360) % 360;
const step = (a: number, b: number) => norm(b - a + 180) - 180;
const utcDay = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

export type Position = { lon: number; sign: string; deg: number; min: number };
export type RetroPeriod = {
  key: string; name: string; glyph: string;
  /** UTC day the planet stations retrograde, and the UTC day it stations direct. */
  start: Date; end: Date;
  from: Position; to: Position;
  /** Mercury, Venus and Mars only, when the scan window reaches them. */
  preShadow?: Date; postShadow?: Date;
  /** Houses in the member's chart the planet moves through while retrograde (timed charts only). */
  houses?: number[];
};

const pos = (lon: number): Position => { const f = fmtLon(lon); return { lon, sign: f.sign, deg: f.deg, min: f.min }; };

/** Daily longitudes for every planet from `startMs` for `days` days. */
function sample(startMs: number, days: number) {
  return BODIES.map(([, , , body]) => Array.from({ length: days + 1 }, (_, i) => eclLon(body, new Date(startMs + i * DAY))));
}

/**
 * Retrograde periods that overlap `[from, from + days]`. Periods already under way on `from` are included with their
 * real start date; periods that start inside the window but end after it carry their true end date.
 */
export function retrogradePeriods(from = new Date(), days = 365): RetroPeriod[] {
  const BACK = 160, AHEAD = 200; // reach back to the start of a running period and forward to its end and shadow
  const origin = utcDay(from) - BACK * DAY, total = BACK + days + AHEAD;
  const lons = sample(origin, total);
  const windowStart = utcDay(from), windowEnd = windowStart + days * DAY;
  const out: RetroPeriod[] = [];
  BODIES.forEach(([key, name, glyph], bi) => {
    const L = lons[bi];
    let i = 1;
    while (i < L.length) {
      if (step(L[i - 1], L[i]) < 0) {
        const s = i - 1; // last day of direct motion = station retrograde day
        let e = i;
        while (e < L.length && step(L[e - 1], L[e]) < 0) e++;
        if (e >= L.length) break; // still retrograde at the end of the scan: no true end date
        const end = e - 1; // station direct day
        const start = new Date(origin + s * DAY), stop = new Date(origin + end * DAY);
        if (s === 0) { i = e; continue; } // started before the scan reached back: no true start date
        if (stop.getTime() >= windowStart && start.getTime() <= windowEnd) {
          const p: RetroPeriod = { key, name, glyph, start, end: stop, from: pos(L[s]), to: pos(L[end]) };
          if (SHADOW.has(key)) {
            for (let k = s; k > 0; k--) { if (step(L[k], L[end]) >= 0) { p.preShadow = new Date(origin + (k + 1) * DAY); break; } }
            for (let k = end; k < L.length; k++) { if (step(L[s], L[k]) >= 0) { p.postShadow = new Date(origin + k * DAY); break; } }
          }
          out.push(p);
        }
        i = e;
      } else i++;
    }
  });
  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** Planets from Mercury to Pluto that were retrograde at birth (Sun, Moon and the always-retrograde mean Node excluded). */
export function natalRetrogrades(chart: ChartResult): BodyPos[] {
  const keys = new Set(BODIES.map(b => b[0]).concat('chiron'));
  return chart.bodies.filter(b => b.retro && keys.has(b.key));
}

/** Houses (in order) a retrograde period passes through in a timed natal chart. */
export function housesCrossed(period: Pick<RetroPeriod, 'from' | 'to'>, cusps: number[] | null | undefined): number[] {
  if (!cusps?.length) return [];
  // Retrograde motion runs backwards from `from` to `to`; sample the arc in 1° steps.
  const arc = norm(period.from.lon - period.to.lon);
  const seen: number[] = [];
  for (let d = 0; d <= arc + 1e-9; d += 1) {
    const h = houseOf(norm(period.from.lon - Math.min(d, arc)), cusps);
    if (seen[seen.length - 1] !== h) seen.push(h);
  }
  return seen;
}

/** Plain traditional meanings, used for both natal and passing retrogrades. Interpretation, not fact. */
export const RETRO_MEANING: Record<string, { theme: string; natal: string; passing: string }> = {
  mercury: { theme: 'thinking, talking, plans and paperwork', natal: 'Traditionally read as a mind that rehearses before it speaks: you may think best on paper, after a second look, or in your own time rather than on the spot.', passing: 'A good stretch for revising, re-reading and finishing. Leave extra time for travel and messages, and double-check dates and contracts.' },
  venus: { theme: 'love, money, taste and what you value', natal: 'Traditionally read as values worked out from the inside: your sense of what you like and who suits you may take longer to settle, and tends to hold once it does.', passing: 'Old relationships, old spending habits and old tastes come back for review. Reconsider rather than rush big purchases or new commitments.' },
  mars: { theme: 'drive, anger and how you go after things', natal: 'Traditionally read as energy that builds quietly: you may hold back, plan the move, then act with more force than people expect.', passing: 'Progress slows on what you are pushing for. Use it to repair, train and rethink tactics; tempers can run short.' },
  jupiter: { theme: 'growth, belief and opportunity', natal: 'Traditionally read as faith built from your own experience rather than borrowed beliefs; your luck can grow in less obvious places.', passing: 'Growth turns inward for a few months: a time to digest what has opened up and decide what is really worth expanding.' },
  saturn: { theme: 'responsibility, limits and long work', natal: 'Traditionally read as a strong inner rulebook: you may judge yourself harder than others judge you, and build authority slowly and on your own terms.', passing: 'A yearly review of structures, duties and commitments. Mend what is weak before building higher.' },
  uranus: { theme: 'change, freedom and surprises', natal: 'Shared by many people born within a few months of you. Traditionally read as a private streak of independence that shows more in thought than in rebellion.', passing: 'Change works under the surface for about five months a year. Ideas for breaking free get tested before they are acted on.' },
  neptune: { theme: 'dreams, ideals and uncertainty', natal: 'Shared by many people born within a few months of you. Traditionally read as an inward imagination and a sharp sense for what is real beneath appearances.', passing: 'The fog lifts a little on one area: a time to see where hopes and facts differ.' },
  pluto: { theme: 'power, endings and deep change', natal: 'Shared by many people born within a few months of you. Traditionally read as deep change processed privately before it is shown.', passing: 'A slow, private look at what needs to end or be taken back. Pluto is retrograde for about five months every year.' },
  chiron: { theme: 'old wounds and the skill of helping', natal: 'Traditionally read as healing that starts with yourself before you can offer it to others.', passing: 'A good time to revisit an old hurt with more patience than before.' },
};

/** How many days a period lasts, start and end days included. */
export const periodDays = (p: Pick<RetroPeriod, 'start' | 'end'>) => Math.round((p.end.getTime() - p.start.getTime()) / DAY) + 1;

/** Retrograde periods annotated with the houses they cross in a member's own chart (empty without a birth time). */
export function periodsForChart(chart: ChartResult | null, from = new Date(), days = 365): RetroPeriod[] {
  const timed = !!chart?.input.time;
  return retrogradePeriods(from, days).map(p => ({ ...p, houses: timed ? housesCrossed(p, chart!.cusps) : [] }));
}
