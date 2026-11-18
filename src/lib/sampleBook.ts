import type { MyBirth } from '@/lib/myBirth';
import { sampleBookLeaves } from '@/content/sampleBookLeaves';
import { previewPdf } from '@/lib/previewPdf';
import type { BookFace } from '@/lib/bookLeaves';

/**
 * The fictional reader used for the public sample book: the same Rosalind Vance printed on the sample Collector cover,
 * so the sample book, comic, demo and chart all describe one calculated birth moment.
 */
export const SAMPLE_BIRTH: MyBirth = {
  name: 'Rosalind Vance',
  date: '1987-05-03',
  time: '06:42',
  placeLabel: 'Asheville, North Carolina',
  lat: 35.5951,
  lon: -82.5515,
  tz: 'America/New_York',
  houseSystem: 'placidus',
};

/** The downloadable sample is the same 28-page fictional preview as the page-turning reader. */
export function samplePreviewFaces(maxPages?: number): BookFace[] {
  const limit = maxPages === undefined ? Infinity : Math.max(0, Math.floor(maxPages));
  return sampleBookLeaves().flatMap(l => [l.front, l.back]).filter(f => !('page' in f) || f.page === undefined || f.page <= limit);
}

/** Limits refer to numbered interior pages, never PDF sheets (cover/end matter are extra). */
export async function composeSampleBook(maxPages?: number) {
  const faces = samplePreviewFaces(maxPages);
  return { blob: await previewPdf(faces), pages: faces.length };
}
