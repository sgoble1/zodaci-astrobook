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
  /** Key facts quoted or summarised from the sources, each with where it comes from. */
  facts?: { text: string; cite: string; to: string }[];
};

export const TOPICS: Topic[] = [
  { slug: 'aries-funnel', label: 'The Aries Funnel · Bucket Handle', intro: 'April\'s chart is a Bucket: nearly every planet sits on one side, and the lone Moon in Aries in the 3rd house is the handle. Everything in the chart pours out through that Moon — her voice, feelings and communication.',
    chapters: /bucket|handle|funnel|aries moon|moon: aries|chart pattern/i, query: 'bucket handle funnel aries moon third house channel energy released chart pattern',
    pages: [{ to: '/masterbook/bcb-05', label: 'Birth Chart Book · Your Moon: Aries 6°37′ H3' }, { to: '/masterbook/c-ff306540-03', label: 'Guide · 4E The Bucket Pattern' }, { to: '/masterbook/ch-38', label: 'Saturn Transit Guide: The Bucket Handle' }, { to: '/masterbook/x-extended-chapter-aries-moon-h3-the-complete-analysis', label: 'Extended Chapter · Aries Moon H3' }, { to: '/planets/moon', label: 'Planets · Moon' }],
    facts: [
      { text: 'Moon in Aries 6°37′ in the 3rd house — "Handle — all chart energy funnels here".', cite: 'Timeline & Retrograde Guide · chart table', to: '/masterbook/c-a4bea1f0-00' },
      { text: '"The Bucket pattern with the Aries Moon H3 as handle is, without question, the most practically important structural feature of April\'s natal chart." The handle is "the exhaust valve, the creative output mechanism".', cite: 'Birth Chart & Feng Shui Guide · 4E', to: '/masterbook/c-ff306540-03' },
      { text: '"Every impulse, every ambition, every talent, every wound in your entire chart funnels through that Moon in Aries in your third house."', cite: 'Timeline & Retrograde Guide · Opening', to: '/masterbook/c-a4bea1f0-00' },
      { text: 'Full Moon birth: the Aries Moon sits opposite the Virgo Sun, so the handle faces the whole cluster of the chart.', cite: 'Birth Chart page', to: '/birth-chart' },
      { text: 'Saturn in Aries (2025–2028) is "the Saturn transit of the bucket handle… This is not a blocking transit. This is Saturn strengthening the handle. What you communicate now carries lasting weight."', cite: 'Masterbook · Saturn Transit Guide', to: '/masterbook/ch-38' },
      { text: 'Saturn in Gemini then crosses the 3rd house, the Moon\'s house: the writing, teaching and speaking "receives the structure that will allow it to last".', cite: 'Masterbook · Saturn Transit Guide', to: '/masterbook/ch-38' },
    ],
    questions: ['What does the Aries Moon bucket handle mean for how I express myself?', 'How do the Saturn in Aries and Gemini transits affect my bucket handle?', 'How do I use the handle well instead of burning out?'] },
  { slug: 'past-lives', label: 'Past Lives & Karma', intro: 'What the chart says about karmic history, the South Node inheritance, and soul contracts carried into this life.',
    chapters: /past li|karm|south node|nodal|soul contract|reincarn/i, query: 'past lives karma karmic south node previous incarnation soul contract',
    pages: [{ to: '/masterbook/bcb-20', label: 'Birth Chart Book · Ch. 18 Past Lives & Karmic Signatures' }, { to: '/masterbook/c-ff306540-06', label: 'Section 7 · Karmic Themes' }, { to: '/volume-2', label: 'Volume II' }],
    facts: [
      { text: 'Karma here is "not a single past life revealed in tidy narrative form; it is a complex of energetic signatures, patterns carried across time, and the current life\'s particular curriculum".', cite: 'Birth Chart Book · Ch. 18', to: '/masterbook/bcb-20' },
      { text: 'The South Node shows the past-life patterns "most ingrained, most comfortable… and most in need of conscious transcendence this lifetime".', cite: 'Birth Chart Book · Ch. 18', to: '/masterbook/bcb-20' },
      { text: 'The calcified pattern: "the reliance on external validation for internal certainty."', cite: 'Birth Chart Book · Ch. 18', to: '/masterbook/bcb-20' },
      { text: 'South Node in Leo 5°17′ in the 7th house; North Node in Aquarius in the 1st.', cite: 'Masterbook · Ch. 12', to: '/masterbook/ch-12' },
    ],
    questions: ['What do my South Node and 12th house say about past lives?', 'What karmic lessons am I here to complete?'] },
  { slug: 'numerology', label: 'Numerology', intro: 'Life Path, Expression, Soul Urge, Personal Years and Pinnacles, and how the numbers echo the chart.',
    chapters: /numerolog|life path|pinnacle|personal year|master number/i, query: 'numerology life path number personal year pinnacle expression soul urge',
    pages: [{ to: '/masterbook/c-ff306540-16', label: 'Section 17 · Numerology Complement' }, { to: '/numerology', label: 'Numerology · Pinnacles' }, { to: '/purpose', label: 'Purpose & Numerology' }],
    facts: [
      { text: 'Life Path 7 — The Seeker: "September 6, 1990 → 9 + 6 + (1+9+9+0) → 9 + 6 + 19 → 9 + 6 + 10 → 9 + 6 + 1 = 16 → 1+6 = 7."', cite: 'Birth Chart & Feng Shui Guide · 17A', to: '/masterbook/c-ff306540-16' },
      { text: '"Life Path 7 is the number of the seeker, the researcher…" and its solitude "is not social withdrawal as fear".', cite: 'Birth Chart & Feng Shui Guide · 17A', to: '/masterbook/c-ff306540-16' },
      { text: 'The Numerological-Astrological Echo: Life Path 7 and the chart\'s major configurations confirm one another.', cite: 'Birth Chart & Feng Shui Guide · 17D, p. 114', to: '/masterbook/c-ff306540-p114' },
    ],
    questions: ['What does my Life Path number mean for my purpose?', 'Which Personal Year am I in and what does it ask of me?'] },
  { slug: 'recurring-themes', label: 'Recurring Themes', intro: 'The patterns the documents return to again and again: the Full Moon axis, the anaretic degrees, the Capricorn stellium, service and depth.',
    chapters: /synthes|theme|pattern|signature|overview|big three|blueprint/i, query: 'recurring theme pattern repeatedly signature throughout your chart full moon anaretic stellium',
    pages: [{ to: '/masterbook/c-ff306540-06', label: 'Section 7 · Repeating Life Patterns' }, { to: '/masterbook/c-ff306540-14', label: 'Section 15 · Seven Core Life Patterns' }, { to: '/reading#synthesis', label: 'Reading · Synthesis across systems' }, { to: '/masterbook/bcb-41', label: 'Birth Chart Book · Ch. 39 Synthesis' }],
    facts: [
      { text: 'Pattern 1: The Full Moon Creative Tension Loop', cite: 'Birth Chart & Feng Shui Guide · Section 7 (expanded in Section 15)', to: '/masterbook/c-ff306540-06' },
      { text: 'Pattern 2: The Identity Complexity Being Misread', cite: 'Birth Chart & Feng Shui Guide · Section 7 (expanded in Section 15)', to: '/masterbook/c-ff306540-06' },
      { text: 'Pattern 3: The Over-Giving in Partnership Loop', cite: 'Birth Chart & Feng Shui Guide · Section 7 (expanded in Section 15)', to: '/masterbook/c-ff306540-06' },
      { text: 'Pattern 4: The Depth Seeking Depth', cite: 'Birth Chart & Feng Shui Guide · Section 7 (expanded in Section 15)', to: '/masterbook/c-ff306540-06' },
      { text: 'Pattern 5: The Communication Release Valve', cite: 'Birth Chart & Feng Shui Guide · Section 7 (expanded in Section 15)', to: '/masterbook/c-ff306540-06' },
      { text: 'Pattern 6: The Late Recognition of Worth', cite: 'Birth Chart & Feng Shui Guide · Section 7 (expanded in Section 15)', to: '/masterbook/c-ff306540-06' },
      { text: 'Pattern 7: The Discipline-Freedom Paradox', cite: 'Birth Chart & Feng Shui Guide · Section 7 (expanded in Section 15)', to: '/masterbook/c-ff306540-06' },
    ],
    questions: ['What themes repeat across all of my reports?', 'What is the single thread that ties my chart together?'] },
  { slug: 'obstacles', label: 'Obstacles & Challenges', intro: 'Squares, oppositions, Saturn and Chiron lessons, retrograde reviews and difficult transits — and the remedies the sources suggest.',
    chapters: /obstacle|challeng|shadow|wound|chiron|saturn|square|difficult|tension/i, query: 'obstacle challenge difficulty struggle block wound tension square saturn chiron remedy overcome',
    pages: [{ to: '/aspects', label: 'Aspects' }, { to: '/retrogrades', label: 'Retrogrades' }, { to: '/transits', label: 'Transits' }],
    questions: ['What are my biggest obstacles and how do I work with them?', 'Which difficult transits are coming and how should I prepare?'] },
  { slug: 'shadow-work', label: 'Shadow Work & Healing', intro: 'The parts of the chart that want to be integrated: Lilith, Pluto, Chiron, the 8th and 12th houses.',
    chapters: /shadow|heal|lilith|pluto|integrat|wound/i, query: 'shadow work integrate healing wound lilith pluto chiron fear',
    pages: [{ to: '/masterbook/bcb-28', label: 'Birth Chart Book · Ch. 26 Shadow Work' }],
    questions: ['What does my shadow work look like?', 'How do I heal my Chiron wound?'] },
  { slug: 'purpose', label: 'Life Purpose & Mission', intro: 'North Node direction, Midheaven vocation and the soul mission statements.',
    chapters: /purpose|mission|north node|calling|dharma|destiny/i, query: 'life purpose mission north node destiny calling soul',
    pages: [{ to: '/purpose', label: 'Purpose & Numerology' }, { to: '/masterbook/bcb-26', label: 'Birth Chart Book · Ch. 24 Life Purpose' }],
    questions: ['What is my life purpose?', 'How can I fulfil my North Node in Aquarius?'] },
  { slug: 'love', label: 'Love & Relationships', intro: 'Venus, Mars, the 7th house, Jupiter and Chiron in partnership, and compatibility notes.',
    chapters: /love|relationship|partner|venus|marriage|compatib|7th/i, query: 'love relationship partner marriage venus seventh house compatibility romance',
    pages: [{ to: '/masterbook/bcb-29', label: 'Birth Chart Book · Ch. 27 Love' }],
    questions: ['What kind of partner suits me?', 'What patterns show up in my relationships?'] },
  { slug: 'career', label: 'Career & Calling', intro: 'Midheaven, 10th and 6th houses, Spica and the professional blueprint.',
    chapters: /career|calling|profession|work|midheaven|vocation/i, query: 'career work profession vocation midheaven tenth house calling success',
    pages: [{ to: '/masterbook/bcb-30', label: 'Birth Chart Book · Ch. 28 Career' }],
    questions: ['Which careers fit my chart?', 'When are my strongest career years?'] },
  { slug: 'money', label: 'Money & Resources', intro: 'The 2nd and 8th houses, Part of Fortune, Jupiter and wealth sectors in Feng Shui.',
    chapters: /money|wealth|financ|resource|fortune|2nd house|8th house/i, query: 'money wealth finances resources income abundance prosperity part of fortune',
    questions: ['What does my chart say about money?', 'Which Feng Shui area supports wealth for me?'] },
  { slug: 'health', label: 'Health & Wellness', intro: 'Virgo body-awareness, the 6th house, the astrological body map and elemental balance.',
    chapters: /health|wellness|body|chakra|healing|6th house/i, query: 'health wellness body diet exercise sleep stress sixth house',
    pages: [{ to: '/masterbook/bcb-31', label: 'Birth Chart Book · Ch. 29 Health' }],
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
    pages: [{ to: '/masterbook/bcb-35', label: 'Birth Chart Book · Ch. 33 Tarot' }, { to: '/masterbook/bcb-38', label: 'Birth Chart Book · Ch. 36 Affirmations' }],
    questions: ['What rituals do the reports recommend each month?', 'What are my birth tarot cards?'] },
  { slug: 'timing', label: 'Key Years & Turning Points', intro: 'Saturn returns, profections, progressions, solar returns and the big dates between 1990 and 2060.',
    chapters: /timeline|return|profection|progress|solar arc|phase|transit|year/i, query: 'saturn return turning point key year age progression solar return timeline',
    pages: [{ to: '/timeline', label: 'Timeline' }, { to: '/profection', label: 'Profection' }, { to: '/transits', label: 'Transits' }],
    questions: ['What are my biggest turning-point years?', 'What happens at my second Saturn return?'] },
];
