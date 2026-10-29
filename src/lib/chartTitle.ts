/** Deterministic, chart-specific titles and cover matches. Modern psychological tone; built only from calculated placements. */
export type Element = 'Fire' | 'Earth' | 'Air' | 'Water';
export const ELEMENT_OF: Record<string, Element> = { Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire', Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth', Gemini: 'Air', Libra: 'Air', Aquarius: 'Air', Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water' };

/** Who you are (Sun sign). */
const SUN_ARCHETYPE: Record<string, string> = { Aries: 'Pioneer', Taurus: 'Builder', Gemini: 'Translator', Cancer: 'Protector', Leo: 'Creator', Virgo: 'Refiner', Libra: 'Harmonizer', Scorpio: 'Transformer', Sagittarius: 'Explorer', Capricorn: 'Strategist', Aquarius: 'Innovator', Pisces: 'Empath' };
/** How you feel (Moon sign). */
const MOON_QUALITY: Record<string, string> = { Aries: 'Bold', Taurus: 'Steady', Gemini: 'Curious', Cancer: 'Tender', Leo: 'Warm-Hearted', Virgo: 'Attentive', Libra: 'Gracious', Scorpio: 'Intense', Sagittarius: 'Hopeful', Capricorn: 'Composed', Aquarius: 'Independent', Pisces: 'Intuitive' };
/** The inner landscape (dominant element). */
const ELEMENT_REALM: Record<Element, string> = { Fire: 'Bright Momentum', Earth: 'Grounded Purpose', Air: 'Open Ideas', Water: 'Deep Currents' };
/** How you meet the world (Rising sign). */
const RISING_PHRASE: Record<string, string> = { Aries: 'leading with courage', Taurus: 'leading with calm', Gemini: 'leading with wit', Cancer: 'leading with care', Leo: 'leading with presence', Virgo: 'leading with precision', Libra: 'leading with grace', Scorpio: 'leading with depth', Sagittarius: 'leading with candor', Capricorn: 'leading with resolve', Aquarius: 'leading with vision', Pisces: 'leading with compassion' };

export type ChartTitleInput = { sun: string; moon?: string | null; rising?: string | null; dominant?: Element | null };
export type ChartTitle = { title: string; subtitle: string; why: string };

const SIGN = (s?: string | null) => (s && s in ELEMENT_OF ? s : null);
const ELEMENT = (e?: string | null): Element | null => (e && e in ELEMENT_REALM ? (e as Element) : null);

/** Unknown or unexpected signs are dropped rather than shown as blank words; without a valid Sun the title stays generic. */
export function chartTitle(input: ChartTitleInput): ChartTitle {
  const sun = SIGN(input.sun), moon = SIGN(input.moon), rising = SIGN(input.rising), dominant = ELEMENT(input.dominant);
  if (!sun) return { title: 'Your Personal Sky', subtitle: 'Add your birth details to personalize this title', why: 'Built once your Sun sign is calculated.' };
  const el = dominant ?? ELEMENT_OF[sun];
  const quality = moon ? MOON_QUALITY[moon] : null;
  const title = `The ${quality ? `${quality} ` : ''}${SUN_ARCHETYPE[sun]} of ${ELEMENT_REALM[el]}`;
  const subtitle = rising ? `${sun} Sun, ${RISING_PHRASE[rising]}` : `${sun} Sun${moon ? ` · ${moon} Moon` : ''}`;
  const why = [`${SUN_ARCHETYPE[sun]} from your ${sun} Sun`, quality && `${quality.toLowerCase()} from your ${moon} Moon`, `${ELEMENT_REALM[el].toLowerCase()} from your ${dominant ? 'strongest element' : 'Sun element'} (${el})`, rising && `${RISING_PHRASE[rising]} from your ${rising} Rising`].filter(Boolean).join('; ');
  return { title, subtitle, why: `Built from ${why}.` };
}

/** Strongest element, or null when two or more tie (the title then falls back to the Sun's element). */
export function dominantElement(counts: Partial<Record<Element, number>>): Element | null {
  const sorted = (Object.entries(counts) as [Element, number][]).sort((a, b) => b[1] - a[1]);
  if (!sorted.length || (sorted[1] && sorted[1][1] === sorted[0][1])) return null;
  return sorted[0][0];
}

/** Cover design matched to the chart's leading element, by design key (see COVER_DESIGNS). */
export const COVER_FOR_ELEMENT: Record<Element, { key: string; reason: string }> = {
  Fire: { key: 'midnight-ember', reason: 'Midnight Ember echoes the warmth of a Fire-led chart.' },
  Earth: { key: 'midnight-stars', reason: 'Midnight Stars suits the steady, grounded tone of an Earth-led chart.' },
  Air: { key: 'gradient-violet-dusk', reason: 'Violet Dusk matches the open evening sky of an Air-led chart.' },
  Water: { key: 'solid-midnight', reason: 'Solid Midnight’s deep, quiet night suits a Water-led chart.' },
};
