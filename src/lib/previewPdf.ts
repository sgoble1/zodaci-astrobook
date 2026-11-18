import { PDFDocument, rgb, degrees, type PDFFont, type RGB } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fontUrl from '@/assets/fonts/manuscript.ttf?url';
import { faceProse, type BookFace } from '@/lib/bookLeaves';

// Semantic print defaults mirror the global tokens; no canvas or browser globals required.
const PRINT_COLORS: Record<string, [number, number, number]> = {
  '--spot-paper': [.9544, .90728, .8056], '--comic-navy': [.1276, .17072, .3124],
  '--comic-brick': [.711, .2673, .189], '--book-foil': [.72, .55, .25],
  '--book-cloth': [.118, .118, .353], '--book-leather': [.075, .075, .09],
};
export function printToken(name: string): RGB {
  const fallback = PRINT_COLORS[name] ?? PRINT_COLORS['--comic-navy'];
  try {
    if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') return rgb(...fallback);
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const m = raw.match(/^(?:hsl\()?\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*\)?$/);
    if (!m) return rgb(...fallback);
    const h = ((Number(m[1]) % 360) + 360) % 360 / 60, s = Number(m[2]) / 100, l = Number(m[3]) / 100;
    if (s > 1 || l > 1) return rgb(...fallback);
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(h % 2 - 1)), offset = l - c / 2;
    const channels = h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x];
    return rgb(channels[0] + offset, channels[1] + offset, channels[2] + offset);
  } catch { return rgb(...fallback); }
}

export interface PreviewPdfOptions {
  /** Optional byte loaders also allow print verification without browser facilities. */
  fontBytes?: Uint8Array;
  loadImage?: (src: string) => Promise<Uint8Array>;
  onPage?: (report: { face: BookFace; index: number; minY: number; size: number; text: string[] }) => void;
}

