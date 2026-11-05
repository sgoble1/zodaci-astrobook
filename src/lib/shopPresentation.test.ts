import { describe, expect, it } from 'vitest';
import { nextUnorderedIssue, productPriority } from './shopPresentation';

describe('featured shop order', () => {
  it('places AstroBooks and AstroComics before other products', () => {
    expect(productPriority('AstroBook Collector')).toBe(0);
    expect(productPriority('AstroComic Issue #1')).toBe(0);
    expect(productPriority('Atomic Zodiac Sticker Sheet')).toBe(1);
  });
  it('places atomic zodiac stickers ahead of bags and the remaining catalog', () => {
    expect(productPriority('Atomic Zodiac Stickers')).toBe(1);
    expect(productPriority('Canvas Tote Bag')).toBe(2);
    expect(productPriority('Zodiac Mug')).toBe(3);
    expect(productPriority('Ordinary stickers')).toBe(3);
  });
});
describe('personal issue recommendation', () => {
  it('starts signed-out or new buyers at Issue #1', () => { expect(nextUnorderedIssue([])).toBe(1); });
  it('recommends the next unordered issue rather than repeating a purchase', () => { expect(nextUnorderedIssue([1, 2, 2])).toBe(3); });
  it('fills gaps rather than assuming every earlier issue was ordered', () => { expect(nextUnorderedIssue([1, 3])).toBe(2); });
});