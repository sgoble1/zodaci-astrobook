import { computeChart, type ChartInput, type ChartResult } from '@/lib/astro';
import { toChartInput, type MyBirth } from '@/lib/myBirth';
import { LEAD_COVER } from '@/content/coverSamples';
import { SAMPLE_EDITION } from '@/content/sampleEdition';
import { SAMPLE_ISSUE } from '@/content/sampleComic';
import { birthLineOf, bookInterior, comicInterior, toLeaves, type BookFace } from '@/lib/bookLeaves';
import { bookPreview } from '@/lib/personalPreview';
import { castFull } from '@/content/castArt';

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
