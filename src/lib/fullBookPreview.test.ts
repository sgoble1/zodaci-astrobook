import { describe, expect, it } from 'vitest';
import { fullBookPreview } from './fullBookPreview';
import { sampleReaderChart } from '@/content/sampleBookLeaves';
import { computeChart } from './astro';

const make = (time: boolean, tone: 'oracle' | 'educational' | 'professional' = 'oracle', edition = 'classic') => fullBookPreview({ chart: time ? sampleReaderChart() : computeChart({ ...sampleReaderChart().input, time: null }), name: 'Rosalind Vance', birthLine: 'Fictional test reader', tone, edition, artFor: () => 'plate.png', asOf: new Date('2026-11-22T00:00:00Z') });
describe('full calculated AstroBook chapters', () => {
  it.each(['oracle', 'educational', 'professional'] as const)('has substantive multi-page chapters with complete numbering in %s', tone => {
    for (const timed of [true, false]) {
      const book = make(timed, tone);
      expect(book.pageCount).toBeGreaterThanOrEqual(75);
      expect(book.pageCount).toBeLessThanOrEqual(120);
      const numbered = book.faces.flatMap(f => 'page' in f && f.page ? [f.page] : []);
      expect(numbered).toEqual(Array.from({ length: book.pageCount }, (_, i) => i + 1));
      const chapters = book.faces.filter(f => f.kind === 'text');
      expect(chapters.filter(f => f.title.includes('· continued')).length).toBeGreaterThan(30);
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
  it.each([['digital', 45, 70], ['pocket', 50, 75], ['classic', 75, 120], ['signature', 90, 150], ['linen', 100, 180]] as const)('respects %s edition depth without padding', (edition, min, max) => {
    const book = make(true, 'oracle', edition);
    expect(book.pageCount).toBeGreaterThanOrEqual(min);
    expect(book.pageCount).toBeLessThanOrEqual(max);
    expect(book.faces.some(f => f.kind === 'text' && f.eyebrow.startsWith('Volume V ·'))).toBe(edition !== 'pocket');
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