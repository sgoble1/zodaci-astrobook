import { fmtLon, type ChartResult } from '@/lib/astro';
import { HOUSE_ARENAS, SIGN_EXPRESSIONS } from '@/content/interpretationLibrary';
import { SIGN_RULER } from '@/lib/signRulers';
import { degreeLabel, type BookFace } from '@/lib/bookLeaves';

const VOICES: Record<string, [string, string]> = {
  sun: ['What feels like your own life', 'What would you begin if you did not have to prove it would succeed?'],
  moon: ['What helps you feel at home', 'What actually restores you, rather than simply keeping you busy?'],
  mercury: ['Making room for your own mind', 'When do you understand something best: speaking, writing, or sitting with it?'],
  venus: ['What is worth caring for', 'Where do your choices reflect what you value, and where do they reflect habit?'],
  mars: ['The shape of your effort', 'What deserves your effort, and what needs a boundary instead?'],
  saturn: ['What you build slowly', 'Which commitment still feels honest when no one is watching?'],
  pluto: ['Private ground, deeper questions', 'What are you ready to reconsider without forcing an answer today?'],
};

/** Interpretive language always sits beside its measured placement; it never supplies a biography. */
export function planetPreview(chart: ChartResult, key: string): BookFace {
  const b = chart.bodies.find(p => p.key === key);
  if (!b) throw new Error(`The calculated chart is missing ${key}.`);
  const e = SIGN_EXPRESSIONS[b.sign];
  const timed = Boolean(chart.input.time);
  const arena = timed && b.house ? HOUSE_ARENAS[b.house] : null;
  const [title, question] = VOICES[key] ?? [b.name, 'What in this passage fits your experience?'];
  const position = `${degreeLabel(b.lon)}${timed && b.house ? ` · house ${b.house}` : ''}${b.retro ? ' · retrograde' : ''}`;
  return {
    kind: 'text', eyebrow: ['sun', 'moon'].includes(key) ? 'Volume I · The Celestial Matrix' : key === 'pluto' ? 'Volume IV · Esoteric Points' : 'Volume III · Planetary Geometry',
    title, placement: `${b.name} · ${position}`, facts: [],
    body: [
      `In the astrological tradition, ${b.name} in ${b.sign} ${e.core}. The useful question is how that description meets your experience. You may recognise its ${e.gift}; you may also notice ${e.shadow} under pressure. Neither is a verdict on who you are.`,
      arena ? `In this house system, ${b.name} falls in house ${b.house}, associated with ${arena.themes}. This gives the interpretation a setting. It cannot tell us what happened there, who was involved, or what you should choose.` : 'Without a recorded birth time, this page gives no house placement. The daily position is a reference calculation; the Moon can move far enough during a day to change the reading.',
      `Take a moment with this: ${question}`,
    ],
  };
}

export function risingPreview(chart: ChartResult): BookFace {
  if (!chart.input.time || chart.asc == null) return { kind: 'text', eyebrow: 'Volume I · The Celestial Matrix', title: 'An open space in the chart', placement: 'Birth time unknown', facts: [], body: ['The eastern horizon changes throughout the day. With no recorded time, we leave the Ascendant, Midheaven and houses unassigned. A noon reference calculation is not a claim that you were born at noon.', 'You can still read the slower planetary placements. Keep the Moon provisional, especially near a sign boundary. Adding a verified time later may change the interpretation.'] };
  const sign = fmtLon(chart.asc).sign;
  const e = SIGN_EXPRESSIONS[sign];
  const ruler = chart.bodies.find(b => b.key === SIGN_RULER[sign].traditional);
  return { kind: 'text', eyebrow: 'Volume I · The Celestial Matrix', title: 'How you meet a beginning', placement: `Ascendant · ${degreeLabel(chart.asc)}`, facts: [], body: [
    `The Ascendant is the degree rising in the east at your recorded birth moment. In ${sign}, its traditional reading ${e.core}. That is a possible approach to beginnings, not a demand to perform a personality for other people.`,
    ruler ? `Its traditional ruler is ${ruler.name}, calculated at ${degreeLabel(ruler.lon)}${ruler.house ? ` in house ${ruler.house}` : ''}. Following that ruler connects the opening of the chart to another part of it. We keep those measured connections visible so you can follow the reasoning.` : 'The ruler is not available in this calculation.',
    'Think of a recent beginning. What felt natural? What took effort? Your answer matters more than a description that does not fit.',
  ] };
}