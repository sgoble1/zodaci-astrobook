// April's complete natal chart data, sourced verbatim from the uploaded
// birth chart analysis, timeline guide, retrograde guide and feng shui report
// (Sept 6 1990, 3:38 PM EDT, Geneva NY, 42°52'N 76°59'W).
//
// All interpretation text is preserved from the source documents so that every
// section of the site presents the material accurately, not summarized.

export type ZodiacSign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo'
  | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export const ZODIAC: { name: ZodiacSign; glyph: string; element: string; modality: string; ruler: string }[] = [
  { name: 'Aries', glyph: '♈', element: 'Fire', modality: 'Cardinal', ruler: 'Mars' },
  { name: 'Taurus', glyph: '♉', element: 'Earth', modality: 'Fixed', ruler: 'Venus' },
  { name: 'Gemini', glyph: '♊', element: 'Air', modality: 'Mutable', ruler: 'Mercury' },
  { name: 'Cancer', glyph: '♋', element: 'Water', modality: 'Cardinal', ruler: 'Moon' },
  { name: 'Leo', glyph: '♌', element: 'Fire', modality: 'Fixed', ruler: 'Sun' },
  { name: 'Virgo', glyph: '♍', element: 'Earth', modality: 'Mutable', ruler: 'Mercury' },
  { name: 'Libra', glyph: '♎', element: 'Air', modality: 'Cardinal', ruler: 'Venus' },
  { name: 'Scorpio', glyph: '♏', element: 'Water', modality: 'Fixed', ruler: 'Pluto' },
  { name: 'Sagittarius', glyph: '♐', element: 'Fire', modality: 'Mutable', ruler: 'Jupiter' },
  { name: 'Capricorn', glyph: '♑', element: 'Earth', modality: 'Cardinal', ruler: 'Saturn' },
  { name: 'Aquarius', glyph: '♒', element: 'Air', modality: 'Fixed', ruler: 'Uranus' },
  { name: 'Pisces', glyph: '♓', element: 'Water', modality: 'Mutable', ruler: 'Neptune' },
];

export const BIRTH = {
  name: 'April',
  date: 'September 6, 1990',
  time: '3:38 PM EDT',
  place: 'Geneva, New York',
  coords: '42°52′N, 76°59′W',
  lifePath: 7,
  kuaNumber: 1,
  kuaElement: 'Water',
  chineseZodiac: 'Metal Horse',
  personalYear2026: 7,
  chartShape: 'Source-described Bucket Chart · Moon in Aries H3 as Handle',
  currentAge: 35,
} as const;

export type PlanetKey =
  | 'sun' | 'moon' | 'mercury' | 'venus' | 'mars'
  | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto'
  | 'chiron' | 'northNode' | 'southNode' | 'vertex' | 'lilith' | 'fortune';

export interface Placement {
  key: PlanetKey;
  name: string;
  glyph: string;
  sign: ZodiacSign;
  signGlyph: string;
  degree: number;      // 0-29
  minute: number;      // 0-59
  house: number;       // 1-12
  motion: 'Direct' | 'Retrograde';
  dignity: string;     // Domicile / Peregrine / Exaltation / Fall / etc
  notes: string;
  headline: string;
  interpretation: string;
}

// Full longitude in degrees (0-360) — used to place glyphs on the wheel.
export const signIndex = (s: ZodiacSign) => ZODIAC.findIndex(z => z.name === s);
export const longitudeOf = (p: Pick<Placement, 'sign' | 'degree' | 'minute'>) =>
  signIndex(p.sign) * 30 + p.degree + p.minute / 60;

