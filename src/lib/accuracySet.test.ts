import { describe, expect, it } from 'vitest';
import { ACCURACY_CASES, ACCURACY_TOLERANCE, checkCase, runAccuracySet } from './accuracySet';
import { computeChart } from './astro';

describe.each(ACCURACY_CASES)('$place ($date $time) vs Swiss Ephemeris', (c) => {
  const r = checkCase(c);
  it('converts local clock time with the historical offset', () => expect(r.chart.utc.toISOString()).toBe(c.ref.utc));
  it.each(r.rows.map(x => [x.point, x] as const))('%s within 0.1° and matching direction', (_p, row) => {
    expect(row.diff).toBeLessThan(ACCURACY_TOLERANCE);
    expect(row.retroOk).not.toBe(false);
  });
  it('shows the Porphyry notice only where Placidus has no solution', () => expect(r.houseNoteOk).toBe(true));
});

describe('accuracy set summary', () => {
  const s = runAccuracySet();
  it('checks 13 public moments and 26 points each', () => { expect(s.charts).toBe(13); expect(s.points).toBe(13 * 26); });
  it('passes every point', () => expect(s.passed).toBe(s.points));
});

describe('edge cases from the house-cusp rules', () => {
  it('Tromsø at midsummer falls back to Porphyry with a notice', () => {
    const c = ACCURACY_CASES.find(x => x.id === 'tromso-midsummer')!;
    expect(c.ref.porphyry).toBe(true);
    expect(checkCase(c).chart.flags.find(f => f.topic === 'Houses')?.note).toMatch(/Porphyry/);
  });
  it('southern hemisphere houses are not mirrored: cusp 1 is the Ascendant and cusps run counter-clockwise', () => {
    for (const id of ['sydney-summer', 'buenos-aires']) {
      const ch = checkCase(ACCURACY_CASES.find(x => x.id === id)!).chart;
      expect(ch.cusps![0]).toBeCloseTo(ch.asc!, 6);
      for (let i = 0; i < 12; i++) { const gap = ((ch.cusps![(i + 1) % 12] - ch.cusps![i]) + 360) % 360; expect(gap).toBeGreaterThan(0); expect(gap).toBeLessThan(180); }
    }
  });
  it('the eclipse case puts the Sun and Moon within half a degree', () => {
    const ch = checkCase(ACCURACY_CASES.find(x => x.id === 'dallas-eclipse')!).chart;
    const d = Math.abs(((ch.bodies[0].lon - ch.bodies[1].lon + 540) % 360) - 180);
    expect(d).toBeLessThan(0.5);
  });
  it('an unknown birth time computes no angles or houses', () => {
    const ch = computeChart({ date: '2000-01-01', time: null, lat: 51.4769, lon: -0.0005, tz: 'Europe/London', placeLabel: '', placeSource: 'geocoded' });
    expect(ch.asc).toBeNull(); expect(ch.cusps).toBeNull();
    expect(ch.flags.some(f => f.topic === 'Birth time')).toBe(true);
  });
});
