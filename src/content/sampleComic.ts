import cover from '@/assets/comic-sample/cover.jpg';
import p1 from '@/assets/comic-sample/p1-gate.jpg';
import p2 from '@/assets/comic-sample/p2-workshop.jpg';
import p3 from '@/assets/comic-sample/p3-harbor.jpg';
import p4 from '@/assets/comic-sample/p4-drawing.jpg';
import p5 from '@/assets/comic-sample/p5-mended.jpg';
import p6 from '@/assets/comic-sample/p6-morning-star.jpg';
import { LEAD_COVER } from '@/content/coverSamples';

export interface ShowcasePanel { layout: 'full' | 'split' | 'grid'; narration: string; dialogue?: string; visualPrompt: string }
export interface ShowcasePage { pageNumber: number; actTitle: string; placement: string; art: string; panels: ShowcasePanel[] }
export interface AstroComicShowcase {
  issueNumber: number; title: string; banner: string; subCaption: string; cover: string; coverAlt: string; footer: string; hero: string;
  /** True when the title and reader are printed on the cover art itself, so viewers don't letter it again. */
  lettered?: boolean;
  /** One-paragraph description shown beside the closed issue. */
  intro: string;
  subject: { sunSign: string; moonSign: string; risingSign: string };
  pages: ShowcasePage[];
}
export interface ScriptedPage { pageNumber: number; title: string; placement: string; summary: string }

/**
 * The public sample AstroComic, written for the same fictional reader as the sample AstroBook (Rosalind Vance, born
 * 3 May 1987, 6:42 a.m., Asheville, North Carolina — see coverSamples.ts). Every placement, degree and orb named here is
 * calculated for that moment and checked in sampleComic.test.ts; the story around them is illustration, not biography.
 */
