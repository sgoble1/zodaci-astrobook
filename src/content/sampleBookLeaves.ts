import { computeChart, type ChartInput, type ChartResult } from '@/lib/astro';
import { toChartInput, type MyBirth } from '@/lib/myBirth';
import { LEAD_COVER } from '@/content/coverSamples';
import { SAMPLE_EDITION } from '@/content/sampleEdition';
import { SAMPLE_ISSUE } from '@/content/sampleComic';
import { birthLineOf, bookInterior, comicInterior, toLeaves, type BookFace } from '@/lib/bookLeaves';
import { bookPreview } from '@/lib/personalPreview';
import { castFull, comicPreviewArt } from '@/content/castArt';
import { buildComicIssue } from '@/lib/comic';

export type BookLeaf = { front: BookFace; back: BookFace };

/**
 * One fictional sample reader everywhere: the Collector cover reader (Rosalind Vance). Her chart is calculated once
 * from the birth details printed on that cover and reused by the sample book, comic digest, demo reading and chart.
 */
let cached: ChartResult | null = null;
export const SAMPLE_READER = LEAD_COVER;
export const SAMPLE_READER_INPUT: ChartInput = { ...LEAD_COVER.birth, placeSource: 'geocoded', houseSystem: 'placidus' } as ChartInput;
export const sampleReaderChart = () => (cached ??= computeChart(SAMPLE_READER_INPUT));

const BOOK_BACK: BookFace = { kind: 'back', lines: ['Zodaci AstroBook', 'Written from one birth chart, in six volumes', 'Printed to order · free US shipping', 'zodaci.com'] };

/** The sample Collector AstroBook: calculated chart pages, then the three illustrated pages from the sample edition. */
export function sampleBookLeaves(): BookLeaf[] {
  return toLeaves(
    { kind: 'cover', src: LEAD_COVER.src, alt: LEAD_COVER.alt },
    bookInterior({ name: LEAD_COVER.name, birthLine: LEAD_COVER.printed.born, chart: sampleReaderChart(), timed: true, edition: `${LEAD_COVER.edition} edition`, pages: SAMPLE_EDITION.pages, owner: 'sample' }),
    BOOK_BACK,
  );
}

/**
 * The cover and first ten pages of a member's own AstroBook, built in the browser from their saved birth details with
 * the same chapters the printed book opens with (buildVolumes). Houses and angles are left out when the time is unknown.
 */
export function memberBookLeaves(birth: MyBirth, coverSrc: string): BookLeaf[] {
  const name = birth.name?.trim() || 'Your AstroBook';
  return personalBookLeaves({ name, birthLine: birthLineOf(birth.date, birth.time, birth.placeLabel), chart: computeChart(toChartInput(birth)), coverSrc });
}

/** Same first ten pages for any authorized chart (a founder's edition, or the member's own). */
export function personalBookLeaves({ name, birthLine, chart, coverSrc, editionLabel = 'Classic Edition' }: { name: string; birthLine: string; chart: ChartResult; coverSrc: string; editionLabel?: string }): BookLeaf[] {
  const { cover, faces } = bookPreview({ name, birthLine, chart, editionLabel, artFor: castFull });
  return toLeaves({ kind: 'cover', src: coverSrc, alt: `AstroBook cover printed with ${cover.name}` }, faces, BOOK_BACK);
}

/** The sample AstroComic digest for the same reader. */
export function sampleComicLeaves(): BookLeaf[] {
  return toLeaves(
    { kind: 'cover', src: SAMPLE_ISSUE.cover, alt: SAMPLE_ISSUE.coverAlt },
    comicInterior(SAMPLE_ISSUE, LEAD_COVER.printed.born, LEAD_COVER.printed.placements),
    { kind: 'back', lines: ['Zodaci AstroComic', 'A 24-page digest every month', 'Your chart casts the story · that month’s transits drive it', 'Printed and mailed in the US · zodaci.com'] },
  );
}

/**
 * The cover and first pages of a member's own Issue #1, scripted in the browser from their saved chart with this
 * month's transits (buildComicIssue, no AI). The cover shows the month's lead planet character; panels show the planet
 * characters the script names. Nothing is saved.
 */
export function memberComicLeaves(birth: MyBirth, upTo = 10): BookLeaf[] {
  const natal = computeChart(toChartInput(birth));
  const reader = birth.name?.trim() || 'You';
  const issue = buildComicIssue(natal, { reader, month: new Date(), issueNumber: 1 });
  const art = comicPreviewArt(issue, upTo);
  const faces: BookFace[] = [
    { kind: 'endpaper', eyebrow: 'This issue stars', heading: reader, lines: [birthLineOf(birth.date, birth.time, birth.placeLabel), [issue.signs.sun && `${issue.signs.sun} Sun`, issue.signs.moon && `${issue.signs.moon} Moon`, issue.signs.rising && `${issue.signs.rising} Rising`].filter(Boolean).join(' · '), `${issue.monthLabel} · calculated from your chart`] },
    ...issue.pages.filter(p => p.n <= upTo && p.section !== 'Cover').map((p): BookFace => {
      const first = p.panels[0];
      const talk = p.panels.flatMap(x => x.balloons ?? [])[0];
      return { kind: 'comic', src: art[`${p.n}-0`] ?? castFull(issue.cast?.lead ?? 'sun'), alt: first?.scene ?? p.title, title: p.title, placement: p.section, caption: first?.caption ?? p.body?.[0] ?? first?.scene ?? '', dialogue: talk ? `${talk.who}: ${talk.text}` : undefined, page: p.n };
    }),
  ];
  return toLeaves({ kind: 'cover', src: castFull(issue.cast?.lead ?? 'sun'), alt: `AstroComic Issue 1 cover for ${reader}, ${issue.signs.sun} Sun` }, faces, { kind: 'back', lines: ['Zodaci AstroComic', 'The full issue runs 24 pages', 'Printed and mailed in the US · zodaci.com'] });
}
