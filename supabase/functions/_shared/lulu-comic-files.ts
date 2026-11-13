import { PDFDocument } from 'npm:pdf-lib@1.17.1';
import { COMIC_TRIM, COMIC_BLEED, comicPageError } from './lulu-comic-rules.ts';

/** Four cover faces become Lulu's two spreads; inner content stays in reading order. */
export async function comicFiles(bytes: Uint8Array, dimensions: { width: number; height: number }) {
  const source = await PDFDocument.load(bytes);
  const total = source.getPageCount();
  const pages = total - 4;
  const error = comicPageError(pages);
  if (error) throw new Error(error);
  const [tw, th] = COMIC_TRIM;
  for (const page of source.getPages()) {
    const box = page.getTrimBox();
    if (Math.abs(box.width - tw) > .1 || Math.abs(box.height - th) > .1) throw new Error('This is an older comic-size PDF. Rebuild artwork and the print file for Lulu’s comic trim.');
  }
  const interior = await PDFDocument.create();
  const copied = await interior.copyPages(source, Array.from({ length: pages }, (_, i) => i + 2));
  copied.forEach(p => interior.addPage(p));
  const cover = await PDFDocument.create();
  const { width, height } = dimensions;
  if (Math.abs(width - (2 * tw + 2 * COMIC_BLEED)) > 1 || Math.abs(height - (th + 2 * COMIC_BLEED)) > 1) throw new Error('Lulu returned unexpected saddle-stitch cover dimensions.');
  // Outside: back | front. Inside: inside front | inside back (Lulu comic template).
  for (const pair of [[total - 1, 0], [1, total - 2]]) {
    const page = cover.addPage([width, height]);
    for (let side = 0; side < 2; side++) {
      const original = source.getPage(pair[side]);
      const embedded = await cover.embedPage(original);
      // Crop the centre bleed at the fold, retaining outer/top/bottom bleed.
      const cropped = await cover.embedPage(original, { left: side ? COMIC_BLEED : 0, bottom: 0, right: side ? embedded.width : embedded.width - COMIC_BLEED, top: embedded.height });
      page.drawPage(cropped, { x: side ? tw + COMIC_BLEED : 0, y: 0, width: tw + COMIC_BLEED, height });
    }
  }
  interior.setTitle('AstroComic interior'); cover.setTitle('AstroComic outside and inside covers');
  return { pages, interior: await interior.save(), cover: await cover.save() };
}