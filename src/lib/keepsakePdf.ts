import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { CertificateRow, ScrollSection } from '@/lib/keepsakes';

/**
 * Print-quality keepsake PDFs drawn with vector type (no screenshots), from the same rows the page shows.
 * Certificate: US Letter landscape. Star Scroll: tall US Legal portrait. Labelled as keepsakes, never official records.
 */
export const CERTIFICATE_SIZE: [number, number] = [792, 612];
export const SCROLL_SIZE: [number, number] = [612, 1008];

const CREAM = rgb(0.937, 0.89, 0.784); const INDIGO = rgb(0.118, 0.118, 0.353); const BRASS = rgb(0.71, 0.56, 0.27); const RED = rgb(0.886, 0.231, 0.267);

/** Standard PDF fonts only encode WinAnsi: swap primes, drop planet glyphs and anything else they cannot draw. */
export function pdfSafe(s: string): string {
  return s.replace(/′/g, "'").replace(/″/g, '"').replace(/[–—]/g, '-').replace(/·/g, '\u00B7').replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '').replace(/\s+/g, ' ').trim();
}

export type KeepsakeInfo = { name: string; bornLine: string; number: string; printed: string };

function frame(p: PDFPage) {
  const { width: w, height: h } = p.getSize();
  p.drawRectangle({ x: 0, y: 0, width: w, height: h, color: CREAM });
  p.drawRectangle({ x: 24, y: 24, width: w - 48, height: h - 48, borderColor: INDIGO, borderWidth: 3 });
  p.drawRectangle({ x: 32, y: 32, width: w - 64, height: h - 64, borderColor: BRASS, borderWidth: 1 });
}
const center = (p: PDFPage, f: PDFFont, t: string, size: number, y: number, color = INDIGO) => { const s = pdfSafe(t); p.drawText(s, { x: (p.getWidth() - f.widthOfTextAtSize(s, size)) / 2, y, size, font: f, color }); };
function rowLine(p: PDFPage, f: PDFFont, b: PDFFont, r: CertificateRow, x: number, y: number, width: number, size: number) {
  const l = pdfSafe(r.label), v = pdfSafe(r.value);
  p.drawText(l, { x, y, size, font: b, color: INDIGO });
  p.drawText(v, { x: x + width - f.widthOfTextAtSize(v, size), y, size, font: f, color: INDIGO });
  p.drawLine({ start: { x, y: y - 4 }, end: { x: x + width, y: y - 4 }, thickness: 0.5, color: BRASS, dashArray: [2, 2] });
}
function footer(p: PDFPage, f: PDFFont, info: KeepsakeInfo) {
  p.drawText(pdfSafe(`Keepsake no. ${info.number} \u00B7 Printed ${info.printed}`), { x: 48, y: 48, size: 9, font: f, color: INDIGO });
  const t = 'A keepsake calculated from the birth details shown. Not an official record.';
  p.drawText(t, { x: p.getWidth() - 48 - f.widthOfTextAtSize(t, 8), y: 48, size: 8, font: f, color: INDIGO });
}

export async function certificatePdf(info: KeepsakeInfo, rows: CertificateRow[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create(); doc.setTitle(pdfSafe(`Certificate of the Birth Sky - ${info.name}`)); doc.setProducer('Zodaci');
  const f = await doc.embedFont(StandardFonts.TimesRoman), b = await doc.embedFont(StandardFonts.TimesRomanBold), h = await doc.embedFont(StandardFonts.HelveticaBold);
  const p = doc.addPage(CERTIFICATE_SIZE); frame(p);
  center(p, h, 'ZODACI \u00B7 ASTRAL RESEARCH AUTHORITY', 10, 548, BRASS);
  center(p, b, 'Certificate of the Birth Sky', 34, 500);
  center(p, f, 'This keepsake records the sky above', 14, 470, RED);
  center(p, b, info.name, 28, 432);
  center(p, f, info.bornLine, 12, 410);
  const half = Math.ceil(rows.length / 2), colW = 300, x0 = (792 - colW * 2 - 40) / 2;
  rows.forEach((r, i) => rowLine(p, f, b, r, x0 + (i < half ? 0 : colW + 40), 360 - (i % half) * 26, colW, 12));
  center(p, b, 'The Grand Observatory \u00B7 Calculated, not invented', 12, 110, BRASS);
  footer(p, f, info);
  return doc.save();
}

export async function scrollPdf(info: KeepsakeInfo, sections: ScrollSection[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create(); doc.setTitle(pdfSafe(`Star Scroll - ${info.name}`)); doc.setProducer('Zodaci');
  const f = await doc.embedFont(StandardFonts.TimesRoman), b = await doc.embedFont(StandardFonts.TimesRomanBold), h = await doc.embedFont(StandardFonts.HelveticaBold);
  const p = doc.addPage(SCROLL_SIZE); frame(p);
  center(p, h, 'STAR SCROLL', 11, 944, BRASS);
  center(p, b, info.name, 30, 906);
  center(p, f, info.bornLine, 12, 884);
  // Two columns; a section moves to the second column when the first runs low, never off the page.
  const colW = 240, xs = [56, 612 - 56 - colW]; let col = 0, y = 840;
  for (const s of sections) {
    const need = 22 + s.rows.length * 17;
    if (y - need < 80 && col === 0) { col = 1; y = 840; }
    if (y - need < 80) break;
    p.drawText(pdfSafe(s.title.toUpperCase()), { x: xs[col], y, size: 11, font: h, color: RED }); y -= 20;
    for (const r of s.rows) { rowLine(p, f, b, { label: r.label.replace(/^\S+\s/, m => /[A-Za-z0-9]/.test(m) ? m : ''), value: r.value }, xs[col], y, colW, 10); y -= 17; }
    y -= 12;
  }
  center(p, b, 'Same skies. Brighter answers.', 14, 72, BRASS);
  footer(p, f, info);
  return doc.save();
}
