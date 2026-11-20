import shaneCover from '@/assets/products/shane-atomic-comic-cover.jpg';
import aprilCover from '@/assets/products/atomic-relay-cover.png.asset.json';
import zacCover from '@/assets/products/atomic-bridge-cover.png.asset.json';
import type { ComicIssue } from '@/lib/comic';
import cover from '@/assets/products/researcher-orbit-cover.jpg';
import s1 from '@/assets/comic-story/signal-1.jpg';
import s2 from '@/assets/comic-story/signal-2.jpg';
import s3 from '@/assets/comic-story/signal-3.jpg';
import s4 from '@/assets/comic-story/signal-4.jpg';
import r1 from '@/assets/comic-story/repair-1.jpg';
import r2 from '@/assets/comic-story/repair-2.jpg';
import r3 from '@/assets/comic-story/repair-3.jpg';
import r4 from '@/assets/comic-story/repair-4.jpg';
import f1 from '@/assets/comic-story/resolution-1.jpg';
import f2 from '@/assets/comic-story/resolution-2.jpg';
import f3 from '@/assets/comic-story/resolution-3.jpg';
import f4 from '@/assets/comic-story/resolution-4.jpg';
import terrace from '@/assets/comic-story/observatory-splash.jpg';
import detail from '@/assets/comic-story/workshop-detail.jpg';

/** Symbolic reference scenes only; never marked as final buyer artwork. */
export const COMIC_SCENES: Record<string, string> = {
  cover, terrace, detail, console: s1, lamp: s2, drawing: s3, archive: s4,
  workshop: r1, conduit: r2, circuit: r3, foundation: r4,
  bridge: f1, agreement: f2, ensemble: f3, dawn: f4,
  // Legacy saved scripts retain their original pictures; new previews use named story beats.
  'signal-1': s1, 'signal-2': s2, 'signal-3': s3, 'signal-4': s4, 'repair-1': r1, 'repair-2': r2, 'repair-3': r3, 'repair-4': r4, 'resolution-1': f1, 'resolution-2': f2, 'resolution-3': f3, 'resolution-4': f4,
};
/** Select artwork by explicit authorized edition identity, for its shelf or composed issue. Public samples never use it. */
export function comicCoverArtwork(issue: Pick<ComicIssue, 'edition'>): string | undefined {
  if (issue.edition === 'april') return aprilCover.url;
  if (issue.edition === 'zac') return zacCover.url;
  if (issue.edition === 'shane') return shaneCover;
  return undefined;
}