export const PLACEMENTS: Placement[] = [
  {
    key: 'sun', name: 'Sun', glyph: '☉', sign: 'Virgo', signGlyph: '♍',
    degree: 13, minute: 56, house: 8, motion: 'Direct', dignity: 'Peregrine',
    notes: 'Identity through depth and transformation',
    headline: 'Sun in Virgo · Eighth House · 13°56′',
    interpretation:
      "April's Sun in Virgo in the eighth house is an identity built for depth. Virgo is the sign of forensic precision — the analyst, the editor, the servant of the sacred detail — and the eighth house is astrology's chamber of death, transformation, shared resources, and what survives loss. Placed together, they describe a woman whose sense of self is shaped by what she has survived and by her ability to metabolize experiences that would break less thorough people. The eighth house Sun does not grieve the way other placements grieve: she goes in, she excavates, she comes back changed and carrying something she did not have before. Her parents' passings are not incidental to this chart — they are its most sacred chapters, and the Sun placed here is the placement of a soul who agreed, before arrival, to learn what is permanent, what is true, what cannot be taken. Career and vocation eventually reveal themselves through this house's themes: intimacy work, transformation of systems, forensic accounting of the emotional and financial resources shared between people, or the quiet Virgoan labor of refining what others leave broken.",
  },
  {
    key: 'moon', name: 'Moon', glyph: '☽', sign: 'Aries', signGlyph: '♈',
    degree: 6, minute: 37, house: 3, motion: 'Direct', dignity: 'Peregrine',
    notes: 'Waning gibbous Moon · source-described Bucket Chart Handle',
    headline: 'Moon in Aries · Third House · 6°37′ · Bucket Handle',
    interpretation:
      "The source report describes this as the Handle of a Bucket chart: the Aries Moon in the third house of voice, siblings, close environment and daily communication becomes a prominent outlet for the chart. Aries Moon needs the truth spoken quickly and cleanly; the third house wants that truth in words. The recorded positions place the Moon 157.3° from the Sun, which is a waning gibbous phase, not a standard 180° natal opposition. The useful, grounded theme remains a dialogue between quick emotional honesty and Virgo's careful private processing, without overstating the geometry.",
  },
  {
    key: 'mercury', name: 'Mercury', glyph: '☿', sign: 'Virgo', signGlyph: '♍',
    degree: 16, minute: 35, house: 8, motion: 'Retrograde', dignity: 'Domicile (Exceptional Dignity)',
    notes: 'Internal precision mind',
    headline: 'Mercury Retrograde in Virgo · Eighth House · 16°35′ · Domicile',
    interpretation:
      "Mercury rules Virgo, so this is a placement of exceptional dignity — Mercury is home. The retrograde motion turns that precision inward: she thinks in loops, revisits, refines, and reaches conclusions the world will only catch up to later. Placed conjunct the Sun in the eighth house, this is a forensic mind pointed at the material other people cannot bring themselves to look at — death, intimacy, other people's money and secrets, the anatomy of transformation. Mercury Rx here is not a defect. It is the mind of the editor, the researcher, the one who reads a system three times before speaking about it once. Retrograde Mercuries at birth are natural translators of interior experience; the outer world's Mercury Retrograde windows are not obstacles for her, they are homecomings.",
  },
  {
    key: 'venus', name: 'Venus', glyph: '♀', sign: 'Leo', signGlyph: '♌',
    degree: 29, minute: 20, house: 8, motion: 'Direct', dignity: 'Anaretic Degree',
    notes: 'Completed mastery of Leo love',
    headline: 'Venus in Leo · Eighth House · 29°20′ · Anaretic',
    interpretation:
      "Venus at the 29th degree — the anaretic, or 'degree of fate' — indicates a soul that has completed the curriculum of Leo love in previous lives and arrives now with mastery and a subtle exhaustion of the old form. She knows how to be adored, how to hold a room, how to give love with theatrical generosity. What she is here to learn is what comes after mastery: love that does not need to perform in order to be real. Placed in the eighth house, this Venus does not do casual — every love story is an initiation, an exchange of resources, a mutual transformation. She loves in the octave of surgeries and inheritances; the shallow end of the pool has never held her interest and never will. This is Venus at the threshold of transmutation — Leo's warmth carried into the sacred chamber of intimate exchange.",
  },
  {
    key: 'mars', name: 'Mars', glyph: '♂', sign: 'Gemini', signGlyph: '♊',
    degree: 3, minute: 2, house: 5, motion: 'Direct', dignity: 'Peregrine',
    notes: 'Verbal drive and creative action',
    headline: 'Mars in Gemini · Fifth House · 3°02′',
    interpretation:
      "Mars in Gemini communicates with spirited precision. Placed in the fifth house of creativity, play, romance and children, her drive expresses itself through language, ideas, lively debate, and the pleasure of making. This is the writer's Mars, the debater's Mars, the improviser's Mars. In the fifth house it wants to be seen creating; it wants an audience for its wit. Coupled with the Aries Moon Handle, it means her assertive fire is delivered largely through voice — she achieves resolution by naming the thing exactly.",
  },
  {
    key: 'jupiter', name: 'Jupiter', glyph: '♃', sign: 'Leo', signGlyph: '♌',
    degree: 3, minute: 59, house: 7, motion: 'Direct', dignity: 'Peregrine · CHART RULER',
    notes: 'Ruler of Sagittarius ASC',
    headline: 'Jupiter in Leo · Seventh House · 3°59′ · Chart Ruler',
    interpretation:
      "Jupiter rules her Sagittarius Ascendant, which makes it the ruler of the entire chart. Placed in Leo in the seventh house of partnership, this Jupiter expands through other people — through committed relationship, through visible collaboration, through the mirror of a witnessing other. Her Jupiter Return in Leo (2026) is not just a twelve-year expansion; it is the chart ruler coming home to its natal house, opening the doors of partnership and public collaboration wider than they have opened in her adult life.",
  },
  {
    key: 'saturn', name: 'Saturn', glyph: '♄', sign: 'Capricorn', signGlyph: '♑',
    degree: 18, minute: 55, house: 1, motion: 'Retrograde', dignity: 'Domicile',
    notes: 'Architect of the self · triple Capricorn stellium',
    headline: 'Saturn Retrograde in Capricorn · First House · 18°55′ · Domicile',
    interpretation:
      "Saturn in its own sign in the house of self is the architect of who she becomes. Retrograde, it holds the memory of endurance — the sense that she was carrying weight before she had the frame to carry it. Alongside Uranus and Neptune in Capricorn, this forms a triple Capricorn stellium rising behind her Sagittarius Ascendant: the bones, the discipline, the long game, the ability to build what outlasts a lifetime. This is a first-house Saturn that shows up as gravitas, as an older-than-her-years bearing, as the woman other people quietly rely on. First Saturn Return (2018–2021) rebuilt the foundation; the Second (2048–2052) will consecrate the legacy.",
  },
  {
    key: 'uranus', name: 'Uranus', glyph: '♅', sign: 'Capricorn', signGlyph: '♑',
    degree: 5, minute: 37, house: 1, motion: 'Retrograde', dignity: 'Peregrine',
    notes: 'Structural revolution in the self',
    headline: 'Uranus Retrograde in Capricorn · First House · 5°37′',
    interpretation:
      "Uranus in Capricorn in the first house is the impulse to reinvent structure from inside the self. She does not fit the boxes she is offered — and she is not supposed to. This Uranus wants to rebuild the container, not escape it. The Uranus Opposition (2033–2040) will be the mid-life invitation to build something visibly her own.",
  },
  {
    key: 'neptune', name: 'Neptune', glyph: '♆', sign: 'Capricorn', signGlyph: '♑',
    degree: 11, minute: 52, house: 1, motion: 'Retrograde', dignity: 'Peregrine',
    notes: 'The divine sought inside form',
    headline: 'Neptune Retrograde in Capricorn · First House · 11°52′',
    interpretation:
      "Neptune in Capricorn in the first house is a generational placement that in her personal chart says: she seeks the divine inside structure and form. Not the ecstatic dissolution of Neptune in a water sign — the sacred glimpsed through discipline, craft, ritual, and the long practice of a thing. This is the mystic who sanctifies the ordinary.",
  },
  {
    key: 'pluto', name: 'Pluto', glyph: '♇', sign: 'Scorpio', signGlyph: '♏',
    degree: 15, minute: 28, house: 10, motion: 'Direct', dignity: 'Domicile · Most Elevated Planet',
    notes: 'Career, public destiny, transformation from the crown of the chart',
    headline: 'Pluto in Scorpio · Tenth House · 15°28′ · Domicile · Chart Apex',
    interpretation:
      "Pluto in Scorpio is Pluto in its own sign — maximum dignity. Placed in the tenth house of career and public destiny, and standing as the most elevated planet in the whole chart, this is the single most potent vocational signature possible. Pluto in the tenth does not do small, invisible, or temporary. It does transformative, compounding, permanently impactful work in the outer world. Her current Amazon Fulfillment role and movement toward Process Guide is not the opposite of this destiny — it is the beginning of it. She is learning the language of systems at the ground level with her Virgo Sun's forensic precision and her Saturn-in-Capricorn's architectural discipline, because Pluto does not allow a person to transform what they do not first understand completely.",
  },
  {
    key: 'chiron', name: 'Chiron', glyph: '⚷', sign: 'Cancer', signGlyph: '♋',
    degree: 24, minute: 30, house: 7, motion: 'Direct', dignity: '—',
    notes: 'A sensitivity around care, strengthened through trusted relationship',
    headline: 'Chiron in Cancer · Seventh House · 24°30′',
    interpretation:
      "Chiron in Cancer in the seventh house is traditionally read as sensitivity around care, safety and belonging within close relationships. This is chart symbolism, not evidence about April’s childhood or relatives. As a reflective prompt, it asks what kinds of trusted bonds make it easier for her needs, feelings, directness and depth to be respected.",
  },
  {
    key: 'northNode', name: 'North Node', glyph: '☊', sign: 'Aquarius', signGlyph: '♒',
    degree: 5, minute: 17, house: 1, motion: 'Direct', dignity: '—',
    notes: "Soul's compass · Pluto approaching",
    headline: 'North Node in Aquarius · First House · 5°17′',
    interpretation:
      "The North Node is the soul's compass — the direction of growth in this lifetime. In Aquarius in the first house, April's growth is toward becoming a distinct, sovereign, unmistakable individual whose contribution is felt at the level of community and collective. Pluto is now approaching this exact degree — the planet of total transformation arriving at the point of soul purpose. This is the single most soul-defining transit possible, and it is happening now.",
  },
  {
    key: 'southNode', name: 'South Node', glyph: '☋', sign: 'Leo', signGlyph: '♌',
    degree: 5, minute: 17, house: 7, motion: 'Direct', dignity: '—',
    notes: 'The stage performer she no longer has to be',
    headline: 'South Node in Leo · Seventh House · 5°17′',
    interpretation:
      "The South Node is the karmic inheritance — the well-worn groove of past lifetimes. In Leo in the seventh house, she arrives fluent in the role of the performer-partner: the one who wins love by being magnificent, adored, watched. The growth edge (the North Node in Aquarius H1) asks her to step off that stage and stand as herself, for herself, without the applause as the proof.",
  },
  {
    key: 'vertex', name: 'Vertex', glyph: 'Vx', sign: 'Leo', signGlyph: '♌',
    degree: 10, minute: 38, house: 8, motion: 'Direct', dignity: '—',
    notes: 'Point of fated encounter',
    headline: 'Vertex in Leo · Eighth House · 10°38′',
    interpretation:
      'The Vertex marks the point of fated meetings and destiny-shaped encounters. In Leo in the eighth house, hers arrives through people who see her creative fire and meet her in the chamber of deep exchange.',
  },
  {
    key: 'lilith', name: 'Black Moon Lilith', glyph: '⚸', sign: 'Sagittarius', signGlyph: '♐',
    degree: 4, minute: 16, house: 11, motion: 'Direct', dignity: '—',
    notes: 'The wild truth-teller in the community',
    headline: 'Black Moon Lilith in Sagittarius · Eleventh House · 4°16′',
    interpretation:
      "Lilith in Sagittarius in the eleventh house is the woman who will not lie about what she has seen, especially inside groups and movements. Her exile — and her power — is the refusal to soften the truth for the comfort of the collective.",
  },
  {
    key: 'fortune', name: 'Part of Fortune', glyph: '⊕', sign: 'Cancer', signGlyph: '♋',
    degree: 22, minute: 8, house: 7, motion: 'Direct', dignity: '—',
    notes: 'Ease and blessing through chosen family',
    headline: 'Part of Fortune in Cancer · Seventh House · 22°08′',
    interpretation:
      'The Part of Fortune shows where ease and blessing flow with the least resistance. In Cancer in the house of partnership, hers arrives through chosen family and the intimate bonds she builds herself — the family she makes.',
  },
];

