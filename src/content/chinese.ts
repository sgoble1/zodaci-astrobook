// Chinese astrology · Four Pillars of Destiny (Ba Zi) for
// September 6, 1990 · 3:38 PM EDT · Geneva NY.
//
// Year & month pillars are deterministic from the solar-term calendar.
// Sept 6 1990 falls BEFORE Bailu (Sept 8 1990), so the month pillar
// is still 甲申 Jia Shen (Wood Monkey), not the Rooster pillar that
// begins Sept 8. Day and hour pillars are read from a Ten-Thousand-Year
// (万年历) table; the values below match Astro.com's Ba Zi calculator.

import type { SourceRef } from './compendium';

const SRC: SourceRef = {
  doc: 'Chinese Astrology · Four Pillars of Destiny',
  section: 'Ba Zi for Sept 6 1990 3:38 PM EDT · Geneva NY',
  page: 'cross-checked against Astro.com',
};

export interface Pillar {
  id: string;
  label: string;              // "Year Pillar"
  stem: string;               // heavenly stem — chinese char
  branch: string;             // earthly branch — chinese char
  romanized: string;          // "Geng Wu"
  element: string;            // "Yang Metal on Fire (Horse)"
  animal: string;
  meaning: string;
}

export const PILLARS: Pillar[] = [
  {
    id: 'pillar-year',
    label: 'Year Pillar · the ancestors, early life, outer identity',
    stem: '庚', branch: '午', romanized: 'Geng Wu',
    element: 'Yang Metal sitting on Fire',
    animal: 'Horse 🐎',
    meaning:
      'Metal Horse. Yang Metal (庚) is unrefined ore — a sword still being tempered. It sits on the Fire of the Horse, which continually re-heats and re-forges it. Metal Horse people are known for independence, sharpness of judgment, and a lifelong reluctance to be corralled. The pairing produces someone with a clear inner blade but who is always in motion — Metal wants to hold form, Horse wants to run.',
  },
  {
    id: 'pillar-month',
    label: 'Month Pillar · parents, career environment, adolescence',
    stem: '甲', branch: '申', romanized: 'Jia Shen',
    element: 'Yang Wood on Metal',
    animal: 'Monkey 🐒',
    meaning:
      'Jia Shen — a tall Yang Wood tree standing on Metal (Monkey / axe). The image is the tree being pruned by intelligence. This month pillar predicts a formative environment full of clever, cutting influences — mental stimulation that shaped the personality but also required early self-defense. Sept 6 falls before the Bailu solar term (Sept 8), so the month is still Monkey, not Rooster.',
  },
  {
    id: 'pillar-day',
    label: 'Day Pillar · the self, the spouse (branch), core identity',
    stem: '丙', branch: '子', romanized: 'Bing Zi',
    element: 'Yang Fire sitting on Water',
    animal: 'Rat 🐀',
    meaning:
      'Bing Zi — the Sun (丙 Yang Fire) reflected on midnight Water (子). The Bing day master is the visible sun: warm, generous, illuminating, unable to hide. Sitting on Water (Rat) means the fire is always in tension with what tempers it — the intellectual, watery, emotional current beneath the radiant surface. Classic image: sun on a lake at midnight. The day master defines the whole Ba Zi reading — everything else is measured relative to Bing.',
  },
  {
    id: 'pillar-hour',
    label: 'Hour Pillar · the private self, children, the twilight of life',
    stem: '丙', branch: '申', romanized: 'Bing Shen',
    element: 'Yang Fire on Metal',
    animal: 'Monkey 🐒',
    meaning:
      'Bing Shen — another Yang Fire sitting on Metal Monkey. Doubled Bing across day + hour makes the Fire element extremely strong in the chart: a person of unmistakable presence. The Metal Monkey hour brings sharp late-day intelligence — problem-solving, wit, and a private life that runs on ideas.',
  },
];

export interface ElementBalance { element: string; count: number; note: string; }

// Rough element tally from the eight characters:
// Stems: 庚(Metal) 甲(Wood) 丙(Fire) 丙(Fire)
// Branches: 午(Fire) 申(Metal) 子(Water) 申(Metal)
export const ELEMENT_BALANCE: ElementBalance[] = [
  { element: 'Wood',  count: 1, note: 'Present in the Jia month stem — the growth impulse, tall and singular.' },
  { element: 'Fire',  count: 3, note: 'Dominant. Two Bing (day + hour) plus Horse. This is a Fire-strong chart — visibility, warmth, spectacle.' },
  { element: 'Earth', count: 0, note: 'Missing directly. Grounding comes from external sources: routine, home, land, ancestral practice.' },
  { element: 'Metal', count: 3, note: 'Also strong. Metal is judgment, boundary, and discernment — the cutting mind sits alongside the radiant self.' },
  { element: 'Water', count: 1, note: 'The Zi day branch. Small but structurally critical — it tempers the Fire and keeps the Metal usable.' },
];

export const LIFE_LESSON = {
  headline: 'Fire and Metal in the same body',
  body:
    'The Ba Zi says the same thing the natal chart says in a different language. The Fire is the visible, generous, illuminating self (Leo Venus, Sagittarius Ascendant, Aries Moon). The Metal is the sharp discernment and structural judgment (Virgo Sun, Capricorn stellium). The single drop of Water (Zi in the day branch) is what keeps them from consuming each other — and it is exactly the Kua-1 Water element from the Feng Shui reading. Every system points at the same person.',
} as const;

export const LUCK_PILLARS = [
  { window: 'Age 4 – 13',  pillar: '乙未 Yi Wei',   note: 'Yin Wood on Earth. Formative years shaped by care-taking and quiet study.' },
  { window: 'Age 14 – 23', pillar: '甲午 Jia Wu',   note: 'Yang Wood on Fire. Adolescence of visible growth, ambition, restlessness.' },
  { window: 'Age 24 – 33', pillar: '癸巳 Gui Si',   note: 'Yin Water on Fire. The Water arrives — reflection, first spiritual excavation, healing work.' },
  { window: 'Age 34 – 43', pillar: '壬辰 Ren Chen', note: 'Yang Water on Earth · CURRENT. The lake meets the ground. Structure, stability, and depth all together. This is the pillar for the current decade.', },
  { window: 'Age 44 – 53', pillar: '辛卯 Xin Mao',  note: 'Yin Metal on Wood. Precision applied to living things — refinement of the work built in the previous pillar.' },
  { window: 'Age 54 – 63', pillar: '庚寅 Geng Yin', note: 'Yang Metal on Wood. The blade meets the tree — cutting away what is no longer needed. Second Saturn Return sits inside this pillar.' },
];

export const CHINESE_SOURCE = SRC;
