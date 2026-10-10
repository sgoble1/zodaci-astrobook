import type { Topic } from '@/content/topics';

/** Source-linked learning topics; interpretations are not quotations or biographical claims. */
export const LIBRARY_TOPICS: Topic[] = [
  {
    slug: 'thinking-decisions',
    label: 'Thinking & Decisions',
    intro: 'April’s careful Virgo Mercury and quick Aries Moon offer two different ways of processing a situation. This reading separates the recorded chart from possible meanings, then turns those meanings into questions she can test for herself.',
    chapters: /your mercury|your moon|your saturn/i,
    sourceIds: ['bcb-06', 'bcb-05', 'bcb-10'],
    query: 'April Mercury Virgo retrograde eighth house analysis thinking decisions Moon Aries third house Saturn Capricorn',
    facts: [
      { text: 'Mercury: Virgo 16°35′, retrograde, in the 8th house in April’s source chart. Mercury rules Virgo; “domicile” means it is in a sign it rules.', cite: 'Birth Chart Book · Chapter 4 · Mercury', to: '/masterbook/bcb-06' },
      { text: 'Moon: Aries 6°37′ in the 3rd house in the same recorded chart.', cite: 'Birth Chart Book · Chapter 3 · Moon', to: '/masterbook/bcb-05' },
      { text: 'Mercury trine Saturn: 2°20′ from an exact 120° angle, calculated from Virgo 16°35′ and Capricorn 18°55′.', cite: 'April’s recorded degrees · aspect check', to: '/aspects' },
    ],
    guide: [
      { title: 'Give careful thinking a useful job', text: 'The Mercury chapter connects this placement with revisiting, editing, and researching. In everyday terms, a possible strength is checking a complicated idea before accepting it. That does not prove that April always thinks this way, and retrograde Mercury is not an impairment or a diagnosis.', cite: 'Interpretation based on the Mercury chapter', to: '/masterbook/bcb-06' },
      { title: 'Separate the first feeling from the final decision', text: 'The Moon chapter emphasizes direct emotional expression, while the Mercury chapter emphasizes review. A chart-based possibility is wanting to say something immediately and then wanting time to refine it. April can acknowledge the first feeling without treating it as the final answer. These placements are not a Sun–Moon opposition.', cite: 'Interpretation connecting April’s Moon and Mercury chapters', to: '/masterbook/bcb-05' },
      { title: 'Use structure without demanding perfection', text: 'A trine is a 120° relationship traditionally interpreted as cooperation. Mercury–Saturn can be read as a possible link between thinking and structure: write the question, list the evidence, and set a point at which there is enough information to decide. This is a reflection suggestion, not a scientifically established effect of the aspect.', cite: 'Chart-based interpretation · Mercury trine Saturn', to: '/aspects' },
    ],
    reflection: ['What do I know directly, and what am I assuming?', 'Is this a decision I need to make now, or can I take time to review it?', 'What one new piece of information would actually change my decision?'],
    pages: [{ to: '/planets/mercury', label: 'April’s Mercury' }, { to: '/planets/moon', label: 'April’s Moon' }, { to: '/workbook/reframe', label: 'Thought Reframe' }],
    questions: ['What do April’s Mercury and Moon chapters say about thinking before speaking?', 'How could April use Mercury trine Saturn as a reflection theme without treating astrology as science?'],
  },
  {
    slug: 'creativity-play',
    label: 'Creativity & Play',
    intro: 'A focused reading of April’s Mars in Gemini in the 5th house: making things, trying ideas, and finding room for enjoyment. The suggestions below are symbolic possibilities, not claims about her hobbies, talents, or life history.',
    chapters: /your mars|your jupiter/i,
    sourceIds: ['bcb-08', 'bcb-09'],
    query: 'April Mars Gemini fifth house creativity play writing ideas Jupiter Leo seventh house collaboration',
    facts: [
      { text: 'Mars: Gemini 3°02′ in the 5th house in April’s source chart.', cite: 'Birth Chart Book · Chapter 6 · Mars', to: '/masterbook/bcb-08' },
      { text: 'Jupiter: Leo 3°59′ in the 7th house in the source chart. Jupiter rules April’s Sagittarius Ascendant.', cite: 'Birth Chart Book · Chapter 7 · Jupiter', to: '/masterbook/bcb-09' },
      { text: 'Mars sextile Jupiter: 0°57′ from an exact 60° angle, calculated from Gemini 3°02′ and Leo 3°59′.', cite: 'April’s recorded degrees · aspect check', to: '/aspects' },
      { text: 'Source correction: the Mars chapter calls Mars–Saturn a trine, but Gemini 3°02′ and Capricorn 18°55′ are 134°07′ apart, not a standard 120° trine. That claim is not used in this reading; the original chapter is preserved below.', cite: 'Original Mars chapter · checked against recorded degrees', to: '/masterbook/bcb-08' },
    ],
    guide: [
      { title: 'Make room for ideas before judging them', text: 'The Mars chapter links Gemini and the 5th house with language, ideas, and creative expression. A plain-language interpretation is that experimenting with words or several approaches may be more inviting than waiting for one perfect idea. This does not establish that April is a writer or must choose any particular creative activity.', cite: 'Interpretation based on the Mars chapter', to: '/masterbook/bcb-08' },
      { title: 'Try a small experiment, not a performance test', text: 'The 5th house is traditionally associated with creativity, play, and enjoyment. A chart-relative suggestion is to make something small simply to see whether the process feels good: a short paragraph, a photo sequence, or a different approach to a familiar task. These are optional examples, not activities documented in April’s sources.', cite: 'Chart-based reflection · Mars in the 5th house', to: '/houses/5' },
      { title: 'Let collaboration be an invitation', text: 'The Jupiter chapter emphasizes growth through one-to-one relationships. A sextile is a 60° relationship traditionally read as an opportunity for cooperation. Together with Mars, this can suggest testing an idea with a trusted person while keeping April’s own preferences central. It does not predict that a particular person will help or that an outcome is guaranteed.', cite: 'Interpretation connecting Mars, Jupiter, and their measured aspect', to: '/aspects' },
    ],
    reflection: ['Which activity leaves me more interested than when I started?', 'What could I make just for enjoyment, without needing praise?', 'Would I prefer to try this alone or invite someone to join?'],
    pages: [{ to: '/planets/mars', label: 'April’s Mars' }, { to: '/houses/5', label: 'The 5th house' }, { to: '/planets/jupiter', label: 'April’s Jupiter' }, { to: '/workbook/journal', label: 'Journal & Patterns' }],
    questions: ['What does April’s Mars chapter actually say about creative expression?', 'How do Mars in Gemini and Jupiter in Leo connect through their sextile?'],
  },
];