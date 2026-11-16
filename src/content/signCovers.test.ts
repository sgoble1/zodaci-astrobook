import { describe, it, expect } from 'vitest';
import { signCover } from './signCovers';
describe('sign covers', () => {
  it('drawn signs return art; others fall back', () => {
    for (const s of ['Aries', 'Taurus', 'Cancer', 'Virgo']) expect(signCover(s)).toBeTruthy();
    expect(signCover('Leo')).toBeUndefined(); expect(signCover(undefined)).toBeUndefined();
  });
});
