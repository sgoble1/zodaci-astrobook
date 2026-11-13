import { describe, expect, it } from 'vitest';
import { COVER_DESIGNS, designVariant } from './coverDesigns';
import { BOOK_VERSIONS } from '@/lib/books';
import { artPpi } from '@/lib/coverLayout';

const art = COVER_DESIGNS.filter(d => d.kind === 'art');

describe('artwork covers print sharp at every AstroBook size', () => {
  it('Signature (square) uses the square artwork', () => {
    for (const d of art) expect(designVariant(d, [612, 612])!.size).toEqual([1920, 1920]);
  });
  it("Collector's Linen (8.5 × 11) uses the US Letter artwork", () => {
    for (const d of art) expect(designVariant(d, [612, 792])!.size).toEqual([1488, 1920]);
  });
  it('Classic (6 × 9) uses the 2:3 artwork', () => {
    for (const d of art) expect(designVariant(d, [432, 648])!.size).toEqual([1280, 1920]);
  });
  it('no version prints our artwork below 150 pixels per inch at the default framing', () => {
    for (const d of art) for (const v of BOOK_VERSIONS) {
      const { size } = designVariant(d, v.trimPt)!;
      expect(artPpi(size[0], size[1], v.trimPt[0] / 72, v.trimPt[1] / 72, 1)).toBeGreaterThanOrEqual(150);
    }
  });
});

describe('cover suite', () => {
  it('offers the four named suite covers', () => {
    const labels = COVER_DESIGNS.map(d => d.label);
    for (const l of ['Midnight Stars', 'Celestial Cartographer', 'Deep Orbit', 'Vintage Monogram']) expect(labels).toContain(l);
  });
  it('monogram uses up to three initials from the name, or a star before a name is typed', async () => {
    const { monogramFor } = await import('./coverDesigns');
    expect(monogramFor('mary ann lee')).toBe('MAL');
    expect(monogramFor('Jean-Luc Picard Smith')).toBe('JLP');
    expect(monogramFor('  ')).toBe('✦');
  });
});
