// Eight Mansions (Ba Zhai) Kua calculation and the standard direction table for every Kua number.
// These are standard Feng Shui rules, not quotes from the source PDFs (labelled "derived" in the UI).
import type { Dir } from '@/content/fengshui';

export type Sex = 'male' | 'female' | 'unspecified';
export type Mansion = 'Sheng Chi' | 'Tien Yi' | 'Nien Yen' | 'Fu Wei' | 'Ho Hai' | 'Wu Kwei' | 'Liu Sha' | 'Jue Ming';

export const MANSION_INFO: Record<Mansion, { meaning: string; good: boolean; rank: number; use: string }> = {
  'Sheng Chi': { meaning: 'Wealth & Success', good: true, rank: 1, use: 'Face it at the desk; best for the front door and main workspace.' },
  'Tien Yi': { meaning: 'Health', good: true, rank: 2, use: 'Sleep with the head toward it; good for bedroom and kitchen stove-knob direction.' },
  'Nien Yen': { meaning: 'Love & Relationships', good: true, rank: 3, use: 'Activate for partnership and family harmony; good for the bed or a couple’s shared space.' },
  'Fu Wei': { meaning: 'Personal Growth & Stability', good: true, rank: 4, use: 'Meditation, study and self-development.' },
  'Ho Hai': { meaning: 'Mishaps & Setbacks', good: false, rank: 5, use: 'Minor bad luck — suitable for storage or a bathroom.' },
  'Wu Kwei': { meaning: 'Five Ghosts — conflict, loss', good: false, rank: 6, use: 'Avoid for the front door and workspace.' },
  'Liu Sha': { meaning: 'Six Killings — legal and relationship trouble', good: false, rank: 7, use: 'Avoid for bedroom and desk.' },
  'Jue Ming': { meaning: 'Total Loss', good: false, rank: 8, use: 'The worst direction; never face it for important work or sleep.' },
};

type D8 = Exclude<Dir, 'C'>;
const T = (sc: D8, ty: D8, ny: D8, fw: D8, hh: D8, wg: D8, ls: D8, jm: D8): Record<Mansion, D8> =>
  ({ 'Sheng Chi': sc, 'Tien Yi': ty, 'Nien Yen': ny, 'Fu Wei': fw, 'Ho Hai': hh, 'Wu Kwei': wg, 'Liu Sha': ls, 'Jue Ming': jm });

export const KUA_TABLE: Record<number, Record<Mansion, D8>> = {
  1: T('SE', 'E', 'S', 'N', 'W', 'NE', 'NW', 'SW'),
  2: T('NE', 'W', 'NW', 'SW', 'E', 'SE', 'S', 'N'),
  3: T('S', 'N', 'SE', 'E', 'SW', 'NW', 'NE', 'W'),
  4: T('N', 'S', 'E', 'SE', 'NW', 'SW', 'W', 'NE'),
  6: T('W', 'NE', 'SW', 'NW', 'SE', 'E', 'N', 'S'),
  7: T('NW', 'SW', 'NE', 'W', 'N', 'S', 'SE', 'E'),
  8: T('SW', 'NW', 'W', 'NE', 'S', 'N', 'E', 'SE'),
  9: T('E', 'SE', 'N', 'S', 'NE', 'W', 'SW', 'NW'),
};
export const KUA_ELEMENT: Record<number, string> = { 1: 'Water', 2: 'Earth', 3: 'Wood', 4: 'Wood', 6: 'Metal', 7: 'Metal', 8: 'Earth', 9: 'Fire' };
export const groupOf = (k: number) => ([1, 3, 4, 9].includes(k) ? 'East' : 'West');

const digitSum = (n: number) => { let s = n; while (s > 9) s = String(s).split('').reduce((a, c) => a + +c, 0); return s; };

/** Kua number from a birth date (Chinese solar year starts ~4 Feb) and sex. Returns null when sex is unspecified. */
export function kuaNumber(date: string, sex: Sex): { kua: number; solarYear: number; steps: string[] } | null {
  if (sex === 'unspecified') return null;
  const [y, m, d] = date.split('-').map(Number);
  const solarYear = m < 2 || (m === 2 && d < 4) ? y - 1 : y;
  const s = digitSum(solarYear);
  let k = sex === 'male' ? 11 - s : 4 + s;
  k = digitSum(((k - 1) % 9 + 9) % 9 + 1);
  const raw = k;
  if (k === 5) k = sex === 'male' ? 2 : 8;
  return {
    kua: k, solarYear,
    steps: [
      `Solar year ${solarYear}${solarYear !== y ? ' (born before Lichun, ~4 Feb)' : ''}.`,
      `Digits of ${solarYear} reduced to ${s}.`,
      sex === 'male' ? `Male: 11 − ${s} → ${raw}.` : `Female: 4 + ${s} → ${raw}.`,
      ...(raw === 5 ? [`Kua 5 has no direction set: ${sex === 'male' ? 'males use 2' : 'females use 8'}.`] : []),
      `Kua ${k} (${KUA_ELEMENT[k]}), ${groupOf(k)} group.`,
    ],
  };
}

export const dirsFor = (kua: number) => (Object.entries(KUA_TABLE[kua]) as [Mansion, D8][]).map(([m, dir]) => ({ mansion: m, dir, ...MANSION_INFO[m] })).sort((a, b) => a.rank - b.rank);
