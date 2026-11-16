import { describe, it, expect } from 'vitest';
import { signCover } from './signCovers';
describe('sign covers', () => {
  it('all twelve signs have a cover', () => {
    for (const s of ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']) expect(signCover(s)).toBeTruthy();
    expect(signCover(undefined)).toBeUndefined();
  });
});
