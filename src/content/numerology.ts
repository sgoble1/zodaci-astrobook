// Pythagorean numerology derived deterministically from April's birth date
// (September 6, 1990). Every number here is computed, not asserted — the
// formulas are shown on the page so the math is auditable.
//
// Life Path check: 9 + 6 + (1+9+9+0) = 9 + 6 + 19 = 34 → 3+4 = 7 ✓

import type { SourceRef } from './compendium';

const SRC: SourceRef = {
  doc: 'Derived · Pythagorean Numerology',
  section: 'Computed from September 6, 1990',
  page: 'formulas shown inline',
};

export interface CoreNumber {
  id: string;
  label: string;
  value: number;
  formula: string;
  headline: string;
  meaning: string;
  chartLink: string; // how it interlocks with the natal chart
}

export const CORE_NUMBERS: CoreNumber[] = [
  {
    id: 'num-lifepath',
    label: 'Life Path',
    value: 7,
    formula: '9 + 6 + (1+9+9+0) = 9 + 6 + 19 = 34 → 3+4 = 7',
    headline: 'The Seeker · The Mystic · The Analyst',
    meaning:
      'Life Path 7 walks the long inward road. The task is not accumulation but comprehension — to look through the surface of things until the pattern beneath reveals itself. Sevens are researchers, contemplatives, spiritual scientists. Trust arrives slowly, from evidence rather than persuasion. The gift of 7 is discernment; the shadow is isolation and the belief that no one else can meet the depth.',
    chartLink:
      'Perfectly mirrored by Mercury Rx in Virgo H8 (final dispositor · underground mind), Neptune Rx in H1 (interior cathedral), and the 12th-house profection year currently in progress. The whole chart is 7 in its structure.',
  },
  {
    id: 'num-birthday',
    label: 'Birthday',
    value: 6,
    formula: 'Day of birth = 6',
    headline: 'The Nurturer · The Aesthete · The Home-Builder',
    meaning:
      'The Birthday number is the gift you were born already holding. A 6 arrives with an innate sense of beauty, responsibility, and care for others — sometimes overdeveloped. Sixes make homes, make family, make things that soothe. The shadow is over-giving and taking on burdens that were never theirs.',
    chartLink:
      'Sits underneath Venus at Leo 29° H7 (partnership Venus) and the entire Capricorn stellium in H1 (the caretaker who built her own foundation early).',
  },
  {
    id: 'num-expression',
    label: 'Expression / Destiny',
    value: 0,
    formula: 'Full birth-name sum · requires legal name to compute',
    headline: 'To be computed with April\'s full name at birth',
    meaning:
      'The Expression number is calculated from the vowels + consonants of the full name given at birth. It describes the abilities you are here to develop and put into the world. Enter the full birth name in future to derive.',
    chartLink:
      'Will overlay onto the MC in Libra H10 and the Pluto-in-domicile career signature.',
  },
  {
    id: 'num-personality',
    label: 'Personality (First Impression)',
    value: 0,
    formula: 'Consonants of full birth name · requires legal name',
    headline: 'To be computed',
    meaning:
      'What the world meets before it meets you. Traditionally derived from the consonants of the birth name.',
    chartLink:
      'Will overlay onto the Sagittarius Ascendant (29° anaretic) — the philosopher-mask.',
  },
  {
    id: 'num-soulurge',
    label: 'Soul Urge / Heart\'s Desire',
    value: 0,
    formula: 'Vowels of full birth name · requires legal name',
    headline: 'To be computed',
    meaning:
      'The inner motivation — what the soul actually wants. Derived from the vowels of the birth name.',
    chartLink:
      'Will overlay onto Moon in Aries H3 (raw emotional truth) and Chiron in Cancer H7 (the longing for safe belonging).',
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
}

// Pinnacle age boundaries: first ends at 36 - Life Path = 36 - 7 = 29.
// Then each subsequent Pinnacle spans 9 years.
export const PINNACLES: PinnacleOrChallenge[] = [
  { id: 'pin-1', label: '1st Pinnacle', value: 6, ageRange: 'Birth – Age 28',
    formula: 'Month + Day = 9 + 6 = 15 → 6',
    meaning: 'A first arc under the 6 — early responsibility, becoming the caretaker, the aesthete, the one who makes the home. Formative training in giving.' },
  { id: 'pin-2', label: '2nd Pinnacle', value: 7, ageRange: 'Age 29 – 37', active: true,
    formula: 'Day + Year(1) = 6 + 1 = 7',
    meaning:
      'Currently active. The 7 pinnacle is the interior decade — study, retreat, contemplation, spiritual research. Exactly synchronous with the 12th-house profection at 35 and the Saturn-return recovery arc. This is the mystical laboratory phase.' },
  { id: 'pin-3', label: '3rd Pinnacle', value: 4, ageRange: 'Age 38 – 46',
    formula: '1st + 2nd = 6 + 7 = 13 → 4',
    meaning:
      'A building decade. Whatever the 7 uncovered underground, the 4 constructs above ground: real work, real form, real infrastructure. Discipline is the currency.' },
  { id: 'pin-4', label: '4th Pinnacle', value: 1, ageRange: 'Age 47 onward',
    formula: 'Month + Year(1) = 9 + 1 = 10 → 1',
    meaning:
      'A late-life pinnacle of 1 — leadership, originality, standing alone at the front of what she has built. Unusual and generous placement: many people never receive a 1 pinnacle.' },
];

export const CHALLENGES: PinnacleOrChallenge[] = [
  { id: 'ch-1', label: '1st Challenge (early life)', value: 3, ageRange: 'Birth – Age 28',
    formula: '|Month − Day| = |9 − 6| = 3',
    meaning:
      'The 3 challenge: self-expression, being witnessed, using the voice freely without shrinking. Confronts the natural introversion of the 7.' },
  { id: 'ch-2', label: '2nd Challenge (adult life)', value: 5, ageRange: 'Age 29 – 46', active: true,
    formula: '|Day − Year(1)| = |6 − 1| = 5',
    meaning:
      'The 5 challenge: freedom versus commitment, movement versus depth. Active now. The pull between the Sagittarius rising\'s wanderlust and the Capricorn stellium\'s desire to build permanent structures.' },
  { id: 'ch-main', label: 'Main / Lifetime Challenge', value: 2, ageRange: 'All years',
    formula: '|1st − 2nd| = |3 − 5| = 2',
    meaning:
      'The 2 challenge is diplomacy, patience, and the willingness to be a partner rather than an island. The lifetime work is trusting that another person can meet the depth without diluting it.' },
  { id: 'ch-4', label: '4th Challenge (later life)', value: 8, ageRange: 'Age 47 onward',
    formula: '|Month − Year(1)| = |9 − 1| = 8',
    meaning:
      'The 8 challenge: the healthy use of power, money, authority. Learning to receive influence without collapsing under its weight or refusing its arrival.' },
];

// Personal Year for a given calendar year = Month + Day + Year (reduced)
// Sept 6 + Y → 9 + 6 + reduce(Y). September always advances the year at birthday.
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
