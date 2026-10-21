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

export function chartTitle({ sun, moon, rising, dominant }: ChartTitleInput): ChartTitle {
  const el = dominant ?? ELEMENT_OF[sun];
  const quality = moon ? MOON_QUALITY[moon] : null;
  const title = `The ${quality ? `${quality} ` : ''}${SUN_ARCHETYPE[sun]} of ${ELEMENT_REALM[el]}`;
  const subtitle = rising ? `${sun} Sun, ${RISING_PHRASE[rising]}` : `${sun} Sun${moon ? ` · ${moon} Moon` : ''}`;
  const why = [`${SUN_ARCHETYPE[sun]} from your ${sun} Sun`, quality && `${quality.toLowerCase()} from your ${moon} Moon`, `${ELEMENT_REALM[el].toLowerCase()} from your ${dominant ? 'strongest element' : 'Sun element'} (${el})`, rising && `${RISING_PHRASE[rising]} from your ${rising} Rising`].filter(Boolean).join('; ');
  return { title, subtitle, why: `Built from ${why}.` };
}

/** Cover design matched to the chart's leading element. Indexes match the cover list order: Midnight Stars, Blue Cosmos, Gold Aurora. */
export const COVER_FOR_ELEMENT: Record<Element, { index: number; reason: string }> = {
  Fire: { index: 2, reason: 'Gold Aurora echoes the warmth of a Fire-led chart.' },
  Earth: { index: 0, reason: 'Midnight Stars suits the steady, grounded tone of an Earth-led chart.' },
  Air: { index: 1, reason: 'Blue Cosmos matches the open sky of an Air-led chart.' },
  Water: { index: 0, reason: 'Midnight Stars reflects the depth of a Water-led chart.' },
};