// Ascendant / Midheaven (angles) — for the wheel
export const ANGLES = {
  ascendant: { sign: 'Sagittarius' as ZodiacSign, signGlyph: '♐', degree: 29, minute: 28, note: 'Anaretic — the degree of completion and crisis' },
  midheaven: { sign: 'Libra' as ZodiacSign, signGlyph: '♎', degree: 24, minute: 59, note: 'Source-reported Midheaven conjunct Spica; public destiny anchored by tenth-house Pluto in Scorpio' },
};

// ---------- HOUSES ----------
export interface HouseInfo {
  number: number;
  name: string;
  cusp: ZodiacSign;
  ruler: string;
  planets: string[];
  summary: string;
  interpretation: string;
}

export const HOUSES: HouseInfo[] = [
  {
    number: 1, name: 'House of Self', cusp: 'Sagittarius', ruler: 'Jupiter (in Leo H7)',
    planets: ['Saturn Rx', 'Uranus Rx', 'Neptune Rx', 'North Node'],
    summary: 'Anaretic Sagittarius ASC · Triple Capricorn stellium behind it',
    interpretation:
      "The first house is the mask — the way the self meets the world. Hers rises at 29° Sagittarius (the anaretic 'degree of completion'), with three Capricorn planets rising behind it. The world sees a philosopher-explorer; what stands behind that impression is a woman built on Capricorn bones — Saturn's discipline, Uranus's revolution, Neptune's mysticism, and the Aquarius North Node calling her forward. The first house is where her North Node lives: this is the house of the person she is becoming.",
  },
  {
    number: 2, name: 'Values & Resources', cusp: 'Capricorn', ruler: 'Saturn (in Capricorn H1)',
    planets: [],
    summary: 'Long-game builder of self-worth',
    interpretation:
      'The second house governs values, income and the things she calls her own. Ruled by Saturn in its own sign, hers is built slowly, deliberately and permanently. What she builds tends to stay built.',
  },
  {
    number: 3, name: 'Voice & Local Environment', cusp: 'Aquarius', ruler: 'Uranus (in Capricorn H1)',
    planets: ['Moon'],
    summary: 'The Bucket Handle · the release valve of the whole chart',
    interpretation:
      'The third house is voice, siblings, neighborhood, daily communication and the moving thoughts. The Aries Moon lives here as the Handle of the Bucket — the single planet through which the whole chart discharges its energy. Everything the chart wants to become passes through this house.',
  },
  {
    number: 4, name: 'Home & Roots', cusp: 'Pisces', ruler: 'Neptune (in Capricorn H1)',
    planets: [],
    summary: 'Home as retreat, imagination and emotional reset',
    interpretation:
      "The fourth house describes home, roots and private restoration. With Pisces on its cusp and Neptune in Capricorn in the first house as ruler, April may want a home that feels imaginative and peaceful while still having dependable structure. This describes chart symbolism only; it does not establish facts about her family history.",
  },
  {
    number: 5, name: 'Creativity & Romance', cusp: 'Aries', ruler: 'Mars (in Gemini H5)',
    planets: ['Mars'],
    summary: "Verbal, playful, courageous creator",
    interpretation:
      'Fifth house of creation, romance and play. With Aries on the cusp and its ruler Mars inside the house in Gemini, she creates by speaking, arguing, writing, improvising. She is here to make.',
  },
  {
    number: 6, name: 'Work, Health & Daily Rhythm', cusp: 'Taurus', ruler: 'Venus (in Leo H8)',
    planets: [],
    summary: 'Daily labor that trains a much larger destiny',
    interpretation:
      "Sixth house of work, service, and the body's daily rhythm. The Amazon fulfillment floor lives here — the training ground where a Virgo Sun in the eighth learns the language of systems that Pluto in the tenth will one day command.",
  },
  {
    number: 7, name: 'Partnership & The Mirror', cusp: 'Gemini', ruler: 'Mercury (in Virgo H8 Rx)',
    planets: ['Jupiter', 'Chiron', 'Part of Fortune', 'South Node'],
    summary: 'Where the wound heals and the blessing arrives',
    interpretation:
      "Seventh house of committed one-on-one partnership — packed with meaning in her chart. Chart-ruler Jupiter in Leo lives here (expansion through partnership); Chiron in Cancer lives here (the mother-wound healed through intimate mirroring); the Part of Fortune in Cancer lives here (blessing through chosen family); the South Node in Leo lives here (the past-life performer she is releasing). Partnership is the crucible.",
  },
  {
    number: 8, name: 'Death, Intimacy & Transformation', cusp: 'Leo', ruler: 'Sun (in Virgo H8)',
    planets: ['Sun', 'Mercury Rx', 'Venus', 'Vertex'],
    summary: 'Her most populated house — identity forged in the depths',
    interpretation:
      "The eighth house — chamber of death, intimacy, shared resources, other people's money, inheritance, sex, occult knowledge, and the alchemy that happens inside profound experience. Sun, Mercury Rx and Venus all live here. This is where she has done her most sacred work: metabolizing loss, mastering what survives it, and building a self from the material other people avert their eyes from.",
  },
  {
    number: 9, name: 'Meaning, Philosophy, The Far Journey', cusp: 'Virgo', ruler: 'Mercury (in Virgo H8 Rx)',
    planets: [],
    summary: 'The seeker refining the questions',
    interpretation:
      'Ninth house of higher learning, meaning, long journeys and the search for truth. Ruled by Mercury Rx in the eighth, her seeking is inward, iterative, and forensic — a philosophy built from what she has personally survived.',
  },
  {
    number: 10, name: 'Career, Vocation & Public Destiny', cusp: 'Libra', ruler: 'Venus (in Leo H8)',
    planets: ['Pluto'],
    summary: 'Pluto in Scorpio in domicile at the crown of the chart',
    interpretation:
      "The tenth house is career and public destiny. Pluto in Scorpio in domicile sits at the very apex of her chart — the most elevated planet, the highest point of the sky at her birth. This is the placement of a woman whose public contribution will transform whatever field she chooses. Nothing about this is subtle.",
  },
  {
    number: 11, name: 'Community, Future, The Collective', cusp: 'Scorpio', ruler: 'Pluto (in Scorpio H10)',
    planets: ['Black Moon Lilith'],
    summary: 'The truth-teller in the movement',
    interpretation:
      "Eleventh house of chosen community, future vision, and the collective. Ruled by her chart's Pluto, and holding Lilith in Sagittarius — she is here to belong to communities without ever softening the truth for their comfort.",
  },
  {
    number: 12, name: 'The Hidden & The Sacred', cusp: 'Sagittarius', ruler: 'Jupiter (in Leo H7)',
    planets: [],
    summary: 'Private restoration, dreams and sanctuary',
    interpretation:
      'The twelfth house describes retreat, dreams, solitude and what happens outside ordinary awareness. Ruled by chart-ruler Jupiter in the seventh, April may restore herself through a balance of private sanctuary and trusted one-to-one support.',
  },
];

