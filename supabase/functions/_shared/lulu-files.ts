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

const midnight = rgb(7 / 255, 8 / 255, 15 / 255), gold = rgb(212 / 255, 168 / 255, 83 / 255), ivory = rgb(232 / 255, 224 / 255, 240 / 255), muted = rgb(168 / 255, 158 / 255, 192 / 255);

/** Full cover (back, spine, front) at Lulu's exact dimensions; the front is the cover page the customer reviewed. */
export async function buildCoverWrap(finalPdf: Uint8Array, opts: { pod: string; interiorPages: number; width: number; height: number; trim: [number, number] }) {
  const L = coverLayout(opts.pod, opts.interiorPages, opts.width, opts.height, opts.trim);
  const out = await PDFDocument.create();
  const page = out.addPage([opts.width, opts.height]);
  page.drawRectangle({ x: 0, y: 0, width: opts.width, height: opts.height, color: midnight });
  const [front] = await out.embedPdf(finalPdf, [0]);
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
  const size = Math.max(14, Math.min(26, L.trimW / 16));
  page.drawText('A personal sky, in print', { x: bx, y: top - size, size, font: serif, color: ivory, maxWidth: bw });
  const lines = ['Calculated from an exact birth moment and written', 'from that one chart. Astrology is offered for', 'reflection, not prediction.'];
  lines.forEach((t, i) => page.drawText(t, { x: bx, y: top - size - 28 - i * 15, size: 10, font: sans, color: muted, maxWidth: bw }));
  page.drawText('Zodaci', { x: bx, y: L.outer + safe + 14, size: 14, font: serif, color: gold });
  page.drawText('zodaci.com', { x: bx, y: L.outer + safe, size: 9, font: sans, color: muted });
  // Spine title when the spine is at least a quarter inch wide.
  if (L.spine >= 18) {
    const text = 'AstroBook  ·  Zodaci';
    const ts = Math.min(11, L.spine * .45);
    const tw = serif.widthOfTextAtSize(text, ts);
    page.drawText(text, { x: L.spineX + L.spine / 2 - ts * .35, y: opts.height / 2 + tw / 2, size: ts, font: serif, color: gold, rotate: degrees(-90) });
  }
  out.setTitle('AstroBook cover'); out.setAuthor('Zodaci');
  return { bytes: await out.save(), layout: L };
}
