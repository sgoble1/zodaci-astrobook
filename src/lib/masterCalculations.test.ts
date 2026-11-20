import { describe, expect, it } from 'vitest';
import * as Astronomy from 'astronomy-engine';
import { computeChart, eclLon } from './astro';
import { annualProfection, birthdayAge } from './profections';
import { baziBalance } from './bazi';
import { LO_SHU, loShu } from './loshu';
import { classifyLongitudes } from './jonesShapes';
import { trueNode, meanNode } from './lunarNodes';
import { motionState, planetSpeed, planetarySpeeds } from './planetaryDynamics';
import { solarReturn } from './solarReturn';

const input = { date: '2000-02-29', time: '12:30', lat: 40.7, lon: -74, tz: 'America/New_York', placeLabel: 'Test location', placeSource: 'geocoded' as const, houseSystem: 'placidus' as const };
const chart = computeChart(input);
const separation = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
describe('annual profections', () => {
  it('birth activates house 1, age 11 house 12, age 12 house 1, age 100 house 5', () => {
    expect([0, 11, 12, 100].map(age => annualProfection(chart, age)?.house)).toEqual([1, 12, 1, 5]);
  });
  it('uses the traditional ruler of the rising whole sign', () => {
    const leo = { ...chart, asc: 132.417 };
    expect(annualProfection(leo, 0)).toMatchObject({ sign: 'Leo', lordKey: 'sun' });
    expect(annualProfection(leo, 3)).toMatchObject({ sign: 'Scorpio', lordKey: 'mars' });
  });
  it('has no house/ruler without a known time', () => expect(annualProfection(computeChart({ ...input, time: null }), 33)).toBeNull());
  it('rejects ages outside the 0–100 integer slider contract', () => {
    for (const age of [-1, 101, 1.5, NaN]) expect(() => annualProfection(chart, age)).toThrow();
  });
  it('advances on civil birthdays including leap-day March 1 convention', () => {
    expect(birthdayAge('2000-02-29', new Date(2026, 1, 28))).toBe(25);
    expect(birthdayAge('2000-02-29', new Date(2026, 2, 1))).toBe(26);
    expect(birthdayAge('2000-03-25', new Date(2026, 2, 24))).toBe(25);
    expect(birthdayAge('2000-03-25', new Date(2026, 2, 25))).toBe(26);
  });
});
describe('Four Pillars and Lo Shu', () => {
  it('uses eight visible elements for timed and six for untimed pillars', () => {
    expect(baziBalance(chart).total).toBe(8);
    const unknown = baziBalance(computeChart({ ...input, time: null }));
    expect(unknown.total).toBe(6); expect(unknown.hourKnown).toBe(false);
  });
  it('uses Lichun solar boundary for the year/month, not lunar new year', () => {
    const before = computeChart({ ...input, date: '2024-02-03', time: '12:00', tz: 'Asia/Shanghai' });
    const after = computeChart({ ...input, date: '2024-02-05', time: '12:00', tz: 'Asia/Shanghai' });
    expect(before.bazi[0].romanized).toBe('Gui Mao');
    expect(after.bazi[0].romanized).toBe('Jia Chen');
    expect(after.bazi[1].romanized).toBe('Bing Yin');
  });
  it('uses the local date day pillar and omits zeros from Lo Shu', () => {
    const grid = loShu('1993-03-25');
    expect(LO_SHU).toEqual([4, 9, 2, 3, 5, 7, 8, 1, 6]);
    expect(grid.counts).toEqual([0, 1, 1, 2, 0, 1, 0, 0, 0, 2]);
    expect(grid.complete).toContainEqual([9, 5, 1]);
    expect(grid.absent).not.toContainEqual([4, 3, 8]);
    expect(() => loShu('2026-02-30')).toThrow();
  });
});
describe('exact solar returns', () => {
  it('aligns Sun within 0.001 degrees in the requested year', () => {
    const r = solarReturn(chart, 2026, input);
    expect(r.instant.getUTCFullYear()).toBe(2026);
    expect(separation(eclLon(Astronomy.Body.Sun, r.instant), chart.bodies[0].lon)).toBeLessThan(0.001);
    expect(r.chart.utc.getTime()).toBe(r.instant.getTime());
  });
  it('relocation changes angles but not the UTC instant or planetary longitudes', () => {
    const home = solarReturn(chart, 2026, input);
    const away = solarReturn(chart, 2026, { lat: 51.5, lon: -0.1, tz: 'Europe/London', placeLabel: 'London' });
    expect(home.instant.getTime()).toBe(away.instant.getTime());
    expect(home.chart.asc).not.toBe(away.chart.asc);
    const planets = (c: typeof chart) => c.bodies.filter(b => !['fortune', 'vertex'].includes(b.key)).map(b => b.lon);
    expect(planets(home.chart)).toEqual(planets(away.chart));
    expect(home.chart.bodies.find(b => b.key === 'vertex')?.lon).not.toBe(away.chart.bodies.find(b => b.key === 'vertex')?.lon);
  });
  it('untimed returns retain uncertainty, and polar Placidus uses declared fallback', () => {
    const untimed = solarReturn(computeChart({ ...input, time: null }), 2026, input);
    expect(untimed.provisional).toBe(true); expect(untimed.chart.cusps).toBeNull(); expect(untimed.chart.asc).toBeNull();
    const polar = solarReturn(chart, 2026, { ...input, lat: 80 });
    expect(polar.chart.cusps).toHaveLength(12);
    expect(polar.chart.flags.some(f => f.topic === 'Houses' && /Porphyry/.test(f.note))).toBe(true);
  });
  it('rejects invalid relocation and year input', () => {
    expect(() => solarReturn(chart, 2101, input)).toThrow();
    expect(() => solarReturn(chart, 2026, { ...input, lat: 90 })).toThrow();
    expect(() => solarReturn(chart, 2026, { ...input, tz: 'Invalid/Zone' })).toThrow();
  });
});
describe('Jones geometric working definitions', () => {
  it.each([
    ['Bundle', [0, 10, 20, 30, 40, 50, 60, 70, 80, 100]],
    ['Bowl', [0, 10, 20, 40, 60, 80, 100, 120, 140, 170]],
    ['Bucket', [0, 10, 20, 30, 40, 60, 80, 100, 120, 240]],
    ['Locomotive', [0, 25, 50, 75, 100, 125, 150, 175, 200, 230]],
    ['Splash', [0, 36, 72, 108, 144, 180, 216, 252, 288, 324]],
    ['Seesaw', [0, 10, 20, 30, 40, 180, 190, 200, 210, 220]],
    ['Splay', [0, 10, 20, 110, 120, 130, 240, 250, 260, 270]],
  ] as const)('classifies %s without sign shortcuts', (shape, values) => expect(classifyLongitudes([...values]).shape).toBe(shape));
  it('handles wraparound consistently', () => expect(classifyLongitudes([350, 355, 0, 5, 10, 15, 20, 25, 30, 35]).shape).toBe('Bundle'));
});
describe('lunar nodes vs Swiss Ephemeris 2.10 Moshier references', () => {
  it.each([
    ['1993-03-25T18:55:00Z', 254.538317],
    ['1990-09-06T19:38:00Z', 306.800524],
    ['2026-11-20T00:00:00Z', 325.092563],
  ])('true ascending osculating node for %s within 0.1°', (date, reference) => expect(separation(trueNode(new Date(date)), Number(reference))).toBeLessThan(0.1));
  it('mean remains the default and a true selection does not move planets', () => {
    const mean = computeChart(input), selected = computeChart({ ...input, nodeMode: 'true' });
    expect(mean.bodies.find(b => b.key === 'northNode')?.lon).toBe(meanNode(mean.utc));
    expect(selected.bodies.find(b => b.key === 'northNode')?.lon).toBe(trueNode(mean.utc));
    expect(mean.bodies[0].lon).toBe(selected.bodies[0].lon);
  });
});
describe('daily motion and station indicators', () => {
  it('signs speed from the ephemeris and calculates all ten planets', () => {
    const rows = planetarySpeeds(new Date('2026-11-20T00:00:00Z'));
    expect(rows).toHaveLength(10);
    expect(planetSpeed(Astronomy.Body.Sun, new Date('2026-11-20T00:00:00Z'))).toBeGreaterThan(0.9);
    expect(rows.every(r => Number.isFinite(r.speed) && r.average > 0)).toBe(true);
  });
  it('labels direct/retrograde and both near-station directions at the declared 5% threshold', () => {
    expect(motionState(0.1, 0.2, 1)).toBe('Direct');
    expect(motionState(-0.1, -0.2, 1)).toBe('Retrograde');
    expect(motionState(-0.01, 0.01, 1)).toBe('Stationary · turning Direct');
    expect(motionState(0.01, -0.01, 1)).toBe('Stationary · turning Retrograde');
  });
});