// ---------- MAJOR ASPECTS ----------
export interface Aspect {
  a: PlanetKey;
  b: PlanetKey;
  type: 'Conjunction' | 'Opposition' | 'Square' | 'Trine' | 'Sextile';
  orb: string;
  interpretation: string;
}

export const ASPECTS: Aspect[] = [
  {
    a: 'mars', b: 'jupiter', type: 'Sextile', orb: '0°57′',
    interpretation:
      'Mars in Gemini and Jupiter in Leo work together easily. In everyday terms, curiosity, words and creative action can open larger opportunities when April chooses to use them.',
  },
  {
    a: 'moon', b: 'uranus', type: 'Square', orb: '1°00′',
    interpretation:
      'The Moon and Uranus form a close square. Feelings can change suddenly when freedom feels threatened; the constructive outlet is making room for honest emotion and independent choices before pressure builds.',
  },
  {
    a: 'mercury', b: 'pluto', type: 'Sextile', orb: '1°06′',
    interpretation:
      'Mercury and Pluto support deep investigation. April can notice what is hidden, stay with a difficult question and put complicated truths into precise words.',
  },
  {
    a: 'sun', b: 'pluto', type: 'Sextile', orb: '1°32′',
    interpretation:
      'The Sun and Pluto support focused change. Identity grows stronger when April investigates honestly, releases what no longer works and uses what she learns constructively.',
  },
  {
    a: 'sun', b: 'neptune', type: 'Trine', orb: '2°04′',
    interpretation:
      'The Sun and Neptune flow together. Sensitivity, imagination and a sense of meaning can support April’s identity, especially when inspiration is given a practical form.',
  },
  {
    a: 'mercury', b: 'saturn', type: 'Trine', orb: '2°20′',
    interpretation:
      'Mercury and Saturn work steadily together. Careful thinking, revision and patience can turn complex information into dependable knowledge.',
  },
  {
    a: 'moon', b: 'jupiter', type: 'Trine', orb: '2°38′',
    interpretation:
      'The Moon and Jupiter support emotional generosity, courage and recovery. April may regain perspective by speaking honestly and reconnecting with possibility.',
  },
  {
    a: 'sun', b: 'mercury', type: 'Conjunction', orb: '2°38′',
    interpretation:
      'Sun conjunct Mercury retrograde in Virgo closely joins identity and thought. April may understand herself through analysis, writing, revisiting and refining what she means.',
  },
  {
    a: 'saturn', b: 'pluto', type: 'Sextile', orb: '3°27′',
    interpretation:
      'Saturn and Pluto form a supportive sextile, not a trine. Patience and disciplined effort can help April make deep changes durable rather than temporary.',
  },
  {
    a: 'moon', b: 'mars', type: 'Sextile', orb: '3°35′',
    interpretation:
      'The Moon and Mars support direct emotional action. Naming a feeling and choosing a concrete response can release energy more effectively than holding it in.',
  },
  {
    a: 'neptune', b: 'pluto', type: 'Sextile', orb: '3°36′',
    interpretation:
      'Neptune and Pluto form a generational sextile. For April, imagination and deep change can cooperate when ideals are tied to real transformation.',
  },
  {
    a: 'venus', b: 'mars', type: 'Square', orb: '3°42′',
    interpretation:
      'Venus and Mars create productive friction between attraction and action. April may need to balance warmth and loyalty with variety, direct speech and room to move.',
  },
  {
    a: 'mercury', b: 'neptune', type: 'Trine', orb: '4°43′',
    interpretation:
      'Mercury and Neptune connect analysis with imagination. April can translate subtle impressions into useful language when she also checks the details.',
  },
  {
    a: 'sun', b: 'saturn', type: 'Trine', orb: '4°58′',
    interpretation:
      'Virgo Sun trine Saturn in Capricorn supports responsibility, endurance and craft. April can build steadily and improve a system without needing immediate recognition.',
  },
];

