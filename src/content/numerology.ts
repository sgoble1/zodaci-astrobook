import { registerPrivateValue } from '@/lib/privateEditionStore';
// Pythagorean numerology derived deterministically from April's birth date
// (recorded birth date). Every number here is computed, not asserted — the
// formulas are shown on the page so the math is auditable.

import type { SourceRef } from './compendium';
import type { Reasoning } from '@/components/common/ReasoningPanel';

const SRC: SourceRef = {
  doc: 'Derived · Pythagorean Numerology',
  section: 'Computed from the recorded birth date',
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

export let CORE_NUMBERS: CoreNumber[] = [];

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

export let PINNACLES: PinnacleOrChallenge[] = [];

export let CHALLENGES: PinnacleOrChallenge[] = [];

function reduce(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = n.toString().split('').reduce((s, d) => s + Number(d), 0);
  }
  return n;
}
const MONTHS = ['january','february','march','april','may','june','july','august','september','october','november','december'];
export function personalYear(year: number, birthDate?: string): number {
  const y = reduce(String(year).split('').reduce((s, d) => s + Number(d), 0));
  const date = birthDate ?? BIRTH.date;
  const m = date.match(/([A-Za-z]+)\s+(\d{1,2})/);
  if (!m) return 0;
  const month = MONTHS.indexOf(m[1].toLowerCase()) + 1;
  const day = Number(m[2]);
  if (!month || !day) return 0;
  return reduce(reduce(month) + reduce(day) + y);
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

export let PERSONAL_YEARS: PersonalYearEntry[] = [];

export let NUMEROLOGY_SOURCE: SourceRef = {"doc":"","section":"","page":""};

registerPrivateValue("numerology", "CORE_NUMBERS", value => { CORE_NUMBERS = value as typeof CORE_NUMBERS; }, []);
registerPrivateValue("numerology", "PINNACLES", value => { PINNACLES = value as typeof PINNACLES; }, []);
registerPrivateValue("numerology", "CHALLENGES", value => { CHALLENGES = value as typeof CHALLENGES; }, []);
registerPrivateValue("numerology", "PERSONAL_YEARS", value => { PERSONAL_YEARS = value as typeof PERSONAL_YEARS; }, []);
registerPrivateValue("numerology", "NUMEROLOGY_SOURCE", value => { NUMEROLOGY_SOURCE = value as typeof NUMEROLOGY_SOURCE; }, {"doc":"","section":"","page":""});
