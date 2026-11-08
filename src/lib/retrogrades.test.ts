import { describe, expect, it } from 'vitest';
import { housesCrossed, natalRetrogrades, periodDays, retrogradePeriods } from './retrogrades';
import { computeChart } from './astro';

const near = (d: Date | undefined, iso: string, days = 1) => {
  expect(d).toBeDefined();
  expect(Math.abs(d!.getTime() - Date.parse(iso)) / 864e5).toBeLessThanOrEqual(days);
};

describe('retrograde periods from the ephemeris', () => {
  const y2024 = retrogradePeriods(new Date('2024-01-01T00:00:00Z'), 365);
  const mercury = y2024.filter(p => p.key === 'mercury');

  it('finds the three 2024 Mercury retrogrades on the published days', () => {
    const april = mercury.find(p => p.start.getUTCMonth() === 3)!;
    near(april.start, '2024-04-01'); near(april.end, '2024-04-25');
    expect(april.from.sign).toBe('Aries'); expect(april.to.sign).toBe('Aries');
    const aug = mercury.find(p => p.start.getUTCMonth() === 7)!;
    near(aug.start, '2024-08-05'); near(aug.end, '2024-08-28');
    expect(aug.from.sign).toBe('Virgo'); expect(aug.to.sign).toBe('Leo');
    const nov = mercury.find(p => p.start.getUTCMonth() === 10)!;
    near(nov.start, '2024-11-26'); near(nov.end, '2024-12-15');
    expect(nov.from.sign).toBe('Sagittarius');
  });

  it('includes a period already under way on the first day, with its real start', () => {
    const dec = mercury.find(p => p.start.getUTCFullYear() === 2023)!;
    near(dec.start, '2023-12-13'); near(dec.end, '2024-01-01');
  });

  it('dates the April 2024 Mercury shadow (Mar 18 to May 13)', () => {
    const april = mercury.find(p => p.start.getUTCMonth() === 3)!;
    near(april.preShadow, '2024-03-18'); near(april.postShadow, '2024-05-13');
  });

  it('finds Saturn retrograde in Pisces, Jun 29 to Nov 15 2024', () => {
    const sat = y2024.find(p => p.key === 'saturn' && p.start.getUTCFullYear() === 2024)!;
    near(sat.start, '2024-06-29'); near(sat.end, '2024-11-15');
    expect(sat.from.sign).toBe('Pisces');
    expect(periodDays(sat)).toBeGreaterThan(130);
    expect(sat.preShadow).toBeUndefined();
  });

  it('lists the houses a period crosses, in retrograde order', () => {
    const equal = Array.from({ length: 12 }, (_, i) => i * 30);
    const aug = mercury.find(p => p.start.getUTCMonth() === 7)!;
    expect(housesCrossed(aug, equal)).toEqual([6, 5]);
    expect(housesCrossed(aug, null)).toEqual([]);
  });

  it('reads natal retrogrades from the chart, never the Node', () => {
    // 10 Aug 2024 noon UTC: Mercury (Aug 5–28) and Saturn (Jun 29–Nov 15) were both retrograde.
    const chart = computeChart({ date: '2024-08-10', time: '12:00', lat: 51.5, lon: 0, tz: 'UTC', placeLabel: 'London', placeSource: 'geocoded', houseSystem: 'placidus' });
    const keys = natalRetrogrades(chart).map(b => b.key);
    expect(keys).toContain('mercury');
    expect(keys).toContain('saturn');
    expect(keys).not.toContain('northNode');
    expect(keys.some(k => /node/i.test(k))).toBe(false);
  });
});