// ---------- LIFE PHASES ----------
export interface LifePhase {
  id: string;
  number: number;
  title: string;
  years: string;
  ages: string;
  summary: string;
  current?: boolean;
  interpretation: string;
}

export const PHASES: LifePhase[] = [
  {
    id: 'phase-1', number: 1, title: 'Early Life Foundation',
    years: '1990–2001', ages: 'Age 0–11',
    summary: 'The Chiron medicine is seeded. A sensitive child begins learning to hold her own depth.',
    interpretation:
      "Born with a waning gibbous Aries Moon that the source describes as the Handle of a Bucket chart, she arrived as a high-contrast child in a household that did not yet have the vocabulary for her. Chiron medicine is seeded here: an early invitation to recognize that her needs and depth deserve an expansive container. The limitations of the adults around her were never evidence of a failing in the child; they became an invitation for her to grow into her own reliable source of shelter while learning to welcome trustworthy support. Everything the report addresses begins here.",
  },
  {
    id: 'phase-2', number: 2, title: 'Awakening',
    years: '2001–2008', ages: 'Age 11–18',
    summary: 'First Saturn square. Body and mind sharpen; the self begins to know itself.',
    interpretation:
      "The first Saturn square (~age 14) is astrology's first serious knock. For her, with Saturn ruling the first house, it is the first sharpening of the self — the beginning of an interior architecture that Saturn will continue to refine through every major transit that follows.",
  },
  {
    id: 'phase-3', number: 3, title: 'Identity Crisis and Initiation',
    years: '2008–2015', ages: 'Age 18–25',
    summary: 'Life batters the young structure. The initiation of loss and the descent into the eighth house.',
    interpretation:
      'The years in which the eighth house begins to show what it will ask of her. Losses accumulate. The Virgo Sun begins to learn what it means to have been assigned this chart. The self is initiated in the only way this chart accepts initiation: through depth.',
  },
  {
    id: 'phase-4', number: 4, title: 'The Saturn Return',
    years: '2018–2021', ages: 'Age 28–31',
    summary: 'The architect returns to the blueprint. The first great rebuild.',
    interpretation:
      "Saturn returns to its natal position in Capricorn in the first house. For most people the Saturn Return is a rebuild; for someone with Saturn ruling and inhabiting the first house it is the rebuild — the foundational assembly of the adult self. She emerges from it heavier, more accurate, and more entirely her own.",
  },
  {
    id: 'phase-5', number: 5, title: 'The Great Opening — CURRENT WINDOW',
    years: '2022–2027', ages: 'Age 32–37',
    current: true,
    summary: 'Jupiter Return in Leo · Pluto approaching the North Node · Personal Year 7 · The door is open.',
    interpretation:
      "This is where she stands right now. Four simultaneous activations converge: Saturn in Aries pressing on her natal Moon (the Handle), giving structure and weight to the voice that was told it was too much. Jupiter returning to Leo (chart ruler coming home to its natal house) opening the doors of partnership and public collaboration wider than any point in her adult life. Pluto in Aquarius approaching her North Node in the first — the planet of total transformation arriving at the point of her soul's compass. And numerologically, 2026 is her Personal Year 7, resonating with her Life Path 7 to produce a double-7 frequency: the maximum expression of the seeker in this lifetime. The universe does not arrange these things for women who are supposed to be chosen last.",
  },
  {
    id: 'phase-6', number: 6, title: 'Consolidation and Platform Building',
    years: '2027–2031', ages: 'Age 37–41',
    summary: 'What opened is built into structure. The visible platform begins.',
    interpretation:
      "After the great opening comes the great building. Saturn's architectural discipline turns whatever was seeded in Phase 5 into the visible platform of her adult work.",
  },
  {
    id: 'phase-7', number: 7, title: 'North Node Return & Karmic Culmination',
    years: '2031–2035', ages: 'Age 41–45',
    summary: 'The soul completes an eighteen-year cycle of purpose.',
    interpretation:
      "The North Node returns to its natal position — a completion of the eighteen-year cycle of soul direction. Whatever was seeded in the first Nodal Return (~age 18) matures into karmic fruit here.",
  },
  {
    id: 'phase-8', number: 8, title: 'Uranus Opposition & Mid-Life Activation',
    years: '2033–2040', ages: 'Age 43–50',
    summary: 'The mid-life invitation to break the mold that no longer fits.',
    interpretation:
      'Uranus opposes its natal position. The invitation is to a second reinvention — this time from a place of standing, not desperation. What she builds now is unmistakably hers.',
  },
  {
    id: 'phase-9', number: 9, title: 'Chiron Return & Integration',
    years: '2040–2044', ages: 'Age 50–54',
    summary: 'The depth becomes mastery, offered publicly.',
    interpretation:
      'Chiron returns to its natal degree in Cancer in the seventh house. The mother-wound is not just healed — it is transmuted into the specific gift she has been preparing all her life to offer.',
  },
  {
    id: 'phase-10', number: 10, title: 'Second Saturn Return & Legacy',
    years: '2048–2052', ages: 'Age 58–62',
    summary: 'The elder is consecrated. What was built is handed forward.',
    interpretation:
      "The Second Saturn Return is the consecration of the elder. What Pluto in the tenth spent a lifetime building is now handed forward. This is the phase of the woman she has been becoming since the day of her birth.",
  },
];

