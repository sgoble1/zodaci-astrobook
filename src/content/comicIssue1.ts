import cover from '@/assets/comic-issue1-cover-v2.jpg';
import act1 from '@/assets/comic-issue1-act1.jpg';
import act2 from '@/assets/comic-issue1-act2.jpg';
import act3 from '@/assets/comic-issue1-act3.jpg';
import p4 from '@/assets/comic-issue1-p4.jpg';
import p5 from '@/assets/comic-issue1-p5.jpg';
import p6 from '@/assets/comic-issue1-p6.jpg';
import p7 from '@/assets/comic-issue1-p7.jpg';

export interface ShowcasePanel { layout: 'full' | 'split' | 'grid'; narration: string; dialogue?: string; visualPrompt: string }
export interface ShowcasePage { pageNumber: number; actTitle: string; placement: string; art: string; panels: ShowcasePanel[] }
export interface AstroComicShowcase {
  issueNumber: number; title: string; banner: string; subCaption: string; cover: string; coverAlt: string; footer: string; hero: string;
  subject: { sunSign: string; moonSign: string; risingSign: string };
  pages: ShowcasePage[];
}

/**
 * Issue #1 example. The hero "Elias" is drawn from a real calculated chart (Leo Rising 12°, Aries Sun 5° with
 * Venus retrograde, Taurus Moon on the Midheaven, Mercury in Pisces in the 8th, Mars in Cancer in the 12th,
 * Saturn square Pluto, North Node in Sagittarius). No birth place, name or biography of the chart's owner is shown.
 */
