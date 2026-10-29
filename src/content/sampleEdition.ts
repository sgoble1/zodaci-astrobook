import rising from '@/assets/sample-plate-rising.jpg';
import sun from '@/assets/sample-plate-sun.jpg';
import moon from '@/assets/sample-plate-moon.jpg';

export interface EditionFact { label: string; value: string }
export interface EditionPage {
  n: number; volume: string; title: string; placement: string; image: string; imageAlt: string;
  facts: EditionFact[]; body: string[]; reflection: string;
}
export interface EditionScriptPage { n: number; title: string; placement: string; summary: string }
export interface EditionShowcase {
  owner: string; title: string; subtitle: string; note: string;
  pages: EditionPage[]; script?: EditionScriptPage[];
}

/**
 * Public sample of a full Collector's edition. The placements are a real calculated chart (checked in
 * sampleEdition.test.ts) published under the invented name "Elias Marrow"; no birth place, biography or personal
 * context appears. Every fact line is a calculated position; the paragraphs are interpretation.
 */
export const SAMPLE_EDITION: EditionShowcase = {
  owner: 'Elias Marrow',
  title: 'Elias Marrow',
  subtitle: 'Your exact placement in print',
  note: 'Sample reader: Aries Sun, Taurus Moon, Leo Rising · Placidus houses · birth time known to the minute.',
  pages: [
    {
      n: 1, volume: 'Volume I · The Celestial Matrix', title: 'The Lantern at the Gate', placement: 'Leo Rising 12°24′ · Chiron in the 1st',
      image: rising, imageAlt: 'Illuminated plate: a golden lion rising over the eastern horizon with a key-shaped comet beside its mane',
      facts: [
        { label: 'Ascendant', value: 'Leo 12°24′' },
        { label: 'Chart ruler', value: 'Sun in Aries 5°06′, 9th house' },
        { label: 'In the 1st house', value: 'Chiron in Leo 17°36′ (retrograde)' },
        { label: 'Contacts to the Ascendant', value: 'Jupiter sextile (2.0°) · Venus trine (3.5°) · North Node trine (3.6°)' },
      ],
      body: [
        'Your Ascendant is the degree of the zodiac that was rising on the eastern horizon at the minute you were born. Yours is 12° of Leo, which puts the Sun — the ruler of Leo — in charge of the whole chart. People meet you as warmth first: you tend to enter a room as if you were expected, and others often read you as more confident than you feel.',
        'Because the Sun rules your chart and stands in Aries, the way you shine is through starting things. A Leo Ascendant ruled by an Aries Sun wants its light to do something — make, launch, lead — rather than simply be admired. When you are not creating, the Leo face can feel like a costume; when you are, it fits perfectly.',
        'Chiron sits five degrees behind your Ascendant, inside the 1st house. In astrology Chiron marks a tender place that becomes a source of skill. Here it sits on the self-image itself: being seen can feel exposing, and the instinct may be to perform before anyone can judge. The same placement often makes a person unusually good at helping others feel seen.',
        'Three easy aspects reach your Ascendant — Jupiter by sextile, Venus and the North Node by trine. These are flowing angles: generosity, charm and a sense of direction are available without much effort. The work of this chart is less about earning confidence and more about trusting what is already there.',
      ],
      reflection: 'Where do you perform being confident, and where do you simply feel it?',
    },
    {
      n: 2, volume: 'Volume III · Planetary Geometry', title: 'The Cardinal Spark', placement: 'Sun & Venus in Aries · 9th house',
      image: sun, imageAlt: 'Illuminated plate: a fiery golden ram leaping across a sky toward distant temples beneath a pink morning star',
      facts: [
        { label: 'Sun', value: 'Aries 5°06′, 9th house' },
        { label: 'Venus', value: 'Aries 15°54′, 9th house, retrograde' },
        { label: 'Tightest aspects', value: 'Venus trine North Node (0.1°) · Venus square Mars (0.3°)' },
        { label: 'Dignity', value: 'Sun exalted in Aries · Venus in detriment in Aries' },
      ],
      body: [
        'The Sun is exalted in Aries — astrologers have long treated this as the place where the Sun’s vitality is strongest. In the 9th house, that vitality points outward: toward ideas, belief, study, travel and anything that widens the map. You are likely to feel most alive at the start of a new chapter, and least alive when life becomes a routine with no horizon.',
        'Venus shares the 9th house with your Sun, and she was moving retrograde when you were born. Venus retrograde happens for about six weeks every eighteen months. Traditionally it turns love and taste inward: what you value is decided privately and revisited often, not borrowed from others. You may come to relationships and beliefs through reflection rather than at first sight.',
        'Two of the tightest aspects in your entire chart involve this Venus. A trine to the North Node, exact within a tenth of a degree, ties what you love to the direction your life is growing. A square to Mars, exact within a third of a degree, puts desire and drive in friction — the push-pull between wanting and going after. Used well, this square is creative heat; unattended, it can show up as impatience in love.',
        'Together these placements describe someone whose growth comes through what they choose to care about. The ram leaps, but Venus asks it to look back once before it lands.',
      ],
      reflection: 'Which belief or love have you chosen twice — once at first, and once again after looking back?',
    },
    {
      n: 3, volume: 'Volume II · The Twelve Temples', title: 'The Steady Hearth', placement: 'Moon in Taurus 2°30′ · conjunct the Midheaven',
      image: moon, imageAlt: 'Illuminated plate: a white bull resting on a mountain summit beneath a crescent moon, with a stone cottage and roses below',
      facts: [
        { label: 'Moon', value: 'Taurus 2°30′, 10th house' },
        { label: 'Midheaven', value: 'Taurus 0°24′ — Moon conjunct within 2.1°' },
        { label: 'Dignity', value: 'Moon exalted in Taurus' },
        { label: 'Support', value: 'Saturn sextile the Midheaven (4.4°)' },
      ],
      body: [
        'The Moon describes what makes you feel safe. In Taurus — the Moon’s exaltation — safety comes from what is steady and real: good food, warm rooms, things made by hand, people who stay. You tend to calm down through the body and the senses before you can calm down through words.',
        'Your Moon is only two degrees from the Midheaven, the highest point of the chart and the classic marker of vocation and reputation. That is a rare and visible placement. Your emotional life and your public life run close together: the work that suits you is work you can care about, and people often sense your feelings about it whether you say them or not.',
        'The contrast with your Aries Sun is the heart of this chart. The Sun wants to start; the Moon wants to keep. One is a match, the other a hearth. You may swing between restless launching and a deep wish to stay put — and the most satisfying projects are the ones that let you do both: start something new, then build it to last.',
        'Saturn’s sextile to the Midheaven adds patience to the career point. Recognition through this chart tends to come slowly and then hold, the way a stone house holds its warmth long after the fire is out.',
      ],
      reflection: 'What in your life have you built to last — and what would you like to build next?',
    },
  ],
};