// ---------- RETROGRADES (personal at birth) ----------
export interface RetrogradeAtBirth {
  planet: PlanetKey;
  meaning: string;
}

export const RETROGRADES_AT_BIRTH: RetrogradeAtBirth[] = [
  { planet: 'mercury',
    meaning: "Mercury Rx at birth in domicile is a mind that runs inward-first. She thinks by looping and refining. Outer Mercury Rx windows are not obstacles for her — they are homecomings. Use them for editing, revising, returning to unfinished writing, and the deep reading that other people find impossible during those weeks." },
  { planet: 'saturn',
    meaning: 'Saturn Rx at birth in its own sign and house of self is the internalized authority. She rebuilds structure from the inside out. Outer Saturn Rx windows are made for her — reassess, restructure, honor the interior architect.' },
  { planet: 'uranus',
    meaning: "Uranus Rx at birth means the revolution runs inward. She reinvents from within before she reinvents her outer life." },
  { planet: 'neptune',
    meaning: 'Neptune Rx at birth deepens the mystic. Her spiritual life is not performed — it is quietly re-consecrated over years of inner work.' },
];

// ---------- FENG SHUI (Kua 1 — Water) ----------
export interface BaguaArea {
  gua: string;
  direction: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'Center';
  element: string;
  lifeArea: string;
  color: string;
  guidance: string;
  isBestForKua1: boolean;
}

