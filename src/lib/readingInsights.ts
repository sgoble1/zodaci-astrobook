/**
 * Facts about a reading's own text for the reader's insights column: reading time, sections, and the chart
 * placements and houses the text names. Pure text parsing — nothing is inferred about the reader.
 */
const BODIES = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'North Node', 'South Node', 'Ascendant', 'Rising', 'Midheaven', 'MC', 'Lilith', 'Part of Fortune'];
const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const ORD: Record<string, number> = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12 };

export type ReadingFacts = { words: number; minutes: number; placements: string[]; houses: number[] };

const plain = (md: string) => md
  .replace(/```[\s\S]*?```/g, ' ')
  .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/<[^>]+>/g, ' ')
  .replace(/[*_`#>|]/g, ' ');

/** Minutes at 230 words a minute, at least one for any text. */
export function readingMinutes(words: number): number { return words ? Math.max(1, Math.round(words / 230)) : 0; }

export function readingFacts(md: string, limit = 10): ReadingFacts {
  const text = plain(md);
  const words = (text.match(/[\p{L}\p{N}'’-]+/gu) ?? []).length;
  const body = BODIES.map(b => b.replace(' ', '\\s+')).join('|');
  const sign = SIGNS.join('|');
  // "Moon in Capricorn", "Venus in Pisces" — the body and the sign it sits in, written out in the text.
  const re = new RegExp(`\\b(${body})\\s+(?:in|is in|sits in)\\s+(${sign})\\b`, 'g');
  const placements: string[] = [];
  for (const m of text.matchAll(re)) {
    const p = `${m[1].replace(/\s+/g, ' ').replace(/^Rising$/, 'Ascendant').replace(/^MC$/, 'Midheaven')} in ${m[2]}`;
    if (!placements.includes(p)) placements.push(p);
    if (placements.length >= limit) break;
  }
  const houses = new Set<number>();
  for (const m of text.matchAll(/\b(\d{1,2})(?:st|nd|rd|th)\s+house\b/gi)) { const n = Number(m[1]); if (n >= 1 && n <= 12) houses.add(n); }
  for (const m of text.matchAll(/\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth)\s+house\b/gi)) houses.add(ORD[m[1].toLowerCase()]);
  return { words, minutes: readingMinutes(words), placements, houses: [...houses].sort((a, b) => a - b) };
}

export const ordinal = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`;
