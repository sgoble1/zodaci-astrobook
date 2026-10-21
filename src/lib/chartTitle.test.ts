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
