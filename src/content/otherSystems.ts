import type { LucideIcon } from 'lucide-react';
import { CircleDot, Compass, Feather, Grid3X3, Layers3, Sparkles, Trees } from 'lucide-react';

export type OtherSystem = {
  slug: string;
  name: string;
  tradition: string;
  icon: LucideIcon;
  result: string;
  calculation: string;
  themes: string[];
  interpretation: string[];
  caution: string;
};

export const OTHER_SYSTEMS: OtherSystem[] = [
  {
    slug: 'vedic', name: 'Vedic · Jyotish', tradition: 'India', icon: Compass,
    result: 'Sidereal Leo Sun · Pisces Moon · Sagittarius rising',
    calculation: 'April’s tropical longitudes are shifted by an approximate 23°43′ Lahiri ayanāṃśa for 1990. Houses remain tied to her recorded birth time and place.',
    themes: ['discernment', 'independence', 'meaning'],
    interpretation: [
      'The sidereal Leo Sun emphasizes warm sovereignty and visible creative integrity beneath April’s careful Virgo presentation.',
      'The Pisces Moon reframes emotional speed as sensitivity: quick reactions can be a protective surface over a highly permeable inner life.',
      'Sagittarius rising remains, reinforcing candour, learning, travel of mind, and the need for a life directed toward meaning.'
    ], caution: 'This is a Lahiri-style sidereal comparison, not a full daśā or divisional-chart consultation.'
  },
  {
    slug: 'mayan-tzolkin', name: 'Maya · Tzolk’in', tradition: 'Mesoamerica', icon: CircleDot,
    result: 'Birth-day cycle: 13 Etz’nab’',
    calculation: 'Using the proleptic Gregorian date and the widely used GMT 584283 correlation, the 260-day ritual cycle resolves to tone 13 with the Etz’nab’ day sign.',
    themes: ['beginnings', 'instinct', 'nurture'],
    interpretation: [
      'Etz’nab’ is associated with flint, clarity, reflection, and the capacity to cut through confusion.',
      'Tone thirteen is often read as completion and transition: insight becomes a threshold into the next cycle.',
      'The overlap with April’s chart is discernment—the Virgo impulse to separate what is useful and true from what is not.'
    ], caution: 'Calendar correlations and modern interpretations vary; this is a cultural calendar lens, not a personality diagnosis.'
  },
  {
    slug: 'tibetan-mewa', name: 'Tibetan Mewa & Parkha', tradition: 'Tibet and Himalayan astrology', icon: Grid3X3,
    result: 'White 1 Mewa · Water emphasis',
    calculation: 'The birth-year cycle is reduced through the traditional nine-number sequence; April’s 1990 birth resolves to Mewa 1, echoing her source-led Kua 1.',
    themes: ['depth', 'adaptability', 'inner knowing'],
    interpretation: [
      'White 1 is associated with water: movement, depth, intuition, and the ability to find a route around fixed obstacles.',
      'Its strongest resonance is with April’s Life Path 7 and eighth-house emphasis—private inquiry before public certainty.',
      'Water symbolism can balance her earth-heavy natal chart by valuing responsiveness alongside structure.'
    ], caution: 'Full Tibetan astrology also uses lunar-calendar and elemental calculations beyond this focused Mewa comparison.'
  },
  {
    slug: 'nine-star-ki', name: 'Japanese Nine Star Ki', tradition: 'Japan', icon: Sparkles,
    result: '1 Water star',
    calculation: 'For a 1990 birth after the early-February solar-year boundary, the annual-star method subtracts the reduced year sum from 11 and reduces again: 11 − 1 = 10 → 1 Water.',
    themes: ['flow', 'listening', 'quiet influence'],
    interpretation: [
      'One Water often works through observation and timing rather than force, giving April a quieter complement to her Aries Moon.',
      'It supports depth, research, and indirect influence—qualities already visible in her eighth-house Virgo placements.',
      'The caution is diffusion: clear limits help sensitivity become discernment rather than over-absorption.'
    ], caution: 'Nine Star Ki schools differ in sex-based and pre-solar-year formulas; the displayed result follows April’s documented Kua 1.'
  },
  {
    slug: 'chaldean-numerology', name: 'Chaldean Numerology', tradition: 'Mesopotamian-derived modern numerology', icon: Layers3,
    result: 'Birth number 6 · destiny rhythm 7',
    calculation: 'Birth day 6 gives the primary birth number. The full date 9 + 6 + 1 + 9 + 9 + 0 = 34, reduced to 7, matches April’s documented Life Path.',
    themes: ['care', 'truth-seeking', 'selectivity'],
    interpretation: [
      'Six brings responsibility, beauty, care, and a desire to make relationships and surroundings more coherent.',
      'Seven adds privacy, research, testing, and the need to reach understanding personally rather than accept consensus.',
      'Together they describe care guided by discernment: April gives most fully when trust and meaning are present.'
    ], caution: 'Name-number work requires a chosen full name and spelling, so this page uses the birth-date numbers only.'
  },
  {
    slug: 'tarot-birth-cards', name: 'Tarot Birth Cards', tradition: 'Western esoteric tarot', icon: Feather,
    result: 'VII · The Chariot',
    calculation: '9 + 6 + 1 + 9 + 9 + 0 = 34; 3 + 4 = 7. Major Arcana VII is The Chariot.',
    themes: ['direction', 'self-command', 'integration'],
    interpretation: [
      'The Chariot is not speed for its own sake; it is the ability to hold contrary forces in one chosen direction.',
      'That mirrors April’s Full Moon polarity and her mix of Aries immediacy with Virgo and Capricorn control.',
      'The useful question is not “Which side wins?” but “What purpose is strong enough to coordinate both sides?”'
    ], caution: 'Birth cards are a reflective tarot practice, not a prediction or fixed verdict.'
  },
  {
    slug: 'celtic-tree-calendar', name: 'Celtic Tree Calendar', tradition: 'Modern Celtic revival', icon: Trees,
    result: 'Vine · gathering and discernment',
    calculation: 'In the commonly circulated thirteen-tree calendar, September 2–29 corresponds to Vine.',
    themes: ['harvest', 'discernment', 'sensory wisdom'],
    interpretation: [
      'Vine symbolism concerns ripening: knowing what is ready, what needs more time, and what should be released.',
      'This closely parallels April’s Virgo Sun—selection, refinement, and care with what enters the system.',
      'Its relational lesson is to let pleasure and receptivity stand beside evaluation rather than making either one the enemy.'
    ], caution: 'The popular tree calendar is a modern revival interpretation, not a securely attested ancient Celtic birth system.'
  },
];

export const COMMON_THREADS = [
  { theme: 'Discernment before commitment', systems: ['Vedic', 'Chaldean', 'Tarot', 'Celtic'], explanation: 'Several lenses describe April as someone who tests meaning and coherence before investing fully. Her Virgo Sun and Life Path 7 provide the clearest source-backed anchor.' },
  { theme: 'Instinct held by structure', systems: ['Tzolk’in', 'Tarot', 'Nine Star Ki', 'Natal chart'], explanation: 'Fast instinct appears repeatedly, but so does the need to direct it. The shared lesson is integration—not suppressing immediacy, and not letting it steer without reflection.' },
  { theme: 'Private depth, selective intimacy', systems: ['Tibetan Mewa', 'Chaldean', 'Vedic', 'Natal chart'], explanation: 'Water and seven symbolism converge with April’s eighth-house emphasis: trust grows through depth, honesty, privacy, and sustained inquiry.' },
  { theme: 'Meaning as orientation', systems: ['Vedic', 'Tarot', 'Tzolk’in', 'Natal chart'], explanation: 'Sagittarius rising, Chariot direction, tone-seven reflection, and Jyotish’s dharmic framing all prioritize a meaningful trajectory over activity for its own sake.' },
];