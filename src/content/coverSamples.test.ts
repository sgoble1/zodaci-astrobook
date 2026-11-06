import { describe, expect, it } from 'vitest';
import { computeChart, SIGNS } from '@/lib/astro';
import { coverBirthLine } from '@/lib/coverLayout';
import { COVER_SAMPLES } from './coverSamples';

const FOUNDER_DATES = ['1993-03-25'];
const at = (lon: number) => `${SIGNS[Math.floor(lon / 30)]} ${Math.floor(lon % 30)}°`;

describe('public AstroBook sample covers', () => {
  for (const s of COVER_SAMPLES) {
    it(`${s.name}: the printed birth line matches the sample birth moment`, () => {
      expect(coverBirthLine(s.birth)).toBe(s.printed.born);
    });
    it(`${s.name}: Sun, Moon and Rising printed on the cover are the calculated ones`, () => {
      const c = computeChart({ ...s.birth, placeSource: 'geocoded', houseSystem: 'placidus' } as never);
      const sun = c.bodies.find(b => b.name === 'Sun')!, moon = c.bodies.find(b => b.name === 'Moon')!;
      expect(s.printed.placements).toBe(`Sun ${at(sun.lon)} · Moon ${at(moon.lon)} · Rising ${at(c.asc!)}`);
      expect(at(sun.lon).startsWith(s.sign)).toBe(true);
    });
  }
  it('never uses a founder’s birth moment', () => {
    for (const s of COVER_SAMPLES) expect(FOUNDER_DATES).not.toContain(s.birth.date);
  });
});
