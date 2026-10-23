import { describe, expect, it } from 'vitest';
import { isChartPoint, planetKey } from './PlanetOrb';

describe('planet graphic keys', () => {
  it('normalizes names and spellings', () => {
    expect(planetKey('North Node')).toBe('northNode');
    expect(planetKey('northNode')).toBe('northNode');
    expect(planetKey('Ketu')).toBe('southNode');
    expect(planetKey('Ascendant')).toBe('asc');
    expect(planetKey('JUPITER')).toBe('jupiter');
  });
  it('draws mathematical points as points, not planets', () => {
    for (const p of ['northNode', 'southNode', 'lilith', 'fortune', 'vertex', 'asc', 'mc']) expect(isChartPoint(p)).toBe(true);
    for (const p of ['sun', 'moon', 'chiron', 'saturn']) expect(isChartPoint(p)).toBe(false);
  });
});
