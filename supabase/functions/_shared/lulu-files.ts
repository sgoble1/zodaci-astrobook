import { PDFDocument, StandardFonts, degrees, rgb } from 'npm:pdf-lib@1.17.1';
import { coverLayout, interiorPageCount } from './lulu-rules.ts';

/**
 * Lulu needs two files per book: a multi-page interior and a single-page full cover.
 * Both are cut from the customer's frozen, reviewed AstroBook PDF, so nothing they approved is rewritten.
 */
export async function buildInterior(finalPdf: Uint8Array) {
  const source = await PDFDocument.load(finalPdf);
  const total = source.getPageCount();
  if (total < 3) throw new Error('The reviewed book is too short to print.');
  const out = await PDFDocument.create();
  const pages = await out.copyPages(source, Array.from({ length: total - 1 }, (_, i) => i + 1));
  pages.forEach(p => out.addPage(p));
  const expected = interiorPageCount(total);
  if (out.getPageCount() < expected) { const { width, height } = pages[pages.length - 1].getSize(); out.addPage([width, height]); }
  out.setTitle(source.getTitle() ?? 'AstroBook'); out.setAuthor('Zodaci'); out.setSubject('AstroBook interior for print');
  return { bytes: await out.save(), pages: out.getPageCount() };
}

const midnight = rgb(24 / 255, 43 / 255, 70 / 255), gold = rgb(193 / 255, 155 / 255, 56 / 255), ivory = rgb(239 / 255, 227 / 255, 200 / 255), muted = midnight;

/** Full cover (back, spine, front) at Lulu's exact dimensions; the front is the cover page the customer reviewed. */
export async function buildCoverWrap(finalPdf: Uint8Array, opts: { pod: string; interiorPages: number; width: number; height: number; trim: [number, number] }) {
  const L = coverLayout(opts.pod, opts.interiorPages, opts.width, opts.height, opts.trim);
  const out = await PDFDocument.create();
  const page = out.addPage([opts.width, opts.height]);
  page.drawRectangle({ x: 0, y: 0, width: opts.width, height: opts.height, color: midnight });
  const [front] = await out.embedPdf(finalPdf, [0]);
  // Reuse the reviewed design on the back: all eight designs and uploads remain paired, never replaced by a stock cover.
  page.drawPage(front, { x: L.backX, y: L.outer, width: L.trimW, height: L.trimH, opacity: .2 });
  // Extend the artwork into the bleed/wrap around the front panel, then place the reviewed cover exactly on the trim.
  const regionW = L.trimW + L.outer + L.flap, regionH = opts.height;
  const s = Math.max(regionW / L.trimW, regionH / L.trimH);
  page.drawPage(front, { x: L.frontX, y: (opts.height - L.trimH * s) / 2, width: L.trimW * s, height: L.trimH * s });
  page.drawRectangle({ x: L.spineX, y: 0, width: L.spine, height: opts.height, color: midnight });
  page.drawPage(front, { x: L.frontX, y: L.outer, width: L.trimW, height: L.trimH });
  if (L.flap) page.drawRectangle({ x: opts.width - L.outer - L.flap, y: 0, width: L.flap + L.outer, height: opts.height, color: midnight });

  const serif = await out.embedFont(StandardFonts.TimesRoman), sans = await out.embedFont(StandardFonts.Helvetica);
  // Back cover: quiet type inside a half-inch safe zone.
  const safe = 36, bx = L.backX + safe, bw = L.trimW - safe * 2, top = L.outer + L.trimH - safe;
  page.drawRectangle({ x: bx - 8, y: L.outer + safe - 8, width: bw + 16, height: L.trimH - safe * 2 + 16, color: ivory, opacity: .96, borderColor: gold, borderWidth: .75 });
  const size = Math.max(14, Math.min(26, L.trimW / 16));
  page.drawText('A personal sky, in print', { x: bx, y: top - size, size, font: serif, color: ivory, maxWidth: bw });
  const lines = ['Calculated from the birth details supplied and written', 'from that one chart. Astrology is offered for', 'entertainment and self-reflection, not prediction.'];
  lines.forEach((t, i) => page.drawText(t, { x: bx, y: top - size - 28 - i * 15, size: 10, font: sans, color: muted, maxWidth: bw }));
  page.drawText('Zodaci', { x: bx, y: L.outer + safe + 14, size: 14, font: serif, color: gold });
  page.drawText('zodaci.com', { x: bx, y: L.outer + safe, size: 9, font: sans, color: muted });
  page.drawEllipse({ x: bx + 30, y: L.outer + safe + 82, xScale: 27, yScale: 13, borderColor: gold, borderWidth: 1, rotate: degrees(25) });
  page.drawEllipse({ x: bx + 30, y: L.outer + safe + 82, xScale: 27, yScale: 13, borderColor: gold, borderWidth: 1, rotate: degrees(-25) });
  page.drawText('ORBIT', { x: bx + 12, y: L.outer + safe + 79, size: 10, font: sans, color: midnight });
  page.drawText('Astral Research Authority', { x: bx, y: L.outer + safe + 35, size: 8, font: sans, color: midnight });
  // Reserve a blank 2 x 1.2 inch block; never invent an ISBN or print fake barcode bars.
  const barcode = { x: L.backX + L.trimW - safe - 144, y: L.outer + safe, width: 144, height: 86.4 };
  page.drawRectangle({ ...barcode, color: rgb(1, 1, 1) });
  // Spine title when the spine is at least a quarter inch wide.
  if (L.spine >= 18) {
    const text = 'AstroBook  ·  Zodaci';
    const ts = Math.min(11, L.spine * .45);
    const tw = serif.widthOfTextAtSize(text, ts);
    page.drawText(text, { x: L.spineX + L.spine / 2 - ts * .35, y: opts.height / 2 + tw / 2, size: ts, font: serif, color: gold, rotate: degrees(-90) });
  }
  out.setTitle('AstroBook cover'); out.setAuthor('Zodaci');
  return { bytes: await out.save(), layout: L, barcode };
}
