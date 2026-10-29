import { coverByKey, paintCover, type CoverDesign } from '@/content/coverDesigns';
import { COVER_BLEED_IN, PRINT_PPI, coverType, placeArt, type CoverCrop, type CoverTextBox } from '@/lib/coverLayout';

/** Where the cover artwork comes from: one of our designs, or an image URL (your upload or a chart cover). */
export type CoverSource = { kind: 'design'; key: string } | { kind: 'image'; url: string };
export type CoverSpec = { source: CoverSource; crop: CoverCrop; name: string; trimPt: [number, number] };

/** Print colours for type on the cover (fixed ink values, independent of the site theme). */
const IVORY = '#F4ECDD';
const GOLD = '#D4A853';
const SERIF = '"DM Serif Display", Georgia, serif';
const SANS = '"Fira Sans", system-ui, sans-serif';
const SPACING = 0.18; // subtitle letter spacing, as a fraction of its size

let fontsReady: Promise<void> | null = null;
/** Wait for the cover faces so canvas text never falls back mid-render. */
export function loadCoverFonts() {
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
  return (fontsReady ??= Promise.all([document.fonts.load(`64px ${SERIF}`), document.fonts.load(`500 32px ${SANS}`)]).then(() => undefined, () => undefined));
}

const images = new Map<string, Promise<HTMLImageElement>>();
export function loadImage(url: string) {
  let p = images.get(url);
  if (!p) {
    p = new Promise((resolve, reject) => { const im = new Image(); im.decoding = 'async'; im.onload = () => resolve(im); im.onerror = () => reject(new Error('The cover image could not be loaded.')); im.src = url; });
    images.set(url, p); p.catch(() => images.delete(url));
  }
  return p;
}

/** Pixel size of the trim for a cover rendered at `ppi`. */
export const coverPixels = (trimPt: [number, number], ppi: number) => [Math.round((trimPt[0] / 72) * ppi), Math.round((trimPt[1] / 72) * ppi)] as const;

/** The intrinsic size of the artwork, or null for painted designs (which have no resolution limit). */
export async function sourceSize(source: CoverSource, trimPt?: [number, number]): Promise<{ width: number; height: number } | null> {
  if (source.kind === 'design') { const d = coverByKey(source.key); const src = d && designSrc(d, trimPt); if (!src) return null; const im = await loadImage(src); return { width: im.naturalWidth, height: im.naturalHeight }; }
  const im = await loadImage(source.url); return { width: im.naturalWidth, height: im.naturalHeight };
}

function drawSpaced(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, spacing: number) {
  const chars = Array.from(text);
  const widths = chars.map(c => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let x = cx - total / 2;
  ctx.textAlign = 'left';
  chars.forEach((c, i) => { ctx.fillText(c, x, y); x += widths[i] + spacing; });
}

function drawBox(ctx: CanvasRenderingContext2D, box: CoverTextBox, family: string, color: string, weight = '', spaced = false) {
  ctx.font = `${weight}${box.size}px ${family}`;
  ctx.fillStyle = color; ctx.textBaseline = 'alphabetic';
  box.lines.forEach((line, i) => {
    if (spaced) drawSpaced(ctx, line, box.x, box.y[i], box.size * SPACING);
    else { ctx.textAlign = box.align; ctx.fillText(line, box.x, box.y[i]); }
  });
}

/** Draw the full front cover — artwork, legibility shading and the shared type layout — onto a canvas of `w`×`h`. */
export async function drawCover(ctx: CanvasRenderingContext2D, spec: CoverSpec, w: number, h: number) {
  await loadCoverFonts();
  const design: CoverDesign | undefined = spec.source.kind === 'design' ? coverByKey(spec.source.key) : undefined;
  if (spec.source.kind === 'design' && !design) throw new Error('That cover design is no longer available.');
  if (design && !design.src) {
    // Painted covers are drawn at full size, then zoom/pan simply moves that painting.
    const off = document.createElement('canvas'); off.width = w; off.height = h;
    paintCover(off.getContext('2d')!, design, w, h);
    const p = placeArt(w, h, w, h, spec.crop); ctx.drawImage(off, p.x, p.y, p.width, p.height);
  } else {
    const im = await loadImage((design && designSrc(design, spec.trimPt)) ?? (spec.source as { url: string }).url);
    const p = placeArt(im.naturalWidth, im.naturalHeight, w, h, spec.crop);
    ctx.fillStyle = '#07080F'; ctx.fillRect(0, 0, w, h);
    ctx.drawImage(im, p.x, p.y, p.width, p.height);
  }
  // Soft shading behind the type so the name reads on any artwork.
  const top = ctx.createLinearGradient(0, 0, 0, h * 0.42); top.addColorStop(0, 'rgba(7,8,15,0.62)'); top.addColorStop(1, 'rgba(7,8,15,0)');
  ctx.fillStyle = top; ctx.fillRect(0, 0, w, h * 0.42);
  const bottom = ctx.createLinearGradient(0, h * 0.8, 0, h); bottom.addColorStop(0, 'rgba(7,8,15,0)'); bottom.addColorStop(1, 'rgba(7,8,15,0.5)');
  ctx.fillStyle = bottom; ctx.fillRect(0, h * 0.8, w, h * 0.2);

  const ppi = w / (spec.trimPt[0] / 72);
  const measure = (family: string, weight = '', spacing = 0) => (text: string, size: number) => { ctx.font = `${weight}${size}px ${family}`; return ctx.measureText(text).width + spacing * size * Math.max(0, Array.from(text).length - 1); };
  const t = coverType(w, h, ppi, spec.name, measure(SERIF), measure(SANS, '500 ', SPACING));
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = t.title.size * 0.12;
  drawBox(ctx, t.title, SERIF, IVORY);
  ctx.restore();
  ctx.fillStyle = GOLD; ctx.globalAlpha = 0.9; ctx.fillRect(t.rule.x, t.rule.y, t.rule.width, Math.max(1, w / 600)); ctx.globalAlpha = 1;
  drawBox(ctx, t.subtitle, SANS, GOLD, '500 ', true);
  drawBox(ctx, t.wordmark, SERIF, GOLD);
  return t;
}

/** Render a cover to a canvas at `ppi` (screen previews use a low value; the print file uses 300). */
export async function renderCoverCanvas(spec: CoverSpec, ppi: number) {
  const [w, h] = coverPixels(spec.trimPt, ppi);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d'); if (!ctx) throw new Error('This browser cannot draw the cover.');
  await drawCover(ctx, spec, w, h);
  return c;
}

/** The print-ready front cover as a JPEG (300 ppi at the version's trim). This exact image becomes page 1 of the book. */
export async function renderCoverJpeg(spec: CoverSpec, ppi = PRINT_PPI): Promise<{ blob: Blob; width: number; height: number }> {
  const c = await renderCoverCanvas(spec, ppi);
  const blob = await new Promise<Blob | null>(res => c.toBlob(res, 'image/jpeg', 0.92));
  if (!blob) throw new Error('The cover could not be saved.');
  return { blob, width: c.width, height: c.height };
}

/** Stable identity for a cover spec, so a finished print render is only reused for exactly the same design. */
export const coverSpecKey = (s: CoverSpec) => JSON.stringify([s.source, s.crop, s.name.trim(), s.trimPt]);

export { COVER_BLEED_IN };
