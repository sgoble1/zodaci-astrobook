import { describe, expect, it } from 'vitest';
import { computeChart } from '@/lib/astro';
import { CASES, buildCase, caseSummaries, balance, ordinal } from './investigations';
import { buildGallery, GALLERIES } from './museum';

// Fictional reader used by public samples: 14 May 1984, 06:30, London.
const timed = computeChart({ date: '1984-05-14', time: '06:30', lat: 51.5074, lon: -0.1278, tz: 'Europe/London', placeLabel: 'London', placeSource: 'geocoded', houseSystem: 'porphyry' });
const untimed = computeChart({ date: '1984-05-14', time: null, lat: 51.5074, lon: -0.1278, tz: 'Europe/London', placeLabel: 'London', placeSource: 'geocoded', houseSystem: 'porphyry' });
const NOW = new Date('2026-11-12T12:00:00Z');

describe('Investigations Bureau', () => {
  it('has exactly the seven investigations from the blueprint', () => {
    expect(CASES.map(c => c.id)).toEqual(['relationship', 'purpose', 'career', 'money', 'health', 'spirituality', 'pattern']);
  });
  it('every piece of evidence states the calculation it comes from', () => {
    for (const spec of CASES) {
      const f = buildCase(timed, spec.id, NOW, 30);
      expect(f.evidence.length).toBeGreaterThan(0);
      f.evidence.forEach(e => { expect(e.basis.length).toBeGreaterThan(5); expect(e.title.length).toBeGreaterThan(3); });
    }
  });
  it('quotes the real Venus sign in the relationship file', () => {
    const venus = timed.bodies.find(b => b.key === 'venus')!;
    expect(buildCase(timed, 'relationship', NOW, 30).evidence[0].title.startsWith(`Venus in ${venus.sign}`)).toBe(true);
  });
  it('leaves houses, rulers and angles out when no birth time is saved, and says so', () => {
    const f = buildCase(untimed, 'career', NOW, 30);
    expect(f.timed).toBe(false);
    expect(f.evidence.some(e => e.kind === 'house' || e.kind === 'ruler')).toBe(false);
    expect(f.evidence.some(e => /Midheaven|Ascendant/.test(e.title))).toBe(false);
    expect(f.limits[0]).toMatch(/No birth time/);
  });
  it('opens house and ruler evidence for a timed chart', () => {
    const f = buildCase(timed, 'money', NOW, 30);
    expect(f.evidence.filter(e => e.kind === 'house').map(e => e.title.split(' ')[0])).toEqual(['2nd', '8th']);
    expect(f.evidence.some(e => e.kind === 'ruler')).toBe(true);
  });
  it('element counts cover all ten planets', () => {
    const b = balance(timed);
    expect(Object.values(b.el).reduce((a, n) => a + n, 0)).toBe(10);
    expect(Object.values(b.mode).reduce((a, n) => a + n, 0)).toBe(10);
  });
  it('only reports transits that touch the points under investigation', () => {
    const f = buildCase(timed, 'relationship', NOW, 60);
    f.activeNow.forEach(h => expect(f.spec.points).toContain(h.natalKey));
    f.upcoming.forEach(e => expect(f.spec.points).toContain(e.natalKey));
  });
  it('summaries list one card per case', () => {
    expect(caseSummaries(timed, NOW)).toHaveLength(7);
    expect(ordinal(11)).toBe('11th'); expect(ordinal(22)).toBe('22nd'); expect(ordinal(3)).toBe('3rd');
  });
});

describe('Museum of the Sky', () => {
  it('has the five blueprint galleries', () => {
    expect(GALLERIES.map(g => g.id)).toEqual(['roots', 'relationships', 'purpose', 'future', 'legacy']);
  });
  it('the Roots gallery says it is symbolism, not childhood history', () => {
    expect(buildGallery(timed, 'roots', NOW).note).toMatch(/not a record of your childhood/);
  });
  it('exhibits the real Moon sign and the IC for a timed chart', () => {
    const g = buildGallery(timed, 'roots', NOW);
    const moon = timed.bodies.find(b => b.key === 'moon')!;
    expect(g.exhibits[0].title).toBe(`Moon in ${moon.sign}`);
    expect(g.exhibits.some(e => e.id === 'cusp-4')).toBe(true);
    expect(buildGallery(untimed, 'roots', NOW).exhibits.some(e => e.id === 'cusp-4')).toBe(false);
  });
  it('future exhibitions only list dates after today', () => {
    const g = buildGallery(timed, 'future', NOW);
    g.coming.forEach(e => expect(e.date.getTime()).toBeGreaterThanOrEqual(NOW.getTime() - 86400000));
    g.milestones.forEach(m => expect(m.past).toBe(false));
  });
  it('legacy milestones mark the first Saturn return as past for someone born in 1984', () => {
    const sr = buildGallery(timed, 'legacy', NOW).milestones.find(m => m.key === 'saturn-return-1')!;
    expect(sr.past).toBe(true);
    expect(sr.date.getUTCFullYear()).toBeGreaterThanOrEqual(2012);
    expect(sr.date.getUTCFullYear()).toBeLessThanOrEqual(2015);
  });
});
