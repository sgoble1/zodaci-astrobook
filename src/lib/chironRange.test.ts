import { describe, it, expect } from 'vitest';
import { computeChart } from './astro';

const chart = (date: string) => computeChart({ date, time: '12:00', lat: 40.71, lon: -74.0, tz: 'America/New_York', placeLabel: '', placeSource: 'geocoded', houseSystem: 'placidus' });

describe('Chiron range notice', () => {
  it('leaves Chiron out before 1940 and says so', () => {
    const c = chart('1935-06-01');
    expect(c.bodies.some(b => b.key === 'chiron')).toBe(false);
    expect(c.flags.some(f => f.topic === 'Chiron')).toBe(true);
  });
  it('includes Chiron inside 1940–2060 with no notice', () => {
    const c = chart('1990-09-06');
    expect(c.bodies.some(b => b.key === 'chiron')).toBe(true);
    expect(c.flags.some(f => f.topic === 'Chiron')).toBe(false);
  });
});
