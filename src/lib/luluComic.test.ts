import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { COMIC_POD, COMIC_TRIM, comicPageError, comicPrintError, comicStatusPatch } from '../../supabase/functions/_shared/lulu-comic-rules';
import { comicFiles } from '../../supabase/functions/_shared/lulu-comic-files';

const issue = { status: 'approved', print_pdf_path: 'file.pdf', print_pdf_at: '2026-11-13', print_report: { ok: true } };
const sub = { status: 'active', environment: 'live', checkout_session_id: 'cs_paid' };
describe('Lulu AstroComic printing', () => {
  it('uses Lulu’s current comic SKU and full-colour saddle stitch', () => expect(COMIC_POD).toBe('0663X1025.FC.PRE.SS.070CW460.GIX'));
  it('never sends sandbox payments for production printing', () => expect(comicPrintError(issue, { ...sub, environment: 'sandbox' }, 'production')).toMatch(/never/));
  it('requires confirmed active purchases', () => expect(comicPrintError(issue, { ...sub, status: 'pending' }, 'production')).toMatch(/payment-confirmed/));
  it('requires an approved issue', () => expect(comicPrintError({ ...issue, status: 'draft' }, sub, 'production')).toMatch(/Approve/));
  it('requires a passing print file', () => expect(comicPrintError({ ...issue, print_report: { ok: false } }, sub, 'production')).toMatch(/passing/));
  it('accepts 20 interior pages but rejects non-multiples of four and over 48', () => {
    expect(comicPageError(20)).toBeNull(); expect(comicPageError(22)).not.toBeNull(); expect(comicPageError(52)).not.toBeNull();
  });
  it('never moves real issue stages for sandbox jobs', () => expect(comicStatusPatch('approved', 'IN_PRODUCTION', 'sandbox', { tracking_id: '', carrier_name: '' }, '2026-11-13')).toBeNull());
  it('records shipment tracking without rolling shipped issues back', () => {
    expect(comicStatusPatch('printing', 'SHIPPED', 'production', { tracking_id: '123', carrier_name: 'USPS' }, '2026-11-13')).toEqual({ status: 'shipped', tracking_number: '123', carrier: 'USPS', shipped_at: '2026-11-13' });
    expect(comicStatusPatch('shipped', 'IN_PRODUCTION', 'production', { tracking_id: '', carrier_name: '' }, '2026-11-13')).toBeNull();
  });
  it('cuts a 24-page issue into 20 interior pages and two cover spreads', async () => {
    const doc = await PDFDocument.create();
    for (let i = 0; i < 24; i++) { const p = doc.addPage([COMIC_TRIM[0] + 18, COMIC_TRIM[1] + 18]); p.setTrimBox(9, 9, ...COMIC_TRIM); p.drawText(`Page ${i + 1}`, { x: 30, y: 30 }); }
    const files = await comicFiles(await doc.save(), { width: COMIC_TRIM[0] * 2 + 18, height: COMIC_TRIM[1] + 18 });
    expect(files.pages).toBe(20); expect((await PDFDocument.load(files.interior)).getPageCount()).toBe(20); expect((await PDFDocument.load(files.cover)).getPageCount()).toBe(2);
  });
  it('refuses to scale older digest PDFs into the Lulu format', async () => {
    const doc = await PDFDocument.create(); for (let i = 0; i < 24; i++) doc.addPage([414, 630]).setTrimBox(9, 9, 396, 612);
    await expect(comicFiles(await doc.save(), { width: COMIC_TRIM[0] * 2 + 18, height: COMIC_TRIM[1] + 18 })).rejects.toThrow(/older/);
  });
});