// Outer-planet transits to April's natal points, 2026–2035.
// Positions are drawn from published ephemerides (Astro.com / Swiss Ephemeris);
// interpretations are written to April's chart specifically — the transiting
// body meets the exact natal degree noted here.

import type { SourceRef } from './compendium';

const SRC: SourceRef = {
  doc: 'Personal Astrological Timeline 1990–2060',
  section: 'V · Outer-Planet Transits · 2026–2035',
  page: 'passim',
};

export interface TransitEvent {
  id: string;
  window: string;             // human date range
  startYear: number;          // for timeline plotting
  endYear: number;
  transiting: string;         // "Pluto"
  aspect: string;             // "conjunct", "square", etc.
  natalPoint: string;         // "North Node · Aquarius 12° H2"
  title: string;
  body: string;
  intensity: 'era-defining' | 'major' | 'notable';
}

export const TRANSITS: TransitEvent[] = [
  {
    id: 'tr-pluto-nn',
    window: '2026 – 2028 (peaks 2026, 2027)',
    startYear: 2026, endYear: 2028,
    transiting: 'Pluto', aspect: 'conjunct', natalPoint: 'North Node · Aquarius 12° H2',
    title: 'Pluto conjunct the North Node — the dharma detonates',
    intensity: 'era-defining',
    body:
      'Pluto in Aquarius makes exact contact with the North Node in H2 (values, resources, self-worth). The soul\'s forward direction is no longer optional. What she has been quietly preparing — the 12th-house material of the age-35 year — is pushed into visibility and asked to become a livelihood. Money, worth, and vocation are transformed at the root. The next decade\'s structure is set here.',
  },
  {
    id: 'tr-neptune-sun',
    window: '2027 – 2029 (peaks 2028)',
    startYear: 2027, endYear: 2029,
    transiting: 'Neptune', aspect: 'square', natalPoint: 'Sun · Virgo 14° H8',
    title: 'Neptune square Sun — dissolving what the Sun thought it was',
    intensity: 'major',
    body:
      'Neptune in Aries perfects the square to the Virgo Sun. Old identifications — perfectionism, over-functioning, the identity built on being useful — soften and lose their grip. This transit rewards mystical practice and punishes over-work. Expect chronic exhaustion if she pushes; expect visions and clarity if she rests.',
  },
  {
    id: 'tr-uranus-moon',
    window: '2026 – 2027 (peaks late 2026)',
    startYear: 2026, endYear: 2027,
    transiting: 'Uranus', aspect: 'conjunct', natalPoint: 'Moon · Aries 6° H3',
    title: 'Uranus conjunct the Moon — the handle of the bucket electrifies',
    intensity: 'era-defining',
    body:
      'The Aries Moon is the Handle of the Bucket chart — the whole chart pours through it. Uranus in Taurus is finishing its long approach; near the end of its Taurus tour it makes the final square, and the ingress into Gemini brings the exact conjunction to the Moon. Emotional life rewires. Voice, siblings, communication (H3) suddenly clarify. What she has been withholding is spoken.',
  },
  {
    id: 'tr-saturn-asc',
    window: 'March 2026 – February 2027',
    startYear: 2026, endYear: 2027,
    transiting: 'Saturn', aspect: 'crossing', natalPoint: 'Ascendant · Sagittarius 29° · into H1',
    title: 'Saturn crosses the Ascendant — a new visible self',
    intensity: 'major',
    body:
      'Saturn in Aries touches the anaretic Ascendant and then enters the 1st house. The body, appearance, and public self are rebuilt with more authority. Weight, hair, wardrobe, posture — many of these change during this transit. It is the physical crystallization of the interior year that came before it.',
  },
  {
    id: 'tr-jupiter-mc',
    window: 'August 2027 – July 2028',
    startYear: 2027, endYear: 2028,
    transiting: 'Jupiter', aspect: 'conjunct', natalPoint: 'Midheaven · Libra 25°',
    title: 'Jupiter conjunct the Midheaven — public elevation',
    intensity: 'major',
    body:
      'Jupiter in Libra reaches the MC. The most reliable career-expansion transit in the standard cycle. Doors open publicly — recognition, invitations, a larger platform. Whatever was excavated in the 12th-house year and named at the North-Node Pluto is now offered outward.',
  },
  {
    id: 'tr-pluto-saturn',
    window: '2029 – 2031',
    startYear: 2029, endYear: 2031,
    transiting: 'Pluto', aspect: 'conjunct', natalPoint: 'Saturn Rx · Capricorn 19° H1',
    title: 'Pluto conjunct natal Saturn — the child sets the bag down',
    intensity: 'era-defining',
    body:
      'Pluto in Aquarius meets the Capricorn Saturn by conjunction (last degrees of Cap / first of Aquarius crossover). The inherited weight — the "five-year-old carrying a bag" (Sabian) — is finally metabolized. Structural, ancestral, karmic material is released. Body-work, ancestral practice, and financial restructuring belong to this window.',
  },
  {
    id: 'tr-uranus-opp',
    window: '2032 – 2034 (age 42)',
    startYear: 2032, endYear: 2034,
    transiting: 'Uranus', aspect: 'opposition', natalPoint: 'natal Uranus · Capricorn 6° H1',
    title: 'Uranus opposition Uranus — the midlife awakening',
    intensity: 'era-defining',
    body:
      'The classic Uranus half-return at age ~42. Everything that was chosen from convention rather than truth begins to visibly crack. For a chart already this individuated, the transit is less rupture and more permission — the last places the false self hides are shown the door.',
  },
  {
    id: 'tr-neptune-asc',
    window: '2033 – 2035',
    startYear: 2033, endYear: 2035,
    transiting: 'Neptune', aspect: 'conjunct', natalPoint: 'Ascendant · Sagittarius 29°',
    title: 'Neptune reaches the Ascendant — the veil lifts on the self',
    intensity: 'major',
    body:
      'Neptune finishes its Aries tour and completes the conjunction to the anaretic Ascendant. Personal boundaries thin. Intuition becomes primary information. This is a mystical arrival — but also a caution against overgiving. The self she meets in the mirror during this window is more transparent than she has ever been.',
  },
  {
    id: 'tr-chiron-return',
    window: '2039 – 2041 (age ~50)',
    startYear: 2039, endYear: 2041,
    transiting: 'Chiron', aspect: 'return', natalPoint: 'natal Chiron · Cancer 12° H7',
    title: 'Chiron Return — the mother wound completes its arc',
    intensity: 'era-defining',
    body:
      'The Chiron Return closes the fifty-year loop opened at birth. Whatever remained of the mother wound, the belonging wound, the partnership wound (all H7 Cancer material) becomes teachable. She becomes a healer for others of exactly this pattern.',
  },
  {
    id: 'tr-saturn-return-2',
    window: '2049 – 2050 (age ~59)',
    startYear: 2049, endYear: 2050,
    transiting: 'Saturn', aspect: 'return', natalPoint: 'natal Saturn · Capricorn 19° H1',
    title: 'Second Saturn Return — the elder is confirmed',
    intensity: 'major',
    body:
      'The 2nd Saturn Return arrives on the H1 Capricorn Saturn. The identity built through Pinnacle 3 (the 4 · builder decade) is tested and confirmed. This is the elder\'s crossing.',
  },
];

export const TRANSITS_SOURCE = SRC;