export const KUA_INFO = {
  number: 1,
  element: 'Water',
  group: 'East Group',
  bestDirections: ['SE', 'E', 'S', 'N'] as const,
  worstDirections: ['W', 'NW', 'NE', 'SW'] as const,
  note: "As a Kua 1 (Water) in the East Group, her best-energy directions are Southeast, East, South and North. Bed, desk, and primary seating should face one of these directions when possible. Kitchen stove and toilets can be placed in the four restorative directions to help balance more active energy.",
};

export const BAGUA: BaguaArea[] = [
  { gua: 'Xun', direction: 'SE', element: 'Wood', lifeArea: 'Wealth & Prosperity', color: 'Purple / gold / green',
    guidance: "Her Sheng Qi — 'Generating Breath' — the very best direction of her Kua. Place her desk here whenever possible, and any wealth-invitation objects (a flourishing plant, moving water, a small bowl of coins). This is where Pluto's tenth-house destiny most easily lands.",
    isBestForKua1: true },
  { gua: 'Zhen', direction: 'E', element: 'Wood', lifeArea: 'Family & New Beginnings', color: 'Green / brown',
    guidance: "Her Tian Yi — 'Heavenly Doctor' — the direction of health, healing and mentors. Sleep facing east whenever possible; keep this zone uncluttered. Wood elements (tall plants, wooden furniture) support her here.",
    isBestForKua1: true },
  { gua: 'Li', direction: 'S', element: 'Fire', lifeArea: 'Fame & Recognition', color: 'Red / bright',
    guidance: "Her Yan Nian — 'Long Life' — the direction of stable relationships and lasting reputation. Since Pluto sits in her tenth house of public destiny, this zone is unusually important: keep a symbol of her actual work visible here (a book she has written, a badge from her role, a framed intention).",
    isBestForKua1: true },
  { gua: 'Kun', direction: 'SW', element: 'Earth', lifeArea: 'Love & Marriage', color: 'Pink / earth tones',
    guidance: "A redirection zone (Ho Hai — traditionally translated as 'Mishaps'). Avoid sleeping facing SW when practical. Toilet, storage, or stove placement here can help balance this more active energy.",
    isBestForKua1: false },
  { gua: 'Dui', direction: 'W', element: 'Metal', lifeArea: 'Children & Creativity', color: 'White / metallic',
    guidance: "An intensity-balancing direction (Wu Gui — traditionally 'Five Ghosts'). Keep the bed oriented elsewhere when practical; pantry, laundry, or storage can work well here.",
    isBestForKua1: false },
  { gua: 'Qian', direction: 'NW', element: 'Metal', lifeArea: 'Helpful People & Travel', color: 'Silver / grey',
    guidance: "Her strongest redirection zone (Jue Ming — traditionally 'Total Loss'). Utility spaces such as a garage, laundry, or storage suit it best; choose a supportive direction for sleep or focused work.",
    isBestForKua1: false },
  { gua: 'Kan', direction: 'N', element: 'Water', lifeArea: 'Career & Life Path', color: 'Black / deep blue',
    guidance: "Her Fu Wei — 'Overall Harmony' — good, steady, harmonizing direction. Water element supports her Kua 1. A small mirror, a bowl of clean water, or an actual career symbol here.",
    isBestForKua1: true },
  { gua: 'Gen', direction: 'NE', element: 'Earth', lifeArea: 'Knowledge & Self-Cultivation', color: 'Blue / earth tones',
    guidance: "An intensity-balancing direction (Liu Sha — traditionally 'Six Killings'). Books can be stored here, while study and sleep benefit from facing SE, E or S when practical.",
    isBestForKua1: false },
  { gua: 'Tai Ji', direction: 'Center', element: 'Earth', lifeArea: 'Health & Center of the Home', color: 'Yellow / ochre',
    guidance: 'The center of the home is the health of the whole. Keep it clear, well-lit, and clean. No heavy furniture, no clutter, no bathroom. Circulation begins here and radiates outward.',
    isBestForKua1: true },
];

