import { describe, expect, it } from 'vitest';
import { computeChart } from './astro';
import { dignityOf, retroPlanets, retroPatterns, tierOf } from './retrogood';

describe('RetroGOOD engine', () => {
  it('scores Mercury in Virgo as domicile+exaltation, Amplified', () => { expect(dignityOf('mercury', 'Virgo')).toBe('domicile+exaltation'); expect(tierOf('domicile+exaltation')).toBe('Amplified'); });
  it('maps peregrine to Internalized, fall to Refined, detriment to Karmic', () => {
    expect(tierOf(dignityOf('mars', 'Gemini'))).toBe('Internalized');
    expect(tierOf(dignityOf('venus', 'Virgo'))).toBe('Refined');
    expect(tierOf(dignityOf('venus', 'Aries'))).toBe('Karmic');
  });
  it('reproduces the reference chart (6 Sep 1990, Geneva NY): Mercury Rx 96, Saturn Rx 94, Deep Thinker', () => {
    const c = computeChart({ date: '1990-09-06', time: '15:38', lat: 42.8689, lon: -76.9777, tz: 'America/New_York', placeLabel: 'Geneva, NY', placeSource: 'geocoded', houseSystem: 'placidus' });
    const rx = retroPlanets(c);
    const merc = rx.find(r => r.key === 'mercury'), sat = rx.find(r => r.key === 'saturn');
    expect(merc?.tier).toBe('Amplified'); expect(merc?.score).toBe(96);
    expect(sat?.tier).toBe('Amplified'); expect(sat?.score).toBe(94);
    expect(retroPatterns(c, rx).some(p => p.label === 'The Deep Thinker')).toBe(true);
  });
});
