// Outer-planet transits to April's natal points, 2026–2040.
// Interpretations sourced from the Personal Astrological Timeline PDF;
// each event carries a `reasoning` panel showing which natal degree the
// transit meets and why it lands in the stated window.

import type { SourceRef } from './compendium';
import type { Reasoning } from '@/components/common/ReasoningPanel';

const SRC: SourceRef = {
  doc: 'Personal Astrological Timeline 1990–2060',
  section: 'V · Outer-Planet Transits',
  page: 'passim',
};

const TL = (section: string, page: string): SourceRef =>
  ({ doc: 'Personal Astrological Timeline 1990–2060', section, page });

export interface TransitEvent {
  id: string;
  window: string;
  startYear: number;
  endYear: number;
  transiting: string;
  aspect: string;
  natalPoint: string;
  title: string;
  body: string;
  intensity: 'era-defining' | 'major' | 'notable';
  reasoning: Reasoning;
  sources: SourceRef[];
}

const orb = (deg: string) => ({ label: 'Orb applied', value: `≤ ${deg}` });

export const TRANSITS: TransitEvent[] = [
  {
    id: 'tr-pluto-nn',
    window: '2026 – 2028 (peaks 2026, 2027)',
    startYear: 2026, endYear: 2028,
    transiting: 'Pluto', aspect: 'conjunct', natalPoint: 'North Node · Aquarius 5°17′ H1',
    title: 'Pluto conjunct the North Node — the dharma detonates',
    intensity: 'era-defining',
    body:
      "Pluto in Aquarius makes exact contact with the North Node. The soul's forward direction is no longer optional. What has been quietly prepared in the 12th-house year is pushed into visibility and asked to become a livelihood. Money, worth, and vocation are transformed at the root.",
    reasoning: {
      inputs: [
        { label: 'Transiting body', value: 'Pluto in Aquarius' },
        { label: 'Natal point',     value: 'North Node · 5°17′ Aquarius · H1' },
        orb('3°'),
      ],
      steps: [
        { label: 'Ingress', detail: 'Pluto enters Aquarius definitively Jan 2024; retrogrades in/out until settled 2024–2025.' },
        { label: 'Approach', detail: 'By 6 Sept 2026, Pluto sits ~2–3° Aquarius, within 2–3° of NN 5°17′.' },
        { label: 'Perfection window', detail: 'Direct/retrograde passes 2026–2028 make three exact conjunctions.' },
      ],
      output: 'Peaks in 2026 and 2027, with an era-defining window 2026–2028.',
      confidence: 'derived',
    },
    sources: [TL('V · Pluto conjunct North Node', 'pp. 88–94'), { doc: 'Supplementary Volume II', section: '6 · SR · Pluto → NN', page: 'p. 31' }],
  },
  {
    id: 'tr-neptune-sun',
    window: '2027 – 2029 (peaks 2028)',
    startYear: 2027, endYear: 2029,
    transiting: 'Neptune', aspect: 'square', natalPoint: 'Sun · Virgo 13°56′ H8',
    title: 'Neptune square Sun — dissolving what the Sun thought it was',
    intensity: 'major',
    body:
      'Neptune in Aries perfects the square to the Virgo Sun. Perfectionism and over-functioning lose their grip. Rewards mystical practice; punishes over-work.',
    reasoning: {
      inputs: [
        { label: 'Transiting', value: 'Neptune in Aries' },
        { label: 'Natal Sun',  value: '13°56′ Virgo H8' },
        orb('2°'),
      ],
      steps: [
        { label: 'Aspect geometry', detail: 'Aries → Virgo forms a waxing square (~90°) at matching degrees.' },
        { label: 'Peak passes', detail: 'Neptune stations near 14° Aries in 2028, generating three exact squares.' },
      ],
      output: 'Major transit window 2027–2029, three-pass square.',
      confidence: 'derived',
    },
    sources: [TL('V · Neptune square Sun', 'pp. 96–101')],
  },
  {
    id: 'tr-uranus-moon',
    window: '2026 – 2027 (peaks late 2026)',
    startYear: 2026, endYear: 2027,
    transiting: 'Uranus', aspect: 'conjunct', natalPoint: 'Moon · Aries 6°37′ H3',
    title: 'Uranus conjunct the Moon — the handle of the bucket electrifies',
    intensity: 'era-defining',
    body:
      'Uranus in Gemini finishes its long approach and makes the exact conjunction to the Moon after ingress. Emotional life rewires. Voice, siblings, communication clarify. What she has been withholding is spoken.',
    reasoning: {
      inputs: [
        { label: 'Transiting', value: 'Uranus (ingress Gemini 2025–2026)' },
        { label: 'Natal Moon', value: '6°37′ Aries H3' },
        orb('3°'),
      ],
      steps: [
        { label: 'Ingress', detail: 'Uranus completes Taurus tour and enters Gemini definitively 2026.' },
        { label: 'Aspect', detail: 'A Gemini-Aries sextile becomes exact as Uranus crosses 6°–7° Gemini vs natal Moon Aries 6°37′.' },
      ],
      output: 'Peak late-2026 into 2027.',
      confidence: 'derived',
      caveats: ['This is a sextile in the strict sense — labelled "conjunct" here per the source PDF because it activates the bucket-handle Moon directly.'],
    },
    sources: [TL('V · Uranus on the Bucket Handle', 'pp. 102–107')],
  },
  {
    id: 'tr-saturn-asc',
    window: 'March 2026 – February 2027',
    startYear: 2026, endYear: 2027,
    transiting: 'Saturn', aspect: 'crossing', natalPoint: 'Ascendant · Sagittarius 29°28′ · into H1',
    title: 'Saturn crosses the Ascendant — a new visible self',
    intensity: 'major',
    body:
      'Saturn in Aries touches the anaretic Ascendant and then enters the 1st house. Body, appearance, posture rebuilt with more authority. The physical crystallization of the interior year.',
    reasoning: {
      inputs: [
        { label: 'Transiting', value: 'Saturn in Aries' },
        { label: 'ASC',        value: '29°28′ Sagittarius (anaretic)' },
        orb('2°'),
      ],
      steps: [
        { label: 'Saturn ingress Aries', detail: 'Late May 2025, then retrograde back to Pisces; definitive re-entry Feb 2026.' },
        { label: 'ASC crossing', detail: 'Saturn moves through 0°–3° Aries, activating the anaretic Sag ASC by the 12th-to-1st crossing.' },
      ],
      output: 'Crossing window Mar 2026 – Feb 2027.',
      confidence: 'approximate',
      caveats: ['Depends on the 3:38 PM ASC assumption. If birth time were earlier, the ASC and this crossing shift substantially.'],
    },
    sources: [TL('V · Saturn on ASC', 'pp. 108–112'), { doc: 'Supplementary Volume II', section: '6 · SR · Saturn on Moon', page: 'p. 30' }],
  },
  {
    id: 'tr-jupiter-mc',
    window: 'August 2027 – July 2028',
    startYear: 2027, endYear: 2028,
    transiting: 'Jupiter', aspect: 'conjunct', natalPoint: 'Midheaven · Libra 24°59′ (source-reported)',
    title: 'Jupiter conjunct the Midheaven — public elevation',
    intensity: 'major',
    body: 'The most reliable career-expansion transit. Doors open publicly. What was excavated in the 12th-house year is offered outward.',
    reasoning: {
      inputs: [
        { label: 'Transiting', value: 'Jupiter in Libra' },
        { label: 'MC',         value: '24°59′ Libra in April’s source report (angle depends on birth time)' },
        orb('3°'),
      ],
      steps: [{ label: 'Jupiter enters Libra', detail: 'Aug 2027; exact conjunction to MC by mid-late 2027.' }],
      output: 'Career expansion window Aug 2027 – Jul 2028.',
      confidence: 'approximate',
      caveats: ['Angle-dependent — 11:14 AM vs 3:38 PM birth time shifts MC by many degrees.'],
    },
    sources: [TL('V · Jupiter on MC', 'pp. 113–116')],
  },
  {
    id: 'tr-pluto-saturn',
    window: '2029 – 2031',
    startYear: 2029, endYear: 2031,
    transiting: 'Pluto', aspect: 'conjunct', natalPoint: 'Saturn Rx · Capricorn 18°55′ H1',
    title: 'Pluto conjunct natal Saturn — the child sets the bag down',
    intensity: 'era-defining',
    body: "The symbolic weight of the 'five-year-old carrying a bag' is reconsidered: obligations, self-imposed standards and financial structures may be rebuilt or released. The chart does not identify a family source for that weight.",
    reasoning: {
      inputs: [
        { label: 'Transiting', value: 'Pluto in Aquarius' },
        { label: 'Natal Saturn', value: 'Cap 18°55′' },
      ],
      steps: [{ label: 'Note', detail: 'Pluto never actually returns to late Capricorn after 2024, but by antiscia/parallel it activates natal Saturn deeply during 2029–2031.' }],
      output: 'Deep multi-year release 2029–2031.',
      confidence: 'approximate',
      caveats: ['Interpretive contact — Pluto does not form a Ptolemaic conjunction to Cap Saturn from Aquarius; the PDF reads this as a "long shadow" activation.'],
    },
    sources: [TL('V · Pluto → natal Saturn', 'pp. 117–121')],
  },
  {
    id: 'tr-uranus-opp',
    window: '2032 – 2034 (age 42)',
    startYear: 2032, endYear: 2034,
    transiting: 'Uranus', aspect: 'opposition', natalPoint: 'natal Uranus · Capricorn 5°37′ H1',
    title: 'Uranus opposition Uranus — the midlife awakening',
    intensity: 'era-defining',
    body: 'The classic Uranus half-return at age ~42. For a chart already this individuated, the transit is permission — the last places the false self hides are shown the door.',
    reasoning: {
      inputs: [{ label: 'Uranus half-cycle', value: '~42 years' }],
      steps: [{ label: 'Compute', detail: '1990 + 42 = 2032; ±2 years for retrograde passes.' }],
      output: 'Universal Uranus opposition, ages ~42.',
      confidence: 'confirmed',
    },
    sources: [TL('V · Uranus Opposition', 'pp. 122–126')],
  },
  {
    id: 'tr-neptune-asc',
    window: '2033 – 2035',
    startYear: 2033, endYear: 2035,
    transiting: 'Neptune', aspect: 'conjunct', natalPoint: 'Ascendant · Sagittarius 29°28′',
    title: 'Neptune reaches the Ascendant — the veil lifts on the self',
    intensity: 'major',
    body: 'Personal boundaries thin. Intuition becomes primary information. A mystical arrival — with a caution against overgiving.',
    reasoning: {
      inputs: [{ label: 'Transiting', value: 'Neptune completing Aries tour' }, { label: 'ASC', value: '29°28′ Sag' }],
      steps: [{ label: 'Neptune ingress Aries', detail: 'Confirmed 2026; exact conjunction to 29°28′ ASC by late Aries → 0° Taurus passes 2033–2035.' }],
      output: 'ASC conjunction 2033–2035.',
      confidence: 'approximate',
      caveats: ['Angle-dependent (birth-time sensitivity).'],
    },
    sources: [TL('V · Neptune on ASC', 'pp. 127–130')],
  },
  {
    id: 'tr-chiron-return',
    window: '2039 – 2041 (age ~50)',
    startYear: 2039, endYear: 2041,
    transiting: 'Chiron', aspect: 'return', natalPoint: 'natal Chiron · Cancer 24°30′ H7',
    title: 'Chiron Return — the mother wound completes its arc',
    intensity: 'era-defining',
    body: 'The 50-year Chiron loop closes. What remained of the mother/belonging wound becomes teachable. She becomes a healer for others of exactly this pattern.',
    reasoning: {
      inputs: [{ label: 'Chiron cycle', value: '~50 years, irregular' }],
      steps: [{ label: 'Compute', detail: '1990 + 50 = 2040; three-pass window 2039–2041.' }],
      output: 'Chiron return window 2039–2041.',
      confidence: 'confirmed',
    },
    sources: [TL('V · Chiron Return', 'pp. 131–135')],
  },
  {
    id: 'tr-saturn-return-2',
    window: '2049 – 2050 (age ~59)',
    startYear: 2049, endYear: 2050,
    transiting: 'Saturn', aspect: 'return', natalPoint: 'natal Saturn · Capricorn 18°55′ H1',
    title: 'Second Saturn Return — the elder is confirmed',
    intensity: 'major',
    body: 'The identity built through the 4-Pinnacle "builder decade" is tested and confirmed. The elder\'s crossing.',
    reasoning: {
      inputs: [{ label: 'Saturn cycle', value: '~29.5 years' }],
      steps: [{ label: 'Compute', detail: '1990 + (29.5 × 2) ≈ 2049.' }],
      output: '2nd Saturn Return 2049–2050.', confidence: 'confirmed',
    },
    sources: [TL('V · Second Saturn Return', 'pp. 136–140')],
  },
];

export const TRANSITS_SOURCE = SRC;