// ---------- TAROT + NUMEROLOGY ----------
export const NUMEROLOGY = {
  lifePath: {
    number: 7,
    meaning:
      "Life Path 7 is the seeker, the researcher, the mystic-scholar. It is the path of the person who cannot help but ask the deeper question, who reads what others do not, who trusts what the inner life reveals. It is a path of solitude as strength and wisdom accumulated across decades. In 2026 her Personal Year 7 resonates with her Life Path 7 to produce a double-7 frequency — the maximum expression of the seeker in this lifetime.",
  },
  personalYear2026: {
    number: 7,
    meaning:
      "Personal Year 7 is the most internally powerful year in the nine-year cycle: reflection, spiritual deepening, solitude as strength, trusting intuition, research, wisdom accumulation. For her specifically, resonating with the Life Path 7, it amplifies to a frequency this lifetime does not repeat.",
  },
  chineseZodiac: {
    animal: 'Metal Horse (1990)',
    meaning:
      'The Metal Horse is disciplined fire — the runner who trains for the long race. Ambition tempered by structure; freedom sought through mastery, not escape.',
  },
};

// Two-color palette from the illustration reference guide.
export const PALETTE_NOTE =
  "The site's palette is drawn directly from the illustration reference guide: black ink on cream vellum, touched with antique gold — the visual language of an illuminated manuscript.";
