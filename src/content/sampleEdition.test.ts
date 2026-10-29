import { describe, expect, it } from 'vitest';
import { computeChart } from '@/lib/astro';

// The public sample edition prints these positions; they must match the calculated chart within 0.2°.
const c = computeChart({ date: '1993-03-25', time: '13:55', lat: 42.96395, lon: -78.73781, tz: 'America/New_York', placeLabel: '', placeSource: 'geocoded', houseSystem: 'placidus' } as never);
const body = (n: string) => c.bodies.find(b => b.name === n)!;
const near = (lon: number, want: number) => expect(Math.abs(lon - want)).toBeLessThan(0.2);

describe('sample edition placements', () => {
  it('Leo Rising 12°24′ and Taurus Midheaven 0°24′', () => { near(c.asc!, 120 + 12.4); near(c.mc!, 30 + 0.4); });
  it('Sun Aries 5°06′, Venus Aries 15°54′ retrograde', () => { near(body('Sun').lon, 5.1); near(body('Venus').lon, 15.9); expect(body('Venus').retro).toBe(true); });
  it('Moon Taurus 2°30′ in the 10th', () => { near(body('Moon').lon, 32.5); expect(body('Moon').house).toBe(10); });
  it('Chiron Leo 17°36′ in the 1st', () => { near(body('Chiron').lon, 137.6); expect(body('Chiron').house).toBe(1); });
});
