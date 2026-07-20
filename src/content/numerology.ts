// Pythagorean numerology derived deterministically from April's birth date
// (September 6, 1990). Every number here is computed, not asserted — the
// formulas are shown on the page so the math is auditable.

import type { SourceRef } from './compendium';
import type { Reasoning } from '@/components/common/ReasoningPanel';

const SRC: SourceRef = {
  doc: 'Derived · Pythagorean Numerology',
  section: 'Computed from September 6, 1990',
  page: 'formulas shown inline',
};

// Master compendium anchors so each core number can also cite a printed page.
const MC = (s: string, p: string): SourceRef => ({ doc: 'Master Astrological Compendium', section: s, page: p });

export interface CoreNumber {
  id: string;
  label: string;
  value: number;
  formula: string;
  headline: string;
  meaning: string;
  chartLink: string;
  reasoning: Reasoning;
  sources: SourceRef[];
}

export const CORE_NUMBERS: CoreNumber[] = [
  {
    id: 'num-lifepath',
    label: 'Life Path',
    value: 7,
    formula: '9 + 6 + (1+9+9+0) = 9 + 6 + 19 = 34 → 3+4 = 7',
    headline: 'The Seeker · The Mystic · The Analyst',
    meaning:
      'Life Path 7 walks the long inward road. The task is not accumulation but comprehension — to look through the surface of things until the pattern beneath reveals itself. Sevens are researchers, contemplatives, spiritual scientists. Trust arrives slowly, from evidence. The gift is discernment; the shadow is isolation.',
    chartLink:
      'Mirrored by Mercury Rx in Virgo H8 (final dispositor · underground mind), Neptune Rx H1 (interior cathedral), and the 12th-house profection year currently in progress.',
    reasoning: {
      inputs: [
        { label: 'Birth month', value: '9' },
        { label: 'Birth day',   value: '6' },
        { label: 'Birth year',  value: '1990 → 1+9+9+0 = 19' },
      ],
      steps: [
        { label: 'Sum reduced parts', detail: '9 + 6 + 19 = 34' },
        { label: 'Reduce until single digit or master number', detail: '3 + 4 = 7' },
        { label: 'Check for master', detail: '7 is not 11/22/33 — final.' },
      ],
      output: 'Life Path = 7',
      confidence: 'confirmed',
    },
    sources: [SRC, MC('Section 6 · Life Path', 'p. 21')],
  },
  {
    id: 'num-birthday',
    label: 'Birthday',
    value: 6,
    formula: 'Day of birth = 6',
    headline: 'The Nurturer · The Aesthete · The Home-Builder',
    meaning:
      'A 6 arrives with an innate sense of beauty, responsibility, and care for others — sometimes overdeveloped. The shadow is over-giving and taking on burdens that were never hers.',
    chartLink: 'Sits underneath Venus at Leo 29° H7 and the Capricorn H1 stellium — the caretaker who built her own foundation early.',
    reasoning: {
      inputs: [{ label: 'Birth day', value: '6' }],
      steps: [{ label: 'Take day, reduce if > 9', detail: '6 is already single digit.' }],
      output: 'Birthday number = 6', confidence: 'confirmed',
    },
    sources: [SRC, MC('Section 6 · Birthday Number', 'p. 22')],
  },
  {
    id: 'num-expression',
    label: 'Expression / Destiny',
    value: 0,
    formula: 'Full birth-name sum · requires legal name to compute',
    headline: "To be computed with April's full name at birth",
    meaning: 'Derived from vowels + consonants of the full legal birth name. Describes the abilities you are here to develop and put into the world.',
    chartLink: 'Will overlay onto the MC in Libra H10 and the Pluto-in-domicile career signature.',
    reasoning: {
      inputs: [{ label: 'Full legal name at birth', value: 'not on file' }],
      steps: [{ label: 'Blocked', detail: 'Cannot compute without the legal name. Upload the birth certificate to derive.' }],
      output: 'Pending — Expression number requires legal name.',
      confidence: 'ambiguous',
      caveats: ['Nickname sums produce meaningfully different results — the calculation must use the legal birth name.'],
    },
    sources: [SRC],
  },
  {
    id: 'num-personality',
    label: 'Personality (First Impression)',
    value: 0,
    formula: 'Consonants of full birth name · requires legal name',
    headline: 'To be computed',
    meaning: 'What the world meets before it meets you. Traditionally derived from the consonants of the birth name.',
    chartLink: 'Will overlay onto the Sagittarius Ascendant (29° anaretic) — the philosopher-mask.',
    reasoning: {
      inputs: [{ label: 'Consonants of legal birth name', value: 'not on file' }],
      steps: [{ label: 'Blocked', detail: 'Sum consonant values, reduce.' }],
      output: 'Pending', confidence: 'ambiguous',
    },
    sources: [SRC],
  },
  {
    id: 'num-soulurge',
    label: "Soul Urge / Heart's Desire",
    value: 0,
    formula: 'Vowels of full birth name · requires legal name',
    headline: 'To be computed',
    meaning: 'The inner motivation — what the soul actually wants.',
    chartLink: 'Will overlay onto Moon in Aries H3 and Chiron in Cancer H7.',
    reasoning: {
      inputs: [{ label: 'Vowels of legal birth name', value: 'not on file' }],
      steps: [{ label: 'Blocked', detail: 'Sum vowel values, reduce.' }],
      output: 'Pending', confidence: 'ambiguous',
    },
    sources: [SRC],
  },
];

