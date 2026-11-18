import { SIGN_COVERS } from '@/content/signCovers';
import { balance } from '@/lib/resultsEngine';
import { dominantElement } from '@/lib/chartTitle';
import { chartRuler } from '@/lib/personalPreview';
import type { ChartResult } from '@/lib/astro';
import { bookPlateSpec, renderBookPlate } from '@/lib/bookPlate';

export const ELEMENTS = ['Fire', 'Earth', 'Air', 'Water'] as const;
const SIGN_ELEMENT: Record<string, string> = Object.fromEntries(Object.keys(SIGN_COVERS).map(sign => [sign, ['Aries', 'Leo', 'Sagittarius'].includes(sign) ? 'Fire' : ['Taurus', 'Virgo', 'Capricorn'].includes(sign) ? 'Earth' : ['Gemini', 'Libra', 'Aquarius'].includes(sign) ? 'Air' : 'Water']));
export type BookArtwork = { sign: string; ruler: string; element: string; cover: string; plate: string; back: string };

/** Symbolic print artwork only. The caller must already be authorized to supply this chart. */
export function resolveBookArtwork(chart: ChartResult): BookArtwork {
  const sun = chart.bodies.find(b => b.key === 'sun');
  if (!sun || !SIGN_COVERS[sun.sign]) throw new Error('No zodiac artwork exists for the calculated Sun sign.');
  const ruler = chartRuler(chart);
  const counted = chart.input.time ? chart : { ...chart, bodies: chart.bodies.filter(b => b.key !== 'moon') };
  const element = dominantElement(balance(counted).el) ?? SIGN_ELEMENT[sun.sign];
  const plate = renderBookPlate(bookPlateSpec(chart, ruler, element));
  const back = plate;
  return { sign: sun.sign, ruler, element, cover: SIGN_COVERS[sun.sign], plate, back };
}