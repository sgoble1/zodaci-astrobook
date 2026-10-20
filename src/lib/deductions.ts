import type { ChartResult } from '@/lib/astro';
import { elementOf, lifePath, LP_MEANING } from '@/lib/synastry';
import { kuaNumber, groupOf, KUA_ELEMENT } from '@/lib/kua';
import { advancedDeductions } from '@/lib/advancedDeductions';

/** Deterministic deductions across Western, Chinese, Numerology and Feng Shui. No AI; every line traces to a calculation. */
export type System = 'Western' | 'Chinese' | 'Numerology' | 'Feng Shui';
export type Deduction = { id: string; system: System; title: string; text: string; basis: string };

const get = (c: ChartResult, k: string) => c.bodies.find(b => b.key === k);
const RULER: Record<string, string> = { Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon', Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Pluto', Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune' };
const MODE: Record<string, string> = { Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal', Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed', Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable' };
const MODE_TEXT: Record<string, string> = { Cardinal: 'You start things; momentum comes from initiating.', Fixed: 'You sustain things; your strength is staying power.', Mutable: 'You adapt; your strength is flexibility and range.' };

export function deduce(c: ChartResult, opts: { date: string; timeKnown: boolean; sex?: 'male' | 'female' | 'unspecified'; today?: Date }): Deduction[] {
  const out: Deduction[] = [];
  const sun = get(c, 'sun'), moon = get(c, 'moon'), venus = get(c, 'venus'), mars = get(c, 'mars'), saturn = get(c, 'saturn');
  if (sun && moon) {
    const same = elementOf(sun.sign) === elementOf(moon.sign);
    out.push({ id: 'sun-moon', system: 'Western', title: same ? 'Head and heart agree' : 'Head and heart speak different languages', text: same ? `Sun and Moon share ${elementOf(sun.sign)}, so what you want and what you need usually point the same way.` : `Your ${elementOf(sun.sign)} Sun and ${elementOf(moon.sign)} Moon mean wants and needs can pull apart; naming both helps.`, basis: `Sun ${sun.sign}, Moon ${moon.sign}` });
  }
  if (opts.timeKnown && c.asc != null) {
    const ascSign = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][Math.floor((((c.asc % 360) + 360) % 360) / 30)];
    const ruler = RULER[ascSign]; const rb = c.bodies.find(b => b.name.startsWith(ruler));
    if (rb) out.push({ id: 'chart-ruler', system: 'Western', title: `Chart ruler: ${ruler}`, text: `With ${ascSign} rising, ${ruler} steers the chart. Its placement in ${rb.sign}${rb.house ? `, house ${rb.house}` : ''} shows where life keeps pulling your attention.`, basis: `Ascendant ${ascSign}` });
    const angular = c.bodies.filter(b => [1, 4, 7, 10].includes(b.house ?? 0) && !['northNode', 'southNode'].includes(b.key));
    if (angular.length >= 3) out.push({ id: 'angular', system: 'Western', title: 'Visible, active chart', text: `${angular.length} planets sit on the angles, so your choices tend to show outwardly and quickly.`, basis: angular.map(b => b.name).join(', ') });
  }
  const modes: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  c.bodies.filter(b => !['northNode', 'southNode', 'chiron'].includes(b.key)).forEach(b => { modes[MODE[b.sign]]++; });
  const topMode = Object.entries(modes).sort((a, b) => b[1] - a[1])[0];
  out.push({ id: 'mode', system: 'Western', title: `Mostly ${topMode[0]}`, text: MODE_TEXT[topMode[0]], basis: `${topMode[1]} planets in ${topMode[0]} signs` });
  if (venus && mars) out.push({ id: 'venus-mars', system: 'Western', title: 'How you love and pursue', text: `Venus in ${venus.sign} wants ${elementOf(venus.sign) === 'Earth' ? 'steadiness and care shown in actions' : elementOf(venus.sign) === 'Water' ? 'emotional depth' : elementOf(venus.sign) === 'Fire' ? 'warmth and spark' : 'conversation and freedom'}; Mars in ${mars.sign} goes after it ${MODE[mars.sign] === 'Cardinal' ? 'directly' : MODE[mars.sign] === 'Fixed' ? 'persistently' : 'flexibly'}.`, basis: `Venus ${venus.sign}, Mars ${mars.sign}` });
  if (saturn) out.push({ id: 'saturn', system: 'Western', title: 'Where maturity is earned', text: `Saturn in ${saturn.sign}${saturn.house ? ` in house ${saturn.house}` : ''} marks the area that feels hard early and becomes a lasting strength with effort.`, basis: `Saturn ${saturn.sign}` });
  const tight = c.aspects.slice().sort((a, b) => a.orb - b.orb)[0];
  if (tight) out.push({ id: 'tightest', system: 'Western', title: 'Your tightest aspect', text: `${tight.a} ${tight.type.toLowerCase()} ${tight.b} is the most exact link in your chart, so this combination is felt constantly.`, basis: `orb ${tight.orb.toFixed(2)}°` });

  const year = c.bazi.find(p => p.label.startsWith('Year')), day = c.bazi.find(p => p.label.startsWith('Day'));
  if (year) out.push({ id: 'animal', system: 'Chinese', title: `${year.stemElement} ${year.animal}`, text: `Your year pillar is ${year.polarity} ${year.stemElement} ${year.animal}, the public, social layer of your Chinese chart.`, basis: `${year.stem}${year.branch}` });
  if (day) out.push({ id: 'day-master', system: 'Chinese', title: `Day Master: ${day.polarity} ${day.stemElement}`, text: `In Ba Zi the day stem is you. ${day.polarity} ${day.stemElement} is your core element; balancing it is the aim of the whole chart.`, basis: `Day ${day.stem}${day.branch}` });
  const counts: Record<string, number> = {};
  c.bazi.forEach(p => { counts[p.stemElement] = (counts[p.stemElement] ?? 0) + 1; counts[p.branchElement] = (counts[p.branchElement] ?? 0) + 1; });
  const missing = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'].filter(e => !counts[e]);
  if (missing.length) out.push({ id: 'bazi-missing', system: 'Chinese', title: `Missing ${missing.join(' and ')}`, text: `Your pillars have no ${missing.join(' or ')}; traditionally these are brought in through surroundings, colours and habits.`, basis: `${c.bazi.length} pillars counted` });

  const lp = lifePath(opts.date);
  out.push({ id: 'life-path', system: 'Numerology', title: `Life Path ${lp.n}`, text: `Life Path ${lp.n} is ${LP_MEANING[lp.n] ?? 'a unique path'}.`, basis: lp.steps });
  const day2 = Number(opts.date.slice(8, 10));
  out.push({ id: 'birthday', system: 'Numerology', title: `Birthday number ${day2}`, text: `Your birth day adds a secondary talent to your Life Path, reduced to ${day2 > 9 && ![11, 22].includes(day2) ? String(day2).split('').reduce((s, d) => s + +d, 0) : day2}.`, basis: `Day ${day2}` });

  if (opts.sex && opts.sex !== 'unspecified') {
    const k = kuaNumber(opts.date, opts.sex);
    if (k) out.push({ id: 'kua', system: 'Feng Shui', title: `Kua ${k.kua} · ${groupOf(k.kua)} group`, text: `Your Kua element is ${KUA_ELEMENT[k.kua]}. Facing your ${groupOf(k.kua)}-group directions at your desk and bed is the classic first step.`, basis: k.steps.join('; ') });
  }
  const extra = advancedDeductions(c, opts);
  const order: System[] = ['Western', 'Chinese', 'Numerology', 'Feng Shui'];
  return [...out, ...extra].sort((a, b) => order.indexOf(a.system) - order.indexOf(b.system));
}
