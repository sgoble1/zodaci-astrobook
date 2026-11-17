import type { MyBirth } from '@/lib/myBirth';
import { sampleBookLeaves } from '@/content/sampleBookLeaves';
import { previewPdf } from '@/lib/previewPdf';

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

/** The downloadable sample is the same 25-page fictional preview as the page-turning reader. */
export async function composeSampleBook() {
  const faces = sampleBookLeaves().flatMap(l => [l.front, l.back]).filter(f => f.kind !== 'blank');
  return { blob: await previewPdf(faces), pages: faces.length };
}
