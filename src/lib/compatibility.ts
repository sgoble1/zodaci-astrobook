import type { ChartResult } from '@/lib/astro';

/**
 * Compatibility score from the Master Build specification (section 15.5): five placements,
 * element table (out of 25) × 3 plus modality table (out of 10) × 2.5, capped at 100 per placement,
 * then a weighted average (Sun 1.0, Moon 1.0, Venus 0.9, Mars 0.8, Rising 0.7). Deterministic.
 */
export const ELEMENT_OF: Record<string, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire', Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air', Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};
export const MODALITY_OF: Record<string, 'Cardinal' | 'Fixed' | 'Mutable'> = {
  Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal', Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
  Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
};
const ELEMENT_TABLE: Record<string, Record<string, number>> = {
  Fire: { Fire: 25, Air: 20, Earth: 8, Water: 5 }, Earth: { Earth: 25, Water: 20, Fire: 8, Air: 5 },
  Air: { Air: 25, Fire: 20, Water: 8, Earth: 5 }, Water: { Water: 25, Earth: 20, Air: 8, Fire: 5 },
};
export const elementScore = (a: string, b: string) => a === b ? 25 : ELEMENT_TABLE[a]?.[b] ?? 10;
export function modalityScore(a: string, b: string) {
  if (a === b) return 5;
  const pair = [a, b].sort().join('-');
  if (pair === 'Cardinal-Fixed') return 7;
  if (pair === 'Cardinal-Mutable') return 10;
  return 8;
}
export const PLANET_WEIGHTS = { sun: 1, moon: 1, venus: 0.9, mars: 0.8, rising: 0.7 } as const;
export type CompatKey = keyof typeof PLANET_WEIGHTS;
export type CompatSigns = Partial<Record<CompatKey, string | null>>;
export type CompatRow = { key: CompatKey; label: string; a: string; b: string; score: number; elements: string; modalities: string; note: string };

const LABEL: Record<CompatKey, string> = { sun: 'Sun', moon: 'Moon', venus: 'Venus', mars: 'Mars', rising: 'Rising' };
const MEANS: Record<CompatKey, string> = { sun: 'core identity and direction', moon: 'emotional needs and comfort', venus: 'affection, taste and values', mars: 'drive, desire and how you handle conflict', rising: 'first impressions and daily style' };

function feel(score: number, elA: string, elB: string) {
  if (elA === elB) return 'You speak the same elemental language here.';
  if (score >= 80) return 'Different but complementary — each supplies what the other reaches for.';
  if (score >= 55) return 'Workable with attention: the differences are where you learn from each other.';
  return 'A real contrast — easy to misread each other, rewarding when named out loud.';
}

/** Score two sets of signs. Missing placements (no birth time for Moon/Rising) are left out rather than guessed. */
export function compatibility(a: CompatSigns, b: CompatSigns): { score: number; rows: CompatRow[]; omitted: CompatKey[] } {
  const rows: CompatRow[] = []; const omitted: CompatKey[] = [];
  let sum = 0, weight = 0;
  (Object.keys(PLANET_WEIGHTS) as CompatKey[]).forEach(key => {
    const sa = a[key], sb = b[key];
    if (!sa || !sb || !ELEMENT_OF[sa] || !ELEMENT_OF[sb]) { omitted.push(key); return; }
    const raw = Math.min(100, elementScore(ELEMENT_OF[sa], ELEMENT_OF[sb]) * 3 + modalityScore(MODALITY_OF[sa], MODALITY_OF[sb]) * 2.5);
    sum += raw * PLANET_WEIGHTS[key]; weight += PLANET_WEIGHTS[key];
    rows.push({ key, label: LABEL[key], a: sa, b: sb, score: Math.round(raw), elements: `${ELEMENT_OF[sa]} / ${ELEMENT_OF[sb]}`, modalities: `${MODALITY_OF[sa]} / ${MODALITY_OF[sb]}`, note: `${LABEL[key]} shows ${MEANS[key]}. ${feel(raw, ELEMENT_OF[sa], ELEMENT_OF[sb])}` });
  });
  return { score: weight ? Math.round(sum / weight) : 0, rows, omitted };
}

/** Signs from a calculated chart; Moon and Rising only when the birth time is known. */
export function signsFromChart(c: ChartResult): CompatSigns {
  const s = (k: string) => c.bodies.find(x => x.key === k)?.sign ?? null;
  const timed = !!c.input.time;
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  return { sun: s('sun'), moon: timed ? s('moon') : null, venus: s('venus'), mars: s('mars'), rising: timed && c.asc != null ? signs[Math.floor((((c.asc % 360) + 360) % 360) / 30)] : null };
}

/** Master Build gauge bands: 0–40 caution, 41–70 moderate, 71–100 harmonious. */
export type ScoreBand = 'caution' | 'moderate' | 'harmonious';
export const scoreBand = (score: number): ScoreBand => score <= 40 ? 'caution' : score <= 70 ? 'moderate' : 'harmonious';
export const BAND_LABEL: Record<ScoreBand, string> = { caution: 'Take care', moderate: 'Workable', harmonious: 'Harmonious' };
