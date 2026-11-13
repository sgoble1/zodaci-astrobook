import { describe, it, expect } from 'vitest';
import { bookPriceList, shortMoney } from './books';
import { comicPriceList } from './comic';

describe('page price lists read the price registries', () => {
  it('lists the five AstroBook versions at their current prices', () => {
    expect(bookPriceList()).toBe("Digital PDF $24.99, Pocket $34.99, Classic $59.99, Signature Hardcover $129 or Collector's Linen $189");
  });
  it('lists the AstroComic plans with Issue #1 at $18.99', () => {
    expect(comicPriceList()).toBe('$14.99/month, $149.99/year or $18.99 for one issue');
  });
  it('drops cents only for whole-dollar prices', () => {
    expect(shortMoney(12900)).toBe('$129');
    expect(shortMoney(2499)).toBe('$24.99');
  });
});
