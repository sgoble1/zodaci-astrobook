import rising from '@/assets/plates/sample-taurus-rising.jpg';
import twelfth from '@/assets/plates/sample-twelfth-house.jpg';
import moon from '@/assets/plates/sample-cancer-moon.jpg';
import { COVER_SAMPLES } from '@/content/coverSamples';

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

const reader = COVER_SAMPLES.find(s => s.id === 'collector')!;

/**
 * Public sample of a full Collector's edition for the invented reader on the Collector sample cover (Rosalind Vance).
 * The birth moment is fictional and belongs to no founder or member; every fact line is a calculated position for that
 * moment (checked in sampleEdition.test.ts) and the paragraphs are interpretation.
 */
export const SAMPLE_EDITION: EditionShowcase = {
  owner: reader.name,
  title: reader.name,
  subtitle: 'Your exact placement in print',
  note: 'Sample reader (fictional): Taurus Sun, Cancer Moon, Taurus Rising · Placidus houses · birth time known to the minute.',
  pages: [
    {
      n: 1, volume: 'Volume I · The Celestial Matrix', title: 'The Garden Gate', placement: 'Taurus Rising 12°47′ · Sun on the Ascendant',
      image: rising, imageAlt: 'Printed plate: a cream-white bull standing at an open iron garden gate as the sun rises behind it, roses on the stone walls and gold orbit rings in the sky',
      facts: [
        { label: 'Ascendant', value: 'Taurus 12°47′' },
        { label: 'Chart ruler', value: 'Venus in Aries 13°00′, 12th house' },
        { label: 'On the Ascendant', value: 'Sun in Taurus 12°29′ — 0.3° away, on the 12th-house side' },
        { label: 'Across the chart', value: 'Pluto in Scorpio 8°28′ opposite the Ascendant (4.3°)' },
      ],
      body: [
        'Your Ascendant is the degree of the zodiac that was rising on the eastern horizon at the minute you were born. Yours is 12° of Taurus. Taurus rising tends to meet the world slowly and steadily: you take a room in before you act in it, and people often read you as calm before they know you well.',
        'Your Sun sits less than a third of a degree from that rising degree. In plain terms, you were born just after sunrise, and the Sun had only just cleared the horizon. When the Sun is this close to the Ascendant, who you are and how you come across are hard to separate — what people see first is very close to what you are.',
        'Because the Sun is on the 12th-house side of the line, part of that light is still behind the gate. The 12th house is the house of rest, retreat and work done out of sight. You may need more quiet time than people expect from someone so visible, and you may do your best thinking alone before you show anything.',
        'Pluto stands opposite your Ascendant, in the house of other people. Close relationships are where this chart gets tested and changed. Partners who matter tend to be intense, and the relationships that last are the ones where neither person has to pretend.',
      ],
      reflection: 'What do people notice about you first — and what do they only learn once they have walked through the gate?',
    },
    {
      n: 2, volume: 'Volume III · Planetary Geometry', title: 'The Hidden Workshop', placement: 'Four planets in the 12th house · Venus with Jupiter in Aries',
      image: twelfth, imageAlt: 'Printed plate: a brass ram on a lamplit workbench in an attic workshop, with a pink morning star and a banded gold planet seen through a round window',
      facts: [
        { label: '12th house', value: 'Sun, Mercury, Venus and Jupiter' },
        { label: 'Venus', value: 'Aries 13°00′, 12th house — conjunct Jupiter (1.7°) and the North Node (3.0°)' },
        { label: 'Tightest aspect', value: 'Mercury in Taurus 7°49′ trine Neptune in Capricorn 7°51′ (0.04°)' },
        { label: 'Dignity', value: 'Venus in detriment in Aries' },
      ],
      body: [
        'Four of your planets sit in the 12th house, the part of the sky that had just risen before you were born. Traditional astrology treats this house as private: behind the scenes, in solitude, in service, in the imagination. A chart weighted here often does its real work quietly and is surprised later by how much it has built.',
        'Venus rules your Taurus Ascendant, so she is your chart ruler, and she stands in Aries — her detriment, the sign opposite her own. Venus in Aries loves quickly and plainly and does not like to wait. Under a patient Taurus Ascendant, that makes for a person who looks unhurried but chooses in an instant.',
        'Jupiter is less than two degrees from Venus, and the North Node is close by. Jupiter enlarges what it touches; with Venus, it tends to bring generosity, a good eye and luck through what you love. With the Node beside them, the direction your life grows in runs through those same tastes and affections.',
        'The tightest aspect in the whole chart is a trine from Mercury to Neptune, exact to less than a tenth of a degree. Practical Taurus thinking meets Neptune’s imagination easily. You can make a feeling concrete — in words, images, rooms or plans — and that may be the most useful tool in the workshop.',
      ],
      reflection: 'What have you made in private that you have not yet shown anyone?',
    },
    {
      n: 3, volume: 'Volume II · The Twelve Temples', title: 'The Harbor Light', placement: 'Moon in Cancer 13°28′ · 3rd house',
      image: moon, imageAlt: 'Printed plate: a striped lighthouse and lit cottage on a small harbor under a full moon in gold orbit rings, a red crab on the rocks in front',
      facts: [
        { label: 'Moon', value: 'Cancer 13°28′, 3rd house' },
        { label: 'Dignity', value: 'Moon in its own sign (domicile)' },
        { label: 'Easy contacts', value: 'Sextile the Ascendant (0.7°) · sextile the Sun (1.0°)' },
        { label: 'Friction', value: 'Square Venus (0.5°) · square Jupiter (1.2°)' },
      ],
      body: [
        'The Moon describes what makes you feel safe. In Cancer, its own sign, the Moon works at full strength: safety comes from home, from the people you have chosen as family, and from being able to look after someone. Feelings run deep and are remembered for a long time.',
        'Your Moon is in the 3rd house — the house of daily talk, short trips, neighbors, siblings and learning. You tend to settle your feelings by putting them into words, often with the people closest at hand. Letters, calls and conversations on the way somewhere can matter more to you than big occasions.',
        'The Moon makes easy sextiles to both your Sun and your Ascendant, each within a degree. Your moods, your will and the way you come across tend to agree with each other. People usually can tell how you feel, and it is rarely a surprise to you.',
        'The tension in this chart is the square from the Moon to Venus and Jupiter. The Moon wants to stay close and keep things safe; Venus and Jupiter in Aries want to go out, choose fast and try more. You may swing between staying in and saying yes to everything — and the most satisfying choices tend to be the ones that bring the adventure home.',
      ],
      reflection: 'Who do you tell first when something happens — and what does that conversation give you?',
    },
  ],
};
