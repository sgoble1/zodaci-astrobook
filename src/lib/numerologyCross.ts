import type { ChartResult } from '@/lib/astro';
import { TRAD_RULER } from '@/lib/advancedDeductions';
import { lifePath } from '@/lib/synastry';

/** Numerology Cross-Reference (MOD-010): Pythagorean core numbers from birth name and date, cross-read with the North Node and chart ruler. */
const VALUE: Record<string, number> = {};
'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((c, i) => { VALUE[c] = (i % 9) + 1; });
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);
const clean = (name: string) => name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z ]/g, '');
/** Y is a vowel when it is not next to another vowel (e.g. "Lynn", "Mary"). */
const isVowel = (w: string, i: number) => VOWELS.has(w[i]) || (w[i] === 'Y' && !VOWELS.has(w[i - 1] ?? '') && !VOWELS.has(w[i + 1] ?? ''));
export function reduce(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) n = String(n).split('').reduce((s, d) => s + Number(d), 0);
  return n;
}
/** Each name part is reduced first, then summed and reduced again (standard Pythagorean method, preserves master numbers). */
function nameNumber(name: string, pick: (w: string, i: number) => boolean) {
  const words = clean(name).split(' ').filter(Boolean);
  if (!words.length) return null;
  const total = words.reduce((s, w) => s + reduce(w.split('').reduce((t, c, i) => t + (pick(w, i) ? VALUE[c] : 0), 0)), 0);
  return total ? reduce(total) : null;
}
export const expression = (name: string) => nameNumber(name, () => true);
export const soulUrge = (name: string) => nameNumber(name, isVowel);
export const personality = (name: string) => nameNumber(name, (w, i) => !isVowel(w, i));

export const NUM_KEYWORD: Record<number, string> = { 1: 'Leader', 2: 'Peacemaker', 3: 'Communicator', 4: 'Builder', 5: 'Adventurer', 6: 'Nurturer', 7: 'Seeker', 8: 'Powerhouse', 9: 'Humanitarian', 11: 'Intuitive', 22: 'Master Builder', 33: 'Master Teacher' };
export const NUM_ELEMENT: Record<number, 'Fire' | 'Earth' | 'Air' | 'Water'> = { 1: 'Fire', 2: 'Water', 3: 'Air', 4: 'Earth', 5: 'Air', 6: 'Earth', 7: 'Water', 8: 'Earth', 9: 'Fire', 11: 'Water', 22: 'Earth', 33: 'Fire' };
const MEANING: Record<number, string> = {
  1: 'independence, initiative and the courage to go first', 2: 'cooperation, sensitivity and the gift of bringing people together', 3: 'expression, creativity and joy in communication', 4: 'structure, patience and building things that last', 5: 'freedom, change and learning through experience', 6: 'care, responsibility and making a home for others', 7: 'reflection, study and searching for deeper truth', 8: 'ambition, authority and mastering the material world', 9: 'compassion, completion and serving something larger', 11: 'heightened intuition and inspiring others through insight', 22: 'turning large visions into practical, lasting results', 33: 'compassionate teaching and uplifting others through example',
};
const NODE_THEME: Record<string, string> = { Aries: 'becoming self-directed', Taurus: 'building steady self-worth', Gemini: 'staying curious and asking questions', Cancer: 'making room for feeling and belonging', Leo: 'stepping into creative visibility', Virgo: 'serving through practical skill', Libra: 'learning partnership and balance', Scorpio: 'embracing depth and shared trust', Sagittarius: 'trusting a bigger meaning', Capricorn: 'taking responsibility for your path', Aquarius: 'contributing to the group', Pisces: 'surrendering to compassion and faith' };
const SIGN_EL: Record<string, string> = { Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire', Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth', Gemini: 'Air', Libra: 'Air', Aquarius: 'Air', Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water' };

export type NumberTile = { id: 'lifePath' | 'expression' | 'soulUrge' | 'personality'; label: string; value: number; keyword: string; element: string; basis: string; text: string; cross: string };

export function numerologyCross(c: ChartResult, birthDate: string, fullName: string): NumberTile[] {
  const node = c.bodies.find(b => b.key === 'northNode');
  const ascSign = c.asc != null ? Math.floor((((c.asc % 360) + 360) % 360) / 30) : null;
  const rulerKey = ascSign != null ? TRAD_RULER[ascSign] : null;
  const ruler = rulerKey ? c.bodies.find(b => b.key === rulerKey) : null;
  const cross = (n: number) => {
    const el = NUM_ELEMENT[n];
    const parts: string[] = [];
    if (node) parts.push(`Your North Node in ${node.sign} points toward ${NODE_THEME[node.sign]}; as a ${n}, you get there through ${MEANING[n].split(',')[0]}.`);
    if (ruler) parts.push(`Your chart ruler ${ruler.name} is in ${ruler.sign}${ruler.house ? `, house ${ruler.house}` : ''}. ${SIGN_EL[ruler.sign] === el ? `It shares this number's ${el} element, so the two reinforce each other.` : `Its ${SIGN_EL[ruler.sign]} element meets this number's ${el} tone, so you balance the two rather than lean on one.`}`);
    else parts.push('Add an exact birth time to cross-reference your chart ruler.');
    return parts.join(' ');
  };
  const lp = lifePath(birthDate).n;
  const tiles: NumberTile[] = [{ id: 'lifePath', label: 'Life Path', value: lp, keyword: NUM_KEYWORD[lp] ?? '', element: NUM_ELEMENT[lp] ?? '', basis: `From your birth date ${birthDate}.`, text: `Your life's main lesson is ${MEANING[lp]}.`, cross: cross(lp) }];
  const add = (id: NumberTile['id'], label: string, v: number | null, basis: string, lead: string) => { if (v) tiles.push({ id, label, value: v, keyword: NUM_KEYWORD[v], element: NUM_ELEMENT[v], basis, text: `${lead} ${MEANING[v]}.`, cross: cross(v) }); };
  add('expression', 'Destiny (Expression)', expression(fullName), `From every letter of “${fullName}”.`, 'Your natural talents point toward');
  add('soulUrge', 'Soul Urge (Heart’s Desire)', soulUrge(fullName), `From the vowels of “${fullName}”.`, 'What you want most, deep down, is');
  add('personality', 'Personality', personality(fullName), `From the consonants of “${fullName}”.`, 'Others first meet you through');
  return tiles;
}
