import { describe, expect, it } from 'vitest';
import { computeChart } from './astro';
import { calculationLedger, crossTraditionCheck, internalParadoxes } from './synthesis';

const timed = computeChart({ date: '1993-03-25', time: '13:55', lat: 42.9634, lon: -78.7378, tz: 'America/New_York', placeLabel: 'Williamsville, NY', placeSource: 'manual' });
const untimed = computeChart({ ...timed.input, time: null });

describe('internal paradox matrix', () => {
  it('only names squares and oppositions within 6° that touch a personal planet', () => {
    for (const p of internalParadoxes(timed, 10)) {
      expect(['Square', 'Opposition']).toContain(p.type);
      expect(p.orb).toBeLessThanOrEqual(6);
      expect(['sun', 'moon', 'mercury', 'venus', 'mars'].some(k => k === p.a || k === p.b)).toBe(true);
    }
  });
  it('drops Moon contacts when birth time is unknown', () => {
    expect(internalParadoxes(untimed, 10).some(p => p.a === 'moon' || p.b === 'moon')).toBe(false);
  });
  it('phrases vignettes as possibilities, never as biography', () => {
    for (const p of internalParadoxes(timed, 10)) expect(p.vignette).toMatch(/\bmay\b/);
  });
});

describe('cross-tradition check', () => {
  it('only reports slow-planet contacts within 2°', () => {
    const c = crossTraditionCheck(timed, new Date('2026-11-21T00:00:00Z'));
    for (const t of c.transits) { expect(t.orb).toBeLessThanOrEqual(2); expect(['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']).toContain(t.transit); }
  });
});

describe('calculation ledger', () => {
  it('reports no house system or houses for an untimed chart', () => {
    const l = calculationLedger(untimed);
    expect(l.houseSystem).toMatch(/unknown/);
    expect(l.positions.every(p => p.house === null)).toBe(true);
  });
});