function wrapped(text: string, font: PDFFont, size: number, width: number): string[] {
  const lines: string[] = []; let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= width) { line = next; continue; }
    if (line) { lines.push(line); line = ''; }
    // Even a single unbroken uploaded dedication/name must fit the printable width.
    for (const char of word) {
      if (line && font.widthOfTextAtSize(line + char, size) > width) { lines.push(line); line = ''; }
      line += char;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** One PDF sheet per preview face; shared page data prevents the download becoming a different book. */
export async function previewPdf(faces: BookFace[], options: PreviewPdfOptions = {}): Promise<Blob> {
  const comicFaces = faces.filter((f): f is Extract<BookFace, { kind: 'comic-page' }> => f.kind === 'comic-page');
  if (comicFaces.length) {
    const { composeComicPdf } = await import('@/lib/comicPdf');
    const art = new Map<string, { bytes: Uint8Array; width: number; height: number }>();
    const entries = Object.entries(comicFaces[0].art);
    const cached = new Map<string, { bytes: Uint8Array; width: number; height: number }>();
    for (const [key, src] of entries) {
      let value = cached.get(src);
      if (!value) {
        const response = await fetch(src);
        if (!response.ok) throw new Error('A comic illustration could not be loaded.');
        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob);
        value = { bytes: new Uint8Array(await blob.arrayBuffer()), width: bitmap.width, height: bitmap.height };
        bitmap.close(); cached.set(src, value);
      }
      art.set(key, value);
    }
    const { bytes } = await composeComicPdf({ issue: { title: comicFaces[0].sheet.title, month: '', monthLabel: 'Illustrative preview', issueNumber: 1, reader: '', signs: { sun: '', moon: null, rising: null }, mainEvent: '', pages: comicFaces.map(f => f.sheet) }, fontBytes: new Uint8Array(await (await fetch(fontUrl)).arrayBuffer()), art, mode: 'proof' });
    return new Blob([bytes as BlobPart], { type: 'application/pdf' });
  }
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(options.fontBytes ?? await (await fetch(fontUrl)).arrayBuffer(), { subset: true });
  const paper = printToken('--spot-paper'), ink = printToken('--comic-navy'), red = printToken('--comic-brick'), foil = printToken('--book-foil');
  const images = new Map<string, Awaited<ReturnType<typeof pdf.embedPng>>>();
  const imageFor = async (src: string) => {
    const cached = images.get(src);
    if (cached) return cached;
    const bytes = options.loadImage ? await options.loadImage(src) : await (async () => {
      const response = await fetch(src);
      if (!response.ok) throw new Error('The preview illustration could not be loaded.');
      return new Uint8Array(await response.arrayBuffer());
    })();
    let image;
    if (bytes[0] === 137) image = await pdf.embedPng(bytes);
    else if (bytes[0] === 255) image = await pdf.embedJpg(bytes);
    else {
      // Uploaded WebP artwork is rasterized only when needed, not for color resolution.
      const bitmap = await createImageBitmap(new Blob([bytes as BlobPart]));
      const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
      const context = canvas.getContext('2d');
      if (!context) { bitmap.close(); throw new Error('The uploaded cover could not be prepared.'); }
      context.drawImage(bitmap, 0, 0); bitmap.close();
      image = await pdf.embedPng(canvas.toDataURL('image/png'));
    }
    images.set(src, image); return image;
  };
  for (const [index, face] of faces.entries()) {
    const page = pdf.addPage([432, 648]);
    page.drawRectangle({ x: 0, y: 0, width: 432, height: 648, color: paper });
    const src = face.kind === 'cover' || face.kind === 'plate' || face.kind === 'comic' ? face.src : face.kind === 'jacket' ? face.art : null;
    if (src) {
      const image = await imageFor(src);
      if (face.kind === 'cover' || (face.kind === 'jacket' && face.composed)) {
        // The customizer has already lettered and cropped this cover: never stamp it twice.
        const height = 432 * image.height / image.width;
        page.setSize(432, height);
        page.drawImage(image, { x: 0, y: 0, width: 432, height });
        options.onPage?.({ face, index, minY: 0, size: 0, text: [] });
        continue;
      }
      if (face.kind === 'jacket') {
        // Full-bleed image with the same separate top/bottom lettering bands as the browser jacket.
        const scale = Math.max(432 / image.width, 648 / image.height);
        page.drawImage(image, { x: (432 - image.width * scale) / 2, y: (648 - image.height * scale) / 2, width: image.width * scale, height: image.height * scale });
      } else {
        const scale = Math.min(350 / image.width, 480 / image.height);
        page.drawImage(image, { x: (432 - image.width * scale) / 2, y: 116, width: image.width * scale, height: image.height * scale });
      }
    }
    const text = faceProse(face);
    let minY = 648, finalSize = 0;
    const printed: string[] = [];
    const drawBlock = (heading: string, paras: string[], top: number, bottom: number, reflection?: string, color = ink) => {
      let size = 12;
      const plan = () => {
        const headingSize = Math.min(17, size * 1.42);
        const head = wrapped(heading, font, headingSize, 348);
        const body = paras.map(p => wrapped(p, font, size, 348));
        const note = reflection ? wrapped(reflection, font, size * .92, 326) : [];
        const height = head.length * headingSize * 1.25 + 12 + body.reduce((sum, lines) => sum + lines.length * size * 1.42 + size * .6, 0) + (note.length ? 24 + note.length * size * 1.42 + 12 : 0);
        return { headingSize, head, body, note, height };
      };
      let layout = plan();
      while (layout.height > top - bottom && size > .5) { size -= .25; layout = plan(); }
      if (layout.height > top - bottom) throw new Error('The preview text exceeds printable bounds.');
      let y = top;
      const draw = (line: string, s: number, c: RGB, x = 42, italic = false) => {
        page.drawText(line, { x, y, font, size: s, color: c, ...(italic ? { xSkew: degrees(-8) } : {}) });
        minY = Math.min(minY, y); printed.push(line);
      };
      for (const line of layout.head) { draw(line, layout.headingSize, red); y -= layout.headingSize * 1.25; }
      y -= 12;
      for (const lines of layout.body) { for (const line of lines) { draw(line, size, color); y -= size * 1.42; } y -= size * .6; }
      if (layout.note.length) {
        y -= 10;
        const h = 22 + layout.note.length * size * 1.42;
        page.drawRectangle({ x: 40, y: y - h, width: 352, height: h + 8, borderColor: foil, borderWidth: .5, color: paper });
        draw('Reflection', size * .9, red, 52); y -= 16;
        for (const line of layout.note) { draw(line, size * .92, color, 52, true); y -= size * 1.42; }
      }
      finalSize = size;
    };
    if (text) {
      if (face.kind === 'jacket') {
        const dark = face.finish === 'cloth' || face.finish === 'leatherette';
        const bg = dark ? printToken(face.finish === 'cloth' ? '--book-cloth' : '--book-leather') : paper;
        page.drawRectangle({ x: 0, y: 470, width: 432, height: 178, color: bg });
        page.drawRectangle({ x: 0, y: 0, width: 432, height: 150, color: bg });
        page.drawRectangle({ x: 17, y: 17, width: 398, height: 614, borderWidth: .6, borderColor: foil });
        drawBlock('AstroBook', ['Zodaci · Astral Research Authority', face.cover.name, face.cover.birthLine], 605, 485, undefined, dark ? foil : ink);
        drawBlock(face.cover.title, [face.cover.signs, face.edition], 126, 35, undefined, dark ? foil : ink);
      } else if (face.kind === 'plate' || face.kind === 'comic') {
        drawBlock(text.heading, face.kind === 'plate' ? [] : text.lines, 98, 36);
      } else {
        if (face.kind === 'endpaper' || face.kind === 'back') {
          page.drawRectangle({ x: 0, y: 0, width: 432, height: 648, color: ink });
          page.drawRectangle({ x: 28, y: 40, width: 376, height: 568, color: paper, borderColor: foil, borderWidth: 1 });
        }
        const eyebrow = 'eyebrow' in face ? face.eyebrow : '';
        drawBlock(text.heading, [...(eyebrow ? [eyebrow] : []), ...text.lines], 594, 42, text.reflection);
      }
    }
    if ('page' in face && face.page != null) page.drawText(String(face.page), { x: 210, y: 18, font, size: 10, color: ink });
    options.onPage?.({ face, index, minY, size: finalSize, text: printed });
  }
  const bytes = await pdf.save();
  return new Blob([bytes as BlobPart], { type: 'application/pdf' });
}