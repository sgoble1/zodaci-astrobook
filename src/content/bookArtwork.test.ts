import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { computeChart, SIGNS } from '@/lib/astro';
import { ELEMENTS, resolveBookArtwork } from './bookArtwork';
import { SIGN_COVERS } from './signCovers';
import { CAST_FULL } from './castArt';
import { sampleReaderChart, sampleBookLeaves } from './sampleBookLeaves';

const diskPath = (src: string) => src.split('?')[0].replace(/^\/src\//, 'src/');
describe('complete atomic AstroBook artwork', () => {
  it('resolves real assets for all twelve signs and ten planetary rulers', () => {
    expect(Object.keys(SIGN_COVERS)).toHaveLength(12);
    expect(Object.keys(CAST_FULL)).toHaveLength(10);
    for (const src of [...Object.values(SIGN_COVERS), ...Object.values(CAST_FULL)]) expect(existsSync(diskPath(src)), src).toBe(true);
    const chart = sampleReaderChart();
    for (const [index, sign] of SIGNS.entries()) {
      const c = { ...chart, asc: index * 30 + 5, bodies: chart.bodies.map(b => b.key === 'sun' ? { ...b, sign, lon: index * 30 + 5 } : b) };
      expect(resolveBookArtwork(c).cover).toBe(SIGN_COVERS[sign]);
      expect(resolveBookArtwork(c).plate).toBeTruthy();
    }
  });
  it('keeps all four element plates available and uses date-only counts without a provisional Moon', () => {
    expect(ELEMENTS).toEqual(['Fire', 'Earth', 'Air', 'Water']);
    const c = computeChart({ ...sampleReaderChart().input, time: null });
    const changed = { ...c, bodies: c.bodies.map(b => b.key === 'moon' ? { ...b, sign: 'Aries' } : b) };
    expect(resolveBookArtwork(changed).element).toBe(resolveBookArtwork(c).element);
  });
  it('wires Rosalind’s ruler plate and elemental back into the shared demo book', () => {
    const art = resolveBookArtwork(sampleReaderChart());
    expect(art.sign).toBe('Taurus');
    expect(art.ruler).toBe('venus');
    const faces = sampleBookLeaves().flatMap(l => [l.front, l.back]);
    expect(faces.find(f => f.kind === 'plate')).toMatchObject({ src: art.plate, page: 6 });
    expect(faces.at(-1)).toMatchObject({ kind: 'back', art: art.back });
  });
});