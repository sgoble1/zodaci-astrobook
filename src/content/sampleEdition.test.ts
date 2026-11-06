import { describe, expect, it } from 'vitest';
import { computeChart } from '@/lib/astro';
import { COVER_SAMPLES } from './coverSamples';
import { SAMPLE_EDITION } from './sampleEdition';

// The public sample edition prints these positions for the fictional Collector-cover reader; they must match the
// calculated chart within 0.2°, and the chart must never be a founder's.
const reader = COVER_SAMPLES.find(s => s.id === 'collector')!;
const c = computeChart({ ...reader.birth, placeSource: 'geocoded', houseSystem: 'placidus' } as never);
const body = (n: string) => c.bodies.find(b => b.name === n)!;
const near = (lon: number, want: number) => expect(Math.abs(lon - want)).toBeLessThan(0.2);
const FOUNDER_DATES = ['1993-03-25'];

describe('sample edition placements', () => {
  it('belongs to the fictional Collector reader, not a founder', () => {
    expect(SAMPLE_EDITION.owner).toBe(reader.name);
    expect(FOUNDER_DATES).not.toContain(reader.birth.date);
  });
  it('Taurus Rising 12°47′ with the Sun 12°29′ in the 12th', () => { near(c.asc!, 30 + 12.78); near(body('Sun').lon, 30 + 12.48); expect(body('Sun').house).toBe(12); });
  it('Venus Aries 13°00′ and Jupiter Aries 14°42′ in the 12th; Mercury Taurus 7°49′', () => {
    near(body('Venus').lon, 13.0); near(body('Jupiter').lon, 14.7); near(body('Mercury').lon, 30 + 7.82);
    expect([body('Venus').house, body('Jupiter').house, body('Mercury').house]).toEqual([12, 12, 12]);
  });
  it('Moon Cancer 13°28′ in the 3rd', () => { near(body('Moon').lon, 90 + 13.47); expect(body('Moon').house).toBe(3); });
});
