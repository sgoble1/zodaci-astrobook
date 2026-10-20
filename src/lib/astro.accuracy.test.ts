// Natal accuracy regression: reference values from the Swiss Ephemeris 2.10 (the engine behind Astrodienst),
// Placidus houses, mean node. Birth facts match the saved Shane/April profiles. Tolerance 0.1° (spec allows 1°).
import { describe, expect, it } from 'vitest';
import { computeChart, localToUtc } from './astro';

type Ref = { utc: string; asc: number; mc: number; cusps: number[]; bodies: Record<string, [number, boolean]> };
const CASES: { name: string; date: string; time: string; lat: number; lon: number; ref: Ref }[] = [
  {
    name: 'Shane', date: '1993-03-25', time: '13:55', lat: 42.96395, lon: -78.73781,
    ref: {
      utc: '1993-03-25T18:55:00.000Z', asc: 132.417, mc: 30.361,
      cusps: [132.417, 152.894, 178.324, 210.361, 247.25, 282.567, 312.417, 332.894, 358.324, 30.361, 67.25, 102.567],
      bodies: { sun: [5.136, false], moon: [32.484, false], mercury: [340.776, false], venus: [15.884, true], mars: [106.15, false], jupiter: [190.405, true], saturn: [325.983, false], uranus: [291.772, false], neptune: [290.935, false], pluto: [235.314, true], northNode: [255.989, true], chiron: [137.616, true] },
    },
  },
  {
    name: 'April', date: '1990-09-06', time: '15:38', lat: 42.86896, lon: -76.97774,
    ref: {
      utc: '1990-09-06T19:38:00.000Z', asc: 269.471, mc: 204.994,
      cusps: [269.471, 309.018, 351.399, 24.994, 49.858, 70.126, 89.471, 129.018, 171.399, 204.994, 229.858, 250.126],
      bodies: { sun: [163.949, false], moon: [6.618, false], mercury: [166.59, true], venus: [149.346, false], mars: [63.038, false], jupiter: [123.986, false], saturn: [288.923, true], uranus: [275.627, true], neptune: [281.875, true], pluto: [225.481, false], northNode: [305.286, true], chiron: [114.509, false] },
    },
  },
];
const diff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
const TOL = 0.1;

describe.each(CASES)('$name natal chart vs Swiss Ephemeris', ({ date, time, lat, lon, ref }) => {
  const c = computeChart({ date, time, lat, lon, tz: 'America/New_York', placeLabel: '', placeSource: 'geocoded', houseSystem: 'placidus' });
  it('uses the historical New York offset', () => expect(c.utc.toISOString()).toBe(ref.utc));
  it.each(Object.keys(ref.bodies))('%s position and retrograde', (k) => {
    const b = c.bodies.find(x => x.key === k)!;
    expect(diff(b.lon, ref.bodies[k][0])).toBeLessThan(TOL);
    expect(b.retro).toBe(ref.bodies[k][1]);
  });
  it('Ascendant and Midheaven', () => { expect(diff(c.asc!, ref.asc)).toBeLessThan(TOL); expect(diff(c.mc!, ref.mc)).toBeLessThan(TOL); });
  it('Placidus cusps', () => ref.cusps.forEach((x, i) => expect(diff(c.cusps![i], x)).toBeLessThan(TOL)));
});

describe('time zone handling', () => {
  it('applies EST before the 1993 DST switch and EDT after', () => {
    expect(localToUtc('1993-04-03', '12:00', 'America/New_York').offset).toBe(-300);
    expect(localToUtc('1993-04-05', '12:00', 'America/New_York').offset).toBe(-240);
  });
});

describe('cusp warnings for angles', () => {
  it('flags April’s Ascendant at 29°28′ Sagittarius as near a sign change', () => {
    const c = computeChart({ ...CASES[1], tz: 'America/New_York', placeLabel: '', placeSource: 'geocoded', houseSystem: 'placidus' });
    expect(c.flags.some(f => f.topic === 'Ascendant')).toBe(true);
  });
  it('does not flag Shane’s Ascendant at 12° Leo', () => {
    const c = computeChart({ ...CASES[0], tz: 'America/New_York', placeLabel: '', placeSource: 'geocoded', houseSystem: 'placidus' });
    expect(c.flags.some(f => f.topic === 'Ascendant')).toBe(false);
  });
});
