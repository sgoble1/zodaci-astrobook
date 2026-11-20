import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FEATURES } from '@/lib/featureRegister';
import { FOUNDER_NEWS } from '@/content/founderNews';
import { samplePreviewFaces } from '@/lib/sampleBook';
import { PREVIEW_PAGES } from '@/lib/personalPreview';

const bookTouchpoints = [
  'src/pages/BrandLanding.tsx', 'src/pages/PublicInfo.tsx', 'src/pages/Books.tsx', 'src/pages/BookPreview.tsx',
  'src/components/books/PersonalPreviewDrawer.tsx', 'src/components/books/MemberBookTeaser.tsx',
  'src/content/sampleBookLeaves.ts', 'src/content/siteUpdates.ts', 'src/lib/featureRegister.ts',
];

describe('AstroBook preview touchpoint contract', () => {
  it.each(bookTouchpoints)('%s contains no retired book preview count', path => {
    const source = readFileSync(path, 'utf8');
    expect(source).not.toMatch(/first (?:ten|10|three|3) pages|five[- ]spreads?/i);
  });
  it('keeps all numbered interiors when the public sheet requests 28 pages', () => {
    const faces = samplePreviewFaces(28);
    expect(faces.flatMap(f => 'page' in f && f.page ? [f.page] : [])).toEqual(Array.from({ length: 28 }, (_, i) => i + 1));
    expect(faces.find(f => f.kind === 'plate')).toMatchObject({ page: 6 });
    expect(faces[0].kind).toBe('cover');
    expect(faces.at(-1)?.kind).toBe('back');
    expect(faces.length).toBeGreaterThan(28);
    expect(samplePreviewFaces(6).flatMap(f => 'page' in f && f.page ? [f.page] : [])).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it('publishes 28-page register data while retaining separate ten-page comic excerpt notes', () => {
    expect(FEATURES.find(f => f.id === 'book-showcase')).toMatchObject({ name: '28-page AstroBook showcase', detail: expect.stringContaining('cover and 28-page preview') });
    const note = FOUNDER_NEWS.find(n => n.title === 'Peek inside your own book and comic');
    expect(note?.text).toContain('“Read the 28-page book preview”');
    expect(note?.text).toContain('AstroComic button shows the first ten pages');
    expect(PREVIEW_PAGES).toBe(10);
  });
});