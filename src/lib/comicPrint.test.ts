import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { PDFDocument, PDFName, PDFArray, PDFNumber } from 'pdf-lib';
import { computeChart } from './astro';
import { buildComicIssue } from './comic';
import { BLEED, LIVE, MEDIA, MIN_DPI, PRINT_PAGES, TRIM, artPixels, effectiveDpi, layoutPage, panelPlan, preflight, validArtSize, type ArtRecord } from './comicPrint';
import { composeComicPdf, fontMeasure } from './comicPdf';

const olivia = computeChart({ date: '1992-03-14', time: '07:23', lat: 45.5152, lon: -122.6784, tz: 'America/Los_Angeles', placeLabel: 'Portland, OR', placeSource: 'geocoded', houseSystem: 'placidus' });
const issue = buildComicIssue(olivia, { reader: 'Olivia Chen', month: new Date(Date.UTC(2026, 10, 1)), issueNumber: 1 });
const fontBytes = new Uint8Array(readFileSync('src/assets/fonts/manuscript.ttf'));
// 1×1 PNG stands in for artwork bytes; resolution checks use the recorded pixel size.
const PNG = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='), c => c.charCodeAt(0));

const within = (r: { x: number; y: number; w: number; h: number }, o: { x: number; y: number; w: number; h: number }) => r.x >= o.x - 0.01 && r.y >= o.y - 0.01 && r.x + r.w <= o.x + o.w + 0.01 && r.y + r.h <= o.y + o.h + 0.01;
const overlaps = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) => a.x < b.x + b.w - 0.01 && b.x < a.x + a.w - 0.01 && a.y < b.y + b.h - 0.01 && b.y < a.y + a.h - 0.01;

describe('AstroComic print geometry', async () => {
  const measure = await fontMeasure(fontBytes);

  it('is a 5.5 × 8.5 in digest with 0.125 in bleed and a 0.25 in safe area', () => {
    expect(TRIM).toEqual({ w: 396, h: 612 });
    expect(MEDIA).toEqual({ w: 414, h: 630 });
    expect(BLEED).toBe(9);
    expect(LIVE).toEqual({ x: 27, y: 27, w: 360, h: 576 });
  });

  it('keeps interior panels and text inside the safe area, never overlapping; only bleed rows reach the edge', () => {
    for (const page of issue.pages) {
      const l = layoutPage(page, measure);
      if (l.full) { expect(l.panels[0].rect).toEqual({ x: 0, y: 0, w: MEDIA.w, h: MEDIA.h }); continue; }
      l.panels.forEach(b => expect(within(b.rect, b.shape === 'bleed' ? { x: 0, y: LIVE.y, w: MEDIA.w, h: LIVE.h } : LIVE)).toBe(true));
      if (l.body) { expect(within(l.body.rect, LIVE)).toBe(true); expect(l.body.overflow).toBe(false); }
      const rects = [...l.panels.map(b => b.rect), ...(l.body ? [l.body.rect] : [])];
      rects.forEach((a, i) => rects.slice(i + 1).forEach(b => expect(overlaps(a, b)).toBe(false)));
    }
  });

  it('plans one illustration per panel, except the QR code which is drawn as a real code', () => {
    const plan = panelPlan(issue, measure);
    const total = issue.pages.reduce((n, p) => n + p.panels.length, 0);
    expect(plan).toHaveLength(total - 1);
    expect(plan.some(s => /QR code/.test(s.scene))).toBe(false);
  });

  it('requests every panel at a supported size that prints at 300 DPI or better', () => {
    for (const s of panelPlan(issue, measure)) {
      expect(validArtSize(s.width, s.height)).toBe(true);
      expect(effectiveDpi(s.width, s.height, s.rect)).toBeGreaterThanOrEqual(MIN_DPI);
    }
    expect(artPixels({ x: 0, y: 0, w: MEDIA.w, h: MEDIA.h })).toEqual({ width: 1792, height: 2720 });
  });

  it('never sends the reader’s name to the image model and asks for art without lettering', () => {
    for (const s of panelPlan(issue, measure)) {
      expect(s.prompt).not.toContain('Olivia');
      expect(s.prompt).toMatch(/no text, letters/);
    }
  });
});

describe('AstroComic preflight', async () => {
  const measure = await fontMeasure(fontBytes);
  const plan = panelPlan(issue, measure);
  const full: ArtRecord[] = plan.map(s => ({ page_n: s.page, panel_i: s.panel, width: s.width, height: s.height, scene: s.scene }));

  it('passes only with 24 pages and every panel illustrated at 300 DPI from the current script', () => {
    expect(issue.pages).toHaveLength(PRINT_PAGES);
    const r = preflight(issue, full, measure);
    expect(r.ok).toBe(true);
    expect(r.illustrated).toBe(plan.length);
    expect(r.minDpi).toBeGreaterThanOrEqual(MIN_DPI);
  });
  it('fails when a panel is missing', () => {
    const r = preflight(issue, full.slice(1), measure);
    expect(r.ok).toBe(false);
    expect(r.missing).toEqual([`${plan[0].page}-${plan[0].panel}`]);
  });
  it('fails when art was drawn for an older version of the scene', () => {
    const r = preflight(issue, full.map((a, i) => (i === 2 ? { ...a, scene: 'an older scene' } : a)), measure);
    expect(r.ok).toBe(false);
    expect(r.stale).toHaveLength(1);
  });
  it('fails when artwork is below 300 DPI (a 1024 px cover is ~178 DPI)', () => {
    const r = preflight(issue, full.map((a, i) => (i === 0 ? { ...a, width: 1024, height: 1536 } : a)), measure);
    expect(r.ok).toBe(false);
    expect(r.lowDpi[0].dpi).toBeLessThan(MIN_DPI);
  });
});

describe('AstroComic PDF', () => {
  const boxOf = (doc: PDFDocument, i: number, name: string) => (doc.getPage(i).node.get(PDFName.of(name)) as PDFArray).asArray().map(n => (n as PDFNumber).asNumber());

  it('builds a 24-page proof with trim and bleed boxes even before artwork exists', async () => {
    const { bytes, pages } = await composeComicPdf({ issue, fontBytes, art: new Map(), mode: 'proof' });
    expect(pages).toBe(PRINT_PAGES);
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(PRINT_PAGES);
    expect(boxOf(doc, 0, 'MediaBox')).toEqual([0, 0, 414, 630]);
    expect(boxOf(doc, 5, 'BleedBox')).toEqual([0, 0, 414, 630]);
    expect(boxOf(doc, 5, 'TrimBox')).toEqual([9, 9, 405, 621]);
  });

  it('refuses to build the print file while any panel lacks artwork', async () => {
    await expect(composeComicPdf({ issue, fontBytes, art: new Map(), mode: 'print' })).rejects.toThrow(/artwork/);
  });

  it('builds the print file once every panel has artwork', async () => {
    const plan = panelPlan(issue, await fontMeasure(fontBytes));
    const art = new Map(plan.map(s => [s.key, { bytes: PNG, width: s.width, height: s.height }]));
    const { bytes } = await composeComicPdf({ issue, fontBytes, art, mode: 'print' });
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(PRINT_PAGES);
    expect(doc.getSubject()).not.toMatch(/PROOF/);
  });
});
