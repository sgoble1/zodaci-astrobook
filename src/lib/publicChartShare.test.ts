import { describe, it, expect } from 'vitest';
import { encodeShare, decodeShare } from './publicChartShare';

const bodies = [{ key: 'sun', sign: 'Aries' }, { key: 'moon', sign: 'Leo' }, { key: 'asc', sign: 'Virgo' }, { key: 'chiron', sign: 'Gemini' }];
describe('public chart share', () => {
  it('round-trips planet signs', () => { expect(decodeShare(encodeShare(bodies, 'Rosalind Vance'))).toEqual({ name: 'Rosalind', signs: { sun: 'Aries', moon: 'Leo' } }); });
  it('never carries Rising, date, time, place or surname', () => {
    const link = encodeShare(bodies, 'Rosalind Vance');
    expect(link).not.toMatch(/asc|Virgo|Vance|\d{4}|:/);
  });
  it('rejects links without a Sun sign', () => { expect(decodeShare('s=moon.3')).toBeNull(); });
  it('ignores tampered keys', () => { expect(decodeShare('s=sun.0-time.5-moon.99')?.signs).toEqual({ sun: 'Aries' }); });
});
