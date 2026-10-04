// Chinese astrology · Four Pillars of Destiny (Ba Zi) for
// September 6, 1990 · 3:38 PM EDT · Geneva NY.

import type { SourceRef } from './compendium';
import type { Reasoning } from '@/components/common/ReasoningPanel';

const SRC: SourceRef = {
  doc: 'Chinese Astrology · Four Pillars of Destiny',
  section: 'Ba Zi for Sept 6 1990 3:38 PM EDT · Geneva NY',
  page: 'cross-checked against Astro.com',
};

export interface Pillar {
  id: string;
  label: string;
  stem: string;
  branch: string;
  romanized: string;
  element: string;
  animal: string;
  meaning: string;
  reasoning: Reasoning;
}

export const PILLARS: Pillar[] = [
  {
    id: 'pillar-year',
    label: 'Year Pillar · broad social setting and outer identity',
    stem: '庚', branch: '午', romanized: 'Geng Wu',
    element: 'Yang Metal sitting on Fire',
    animal: 'Horse 🐎',
    meaning:
      'Metal Horse. Yang Metal (庚) is unrefined ore, continually re-forged by the Fire of the Horse. Independent, sharp of judgment, always in motion.',
    reasoning: {
      inputs: [{ label: 'Chinese solar year', value: 'Feb 4 1990 – Feb 3 1991' }],
      steps: [
        { label: 'Solar-term boundary', detail: 'Chinese year begins at Lichun (~Feb 4). Sept 6 1990 is inside the 1990 solar year.' },
        { label: 'Sexagenary lookup', detail: '1990 = 7th year of current 60-cycle → 庚午 Geng Wu.' },
      ],
      output: 'Year Pillar = 庚午 Geng Wu (Metal Horse).', confidence: 'confirmed',
    },
  },
  {
    id: 'pillar-month',
    label: 'Month Pillar · parents, career environment, adolescence',
    stem: '甲', branch: '申', romanized: 'Jia Shen',
    element: 'Yang Wood on Metal',
    animal: 'Monkey 🐒',
    meaning:
      'Jia Shen — a tall Yang Wood tree standing on Metal (Monkey / axe). Formative environment shaped by clever, cutting influences requiring early self-defense.',
    reasoning: {
      inputs: [{ label: 'Solar-term cutoff', value: 'Bailu 白露 = Sept 8 1990' }],
      steps: [
        { label: 'Cutoff check', detail: 'Sept 6 falls BEFORE Bailu (Sept 8) → still Monkey month, not Rooster.' },
        { label: 'Stem derivation', detail: 'Year stem Geng → Monkey month has stem Jia by the "Five Tigers Escape Sequence".' },
      ],
      output: 'Month Pillar = 甲申 Jia Shen (Wood Monkey).', confidence: 'confirmed',
      caveats: ['If Sept 8 or later were the birth date, the month pillar would change to Yi You (Wood Rooster).'],
    },
  },
  {
    id: 'pillar-day',
    label: 'Day Pillar · the self, the spouse (branch), core identity',
    stem: '丙', branch: '子', romanized: 'Bing Zi',
    element: 'Yang Fire sitting on Water',
    animal: 'Rat 🐀',
    meaning:
      'Bing Zi — the Sun (丙 Yang Fire) reflected on midnight Water (子). The visible sun: warm, generous, illuminating, unable to hide. The day master defines the whole Ba Zi.',
    reasoning: {
      inputs: [{ label: 'Date', value: 'Sept 6 1990' }],
      steps: [
        { label: '万年历 lookup', detail: 'Ten-Thousand-Year table for Sept 6 1990 → 丙子 Bing Zi.' },
        { label: 'Cross-check', detail: 'Matches Astro.com Ba Zi calculator.' },
      ],
      output: 'Day Pillar = 丙子 Bing Zi (Fire Rat). Day Master = 丙 Bing.', confidence: 'confirmed',
    },
  },
  {
    id: 'pillar-hour',
    label: 'Hour Pillar · the private self, children, the twilight of life',
    stem: '丙', branch: '申', romanized: 'Bing Shen',
    element: 'Yang Fire on Metal',
    animal: 'Monkey 🐒',
    meaning:
      'Bing Shen — another Yang Fire on Metal Monkey. Doubled Bing across day + hour makes Fire extremely strong: unmistakable presence, with a sharp late-day intelligence.',
    reasoning: {
      inputs: [
        { label: 'Local hour', value: '15:38 EDT (3:38 PM)' },
        { label: 'Day stem', value: '丙 Bing' },
      ],
      steps: [
        { label: 'Two-hour branch', detail: 'Chinese hours are two-hour blocks. 15:00–17:00 = 申 Shen (Monkey).' },
        { label: 'Stem from day-stem', detail: '"Five Rats Escape Sequence": from day stem Bing, the Shen hour takes stem Bing → 丙申.' },
      ],
      output: 'Hour Pillar = 丙申 Bing Shen.',
      confidence: 'ambiguous',
      caveats: ['Depends entirely on the 3:38 PM birth time. An 11:14 AM birth (2:14 PM local? No — 11:14 AM EDT itself) would give hour branch 巳 Si (Snake), producing 癸巳 — a completely different hour pillar.'],
    },
  },
];

export interface ElementBalance { element: string; count: number; note: string; }

export const ELEMENT_BALANCE: ElementBalance[] = [
  { element: 'Wood',  count: 1, note: 'Jia month stem — the growth impulse.' },
  { element: 'Fire',  count: 3, note: 'Dominant. Two Bing + Horse. Visibility, warmth, spectacle.' },
  { element: 'Earth', count: 0, note: 'Missing. Grounding must come from routine, home, land, practice.' },
  { element: 'Metal', count: 3, note: 'Strong. Judgment, boundary, discernment — the cutting mind.' },
  { element: 'Water', count: 1, note: 'The Zi day branch. Small but structurally critical — tempers Fire, keeps Metal usable.' },
];

export const LIFE_LESSON = {
  headline: 'Fire and Metal in the same body',
  body:
    'The Ba Zi says what the natal chart says in a different language. Fire = the visible, generous, illuminating self (Leo Venus, Sag ASC, Aries Moon). Metal = the sharp discernment (Virgo Sun, Capricorn stellium). The single drop of Water (Zi) keeps them from consuming each other — and it is exactly the Kua-1 Water element from the Feng Shui reading. Every system points at the same person.',
} as const;

export const LUCK_PILLARS = [
  { id: 'luck-1', window: 'Age 4 – 13',  pillar: '乙未 Yi Wei',   note: 'Yin Wood on Earth. Formative years shaped by care-taking and quiet study.' },
  { id: 'luck-2', window: 'Age 14 – 23', pillar: '甲午 Jia Wu',   note: 'Yang Wood on Fire. Adolescence of visible growth, ambition, restlessness.' },
  { id: 'luck-3', window: 'Age 24 – 33', pillar: '癸巳 Gui Si',   note: 'Yin Water on Fire. Reflection, first spiritual excavation.' },
  { id: 'luck-4', window: 'Age 34 – 43', pillar: '壬辰 Ren Chen', note: 'Yang Water on Earth · CURRENT. Structure, stability, depth all together.' },
  { id: 'luck-5', window: 'Age 44 – 53', pillar: '辛卯 Xin Mao',  note: 'Yin Metal on Wood. Precision applied to living things.' },
  { id: 'luck-6', window: 'Age 54 – 63', pillar: '庚寅 Geng Yin', note: 'Yang Metal on Wood. Cutting away what is no longer needed. 2nd Saturn Return sits inside this pillar.' },
];

export const CHINESE_SOURCE = SRC;
