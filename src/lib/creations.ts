import type { ChartResult } from '@/lib/astro';

/** Printable/downloadable creations drawn from a member's saved chart. Pure text helpers are kept here so they can be tested. */
export type CreationKind = 'wallpaper' | 'poster' | 'journal' | 'card';
export const CREATION_SIZE: Record<CreationKind, { w: number; h: number; label: string; note: string }> = {
  wallpaper: { w: 1170, h: 2532, label: 'Phone wallpaper', note: '1170 × 2532 px, fits modern phones' },
  poster: { w: 2400, h: 3600, label: 'Chart poster', note: '8 × 12 in at 300 dpi, print-ready' },
  journal: { w: 2550, h: 3300, label: 'Journal & planner page', note: 'US Letter at 300 dpi' },
  card: { w: 1500, h: 2100, label: 'Affirmation card', note: '5 × 7 in at 300 dpi' },
};

const GIFT: Record<string, [string, string]> = {
  Aries: ['courage', 'I act first and learn as I go.'], Taurus: ['steadiness', 'I build slowly and it lasts.'],
  Gemini: ['curiosity', 'My questions open doors.'], Cancer: ['care', 'I make safe places for the people I love.'],
  Leo: ['warmth', 'I let myself be seen.'], Virgo: ['skill', 'Small, careful steps are my strength.'],
  Libra: ['balance', 'I choose fairness, starting with myself.'], Scorpio: ['depth', 'I can face what is real.'],
  Sagittarius: ['faith', 'I trust the bigger picture.'], Capricorn: ['endurance', 'I climb at my own pace.'],
  Aquarius: ['originality', 'My difference is useful.'], Pisces: ['compassion', 'I feel deeply and stay whole.'],
};
const PLANET_TOPIC: Record<string, string> = { sun: 'who I am becoming', moon: 'what I need to feel safe', mercury: 'how I think and speak', venus: 'what I love and value', mars: 'how I go after things', jupiter: 'where I grow', saturn: 'what I am learning to master' };

export const placementLine = (b: { name: string; sign: string; deg: number; house: number | null; retro?: boolean }) =>
  `${b.name} in ${b.sign} ${b.deg}°${b.house ? ` · House ${b.house}` : ''}${b.retro ? ' · Rx' : ''}`;

/** A one-line affirmation built only from the planet's sign; never invented biography. */
export function affirmationFor(planet: string, sign: string) {
  const g = GIFT[sign]; if (!g) return '';
  return `${g[1]} My ${planet} in ${sign} brings ${g[0]} to ${PLANET_TOPIC[planet.toLowerCase()] ?? 'my life'}.`;
}

/** Journal prompts tied to exact placements; houses are only mentioned when the birth time is known. */
export function journalPrompts(chart: Pick<ChartResult, 'bodies'>, timed: boolean) {
  const get = (k: string) => chart.bodies.find(b => b.key === k);
  const out: string[] = [];
  const sun = get('sun'), moon = get('moon'), saturn = get('saturn'), venus = get('venus');
  if (sun) out.push(`Sun in ${sun.sign}: where did I use my ${GIFT[sun.sign]?.[0]} today?`);
  if (moon) out.push(`Moon in ${moon.sign}: what did I need emotionally, and did I ask for it?`);
  if (venus) out.push(`Venus in ${venus.sign}: what felt beautiful or valuable this week?`);
  if (saturn) out.push(`Saturn in ${saturn.sign}${timed && saturn.house ? ` (House ${saturn.house})` : ''}: one small, steady step I took.`);
  out.push('Three things I am grateful for:');
  return out;
}
