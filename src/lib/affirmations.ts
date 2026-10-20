import { fmtLon, type ChartResult } from '@/lib/astro';
import { retroPlanets } from '@/lib/retrogood';
import { lifePath } from '@/lib/synastry';

/** MOD-006: 8–12 chart-specific identity affirmations ("I am…"), each tied to the placement it comes from. Deterministic. */
const SUN: Record<string, string> = {
  Aries: 'I am the first spark, and I trust my courage to begin.', Taurus: 'I am steady ground; what I build with patience lasts.', Gemini: 'I am curiosity in motion, and my questions open doors.',
  Cancer: 'I am a safe harbour, and my care is a quiet strength.', Leo: 'I am light freely given; my warmth makes room for others to shine.', Virgo: 'I am skilled devotion; my attention makes things whole.',
  Libra: 'I am balance made beautiful; I bring people into harmony.', Scorpio: 'I am depth without fear; I transform what I touch.', Sagittarius: 'I am the far horizon; my faith in meaning carries me.',
  Capricorn: 'I am the long climb, and every step is mine.', Aquarius: 'I am a new idea arriving on time; my difference is a gift.', Pisces: 'I am the ocean’s memory; my compassion has no edges.',
};
const MOON: Record<string, string> = {
  Aries: 'My feelings are honest and quick, and I let them move me forward.', Taurus: 'I am at peace in my body; comfort is my birthright.', Gemini: 'I name what I feel, and naming it sets me free.',
  Cancer: 'I belong to myself first, and from there I hold others.', Leo: 'My heart is generous, and I deserve to be celebrated too.', Virgo: 'I care for myself with the same precision I give others.',
  Libra: 'I feel calm when I choose fairness, starting with myself.', Scorpio: 'My emotional depth is a well, not a wound.', Sagittarius: 'My spirit stays free, and freedom keeps me well.',
  Capricorn: 'I allow myself rest; my strength does not need to be earned.', Aquarius: 'I honour my need for space, and I return to people by choice.', Pisces: 'I trust my intuition, and I protect my softness.',
};
const RISING: Record<string, string> = {
  Aries: 'I meet the world directly, and it meets me back.', Taurus: 'I arrive calmly, and my presence reassures.', Gemini: 'I meet each day with a ready mind and a light step.',
  Cancer: 'I lead with kindness, and kindness is power.', Leo: 'I walk in as myself, fully seen.', Virgo: 'I meet the world with clear eyes and useful hands.',
  Libra: 'I bring grace into every room I enter.', Scorpio: 'I reveal myself on my own terms, and that is wisdom.', Sagittarius: 'I greet life as an adventure worth having.',
  Capricorn: 'I show up with integrity, and it is noticed.', Aquarius: 'I am unmistakably myself, and that is enough.', Pisces: 'I move through the world gently, and my gentleness reaches people.',
};
const VENUS: Record<string, string> = { Fire: 'I love boldly and I am worth loving boldly.', Earth: 'I am loved in ways I can feel and trust.', Air: 'I am loved for my mind as much as my heart.', Water: 'I am held, and I let myself be held.' };
const MARS: Record<string, string> = { Fire: 'My energy is a flame I aim with purpose.', Earth: 'My effort is steady, and steady wins.', Air: 'I act on ideas, and ideas become real through me.', Water: 'I act from feeling, and my instincts are sound.' };
const NODE: Record<string, string> = { Aries: 'I am growing into my own leadership.', Taurus: 'I am growing into calm self-worth.', Gemini: 'I am growing into open curiosity.', Cancer: 'I am growing into emotional belonging.', Leo: 'I am growing into joyful visibility.', Virgo: 'I am growing into skilled service.', Libra: 'I am growing into true partnership.', Scorpio: 'I am growing into deep trust.', Sagittarius: 'I am growing into my own truth.', Capricorn: 'I am growing into chosen responsibility.', Aquarius: 'I am growing into my place in the collective.', Pisces: 'I am growing into faith and surrender.' };
const LP: Record<number, string> = { 1: 'I am a beginning.', 2: 'I am the bridge between people.', 3: 'I am joyful expression.', 4: 'I am a builder of lasting things.', 5: 'I am free, and change is my teacher.', 6: 'I am love that takes responsibility.', 7: 'I am a seeker of truth.', 8: 'I am power used well.', 9: 'I am compassion in action.', 11: 'I am a channel for insight.', 22: 'I am a builder of visions.', 33: 'I am a teacher through love.' };
const EL: Record<string, string> = { Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire', Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth', Gemini: 'Air', Libra: 'Air', Aquarius: 'Air', Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water' };

export type Affirmation = { text: string; source: string };
export function chartAffirmations(c: ChartResult, birthDate: string): Affirmation[] {
  const get = (k: string) => c.bodies.find(b => b.key === k);
  const out: Affirmation[] = [];
  const sun = get('sun'), moon = get('moon'), venus = get('venus'), mars = get('mars'), node = get('northNode');
  if (sun) out.push({ text: SUN[sun.sign], source: `Sun in ${sun.sign}` });
  if (moon && c.input.time) out.push({ text: MOON[moon.sign], source: `Moon in ${moon.sign}` });
  if (c.asc != null) { const r = fmtLon(c.asc).sign; out.push({ text: RISING[r], source: `${r} Rising` }); }
  retroPlanets(c).forEach(r => out.push({ text: r.narrative.affirmation, source: `${r.name} retrograde in ${r.sign} · ${r.tier}` }));
  if (venus) out.push({ text: VENUS[EL[venus.sign]], source: `Venus in ${venus.sign}` });
  if (mars) out.push({ text: MARS[EL[mars.sign]], source: `Mars in ${mars.sign}` });
  if (node) out.push({ text: NODE[node.sign], source: `North Node in ${node.sign}` });
  const lp = lifePath(birthDate);
  if (LP[lp]) out.push({ text: LP[lp], source: `Life Path ${lp}` });
  if (moon && !c.input.time) out.push({ text: MOON[moon.sign], source: `Moon in ${moon.sign} (approximate without birth time)` });
  const seen = new Set<string>();
  return out.filter(a => a.text && !seen.has(a.text) && seen.add(a.text)).slice(0, 12);
}