export interface PinnacleOrChallenge {
  id: string;
  label: string;
  value: number;
  ageRange: string;
  formula: string;
  meaning: string;
  active?: boolean;
  reasoning: Reasoning;
}

export const PINNACLES: PinnacleOrChallenge[] = [
  { id: 'pin-1', label: '1st Pinnacle', value: 6, ageRange: 'Birth – Age 28',
    formula: 'Month + Day = 9 + 6 = 15 → 6',
    meaning: 'Early responsibility — the caretaker, the aesthete, the one who makes the home. Formative training in giving.',
    reasoning: {
      inputs: [{ label: 'Month', value: '9' }, { label: 'Day', value: '6' }],
      steps: [
        { label: 'Sum', detail: '9 + 6 = 15' },
        { label: 'Reduce', detail: '1 + 5 = 6' },
        { label: 'Age window', detail: '1st Pinnacle ends at (36 − Life Path) = 36 − 7 = 29 → age 0–28.' },
      ],
      output: '1st Pinnacle = 6, ages 0–28.', confidence: 'confirmed',
    } },
  { id: 'pin-2', label: '2nd Pinnacle', value: 7, ageRange: 'Age 29 – 37', active: true,
    formula: 'Day + Year(1) = 6 + 1 = 7',
    meaning: 'Currently active. The 7 pinnacle is the interior decade — study, retreat, spiritual research. Synchronous with the 12th-house profection and the Saturn-return recovery arc.',
    reasoning: {
      inputs: [{ label: 'Day', value: '6' }, { label: 'Reduced year', value: '1+9+9+0=19 → 1' }],
      steps: [{ label: 'Sum', detail: '6 + 1 = 7' }, { label: 'Window', detail: 'Each subsequent pinnacle spans 9 years → ages 29–37.' }],
      output: '2nd Pinnacle = 7, active now.', confidence: 'confirmed',
    } },
  { id: 'pin-3', label: '3rd Pinnacle', value: 4, ageRange: 'Age 38 – 46',
    formula: '1st + 2nd = 6 + 7 = 13 → 4',
    meaning: 'A building decade. What the 7 uncovered underground, the 4 constructs above ground.',
    reasoning: {
      inputs: [{ label: '1st', value: '6' }, { label: '2nd', value: '7' }],
      steps: [{ label: 'Sum', detail: '6 + 7 = 13' }, { label: 'Reduce', detail: '1 + 3 = 4' }],
      output: '3rd Pinnacle = 4, ages 38–46.', confidence: 'confirmed',
    } },
  { id: 'pin-4', label: '4th Pinnacle', value: 1, ageRange: 'Age 47 onward',
    formula: 'Month + Year(1) = 9 + 1 = 10 → 1',
    meaning: 'A late-life pinnacle of 1 — leadership, originality, standing at the front of what she has built.',
    reasoning: {
      inputs: [{ label: 'Month', value: '9' }, { label: 'Reduced year', value: '1' }],
      steps: [{ label: 'Sum', detail: '9 + 1 = 10' }, { label: 'Reduce', detail: '1 + 0 = 1' }],
      output: '4th Pinnacle = 1, ages 47+.', confidence: 'confirmed',
    } },
];