export const SAMPLE_ISSUE: AstroComicShowcase = {
  issueNumber: 1,
  title: 'The Garden Gate',
  hero: LEAD_COVER.name,
  lettered: true,
  banner: 'Zodaci AstroComic · Sample issue',
  subCaption: 'Born a few minutes after sunrise, with the bull at the gate.',
  cover,
  coverAlt: `Sample AstroComic cover, The Garden Gate: ${LEAD_COVER.name} at an open iron garden gate at sunrise holding a brass lantern, a golden Taurus wheel in the sky, printed with her Sun, Moon and Rising`,
  footer: 'End of the sample. A subscriber’s issue continues with that month’s transits to their own chart.',
  intro: 'Six drawn pages for one fictional reader. Her Taurus rising and the Sun on her Ascendant open the story, her Cancer Moon brings it home, and her tightest aspects each take a page. Turn the page to read the script beside the art.',
  subject: { sunSign: 'Taurus', moonSign: 'Cancer', risingSign: 'Taurus' },
  pages: [
    { pageNumber: 1, actTitle: 'The Gate at Sunrise', placement: 'Taurus Rising 12°47′ · Sun on the Ascendant', art: p1, panels: [
      { layout: 'full', narration: 'Rosalind was born a few minutes after sunrise. Her Sun had cleared the eastern horizon by less than a third of a degree, so it sits almost exactly on her rising degree.', visualPrompt: 'Dawn: Rosalind opens a wrought-iron garden gate as the sun rises behind it; a cream bull grazes in the meadow.' },
      { layout: 'split', narration: 'Taurus rising meets the world slowly. She takes the garden in before she steps into it.', dialogue: '“No rush. The roses will still be here.”', visualPrompt: 'Close on Rosalind’s calm face at the gate.' },
      { layout: 'grid', narration: 'With the Sun this close to the Ascendant, what people see first is very close to who she is.', visualPrompt: 'The sun’s disc on the horizon line behind the gate.' },
    ] },
    { pageNumber: 2, actTitle: 'The Hidden Workshop', placement: 'Sun, Mercury, Venus and Jupiter in the 12th house', art: p2, panels: [
      { layout: 'full', narration: 'Four of her planets sit in the 12th house, the quiet room just above the eastern horizon. Her real work happens here, before anyone else is up.', visualPrompt: 'An attic workshop before dawn; Rosalind builds a brass ram at a lamplit bench.' },
      { layout: 'split', narration: 'Venus, her chart ruler, stands in Aries with Jupiter 1.7° away: quick choices, generous taste, luck through what she loves.', dialogue: '“I know what I like the second I see it.”', visualPrompt: 'Hands fitting a gear into the ram.' },
      { layout: 'grid', narration: 'Through the window, the morning star and Jupiter rise ahead of the Sun, as they did on the day she was born.', visualPrompt: 'Round window: a pink morning star beside banded Jupiter.' },
    ] },
    { pageNumber: 3, actTitle: 'The Harbor Light', placement: 'Moon in Cancer 13°28′ · 3rd house', art: p3, panels: [
      { layout: 'full', narration: 'Her Moon is in Cancer, its own sign. For Rosalind, feeling safe means the kitchen light on and the people she has chosen close by.', visualPrompt: 'Evening kitchen over a harbor and striped lighthouse under a full moon.' },
      { layout: 'split', narration: 'In the 3rd house, feelings settle once they are put into words: a call, a letter, a talk on the way somewhere.', dialogue: '“I didn’t know how I felt until I told you.”', visualPrompt: 'Rosalind on the telephone, writing a letter.' },
      { layout: 'grid', narration: 'The Moon sextiles her Sun (1.0°) and her Ascendant (0.7°). What she feels, what she wants and how she comes across tend to agree.', visualPrompt: 'Letters tied with string beside the telephone.' },
    ] },
    { pageNumber: 4, actTitle: 'The Drawing Made Real', placement: 'Mercury in Taurus trine Neptune in Capricorn · 0.04°', art: p4, panels: [
      { layout: 'full', narration: 'The tightest aspect in her chart: Mercury trines Neptune, exact to less than a tenth of a degree. Practical Taurus thinking meets imagination with no friction.', visualPrompt: 'A garden pavilion sketch rises off the page as a glowing, real pavilion in sea-blue mist.' },
      { layout: 'split', narration: 'She can picture a feeling and then build it.', dialogue: '“If I can sketch it, I can make it.”', visualPrompt: 'Rosalind at the drafting table, chin on hand.' },
      { layout: 'grid', narration: 'Neptune sits in Capricorn in her 9th house: a big picture given solid shape, one plan at a time.', visualPrompt: 'A mountain goat on a misty ridge outside the window.' },
    ] },
    { pageNumber: 5, actTitle: 'The Mended Compass', placement: 'Mars conjunct Chiron in Gemini · 2nd house', art: p5, panels: [
      { layout: 'full', narration: 'Mars and Chiron stand together in Gemini, 0.3° apart, in the house of money, tools and what she can count on. In astrology, her drive and her sore spot share one place.', visualPrompt: 'Night workshop: Rosalind solders a cracked pair of twin brass compasses.' },
      { layout: 'split', narration: 'Saturn in Sagittarius sits opposite them (1.9° from Mars): the patient clock across the room.', dialogue: '“All right. I’ll measure twice.”', visualPrompt: 'The stern wall clock and the archer emblem behind her.' },
      { layout: 'grid', narration: 'Mended carefully, the twin compass works again. In this chart, repair is a skill worth practising.', visualPrompt: 'Sparks at the soldered joint.' },
    ] },
    { pageNumber: 6, actTitle: 'The Morning Star', placement: 'North Node in Aries 10° with Venus · 12th house', art: p6, panels: [
      { layout: 'full', narration: 'The North Node, the direction a life grows in, sits in Aries 3° from Venus. Her way forward runs through what she loves, and it starts quietly, before sunrise.', visualPrompt: 'First light: Rosalind steps out of the garden gate onto a road toward the eastern hills under the morning star.' },
      { layout: 'split', narration: 'Her Moon squares Venus (0.5°) and Jupiter (1.2°): stay by the warm window, or say yes to the road.', dialogue: '“Both. I’ll bring the road home.”', visualPrompt: 'She looks back at the lit kitchen window and smiles.' },
      { layout: 'full', narration: 'The bull keeps the garden. The crab keeps the light on. And the ram, at last, walks out of the gate.', visualPrompt: 'The road winding toward the hills under the morning star.' },
    ] },
  ],
};

/** Pages of the sample issue that are scripted but not drawn, shown in the full read-through. */
export const SAMPLE_ISSUE_SCRIPTED: ScriptedPage[] = [
  { pageNumber: 7, title: 'The Clock and the Archer', placement: 'Saturn and Uranus in Sagittarius · 8th house', summary: 'Two slow planets in the house of shared money and trust: promises are tested before they are kept, and change comes in sudden turns.' },
  { pageNumber: 8, title: 'The Room Across the Line', placement: 'Pluto in Scorpio 8°28′ · 6th house, 4.3° from the Descendant', summary: 'Pluto stands just short of the partnership line and opposite her Mercury (0.7°): the conversations that change her are the honest, intense ones.' },
  { pageNumber: 9, title: 'The Long Ladder', placement: 'Midheaven Capricorn 26°43′', summary: 'Her public direction is built step by step. Saturn, ruler of the Midheaven, sits in her 8th house, so the climb runs through commitments shared with others.' },
  { pageNumber: 10, title: 'The Lucky Window', placement: 'Part of Fortune Cancer 13°46′ · 3rd house', summary: 'Fortune falls a third of a degree from her Moon: what goes well tends to come through home and everyday talk.' },
  { pageNumber: 11, title: 'Next Month', placement: 'Cliffhanger', summary: 'A real issue turns here to the month ahead: the transits that touch the reader’s own chart decide what happens next.' },
];
