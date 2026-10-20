import { describe, expect, it } from 'vitest';
import { computeChart } from './astro';
import { expression, soulUrge, personality } from './numerologyCross';
import { arabicParts, challenges, compatibilityScore, fixedStarContacts, houseAnalysis, pinnacles } from './resultsEngine';
import { upcomingEvents, transitsTo } from './transitOverlay';
import { chartAffirmations } from './affirmations';

const april = computeChart({ date: '1990-09-06', time: '15:38', lat: 42.8689, lon: -76.9856, tz: 'America/New_York', placeLabel: 'Geneva, NY', placeSource: 'geocoded', houseSystem: 'placidus' });

describe('numerology name numbers', () => {
  it('reduces each name part before summing (John Smith)', () => {
    expect(expression('John Smith')).toBe(8);
    expect(soulUrge('John Smith')).toBe(6);
    expect(personality('John Smith')).toBe(11);
  });
});

describe('numerology cycles for 6 Sept 1990', () => {
  it('pinnacles are 6, 7, 4, 1 with the first ending at 29 (36 − Life Path 7)', () => {
    const p = pinnacles('1990-09-06');
    expect(p.map(x => x.n)).toEqual([6, 7, 4, 1]);
    expect(p[0].to).toBe(29);
    expect(p[1].from).toBe(30);
  });
  it('challenges are 3, 5, 2, 8', () => { expect(challenges('1990-09-06')).toEqual([3, 5, 2, 8]); });
});

describe('chart building blocks', () => {
  it('Part of Fortune lot matches the point computed with the chart', () => {
    const lot = arabicParts(april).find(l => l.name === 'Part of Fortune')!;
    const point = april.bodies.find(b => b.key === 'fortune')!;
    expect(Math.abs(lot.lon - point.lon)).toBeLessThan(1e-6);
  });
  it('analyses twelve houses with a ruler each', () => {
    const h = houseAnalysis(april);
    expect(h).toHaveLength(12);
    expect(h.every(x => !!x.ruler)).toBe(true);
  });
  it('only reports fixed stars within the requested orb', () => {
    expect(fixedStarContacts(april, 1).every(s => s.orb <= 1)).toBe(true);
  });
  it('scores Aries Sun with Leo Sun as fire-fire, different modality: 91', () => {
    expect(compatibilityScore({ sun: 'Aries' }, { sun: 'Leo' }).score).toBe(91);
  });
});

describe('transit overlay', () => {
  it('finds Mercury stationing retrograde around 1 April 2024', () => {
    const ev = upcomingEvents(april, new Date(Date.UTC(2024, 2, 20)), 30).filter(e => e.title === 'Mercury turns retrograde');
    expect(ev).toHaveLength(1);
    expect(ev[0].date.getUTCMonth()).toBe(3);
    expect(ev[0].date.getUTCDate()).toBeLessThanOrEqual(3);
  });
  it('sorts applying transits before separating ones', () => {
    const hits = transitsTo(april, new Date(Date.UTC(2026, 9, 20, 12)));
    const firstSep = hits.findIndex(h => !h.applying);
    if (firstSep >= 0) expect(hits.slice(firstSep).every(h => !h.applying)).toBe(true);
  });
});

describe('affirmations', () => {
  it('builds 8 to 12 unique affirmations for a timed chart', () => {
    const a = chartAffirmations(april, '1990-09-06');
    expect(a.length).toBeGreaterThanOrEqual(8);
    expect(a.length).toBeLessThanOrEqual(12);
    expect(new Set(a.map(x => x.text)).size).toBe(a.length);
  });
});
