import { describe, expect, it } from 'vitest';
import { computeChart } from './astro';
import { certificateRows, keepsakeNumber, scrollSections } from './keepsakes';

const base = { date: '1984-05-14', lat: 51.5074, lon: -0.1278, tz: 'Europe/London', placeLabel: 'London', placeSource: 'geocoded' as const, houseSystem: 'porphyry' as const };
const timed = computeChart({ ...base, time: '06:30' });
const untimed = computeChart({ ...base, time: null });

describe('Birth-Sky Certificate', () => {
  it('lists Rising and Midheaven only when a birth time is known', () => {
    expect(certificateRows(timed).map(r => r.label)).toEqual(['Sun', 'Moon', 'Rising', 'Midheaven', 'Leading element', 'Moon phase at birth']);
    expect(certificateRows(untimed).map(r => r.label)).not.toContain('Rising');
    expect(certificateRows(untimed).find(r => r.label === 'Moon')!.value).toMatch(/time unknown/);
  });
  it('reports the birth Moon as a percentage between 0 and 100', () => {
    const lit = Number(certificateRows(timed).find(r => r.label === 'Moon phase at birth')!.value.match(/(\d+)% lit/)![1]);
    expect(lit).toBeGreaterThanOrEqual(0); expect(lit).toBeLessThanOrEqual(100);
  });
  it('shows the calculated Sun sign', () => {
    const sun = timed.bodies.find(b => b.key === 'sun')!;
    expect(certificateRows(timed)[0].value).toContain(sun.sign);
  });
  it('gives the same keepsake number on every reprint and a different one for another birth time', () => {
    const a = keepsakeNumber({ ...base, time: '06:30' });
    expect(a).toMatch(/^ZK-[0-9A-Z]{6}$/);
    expect(keepsakeNumber({ ...base, time: '06:30' })).toBe(a);
    expect(keepsakeNumber({ ...base, time: '06:31' })).not.toBe(a);
  });
});

describe('Star Scroll', () => {
  it('includes twelve house cusps for a timed chart and none without a time', () => {
    expect(scrollSections(timed).find(s => s.title === 'The houses')!.rows).toHaveLength(12);
    expect(scrollSections(untimed).some(s => s.title === 'The houses')).toBe(false);
  });
  it('lists at most eight aspects, closest first', () => {
    const asp = scrollSections(timed).find(s => s.title === 'Closest aspects')!.rows;
    expect(asp.length).toBeLessThanOrEqual(8);
    const orbs = asp.map(r => Number(r.value.split('·')[1].replace('°', '')));
    expect([...orbs].sort((a, b) => a - b)).toEqual(orbs);
  });
});
