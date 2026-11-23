import { describe, expect, it } from 'vitest';
import { isPublication } from './publicationFocus';

describe('temporary publication-only storefront', () => {
  it.each(['AstroBook Collector', 'AstroComic Issue #1', 'Atomic Zodiac book'])('keeps %s visible', title => {
    expect(isPublication({ title })).toBe(true);
  });
  it.each(['Taurus sticker', 'Atomic Zodiac poster', 'AstroBook notebook', 'AstroComic mug', 'Star Scroll', 'Gift tote'])('hides %s', title => {
    expect(isPublication({ title })).toBe(false);
  });
  it('recognizes a book catalog type without guessing from description or tags', () => {
    expect(isPublication({ title: 'Collector Taurus', productType: 'Books' })).toBe(true);
    expect(isPublication({ title: 'Collector Taurus', productType: 'Posters' })).toBe(false);
  });
});