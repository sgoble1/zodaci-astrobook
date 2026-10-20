import { describe, expect, it } from 'vitest';
import { compatibility, elementScore, modalityScore, scoreBand } from './compatibility';

describe('Master Build compatibility formula', () => {
  it('uses the element table out of 25', () => {
    expect(elementScore('Fire', 'Fire')).toBe(25);
    expect(elementScore('Fire', 'Air')).toBe(20);
    expect(elementScore('Fire', 'Earth')).toBe(8);
    expect(elementScore('Fire', 'Water')).toBe(5);
  });
  it('uses the modality table out of 10', () => {
    expect(modalityScore('Fixed', 'Fixed')).toBe(5);
    expect(modalityScore('Cardinal', 'Fixed')).toBe(7);
    expect(modalityScore('Mutable', 'Cardinal')).toBe(10);
    expect(modalityScore('Fixed', 'Mutable')).toBe(8);
  });
  it('caps each placement at 100 and weights Sun 1.0 / Moon 1.0 / Venus 0.9 / Mars 0.8 / Rising 0.7', () => {
    // Aries–Sagittarius: 25×3 + 10×2.5 = 100. Aries–Cancer: 5×3 + 5×2.5 = 27.5.
    const r = compatibility({ sun: 'Aries', moon: 'Aries' }, { sun: 'Sagittarius', moon: 'Cancer' });
    expect(r.rows.find(x => x.key === 'sun')!.score).toBe(100);
    expect(r.rows.find(x => x.key === 'moon')!.score).toBe(28);
    expect(r.score).toBe(64); // (100×1 + 27.5×1) / 2 = 63.75
    expect(r.omitted).toEqual(['venus', 'mars', 'rising']);
  });
  it('same sign everywhere scores 87.5 per placement', () => {
    const s = { sun: 'Leo', moon: 'Leo', venus: 'Leo', mars: 'Leo', rising: 'Leo' };
    expect(compatibility(s, s).score).toBe(88);
  });
});

describe('compatibility gauge bands', () => {
  it('0–40 is caution', () => { expect(scoreBand(0)).toBe('caution'); expect(scoreBand(40)).toBe('caution'); });
  it('41–70 is moderate', () => { expect(scoreBand(41)).toBe('moderate'); expect(scoreBand(70)).toBe('moderate'); });
  it('71–100 is harmonious', () => { expect(scoreBand(71)).toBe('harmonious'); expect(scoreBand(100)).toBe('harmonious'); });
});
