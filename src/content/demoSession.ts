import { SAMPLE_EDITION, type EditionPage } from './sampleEdition';
import { COVER_SAMPLES } from './coverSamples';
import { computeChart } from '@/lib/astro';
import type { Tone } from '@/lib/perception';
import type { Tier } from '@/lib/plans';

export const DEMO_TABS = [
  { id: 'wheel', label: 'Natal Wheel' },
  { id: 'placements', label: 'Placements & Houses' },
  { id: 'transits', label: 'Transits & Horoscope' },
  { id: 'edition', label: 'Shane’s Edition' },
  { id: 'synastry', label: 'Synastry' },
] as const;
export type DemoTab = typeof DEMO_TABS[number]['id'];
export const demoAllows = (tier: Tier, feature: 'overview' | 'chapters' | 'transits' | 'audio' | 'tone' | 'synastry') => feature === 'overview' || tier !== 'free';

/** Only public, fictional cover readers can be chosen as the second chart. */
export function demoPartner(id: string) {
  const reader = COVER_SAMPLES.find(s => s.id === id && s.id !== 'collector');
  if (!reader) throw new Error('Choose a fictional sample partner.');
  return { reader, chart: computeChart({ ...reader.birth, placeSource: 'geocoded', houseSystem: 'placidus' }) };
}

/** Curated tone variants retain the same compound measurements; no AI or private source text. */
export function demoChapter(page: EditionPage, tone: Tone): string[] {
  if (tone === 'oracle') return page.body;
  const measurements = page.facts.map(f => `${f.label}: ${f.value}.`).join(' ');
  const specific = SAMPLE_EDITION.pages.indexOf(page);
  const readings = [
    {
      educational: 'Read these factors together, not as separate labels. The Ascendant describes the approach to the world; a Sun only 0.3° away makes identity unusually visible. Its position just inside house 12 adds a need for privacy. Venus, the Ascendant ruler, then connects that steady exterior to more immediate Aries choices. Pluto is in house 6, not house 7: proximity to the Descendant is a distinct factor, not permission to change its house.',
      professional: 'Synthesis: prominent solar identity at the Ascendant with a house-12 emphasis. Taurus presentation is moderated by an Aries chart ruler. Pluto’s opposition to the Ascendant brings relationship symbolism into a configuration originating in house 6. Treat visibility, privacy and relational intensity as concurrent themes; no personal history is established.',
    },
    {
      educational: 'House 12 holds four planets, so the private-work theme repeats across several functions. Venus rules the Taurus Ascendant but occupies Aries, where traditional dignity calls it in detriment. This is a technical relationship between signs, not a judgment of character. Its conjunction with Jupiter and proximity to the North Node link affection and growth; Mercury’s near-exact trine to Neptune adds a separate imagination-to-form pathway.',
      professional: 'Synthesis: house-12 concentration; chart ruler Venus in detriment, conjunct Jupiter and near the North Node. Mercury–Neptune is the tightest listed aspect. Private creative work, direct values and expansive affection are interpretive themes supported by multiple factors, not independent personality claims or guaranteed outcomes.',
    },
    {
      educational: 'The Moon’s domicile in Cancer describes how the emotional function is expressed; house 3 describes its arena of daily conversation and learning. Sextiles to the Sun and Ascendant connect feelings with identity and presentation. Squares to Venus and Jupiter add a competing pull toward immediate Aries choices. That tension is not proof of a particular event or upbringing.',
      professional: 'Synthesis: domiciled Cancer Moon in house 3; close sextiles to Sun and Ascendant, close squares to Venus and Jupiter. Emotional continuity and verbal processing coexist with a more immediate affiliative impulse. A useful reflection is how ordinary conversations help negotiate the safety–adventure tension. Biography remains unknown.',
    },
  ];
  const variant = readings[specific];
  return [measurements, variant?.[tone] ?? page.body.join('\n\n')];
}