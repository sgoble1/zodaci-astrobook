import { fmtLon, type ChartResult } from '@/lib/astro';
import { HOUSE_ARENAS, SIGN_EXPRESSIONS } from '@/content/interpretationLibrary';
import { SIGN_RULER } from '@/lib/signRulers';
import { degreeLabel, tightestAspects, type TextFace } from '@/lib/bookLeaves';
import { balance, CORE_KEYS } from '@/lib/resultsEngine';
import type { Tone } from '@/lib/perception';

export const PROVISIONAL_MOON_NOTE = 'The provisional Moon position represents the daily reference range, not a confirmed birth hour. Its degree, sign and close aspects may change across that day; read its emotional themes as possibilities rather than settled placements.';

/** Date-only analysis never uses the calculated reference horizon or houses. */
export function untimedPreview(chart: ChartResult, topic: 'elements' | 'geometry' | 'planets' | 'cycles'): TextFace {
  const stable = { ...chart, asc: null, mc: null, cusps: null, bodies: chart.bodies.filter(b => b.key !== 'moon') };
  const counts = balance(stable);
  const contacts = tightestAspects({ ...stable, aspects: chart.aspects.filter(a => a.a !== 'Moon' && a.b !== 'Moon') }, 3);
  const positions = stable.bodies.filter(b => CORE_KEYS.includes(b.key)).slice(0, 5).map(b => `${b.name} at ${degreeLabel(b.lon)}`).join('; ');
  const sections = {
    elements: ['The balance beneath the signs', `Among the nine non-lunar planets, this reference chart contains ${Object.entries(counts.el).map(([e, n]) => `${n} in ${e}`).join(', ')}. Fire describes initiative, Earth practical continuity, Air exchange and Water emotional attention. These are symbolic categories, not a psychological test.`, 'Read the distribution beside the individual planets rather than treating the largest count as your identity. Two planets in the same element can ask very different things of you. The Moon is excluded from this count because its daily movement can cross a sign boundary.'],
    geometry: ['The conversation between planets', contacts.length ? `The closest non-lunar planetary contacts are ${contacts.join('; ')}. Each orb measures how far the reference positions lie from an exact angular relationship. Conjunctions bring functions together; squares invite negotiation; trines describe easier cooperation within the tradition.` : 'No non-lunar major aspects fall within the selected orbs. The absence of a close contact does not mean an absence of connection in your life; it means the individual planetary delineations deserve more attention than a dominant geometric pattern.', 'Read both planets before interpreting their relationship. A close angle cannot establish an event or a feeling. These contacts use the daily reference positions; precise orbs remain subject to the unrecorded hour, especially for faster planets.'],
    planets: ['Several voices, one chart', `The reference positions include ${positions}. Start with the function of each planet, then its sign: purpose is not affection, and affection is not the same question as effort or judgment. Their differences give this reading more substance than a single sign description.`, 'Compare the passages with one ordinary decision you remember. Which function seemed easy to express, and which needed more care? Keep your example separate from the calculation. Slower planetary positions give useful date-based reference points, while exact degrees still belong to the unconfirmed hour.'],
    cycles: ['Time measured through planetary cycles', `Planetary cycles compare moving planets with their reference birth positions. ${positions}. Jupiter revisits its natal longitude in roughly twelve years; Saturn takes roughly twenty-nine and a half. These are average orbital periods, not promised dates or events.`, 'A return describes a geometric recurrence, not an instruction about how your life must unfold. For a date-only reading, begin with the slower planets and compare broad periods with your own notes. Exact return timing requires fresh ephemeris calculations; the Moon remains a daily range rather than a fixed target.'],
  };
  const [title, ...body] = sections[topic];
  return { kind: 'text', eyebrow: topic === 'cycles' ? 'Volume VI · Cycles of Time' : topic === 'geometry' || topic === 'planets' ? 'Volume II · The Twelve Temples' : 'Volume I · The Celestial Matrix', title, placement: 'Date-based planetary reference', facts: [], body };
}

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
export function planetPreview(chart: ChartResult, key: string, tone: Tone = 'oracle'): TextFace {
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
      tone === 'professional' ? `Interpretive basis: ${b.name} in ${b.sign} ${e.core}. The sign symbolism associates this placement with ${e.gift}, with ${e.shadow} as a possible pressure response. These are interpretive hypotheses, not established personal history or diagnostic findings.` : tone === 'educational' ? `${b.name} supplies the planetary function; ${b.sign} describes its symbolic manner of expression, which ${e.core}. In this tradition, ${e.gift} names a constructive expression and ${e.shadow} a possible pressure response. Compare both with experience rather than assuming either is true.` : `In the astrological tradition, ${b.name} in ${b.sign} ${e.core}. The useful question is how that description meets your experience. You may recognise its ${e.gift}; you may also notice ${e.shadow} under pressure. Neither is a verdict on who you are.`,
      arena ? `In this house system, ${b.name} falls in house ${b.house}, associated with ${arena.themes}. This gives the interpretation a setting. It cannot tell us what happened there, who was involved, or what you should choose.` : key === 'moon' ? PROVISIONAL_MOON_NOTE : `Read ${b.name} alongside its closest planetary contacts. A sign describes a manner of expression; an aspect describes how that function meets another. Together they offer a more particular question than the sign alone, without assigning a life event or personal history.`,
      `Take a moment with this: ${question}`,
    ],
  };
}

export function risingPreview(chart: ChartResult): TextFace {
  if (!chart.input.time || chart.asc == null) return untimedPreview(chart, 'elements');
  const sign = fmtLon(chart.asc).sign;
  const e = SIGN_EXPRESSIONS[sign];
  const ruler = chart.bodies.find(b => b.key === SIGN_RULER[sign].traditional);
  return { kind: 'text', eyebrow: 'Volume I · The Celestial Matrix', title: 'How you meet a beginning', placement: `Ascendant · ${degreeLabel(chart.asc)}`, facts: [], body: [
    `The Ascendant is the degree rising in the east at your recorded birth moment. In ${sign}, its traditional reading ${e.core}. That is a possible approach to beginnings, not a demand to perform a personality for other people.`,
    ruler ? `Its traditional ruler is ${ruler.name}, calculated at ${degreeLabel(ruler.lon)}${ruler.house ? ` in house ${ruler.house}` : ''}. Following that ruler connects the opening of the chart to another part of it. We keep those measured connections visible so you can follow the reasoning.` : 'The ruler is not available in this calculation.',
    'Think of a recent beginning. What felt natural? What took effort? Your answer matters more than a description that does not fit.',
  ] };
}