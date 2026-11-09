import { describe, expect, it } from 'vitest';
import { departmentFor, matchesShopType } from './shopDepartments';
describe('shop departments', () => {
  it('groups book and comic types together', () => {
    expect(departmentFor('AstroBook')).toBe('books');
    expect(matchesShopType('AstroComic', 'dept:books')).toBe(true);
    expect(matchesShopType('Tote bags', 'dept:books')).toBe(false);
  });
  it('keeps specific type filtering available', () => {
    expect(matchesShopType('Stickers', 'Stickers')).toBe(true);
    expect(matchesShopType('Sticker sheets', 'Stickers')).toBe(false);
    expect(departmentFor('Tote bags')).toBe('bags');
    expect(departmentFor('Unknown')).toBe('other');
  });
});