export const CHALLENGES: PinnacleOrChallenge[] = [
  { id: 'ch-1', label: '1st Challenge (early life)', value: 3, ageRange: 'Birth – Age 28',
    formula: '|Month − Day| = |9 − 6| = 3',
    meaning: 'Self-expression, being witnessed, using the voice freely.',
    reasoning: {
      inputs: [{ label: 'Month', value: '9' }, { label: 'Day', value: '6' }],
      steps: [{ label: 'Absolute difference', detail: '|9 − 6| = 3' }],
      output: '1st Challenge = 3.', confidence: 'confirmed',
    } },
  { id: 'ch-2', label: '2nd Challenge (adult life)', value: 5, ageRange: 'Age 29 – 46', active: true,
    formula: '|Day − Year(1)| = |6 − 1| = 5',
    meaning: 'Freedom versus commitment. Active now.',
    reasoning: {
      inputs: [{ label: 'Day', value: '6' }, { label: 'Reduced year', value: '1' }],
      steps: [{ label: 'Absolute difference', detail: '|6 − 1| = 5' }],
      output: '2nd Challenge = 5.', confidence: 'confirmed',
    } },
  { id: 'ch-main', label: 'Main / Lifetime Challenge', value: 2, ageRange: 'All years',
    formula: '|1st − 2nd| = |3 − 5| = 2',
    meaning: 'Diplomacy, patience, partnership over island-ness.',
    reasoning: {
      inputs: [{ label: '1st', value: '3' }, { label: '2nd', value: '5' }],
      steps: [{ label: 'Absolute difference', detail: '|3 − 5| = 2' }],
      output: 'Main Challenge = 2.', confidence: 'confirmed',
    } },
  { id: 'ch-4', label: '4th Challenge (later life)', value: 8, ageRange: 'Age 47 onward',
    formula: '|Month − Year(1)| = |9 − 1| = 8',
    meaning: 'Healthy use of power, money, authority.',
    reasoning: {
      inputs: [{ label: 'Month', value: '9' }, { label: 'Reduced year', value: '1' }],
      steps: [{ label: 'Absolute difference', detail: '|9 − 1| = 8' }],
      output: '4th Challenge = 8.', confidence: 'confirmed',
    } },
];

function reduce(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = n.toString().split('').reduce((s, d) => s + Number(d), 0);
  }
  return n;
}
export function personalYear(year: number): number {
  const y = reduce(String(year).split('').reduce((s, d) => s + Number(d), 0));
  return reduce(9 + 6 + y);
}

export interface PersonalYearEntry { year: number; number: number; theme: string; }

const THEMES: Record<number, string> = {
  1: 'New Beginnings · Seed Year · The world starts over.',
  2: 'Partnership · Patience · Slow relational deepening.',
  3: 'Expression · Visibility · Creative flowering.',
  4: 'Foundation · Work · Building the real thing.',
  5: 'Change · Freedom · Movement and disruption.',
  6: 'Home · Love · Responsibility for what you have made.',
  7: 'Reflection · Inner Wisdom · The spiritual laboratory.',
  8: 'Power · Achievement · Material harvest.',
  9: 'Completion · Release · The end of the arc.',
  11: 'Master Illumination · Spiritual downloads · Fragile intensity.',
  22: 'Master Builder · Vision made material · Enormous scope.',
  33: 'Master Teacher · Sacred service · Rare and demanding.',
};

export const PERSONAL_YEARS: PersonalYearEntry[] = Array.from({ length: 12 }, (_, i) => {
  const year = 2020 + i;
  const n = personalYear(year);
  return { year, number: n, theme: THEMES[n] ?? '—' };
});

export const NUMEROLOGY_SOURCE = SRC;
