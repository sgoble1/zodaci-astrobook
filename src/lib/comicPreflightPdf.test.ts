import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { composePreflightPdf } from './comicPdf';
import { describeReport, type PrintReport } from './comicPrint';

const fontBytes = new Uint8Array(readFileSync('src/assets/fonts/manuscript.ttf'));
const failing: PrintReport = { ok: false, pages: 24, panels: 40, illustrated: 38, missing: ['3-0', '5-1'], stale: [], lowDpi: [{ key: '7-0', dpi: 240 }], overflow: [], minDpi: 240, checkedAt: '2026-10-29T12:00:00.000Z' };

describe('AstroComic preflight report PDF', () => {
  it('builds a one-page letter-size PDF even when the check failed', async () => {
    const bytes = await composePreflightPdf({ title: 'The Lantern Year', issueNumber: 3, reader: 'Test Reader', month: '2026-10', report: failing, lines: describeReport(failing), fontBytes });
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
    expect(doc.getPage(0).getSize()).toEqual({ width: 612, height: 792 });
  });
  it('names the missing panels in the plain-language findings', () => {
    expect(describeReport(failing).join(' ')).toContain('2 panels still need artwork');
  });
});
