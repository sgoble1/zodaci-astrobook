import { readFileSync } from 'node:fs';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { computeChart } from '@/lib/astro';
import { bookPreview } from '@/lib/personalPreview';
import { faceProse, toLeaves, type BookFace } from '@/lib/bookLeaves';
import { previewPdf, printToken, type PreviewPdfOptions } from '@/lib/previewPdf';

const fontBytes = new Uint8Array(readFileSync('src/assets/fonts/manuscript.ttf'));
const png = new Uint8Array(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==', 'base64'));
const input = { date: '1993-03-25', time: '13:55', lat: 42.96395, lon: -78.73781, tz: 'America/New_York', placeLabel: 'Williamsville, New York', placeSource: 'geocoded', houseSystem: 'placidus' } as const;
const charts = { timed: computeChart(input), untimed: computeChart({ ...input, time: null }) };
const modes = (['timed', 'untimed'] as const).flatMap(mode => (['oracle', 'educational', 'professional'] as const).map(tone => ({ mode, tone })));
const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();
afterEach(() => vi.unstubAllGlobals());

describe('AstroBook PDF face parity', () => {
  it.each(modes)('exports every face with no overflow for $mode / $tone', async ({ mode, tone }) => {
    const preview = bookPreview({ name: 'Test Reader', birthLine: 'Verified test birth facts', chart: charts[mode], tone, artFor: () => 'plate.png', dedication: 'For someone who keeps looking closely.' });
    if (preview.jacket.kind !== 'jacket') throw new Error('Expected jacket');
    const faces = toLeaves({ ...preview.jacket, finish: 'cloth' }, preview.faces, { kind: 'back', lines: ['Zodaci AstroBook', 'End of preview'] }).flatMap(l => [l.front, l.back]);
    const reports: Parameters<NonNullable<PreviewPdfOptions['onPage']>>[0][] = [];
    const blob = await previewPdf(faces, { fontBytes, loadImage: async () => png, onPage: r => reports.push(r) });
    const pdf = await PDFDocument.load(await blob.arrayBuffer());
    expect(pdf.getPageCount()).toBe(faces.length);
    expect(reports.map(r => r.face)).toEqual(faces);
    expect(reports.flatMap(r => 'page' in r.face && r.face.page ? [r.face.page] : [])).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
    expect(reports.find(r => r.face.kind === 'plate')?.face).toMatchObject({ page: 7, caption: expect.stringContaining('Plate I') });
    for (const r of reports) {
      expect(r.minY, `face ${r.index}`).toBeGreaterThanOrEqual(30);
      const face = r.face;
      if (face.kind === 'blank') continue;
      const text = faceProse(face);
      expect(text).not.toBeNull();
      const printed = normalize(r.text.join(' '));
      if (face.kind === 'plate') expect(printed).toContain(face.caption);
      else if (face.kind === 'jacket') {
        for (const value of [face.cover.name, face.cover.birthLine, face.cover.title, face.cover.signs, face.edition]) expect(printed).toContain(normalize(value));
      } else if (text) {
        expect(printed).toContain(normalize(text.heading));
        for (const line of text.lines) expect(printed, `face ${r.index}`).toContain(normalize(line));
      }
      if (face.kind === 'text') expect(r.size).toBeGreaterThanOrEqual(8);
    }
    expect(reports.some(r => r.face.kind === 'endpaper' && r.text.join(' ').includes('For someone'))).toBe(true);
  });
  it('prints reflections once, separately, and fits long headings and unbroken dedications', async () => {
    const face: BookFace = { kind: 'text', eyebrow: 'Study notes', title: 'A compound chart reading with an unusually long chapter heading', placement: 'Sun and Saturn', facts: [['Aspect', 'Square']], body: Array.from({ length: 3 }, () => 'These measurements provide the basis for interpretation without deciding what a person has experienced. '.repeat(3)), reflection: 'What fits your experience, and what does not?', page: 24 };
    const reports: Parameters<NonNullable<PreviewPdfOptions['onPage']>>[0][] = [];
    await previewPdf([face, { kind: 'endpaper', eyebrow: 'Dedication', heading: 'Reader', lines: ['W'.repeat(500)] }], { fontBytes, onPage: r => reports.push(r) });
    expect(reports[0].text.filter(t => t === 'Reflection')).toHaveLength(1);
    expect(normalize(reports[0].text.join(' '))).toContain(face.reflection);
    expect(reports.every(r => r.minY >= 30)).toBe(true);
    expect(reports[1].text.join('').replace(/Dedication|Reader/g, '')).toContain('W'.repeat(500));
  });
  it.each(['paper', 'cloth', 'leatherette'] as const)('retains composed %s covers without duplicate lettering and keeps blank/end faces', async finish => {
    const p = bookPreview({ name: 'Test Reader', birthLine: 'Test', chart: charts.timed, artFor: () => 'plate.png' });
    if (p.jacket.kind !== 'jacket') throw new Error('Expected jacket');
    const faces: BookFace[] = [{ ...p.jacket, composed: true, finish }, { kind: 'blank' }, { kind: 'back', lines: ['Back matter'] }];
    const reports: Parameters<NonNullable<PreviewPdfOptions['onPage']>>[0][] = [];
    const blob = await previewPdf(faces, { fontBytes, loadImage: async () => png, onPage: r => reports.push(r) });
    const pdf = await PDFDocument.load(await blob.arrayBuffer());
    expect(pdf.getPageCount()).toBe(3);
    expect(pdf.getPage(0).getSize()).toEqual({ width: 432, height: 432 });
    expect(reports[0].text).toEqual([]);
    expect(reports[2].text).toContain('Back matter');
  });
  it('exports without getComputedStyle, canvas, or document', () => {
    expect(printToken('--spot-paper').red).toBeCloseTo(.9544);
    vi.stubGlobal('document', { documentElement: {} });
    vi.stubGlobal('getComputedStyle', () => { throw new Error('Restricted environment'); });
    expect(printToken('--comic-brick').red).toBeCloseTo(.711);
    vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: () => '226 42% 22%' }));
    expect(printToken('--comic-navy').blue).toBeCloseTo(.3124);
    vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: () => '' }));
    expect(printToken('--spot-paper').red).toBeCloseTo(.9544);
  });
});