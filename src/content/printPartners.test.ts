import { describe, expect, it } from 'vitest';
import { PRINT_PARTNERS, unverifiedCount } from './printPartners';
import { BOOK_VERSIONS } from '@/lib/books';

describe('print partner matrix', () => {
  it('names Lulu for books, Printful for posters/notebooks and StickerApp for stickers', () => {
    expect(PRINT_PARTNERS.map(p => p.name)).toEqual(['Lulu', 'Printful', 'StickerApp']);
  });
  it('lists every printed AstroBook edition under Lulu with its real spec', () => {
    const lulu = PRINT_PARTNERS.find(p => p.id === 'lulu')!;
    for (const b of BOOK_VERSIONS.filter(v => v.format === 'print')) expect(lulu.facts.find(f => f.label === b.name)?.value).toContain(b.paper);
  });
  it('only marks a claim verified when it names its source', () => {
    for (const f of PRINT_PARTNERS.flatMap(p => p.facts)) if (f.verified) expect(f.source).toBeTruthy();
  });
  it('keeps every unquoted Printful and StickerApp detail UNVERIFIED', () => {
    for (const p of PRINT_PARTNERS.filter(x => x.id !== 'lulu')) expect(p.facts.every(f => !f.verified)).toBe(true);
    expect(unverifiedCount()).toBeGreaterThan(0);
  });
});