export const ISSUE_1: AstroComicShowcase = {
  issueNumber: 1,
  title: 'The Alchemist of the Mill Valley',
  hero: 'Elias',
  banner: 'Zodaci AstroComic · The Native Chronicles · Issue 01',
  subCaption: 'The ignition of the Ram beneath the Lion’s lantern.',
  cover,
  coverAlt: 'Issue 1 cover: Elias on a limestone cliff holding a glowing astrolabe above a misty mill valley, a golden Leo wheel in the night sky',
  footer: 'End of Issue #1. Next: The Starry Compass.',
  subject: { sunSign: 'Aries', moonSign: 'Taurus', risingSign: 'Leo' },
  pages: [
    { pageNumber: 1, actTitle: 'The Lantern at the Gate', placement: 'Leo Rising', art: act1, panels: [
      { layout: 'full', narration: 'Some souls arrive carrying their own light. Even on a grey day in a town of stone mills and dark water, Elias is the window that glows.', visualPrompt: 'Wide establishing shot of a mill town and creek under slate skies, one window lit amber.' },
      { layout: 'split', narration: 'Leo rising meets the world warmly and is seen before it speaks.', dialogue: '“If they’re going to look, give them something worth seeing.”', visualPrompt: 'Close-up of a face lit by lamplight through a rain-slicked pane.' },
      { layout: 'grid', narration: 'Inside: bound folios, drafting tools and sketches waiting for a spark.', visualPrompt: 'Push through the glass into a cluttered amber studio.' },
    ] },
    { pageNumber: 2, actTitle: 'The Cardinal Spark', placement: 'Sun in Aries', art: act2, panels: [
      { layout: 'full', narration: 'Locked inside the bright watcher is a cardinal fire that refuses to wait for permission.', visualPrompt: 'Embers and gold sweep the room; charcoal flies across parchment as gears take shape.' },
      { layout: 'split', narration: 'The jaw sets. The breakthrough lands.', dialogue: '“Enough planning. Let’s build it.”', visualPrompt: 'Medium shot, eyes reflecting the glow of the drawing.' },
      { layout: 'grid', narration: 'When Aries leads the charge, hesitation is a foreign language.', visualPrompt: 'Split: a match striking; a glowing screen of clean golden lines.' },
    ] },
    { pageNumber: 3, actTitle: 'The Steady Hearth', placement: 'Moon in Taurus on the Midheaven', art: act3, panels: [
      { layout: 'full', narration: 'For all the drive to conquer new horizons, the anchor stays rooted. The Taurus Moon finds safety in what can be touched: timber, warmth, a place made by hand.', visualPrompt: 'Timber-beamed loft workshop, hearth glowing, silver-blue dusk.' },
      { layout: 'split', narration: 'Slow, sure work. Tea cooling on a polished bench.', dialogue: '“Build it to last, and it will hold you too.”', visualPrompt: 'Hands arranging keepsakes beside a cup of tea.' },
      { layout: 'full', narration: 'And because this Moon sits at the top of the sky, what he loves and what he becomes known for will grow side by side.', visualPrompt: 'Doorway at twilight; a celestial wheel turns softly above the valley.' },
    ] },
    { pageNumber: 4, actTitle: 'The Ink Beneath the Tide', placement: 'Mercury in Pisces · 8th house', art: p4, panels: [
      { layout: 'full', narration: 'At night the thinking changes. Mercury in Pisces does not reason in straight lines — it dreams, then surfaces with the answer.', visualPrompt: 'Rain-dark library; ink pours from an open book like a tide.' },
      { layout: 'split', narration: 'In the 8th house, the mind is drawn to what is hidden: the reasons beneath the reasons.', dialogue: '“There’s always another page under this one.”', visualPrompt: 'Twin ink fish circle his hand.' },
      { layout: 'grid', narration: 'He learns to trust the hunch first and check it after.', visualPrompt: 'A veiled figure at the window, watching.' },
    ] },
    { pageNumber: 5, actTitle: 'The Ember Kept Close', placement: 'Mars in Cancer · 12th house', art: p5, panels: [
      { layout: 'full', narration: 'Not every fire is for show. Mars in Cancer, behind the closed door of the 12th house, fights hardest for what it protects — and often fights unseen.', visualPrompt: 'Moonlit attic; a red ember cupped in both hands.' },
      { layout: 'split', narration: 'He doesn’t announce the battle. He just doesn’t stop.', dialogue: '“Nobody needs to see this part.”', visualPrompt: 'Close on the ember, the crab tapestry behind.' },
      { layout: 'grid', narration: 'Venus squares this Mars almost exactly: wanting and doing pull against each other, and the friction makes heat.', visualPrompt: 'Silver moon through the round window.' },
    ] },
    { pageNumber: 6, actTitle: 'The Crossroads of Clock and River', placement: 'Saturn square Pluto', art: p6, panels: [
      { layout: 'full', narration: 'On one side, Saturn’s tower: rules, time, the long road. On the other, Pluto’s river: everything that must be torn down to be rebuilt. They meet at a right angle — within a single degree.', visualPrompt: 'Saturn clocktower and crimson underground river meeting at a crossroads.' },
      { layout: 'split', narration: 'Squares don’t resolve. They are carried.', dialogue: '“Then I’ll carry the lantern.”', visualPrompt: 'He lifts the lantern; the compass rose glows at his feet.' },
      { layout: 'grid', narration: 'Structure and transformation, held in the same two hands.', visualPrompt: 'Wide shot of the bridge.' },
    ] },
    { pageNumber: 7, actTitle: 'The Arrow at Dawn', placement: 'North Node in Sagittarius', art: p7, panels: [
      { layout: 'full', narration: 'The North Node points to where a life is growing. In Sagittarius, it points far: the open road, the bigger question, the city on the horizon.', visualPrompt: 'Dawn hilltop; a golden arrow loosed toward distant spires.' },
      { layout: 'split', narration: 'Venus trines this Node to a tenth of a degree. What he loves is the map.', dialogue: '“Further. Always a little further.”', visualPrompt: 'He grins, bowstring still singing.' },
      { layout: 'full', narration: 'The lion lights the gate. The ram fires the forge. The bull keeps the hearth. And the archer — at last — lets go.', visualPrompt: 'The arrow’s light crosses the whole valley.' },
    ] },
  ],
};

/** Pages of the 24-page issue that are scripted but not yet drawn, shown in the full read-through. */
export const ISSUE_1_SCRIPTED: { pageNumber: number; title: string; placement: string; summary: string }[] = [
  { pageNumber: 8, title: 'The Scale in the Square', placement: 'Jupiter in Libra · 3rd house', summary: 'A town-square argument settled with grace — Jupiter retrograde sextiles the Ascendant, luck through fair words.' },
  { pageNumber: 9, title: 'The Twin Engines', placement: 'Uranus conjunct Neptune in Capricorn · 6th house', summary: 'The workshop becomes an invention lab; vision and disruption fused into the daily craft.' },
  { pageNumber: 10, title: 'The Key in the Mirror', placement: 'Chiron in Leo · 1st house', summary: 'A cracked mirror shows the tender place — and how it becomes the gift of seeing others.' },
  { pageNumber: 11, title: 'The Partner’s Ring', placement: 'Saturn in Aquarius · 7th house', summary: 'An old friend returns with a serious offer; commitment as something built, not found.' },
  { pageNumber: 12, title: 'The Starry Compass', placement: 'Cliffhanger', summary: 'The astrolabe turns on its own — pointing to Issue #2.' },
];
