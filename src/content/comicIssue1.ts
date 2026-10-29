import cover from '@/assets/comic-issue1-cover.jpg';
import act1 from '@/assets/comic-issue1-act1.jpg';
import act2 from '@/assets/comic-issue1-act2.jpg';
import act3 from '@/assets/comic-issue1-act3.jpg';

export interface ShowcasePanel { layout: 'full' | 'split' | 'grid'; narration: string; dialogue?: string; visualPrompt: string }
export interface ShowcasePage { pageNumber: number; actTitle: string; placement: string; art: string; panels: ShowcasePanel[] }
export interface AstroComicShowcase {
  issueNumber: number; title: string; banner: string; subCaption: string; cover: string; footer: string;
  subject: { sunSign: string; moonSign: string; risingSign: string };
  pages: ShowcasePage[];
}

/**
 * Issue #1 showcase, adapted from the owner's production blueprint. The Big Three are the computed chart
 * (verified birth time): Aries Sun, Taurus Moon, Leo Rising — the blueprint's Scorpio Rising / Cancer Moon came
 * from a different birth time, so the acts follow the calculated placements. Exact birth time/place are not shown publicly.
 */
export const ISSUE_1: AstroComicShowcase = {
  issueNumber: 1,
  title: 'The Alchemist of Williamsville',
  banner: 'Zodaci AstroComic: The Native Chronicles — Issue 01',
  subCaption: 'The ignition of the Ram beneath the Lion’s lantern.',
  cover,
  footer: 'End of Issue #1. Next: The Starry Compass.',
  subject: { sunSign: 'Aries', moonSign: 'Taurus', risingSign: 'Leo' },
  pages: [
    { pageNumber: 1, actTitle: 'Act I · The Lantern at the Gate', placement: 'Leo Rising', art: act1, panels: [
      { layout: 'full', narration: 'Some souls arrive carrying their own light. Even on a grey day in a town of stone mills and dark water, they are the window that glows.', visualPrompt: 'Wide establishing shot of a mill town and creek under slate skies, one window lit amber.' },
      { layout: 'split', narration: 'Leo rising meets the world warmly and is seen before it speaks.', dialogue: '“If they’re going to look, give them something worth seeing.”', visualPrompt: 'Close-up of a face lit by lamplight through a rain-slicked pane.' },
      { layout: 'grid', narration: 'Inside: bound folios, drafting tools and sketches waiting for a spark.', visualPrompt: 'Push through the glass into a cluttered amber studio.' },
    ] },
    { pageNumber: 2, actTitle: 'Act II · The Cardinal Spark', placement: 'Sun in Aries', art: act2, panels: [
      { layout: 'full', narration: 'Locked inside the bright watcher is a cardinal fire that refuses to wait for permission.', visualPrompt: 'Embers and gold sweep the room; charcoal flies across parchment as gears take shape.' },
      { layout: 'split', narration: 'The jaw sets. The breakthrough lands.', dialogue: '“Enough planning. Let’s build it.”', visualPrompt: 'Medium shot, eyes reflecting the glow of the drawing.' },
      { layout: 'grid', narration: 'When Aries leads the charge, hesitation is a foreign language. The world is raw material waiting to be forged.', visualPrompt: 'Split: a match striking; a glowing screen of clean golden lines.' },
    ] },
    { pageNumber: 3, actTitle: 'Act III · The Steady Hearth', placement: 'Moon in Taurus', art: act3, panels: [
      { layout: 'full', narration: 'For all the drive to conquer new horizons, the anchor stays rooted. The Moon in Taurus finds safety in what can be touched: timber, warmth, a place made by hand.', visualPrompt: 'Timber-beamed loft workshop, hearth glowing, silver-blue dusk.' },
      { layout: 'split', narration: 'Slow, sure work. Tea cooling on a polished bench.', dialogue: '“Build it to last, and it will hold you too.”', visualPrompt: 'Hands arranging keepsakes beside a cup of tea.' },
      { layout: 'full', narration: 'Leo rising to light the gate. Aries burning to fire the forge. Taurus holding the hearth. This is the blueprint of the native.', visualPrompt: 'Standing in the doorway at twilight; a celestial wheel turns softly above the valley.' },
    ] },
  ],
};
