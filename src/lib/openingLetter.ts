import { fmtLon, type ChartResult } from '@/lib/astro';
import { detectPatterns, rankPatterns, type SignificantPattern } from '@/lib/chartPatterns';
import { shadowBreakthroughBlock, type SBItem } from '@/content/shadowBreakthrough';
import { HOUSE_ARENAS, SIGN_EXPRESSIONS } from '@/content/interpretationLibrary';

/**
 * OpeningLetter template (Unified Master Specification §3.4). Deterministic, no AI call: addresses the reader by first
 * name, names the birth moment and place, leads with the two or three highest-ranked patterns, gives one shadow and one
 * breakthrough sentence, and closes with one forward-looking line. Second person throughout, at least 400 words.
 */
export const LETTER_MIN_WORDS = 400;
/** §8.5: no social-media astrology language and no alarming framing. Checked by tests on every letter. */
export const FORBIDDEN_PHRASES = ['the universe has a plan', 'manifest', 'vibes', 'big energy', 'main character', 'toxic', 'red flag', 'cursed', 'doomed', 'bad luck', 'nightmare', 'chaos', 'mercury retrograde ruins', 'it’s giving', "it's giving", 'slay', 'cosmic download', 'destined to suffer'];

export type LetterInput = { name: string; placeLabel: string; chart: ChartResult; timeKnown: boolean };
export type OpeningLetter = { salutation: string; paragraphs: string[]; closing: string; signature: string; patterns: SignificantPattern[]; shadowItem: SBItem | null; words: number };

const ORD = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`;

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const listOf = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
export const wordCount = (t: string) => t.split(/\s+/).filter(Boolean).length;

function birthMoment(chart: ChartResult, timeKnown: boolean) {
  const [y, m, d] = chart.input.date.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  if (!timeKnown || !chart.input.time) return date;
  const [hh, mm] = chart.input.time.split(':').map(Number);
  const t = `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'in the morning' : hh < 17 ? 'in the afternoon' : 'in the evening'}`;
  return `${t} on ${date}`;
}

export function buildOpeningLetter({ name, placeLabel, chart, timeKnown }: LetterInput): OpeningLetter {
  const first = name.trim().split(/\s+/)[0] || 'Friend';
  const body = (k: string) => chart.bodies.find(b => b.key === k);
  const sun = body('sun')!, moon = body('moon')!;
  const rising = timeKnown && chart.asc != null ? fmtLon(chart.asc) : null;
  const sx = SIGN_EXPRESSIONS[sun.sign], mx = SIGN_EXPRESSIONS[moon.sign], rx = rising ? SIGN_EXPRESSIONS[rising.sign] : null;
  const ranked = rankPatterns(detectPatterns(timeKnown ? chart : { ...chart, asc: null, cusps: null, utc: null }), chart);
  const top = ranked.slice(0, 3);
  const sb = shadowBreakthroughBlock(ranked, 'oracle', 5);
  const lead = sb[0] ?? null;
  const place = placeLabel.split(',').slice(0, 2).join(',').trim() || 'the place you were born';
  const p: string[] = [];

  p.push(`When you arrived, at ${birthMoment(chart, timeKnown)}, in ${place}, the Sun stood at ${sun.deg}° ${sun.sign} and the Moon at ${moon.deg}° ${moon.sign}${rising ? `, with ${rising.sign} rising over the eastern horizon` : ''}. This letter is written from that one moment. Every placement in it was calculated from the date${timeKnown ? ', time' : ''} and place you gave, and nothing in it is borrowed from anyone else's chart. Where a sentence interprets rather than measures, it says so.`);

  p.push(`Your Sun in ${sun.sign}${sun.house && timeKnown ? `, in the ${ORD(sun.house)} house of ${HOUSE_ARENAS[sun.house].arena}` : ''}, is the part of you that ${sx.core}. Its gift is ${sx.gift}; its shadow, when you are tired or unseen, is ${sx.shadow}. Your Moon in ${moon.sign} answers to a different need: it ${mx.core}, and it settles when there is room for ${mx.gift}. ${sx.element === mx.element ? `Both lights are ${sx.element} signs, so what you want and what you need tend to pull in the same direction.` : `Your Sun is ${sx.element} and your Moon is ${mx.element}, so what you want and what you need speak in two different temperaments, and learning to translate between them is part of your work.`}`);

  if (rising && rx) p.push(`${rising.sign} rising describes how you arrive: the manner you bring into a new room before anyone knows your story. It ${rx.core}. People often meet the ${lower(rx.gift)} first, and only later discover the ${sun.sign} Sun underneath it. When the two are in step, the first impression and the person behind it feel like one thing.`);
  else p.push(`Your birth time is not recorded, so this letter leaves your rising sign and houses unnamed rather than guessing them. The Sun, the slower planets and most of the Moon's position are still exact for the day, and they carry the larger part of what follows.`);

  if (top.length) {
    const names = top.map(t => lower(t.label));
    p.push(`Three things stand out when your chart is ranked by what a person would recognise as most themselves. ${top.length > 1 ? `The strongest are ${listOf(names)}.` : `The strongest is ${names[0]}.`} ${top.map(t => t.detail.replace(/\s+$/, '')).join(' ')} These were ranked by how closely they involve your Sun, Moon and Ascendant, how near they sit to the angles of the chart, and how tightly they are formed. They are the threads the rest of your reading follows first.`);
  } else {
    p.push('No single configuration dominates your chart. That is less common than it sounds: it means your story is carried by the individual placements rather than by one loud pattern, and each planet gets to speak in its own voice. The reading that follows takes them one at a time, in order of how strongly they are placed.');
  }

  if (lead) p.push(`Every gift in a chart has a form it takes under pressure. For you, the pressure point most worth naming is ${lower(lead.source)}: when it is strained, it can look like ${lower(lead.shadow)}. The same energy, worked with rather than against, becomes ${lower(lead.breakthrough)}. A small way to practise the second: ${lower(lead.practice ?? '')}.`);

  const els = Object.entries(chart.elements ?? {}).filter(([, n]) => typeof n === 'number').sort((a, b) => b[1] - a[1]);
  if (els.length) {
    const [hi] = els, lo = els[els.length - 1];
    p.push(`Across the whole chart, ${hi[0].toLowerCase()} carries the most weight${lo[1] === 0 ? `, and ${lo[0].toLowerCase()} is missing entirely, which usually means its qualities are learned on purpose rather than given` : `, and ${lo[0].toLowerCase()} carries the least`}. Treat that balance as a description of your starting point, not a limit. Charts describe tendencies and timing; the choices are yours.`);
  }

  p.push(`Read the pages that follow slowly, and keep what is useful. If a passage does not fit, notice that too: the chart is a map drawn from a single moment, and you have been walking the territory ever since. You know things about your life that no calculation can see, and those always come first.`);

  const closing = `${first}, the next chapter of your chart is already moving; start with the thread that caught your attention here.`;
  const words = wordCount([`Dear ${first},`, ...p, closing].join(' '));
  return { salutation: `Dear ${first},`, paragraphs: p, closing, signature: 'With care, Zodaci', patterns: top, shadowItem: lead, words };
}

export const letterText = (l: OpeningLetter) => [l.salutation, ...l.paragraphs, l.closing, l.signature].join('\n\n');

