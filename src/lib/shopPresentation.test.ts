import { describe, expect, it } from 'vitest';
import { atomicAestheticRank, comicIssueTitle, compareAtomicAesthetic, isAtomicZodiac, isPortraitProduct, nextUnorderedIssue, productPriority, shopTitle, signPicks } from './shopPresentation';

describe('featured shop order', () => {
  it('places AstroBooks and AstroComics before other products', () => {
    expect(productPriority('AstroBook Collector')).toBe(0);
    expect(productPriority('AstroComic Issue #1')).toBe(0);
    expect(productPriority('Atomic Zodiac Sticker Sheet')).toBe(1);
  });
  it('places atomic zodiac stickers ahead of bags and the remaining catalog', () => {
    expect(productPriority('Atomic Zodiac Stickers')).toBe(1);
    expect(productPriority('Zodiac Sticker Sheet', 'Stickers')).toBe(2);
    expect(productPriority('Aries Sticker Sheet', 'Stickers')).toBe(2);
    expect(productPriority('Canvas Tote Bag')).toBe(3);
    expect(productPriority('Zodiac Wheel Tote', 'Tote Bags')).toBe(3);
    expect(productPriority('Zodiac Mug')).toBe(4);
    expect(productPriority('Ordinary stickers')).toBe(4);
  });
  it('frames only books and comics as portraits', () => {
    expect(isPortraitProduct('AstroComic Issue #1 (Pre-order)', 'Comic Books')).toBe(true);
    expect(isPortraitProduct('Constellation Mug', 'Mugs')).toBe(false);
  });
});
describe('Atomic Zodiac collection', () => {
  it('uses catalog tags even when the title omits the collection name', () => {
    expect(isAtomicZodiac({ title: 'Cosmic Archive: The Houses', tags: ['Atomic Zodiac'] })).toBe(true);
    expect(isAtomicZodiac({ title: 'Constellation Mug', tags: ['collection:core'] })).toBe(false);
  });
  it('ranks every atomic edition ahead of other styles in a department', () => {
    expect(productPriority('Cosmic Archive: The Houses', 'Books', ['Atomic Zodiac'])).toBe(1);
    expect(productPriority('Linen Zodiac Notebook', 'Notebooks', ['collection:core'])).toBe(4);
  });
  it('leads with illustrated display pieces, then stickers, with packaging concepts last', () => {
    expect(atomicAestheticRank('Aries Metal Print', 'Metal Prints')).toBeLessThan(atomicAestheticRank('Aries Sticker', 'Stickers'));
    expect(atomicAestheticRank('Aries Sticker', 'Stickers')).toBeLessThan(atomicAestheticRank('Protection Incense — Atomic Zodiac Packaging Edition', 'Incense'));
  });
  it('uses newest catalog additions to break ties inside a visual group', () => {
    const older = { title: 'Aries Metal Print', productType: 'Metal Prints', createdAt: '2026-11-01' };
    const newer = { title: 'Taurus Metal Print', productType: 'Metal Prints', createdAt: '2026-11-05' };
    expect(compareAtomicAesthetic(newer, older)).toBeLessThan(0);
  });
});
describe('personal issue recommendation', () => {
  it('starts signed-out or new buyers at Issue #1', () => { expect(nextUnorderedIssue([])).toBe(1); });
  it('recommends the next unordered issue rather than repeating a purchase', () => { expect(nextUnorderedIssue([1, 2, 2])).toBe(3); });
  it('fills gaps rather than assuming every earlier issue was ordered', () => { expect(nextUnorderedIssue([1, 3])).toBe(2); });
});
describe('AstroComic issue title', () => {
  it('shows signed-out visitors just "Issue #1"', () => {
    expect(comicIssueTitle({ signedIn: false, purchased: true, next: 4 }).title).toBe('Issue #1');
  });
  it('points signed-in buyers at their next unordered issue', () => {
    expect(comicIssueTitle({ signedIn: true, purchased: true, next: 3 }).title).toBe('Issue #3');
    expect(comicIssueTitle({ signedIn: true, purchased: false, next: 1 }).title).toBe('Issue #1');
  });
  it('renames the issue-one listing without touching other products', () => {
    expect(shopTitle('AstroComic Issue #1 (Pre-order)', 'Comic Books')).toEqual({ title: 'AstroComic Issue #1', badge: 'Pre-order' });
    expect(shopTitle('Constellation Mug', 'Mugs')).toEqual({ title: 'Constellation Mug' });
  });
});

describe('shop picks for a member’s own signs', () => {
  const P = (title: string, tags: string[] = [], type = '') => ({ title, tags, productType: type });
  const shop = [
    P('Leopard print tote', [], 'Bag'), P('Leo Constellation Tee', ['leo'], 'T-Shirt'), P('Leo Atomic Zodiac Poster', ['Atomic Zodiac', 'Leo'], 'Poster'),
    P('Pisces Mug', ['pisces'], 'Mug'), P('Virgo Notebook', ['Virgo'], 'Notebook'), P('Leo Sticker', ['leo'], 'Sticker'),
  ];
  it('picks Sun, Moon then Rising, Atomic Zodiac first, never matching Leopard for Leo', () => {
    const picks = signPicks(shop, { sun: 'Leo', moon: 'Pisces', rising: 'Virgo' });
    expect(picks.map(p => [p.role, p.product.title])).toEqual([['Sun', 'Leo Atomic Zodiac Poster'], ['Moon', 'Pisces Mug'], ['Rising', 'Virgo Notebook']]);
  });
  it('without a birth time there is no Rising pick; extra Sun picks fill the space', () => {
    const picks = signPicks(shop, { sun: 'Leo', moon: 'Pisces', rising: null });
    expect(picks.map(p => p.role)).toEqual(['Sun', 'Moon', 'Sun']);
    expect(picks.some(p => /Leopard/.test(p.product.title))).toBe(false);
  });
  it('returns nothing when no product matches the signs', () => {
    expect(signPicks(shop, { sun: 'Aries', moon: 'Taurus' })).toEqual([]);
  });
});
