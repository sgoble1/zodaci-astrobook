import { computeChart, fmtLon, type ChartResult } from './astro';
import { baziStrength } from './bazi';
import { PLANET_VOICES, type EditorialPlanet } from '@/content/placements/blocks';
import { VIGNETTES } from '@/content/placements/vignettes';

const keyOf = (name: string) => (Object.entries(PLANET_VOICES).find(([, p]) => p.name === name)?.[0] ?? null) as EditorialPlanet | null;
const PERSONAL: EditorialPlanet[] = ['sun', 'moon', 'mercury', 'venus', 'mars'];
const HARD = ['Square', 'Opposition'];

export type Paradox = { a: EditorialPlanet; b: EditorialPlanet; type: string; orb: number; text: string; vignette: string };

/** Hard contacts that involve at least one personal planet, tightest first. Untimed charts skip the Moon. */
export function internalParadoxes(chart: ChartResult, limit = 3, maxOrb = 6): Paradox[] {
  const timed = Boolean(chart.input.time);
  return chart.aspects
    .filter(x => HARD.includes(x.type) && x.orb <= maxOrb)
    .map(x => ({ x, a: keyOf(x.a), b: keyOf(x.b) }))
    .filter((r): r is { x: typeof r.x; a: EditorialPlanet; b: EditorialPlanet } => !!r.a && !!r.b && (PERSONAL.includes(r.a) || PERSONAL.includes(r.b)) && (timed || (r.a !== 'moon' && r.b !== 'moon')))
    .sort((p, q) => p.x.orb - q.x.orb).slice(0, limit)
    .map(({ x, a, b }) => {
      const A = PLANET_VOICES[a], B = PLANET_VOICES[b];
      const verb = x.type === 'Square' ? 'push against each other' : 'pull from opposite ends';
      const text = `${A.name} ${x.type.toLowerCase()} ${B.name} (orb ${x.orb.toFixed(2)}°): your ${A.subject} and your ${B.subject} ${verb}. The argument is not which one wins; it is that both are right about something. One asks, “${A.question}” The other answers, “${B.question}” A workable middle: ${A.practice}, and ${B.practice}.`;
      return { a, b, type: x.type, orb: x.orb, text, vignette: VIGNETTES[b in VIGNETTES && !PERSONAL.includes(b) ? b : a] };
    });
}

const SLOW = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const PRESSURE = ['Square', 'Opposition', 'Conjunction'];
export type CrossCheck = { transits: { transit: string; natal: string; type: string; orb: number }[]; balance: string | null; score: number | null; partial: boolean; note: string };

/** Today's slow-planet contacts to natal personal points (within 2°), set beside the BaZi support/demand balance. A combined reading, not a prediction. */
export function crossTraditionCheck(natal: ChartResult, when = new Date()): CrossCheck {
  const sky = computeChart({ ...natal.input, date: when.toISOString().slice(0, 10), time: when.toISOString().slice(11, 16), tz: 'UTC' } as ChartResult['input'], when);
  const timed = Boolean(natal.input.time);
  const targets = natal.bodies.filter(b => PERSONAL.includes(b.key as EditorialPlanet) && (timed || b.key !== 'moon'));
  const angles: Record<string, number> = { Conjunction: 0, Square: 90, Opposition: 180 };
  const transits = sky.bodies.filter(b => SLOW.includes(b.name)).flatMap(t => targets.flatMap(n => {
    const d = Math.abs(((t.lon - n.lon) % 360 + 540) % 360 - 180); const sep = 180 - d;
    return PRESSURE.map(type => ({ transit: t.name, natal: n.name, type, orb: Math.abs(sep - angles[type]) })).filter(r => r.orb <= 2);
  })).sort((a, b) => a.orb - b.orb);
  const s = baziStrength(natal);
  const pressured = transits.some(t => t.transit === 'Saturn' || t.transit === 'Pluto');
  const note = !s ? 'BaZi balance unavailable for this chart.'
    : pressured && s.balance === 'Demand-led' ? 'A Saturn or Pluto contact is active while the Day Master leans demand-led: both traditions point to conserving effort and choosing fewer commitments.'
    : pressured ? 'A Saturn or Pluto contact is active while the Day Master has steadier support; the pressure is real but there are resources to draw on.'
    : transits.length ? 'Slow-planet contacts are active; read them beside the element balance rather than alone.'
    : 'No slow-planet contacts within 2° today; the element balance describes your baseline, not a current event.';
  return { transits, balance: s?.balance ?? null, score: s ? Math.round(s.score) : null, partial: s?.partial ?? true, note };
}

/** The ledger rows: exact positions, house system and hidden-stem weights. */
export function calculationLedger(chart: ChartResult) {
  const timed = Boolean(chart.input.time);
  return {
    utc: chart.utc.toISOString(), houseSystem: timed ? (chart.input.houseSystem ?? 'placidus') : 'none (birth time unknown)',
    positions: chart.bodies.slice(0, 12).map(b => ({ name: b.name, position: fmtLon(b.lon).text, house: timed ? b.house : null, retro: b.retro })),
    hiddenStems: baziStrength(chart)?.contributions.filter(c => c.source.startsWith('Hidden')).map(c => ({ pillar: c.pillar, stem: c.stem, element: c.element, weight: Number(c.weighted.toFixed(2)) })) ?? [],
  };
}
