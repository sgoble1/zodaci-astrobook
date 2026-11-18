import shaneResearcher from '@/assets/products/researcher-orbit-cover.jpg';
import { resolveBookArtwork } from '@/content/bookArtwork';
import type { ChartResult } from '@/lib/astro';

/** Artwork selection is presentation only; callers must already have authorization to the supplied chart. */
export function personalCoverArtwork(name: string, chart: ChartResult): string {
  return /^(shane|julian mercer)\b/i.test(name.trim()) ? shaneResearcher : resolveBookArtwork(chart).cover;
}