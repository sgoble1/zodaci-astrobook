import sunHead from '@/assets/comic-cast/sun.jpg';
import moonHead from '@/assets/comic-cast/moon.jpg';
import mercuryHead from '@/assets/comic-cast/mercury.jpg';
import venusHead from '@/assets/comic-cast/venus.jpg';
import marsHead from '@/assets/comic-cast/mars.jpg';
import jupiterHead from '@/assets/comic-cast/jupiter.jpg';
import saturnHead from '@/assets/comic-cast/saturn.jpg';
import uranusHead from '@/assets/comic-cast/uranus.jpg';
import neptuneHead from '@/assets/comic-cast/neptune.jpg';
import plutoHead from '@/assets/comic-cast/pluto.jpg';
import sunFull from '@/assets/comic-cast/sun-full.jpg';
import moonFull from '@/assets/comic-cast/moon-full.jpg';
import mercuryFull from '@/assets/comic-cast/mercury-full.jpg';
import venusFull from '@/assets/comic-cast/venus-full.jpg';
import marsFull from '@/assets/comic-cast/mars-full.jpg';
import jupiterFull from '@/assets/comic-cast/jupiter-full.jpg';
import saturnFull from '@/assets/comic-cast/saturn-full.jpg';
import uranusFull from '@/assets/comic-cast/uranus-full.jpg';
import neptuneFull from '@/assets/comic-cast/neptune-full.jpg';
import plutoFull from '@/assets/comic-cast/pluto-full.jpg';
import skyPanel from '@/assets/astrocomic-sky-panel.jpg';
import letterPanel from '@/assets/astrocomic-letter-panel.jpg';
import { comicArtSlots, PREVIEW_PAGES } from '@/lib/personalPreview';
import type { ComicIssue } from '@/lib/comic';

/** The ten AstroComic planet characters, cut from the shared cast sheet: head crops and full figures. */
export const CAST_HEAD: Record<string, string> = { sun: sunHead, moon: moonHead, mercury: mercuryHead, venus: venusHead, mars: marsHead, jupiter: jupiterHead, saturn: saturnHead, uranus: uranusHead, neptune: neptuneHead, pluto: plutoHead };
export const CAST_FULL: Record<string, string> = { sun: sunFull, moon: moonFull, mercury: mercuryFull, venus: venusFull, mars: marsFull, jupiter: jupiterFull, saturn: saturnFull, uranus: uranusFull, neptune: neptuneFull, pluto: plutoFull };
export const castFull = (key: string) => CAST_FULL[key] ?? CAST_FULL.sun;

/** Panel key → picture for an issue's first pages: shared sky/letter scenes, otherwise the planet character the script names. */
export function comicPreviewArt(issue: ComicIssue, upTo = PREVIEW_PAGES): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, slot] of Object.entries(comicArtSlots(issue, upTo))) out[key] = slot === 'sky' ? skyPanel : slot === 'letter' ? letterPanel : castFull(slot);
  return out;
}
