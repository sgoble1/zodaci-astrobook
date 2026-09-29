// Theme pages that gather every matching chapter and passage across the source documents.
export type Topic = {
  slug: string; label: string; intro: string;
  /** Regex matched against Masterbook / Birth Chart Book chapter and section titles. */
  chapters: RegExp;
  /** Search query for pulling passages from all documents. */
  query: string;
  /** Hand-picked in-app pages that cover this topic. */
  pages?: { to: string; label: string }[];
  questions: string[];
};

export const TOPICS: Topic[] = [
  { slug: 'past-lives', label: 'Past Lives & Karma', intro: 'What the chart says about karmic history, the South Node inheritance, and soul contracts carried into this life.',
    chapters: /past li|karm|south node|nodal|soul contract|reincarn/i, query: 'past lives karma karmic south node previous incarnation soul contract',
    pages: [{ to: '/masterbook/bcb-21', label: 'Birth Chart Book · Ch. 18 Past Lives & Karmic Signatures' }, { to: '/volume-2', label: 'Volume II' }],
    questions: ['What do my South Node and 12th house say about past lives?', 'What karmic lessons am I here to complete?'] },
  { slug: 'numerology', label: 'Numerology', intro: 'Life Path, Expression, Soul Urge, Personal Years and Pinnacles, and how the numbers echo the chart.',
    chapters: /numerolog|life path|pinnacle|personal year|master number/i, query: 'numerology life path number personal year pinnacle expression soul urge',
    pages: [{ to: '/numerology', label: 'Numerology · Pinnacles' }, { to: '/purpose', label: 'Purpose & Numerology' }],
    questions: ['What does my Life Path number mean for my purpose?', 'Which Personal Year am I in and what does it ask of me?'] },
  { slug: 'recurring-themes', label: 'Recurring Themes', intro: 'The patterns the documents return to again and again: the Full Moon axis, the anaretic degrees, the Capricorn stellium, service and depth.',
    chapters: /synthes|theme|pattern|signature|overview|big three|blueprint/i, query: 'recurring theme pattern repeatedly signature throughout your chart full moon anaretic stellium',
    pages: [{ to: '/reading#synthesis', label: 'Reading · Synthesis across systems' }, { to: '/masterbook/bcb-42', label: 'Birth Chart Book · Ch. 39 Synthesis' }],
    questions: ['What themes repeat across all of my reports?', 'What is the single thread that ties my chart together?'] },
  { slug: 'obstacles', label: 'Obstacles & Challenges', intro: 'Squares, oppositions, Saturn and Chiron lessons, retrograde reviews and difficult transits — and the remedies the sources suggest.',
    chapters: /obstacle|challeng|shadow|wound|chiron|saturn|square|difficult|tension/i, query: 'obstacle challenge difficulty struggle block wound tension square saturn chiron remedy overcome',
    pages: [{ to: '/aspects', label: 'Aspects' }, { to: '/retrogrades', label: 'Retrogrades' }, { to: '/transits', label: 'Transits' }],
    questions: ['What are my biggest obstacles and how do I work with them?', 'Which difficult transits are coming and how should I prepare?'] },
  { slug: 'shadow-work', label: 'Shadow Work & Healing', intro: 'The parts of the chart that want to be integrated: Lilith, Pluto, Chiron, the 8th and 12th houses.',
    chapters: /shadow|heal|lilith|pluto|integrat|wound/i, query: 'shadow work integrate healing wound lilith pluto chiron fear',
    pages: [{ to: '/masterbook/bcb-29', label: 'Birth Chart Book · Ch. 26 Shadow Work' }],
    questions: ['What does my shadow work look like?', 'How do I heal my Chiron wound?'] },
  { slug: 'purpose', label: 'Life Purpose & Mission', intro: 'North Node direction, Midheaven vocation and the soul mission statements.',
    chapters: /purpose|mission|north node|calling|dharma|destiny/i, query: 'life purpose mission north node destiny calling soul',
    pages: [{ to: '/purpose', label: 'Purpose & Numerology' }, { to: '/masterbook/bcb-27', label: 'Birth Chart Book · Ch. 24 Life Purpose' }],
    questions: ['What is my life purpose?', 'How can I fulfil my North Node in Aquarius?'] },
  { slug: 'love', label: 'Love & Relationships', intro: 'Venus, Mars, the 7th house, Jupiter and Chiron in partnership, and compatibility notes.',
    chapters: /love|relationship|partner|venus|marriage|compatib|7th/i, query: 'love relationship partner marriage venus seventh house compatibility romance',
    pages: [{ to: '/masterbook/bcb-30', label: 'Birth Chart Book · Ch. 27 Love' }],
    questions: ['What kind of partner suits me?', 'What patterns show up in my relationships?'] },
  { slug: 'career', label: 'Career & Calling', intro: 'Midheaven, 10th and 6th houses, Spica and the professional blueprint.',
    chapters: /career|calling|profession|work|midheaven|vocation/i, query: 'career work profession vocation midheaven tenth house calling success',
    pages: [{ to: '/masterbook/bcb-31', label: 'Birth Chart Book · Ch. 28 Career' }],
    questions: ['Which careers fit my chart?', 'When are my strongest career years?'] },
  { slug: 'money', label: 'Money & Resources', intro: 'The 2nd and 8th houses, Part of Fortune, Jupiter and wealth sectors in Feng Shui.',
    chapters: /money|wealth|financ|resource|fortune|2nd house|8th house/i, query: 'money wealth finances resources income abundance prosperity part of fortune',
    questions: ['What does my chart say about money?', 'Which Feng Shui area supports wealth for me?'] },
  { slug: 'health', label: 'Health & Wellness', intro: 'Virgo body-awareness, the 6th house, the astrological body map and elemental balance.',
    chapters: /health|wellness|body|chakra|healing|6th house/i, query: 'health wellness body diet exercise sleep stress sixth house',
    pages: [{ to: '/masterbook/bcb-32', label: 'Birth Chart Book · Ch. 29 Health' }],
    questions: ['What health areas should I pay attention to?', 'What routines suit my chart?'] },
  { slug: 'family-home', label: 'Family & Home', intro: 'The 4th house, the Moon, siblings in the 3rd house, and the home blueprint.',
    chapters: /family|home|mother|father|sibling|4th house|ancest/i, query: 'family home mother father siblings childhood ancestors fourth house',
    pages: [{ to: '/feng-shui/bagua', label: 'Feng Shui · Bagua & Home' }],
    questions: ['What does my chart say about my family?', 'How should I set up my home?'] },
  { slug: 'spiritual-gifts', label: 'Spiritual Gifts & Intuition', intro: 'Neptune, the 12th house, the Galactic Center, Sabian symbols and intuitive talents.',
    chapters: /spiritual|intuit|psychic|gift|neptune|12th|galactic|sabian|mystic/i, query: 'spiritual gift intuition psychic neptune twelfth house galactic center mystic',
    questions: ['What spiritual gifts does my chart show?', 'How can I develop my intuition?'] },
  { slug: 'practices', label: 'Rituals, Tarot, Chakras & Affirmations', intro: 'The practical tools: monthly rituals, birth tarot cards, chakras, colour and sound, journaling prompts and affirmations.',
    chapters: /ritual|tarot|chakra|color|colour|sound|journal|affirm|crystal|gene key|human design/i, query: 'ritual tarot chakra affirmation journal prompt crystal colour sound practice',
    pages: [{ to: '/masterbook/bcb-36', label: 'Birth Chart Book · Ch. 33 Tarot' }, { to: '/masterbook/bcb-39', label: 'Birth Chart Book · Ch. 36 Affirmations' }],
    questions: ['What rituals do the reports recommend each month?', 'What are my birth tarot cards?'] },
  { slug: 'timing', label: 'Key Years & Turning Points', intro: 'Saturn returns, profections, progressions, solar returns and the big dates between 1990 and 2060.',
    chapters: /timeline|return|profection|progress|solar arc|phase|transit|year/i, query: 'saturn return turning point key year age progression solar return timeline',
    pages: [{ to: '/timeline', label: 'Timeline' }, { to: '/profection', label: 'Profection' }, { to: '/transits', label: 'Transits' }],
    questions: ['What are my biggest turning-point years?', 'What happens at my second Saturn return?'] },
];
