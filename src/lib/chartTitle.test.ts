import { describe, expect, it } from 'vitest';
import { chartTitle, COVER_FOR_ELEMENT } from './chartTitle';

describe('chartTitle', () => {
  it('combines Moon quality, Sun archetype and dominant element', () => {
    expect(chartTitle({ sun: 'Capricorn', moon: 'Pisces', rising: 'Leo', dominant: 'Water' }).title).toBe('The Intuitive Strategist of Deep Currents');
  });
  it('falls back to the Sun element when only the date is known', () => {
    expect(chartTitle({ sun: 'Leo' }).title).toBe('The Creator of Bright Momentum');
  });
  it('mentions Rising only when known', () => {
    expect(chartTitle({ sun: 'Aries', moon: 'Cancer' }).subtitle).toBe('Aries Sun · Cancer Moon');
  });
  it('matches Air charts to Blue Cosmos', () => {
    expect(COVER_FOR_ELEMENT.Air.index).toBe(1);
  });
});

import { dominantElement } from './chartTitle';
describe('chart title edge cases', () => {
  it('never shows undefined for unknown signs', () => {
    const t = chartTitle({ sun: 'Leo', moon: 'Nope', rising: 'x' });
    expect(t.title + t.subtitle + t.why).not.toMatch(/undefined/);
    expect(t.title).toBe('The Creator of Bright Momentum');
  });
  it('falls back to a generic title without a valid Sun', () => {
    expect(chartTitle({ sun: '' }).title).toBe('Your Personal Sky');
  });
  it('treats tied elements as no single dominant element', () => {
    expect(dominantElement({ Fire: 3, Water: 3, Air: 1 })).toBeNull();
    expect(dominantElement({ Fire: 4, Water: 3 })).toBe('Fire');
  });
  it('gives every Sun sign a title', () => {
    for (const s of ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'])
      expect(chartTitle({ sun: s }).title).not.toMatch(/undefined|Personal Sky/);
  });
});
