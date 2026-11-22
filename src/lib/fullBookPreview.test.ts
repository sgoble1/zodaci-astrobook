import { describe, expect, it } from 'vitest';
import { fullBookPreview, paginateChapter } from './fullBookPreview';
import { sampleReaderChart } from '@/content/sampleBookLeaves';
import { computeChart } from './astro';

const make = (time: boolean, tone: 'oracle' | 'educational' | 'professional' = 'oracle', edition = 'classic') => fullBookPreview({ chart: time ? sampleReaderChart() : computeChart({ ...sampleReaderChart().input, time: null }), name: 'Rosalind Vance', birthLine: 'Fictional test reader', tone, edition, artFor: () => 'plate.png', asOf: new Date('2026-11-22T00:00:00Z') });
describe('full calculated AstroBook chapters', () => {
  it.each(['oracle', 'educational', 'professional'] as const)('has substantive multi-page chapters with complete numbering in %s', tone => {
    for (const timed of [true, false]) {
      const book = make(timed, tone);
      expect(book.pageCount).toBeGreaterThanOrEqual(75);
      const numbered = book.faces.flatMap(f => 'page' in f && f.page ? [f.page] : []);
      expect(numbered).toEqual(Array.from({ length: book.pageCount }, (_, i) => i + 1));
      const chapters = book.faces.filter(f => f.kind === 'text');
      const complete = chapters.filter(f => f.chapterId);
      const ids = [...new Set(complete.map(f => f.chapterId))];
      expect(ids.length).toBeGreaterThanOrEqual(16);
      for (const id of ids) {
        const pages = complete.filter(f => f.chapterId === id);
        expect(pages.length, pages[0]?.title).toBeGreaterThanOrEqual(5);
        expect(pages.map(f => f.chapterPage)).toEqual(Array.from({ length: pages.length }, (_, i) => i + 1));
        expect(new Set(pages.map(f => f.chapterPages))).toEqual(new Set([pages.length]));
        expect(pages.every(f => !f.title.includes('continued'))).toBe(true);
        expect(new Set(pages.map(f => f.body.join(' '))).size).toBe(pages.length);
        for (const face of pages) expect(face.body.join(' ').split(/\s+/).filter(Boolean).length).toBeGreaterThanOrEqual(140);
      }
      const plate = book.faces.find(f => f.kind === 'plate');
      expect((plate?.page ?? 1) % 2).toBe(0);
      expect((book.faces.indexOf(plate as never) + 1) % 2).toBe(1);
      // Each contents entry points to the actual first face, not a stale fixed page.
      for (const face of book.faces) if (face.kind === 'list' && face.eyebrow === 'Table of Contents') for (const item of face.items) {
        const at = Number(item.match(/ · (\d+)$/)?.[1]);
        expect(book.faces.some(f => 'page' in f && f.page === at && f.kind === 'text')).toBe(true);
      }
    }
  });
  it.each(['digital', 'pocket', 'classic', 'signature', 'linen'])('keeps %s chapter inclusion without truncating full study pages to print estimates', edition => {
    const book = make(true, 'oracle', edition);
    const ids = [...new Set(book.faces.flatMap(f => f.kind === 'text' && f.chapterId ? [f.chapterId] : []))];
    for (const id of ids) expect(book.faces.filter(f => f.kind === 'text' && f.chapterId === id).length).toBeGreaterThanOrEqual(5);
    expect(book.faces.some(f => f.kind === 'text' && f.eyebrow.startsWith('Volume V ·'))).toBe(edition !== 'pocket');
  });
  it('balances complete sentences across full pages without changing the prose', () => {
    const paragraphs = Array.from({ length: 40 }, (_, i) => `Section ${i} considers the measured placement alongside the reader’s actual choices, without claiming an event or prescribing a response.`);
    const pages = paginateChapter(paragraphs);
    expect(pages.length).toBeGreaterThanOrEqual(5);
    expect(pages.flat().join(' ')).toBe(paragraphs.join(' '));
    expect(pages.every(p => p.join(' ').endsWith('.'))).toBe(true);
  });
  it('does not recover artificial houses or Moon contacts from a date-only chart', () => {
    const book = make(false);
    const prose = book.faces.flatMap(f => f.kind === 'text' ? f.body : []).join(' ');
    expect(prose).not.toMatch(/(?:in|your) (?:\d+(?:st|nd|rd|th)?|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) house/i);
    expect(prose).not.toMatch(/Moon (?:square|sextile|trine|conjunction|opposition)/i);
    expect(prose).toMatch(/provisional/i);
  });
  it('keeps measurable differences when the reader changes', () => {
    const original = make(true);
    const chart = computeChart({ ...sampleReaderChart().input, date: '1990-09-06', time: '12:00' });
    const changed = fullBookPreview({ chart, name: 'Another fictional reader', birthLine: 'Test', artFor: () => 'plate.png' });
    expect(changed.cover.sunSign).not.toBe(original.cover.sunSign);
    expect(changed.faces.filter(f => f.kind === 'facts')).not.toEqual(original.faces.filter(f => f.kind === 'facts'));
  });
});