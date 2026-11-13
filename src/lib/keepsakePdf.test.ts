import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { computeChart } from './astro';
import { certificateRows, scrollSections } from './keepsakes';
import { certificatePdf, scrollPdf, pdfSafe } from './keepsakePdf';

const chart = computeChart({ date: '1990-05-04', time: '06:30', lat: 40.7128, lon: -74.006, tz: 'America/New_York', placeLabel: 'New York, NY', placeSource: 'geocoded' } as never);
const info = { name: 'Rosalind Vance', bornLine: 'born May 4, 1990 at 6:30 AM \u00B7 New York, NY', number: 'ZK-ABC123', printed: 'November 13, 2026' };

describe('keepsake PDFs', () => {
  it('certificate is one US Letter landscape page', async () => {
    const d = await PDFDocument.load(await certificatePdf(info, certificateRows(chart)));
    expect(d.getPageCount()).toBe(1); expect(d.getPage(0).getSize()).toEqual({ width: 792, height: 612 });
  });
  it('star scroll is one tall 8.5x14 page', async () => {
    const d = await PDFDocument.load(await scrollPdf(info, scrollSections(chart)));
    expect(d.getPage(0).getSize()).toEqual({ width: 612, height: 1008 });
  });
  it('strips characters standard fonts cannot draw', () => { expect(pdfSafe('☉ Sun 12°47′ Taurus')).toBe("Sun 12°47' Taurus"); });
});
