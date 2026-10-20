import { ART_RULES, CAST, type ComicIssue, type ComicPage, type ComicPanel } from '@/lib/comic';

/**
 * AstroComic print geometry and artwork planning. One source for the proof/print PDF, the artwork sizes
 * requested from the image model and the preflight report, so art is always drawn at the size it is printed.
 * Units are PDF points (72 per inch), measured from the top-left of the page including bleed.
 */
export const PT = 72;
export const TRIM = { w: 5.5 * PT, h: 8.5 * PT };
export const BLEED = 0.125 * PT;
export const SAFE = 0.25 * PT;
export const MEDIA = { w: TRIM.w + 2 * BLEED, h: TRIM.h + 2 * BLEED };
export const LIVE = { x: BLEED + SAFE, y: BLEED + SAFE, w: TRIM.w - 2 * SAFE, h: TRIM.h - 2 * SAFE };
export const MIN_DPI = 300;
export const PRINT_PAGES = 24;
/** Pixels requested per printed point: a little above 300 DPI so rounding never drops below it. */
const PX_PER_PT = 310 / PT;
const GUTTER = 7;
const HEADER_H = 40;
const BODY_GAP = 12;
const MIN_ROW_H = 72;

export type Rect = { x: number; y: number; w: number; h: number };
export type Measure = (text: string, size: number) => number;
export type PanelBox = { panel: number; shape: ComicPanel['shape']; rect: Rect; qr: boolean };
export type BodyBlock = { rect: Rect; size: number; leading: number; columns: 1 | 2; colGap: number; paragraphs: string[][]; overflow: boolean };
export type PageLayout = { n: number; full: boolean; panels: PanelBox[]; body: BodyBlock | null };

export const artKey = (page: number, panel: number) => `${page}-${panel}`;
export const isFullPage = (page: ComicPage) => page.section === 'Cover' || page.section === 'Back Cover';
/** The "About Zodaci" QR panel is drawn as a real, scannable code — never by the image model. */
export const isQrPanel = (panel: ComicPanel) => /^QR code/i.test(panel.scene);
export const QR_URL = 'https://zodaci.com/my-chart';

/** Greedy word wrap; words longer than the line are kept whole rather than split mid-word. */
export function wrapText(text: string, width: number, size: number, measure: Measure): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (line && measure(next, size) > width) { lines.push(line); line = w; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Largest comfortable lettering that fits: prefer at most 45% of the page for text, fall back to the hard limit. */
function layoutBody(body: string[], width: number, comfortable: number, hard: number, measure: Measure): Omit<BodyBlock, 'rect'> & { height: number } {
  const twoCol = body.length >= 6 && body.every(t => t.length <= 48);
  const colGap = 14;
  const columns: 1 | 2 = twoCol ? 2 : 1;
  const colW = columns === 2 ? (width - colGap) / 2 : width;
  const at = (size: number) => {
    const leading = size * 1.32; const paraGap = size * 0.45;
    const paragraphs = body.map(t => wrapText(t, colW, size, measure));
    const heightOf = (ps: string[][]) => ps.reduce((h, p) => h + p.length * leading, 0) + Math.max(0, ps.length - 1) * paraGap;
    const split = Math.ceil(paragraphs.length / 2);
    const height = columns === 2 ? Math.max(heightOf(paragraphs.slice(0, split)), heightOf(paragraphs.slice(split))) : heightOf(paragraphs);
    return { size, leading, columns, colGap, paragraphs, height, overflow: height > hard };
  };
  const sizes = [10.5, 9.75, 9, 8.25, 7.5];
  for (const limit of [comfortable, hard]) for (const size of sizes) { const b = at(size); if (b.height <= limit) return b; }
  return at(sizes[sizes.length - 1]);
}

type Row = { kind: 'full' | 'pair'; items: number[] };
/** Wide, oval and bleed panels take a full row; squares and talls pair up side by side; a lone square or tall takes the full row. */
export function panelRows(panels: ComicPanel[]): Row[] {
  const rows: Row[] = [];
  let pending: number | null = null;
  panels.forEach((p, i) => {
    const half = p.shape === 'square' || p.shape === 'tall';
    if (half) {
      if (pending === null) pending = i; else { rows.push({ kind: 'pair', items: [pending, i] }); pending = null; }
      return;
    }
    if (pending !== null) { rows.push({ kind: 'full', items: [pending] }); pending = null; }
    rows.push({ kind: 'full', items: [i] });
  });
  if (pending !== null) rows.push({ kind: 'full', items: [pending] });
  return rows;
}

/** Page geometry. Cover and back cover are one full-bleed panel; interior pages stack header, panel rows and body text inside the safe area. */
export function layoutPage(page: ComicPage, measure: Measure): PageLayout {
  if (isFullPage(page)) return { n: page.n, full: true, panels: page.panels.slice(0, 1).map((p, i) => ({ panel: i, shape: p.shape, rect: { x: 0, y: 0, w: MEDIA.w, h: MEDIA.h }, qr: false })), body: null };
  const top = LIVE.y + HEADER_H;
  const bottom = LIVE.y + LIVE.h;
  const rows = panelRows(page.panels);
  const minPanels = rows.length * MIN_ROW_H + Math.max(0, rows.length - 1) * GUTTER;
  let body: BodyBlock | null = null;
  let panelsBottom = bottom;
  if (page.body?.length) {
    const hard = Math.max(60, bottom - top - minPanels - BODY_GAP);
    const b = layoutBody(page.body, LIVE.w, Math.min(hard, (bottom - top) * 0.45), hard, measure);
    const h = Math.min(b.height, hard);
    body = { rect: { x: LIVE.x, y: bottom - h, w: LIVE.w, h }, size: b.size, leading: b.leading, columns: b.columns, colGap: b.colGap, paragraphs: b.paragraphs, overflow: b.overflow };
    panelsBottom = bottom - h - BODY_GAP;
  }
  const weights = rows.map(r => (r.kind === 'pair' ? (r.items.some(i => page.panels[i].shape === 'tall') ? 1.45 : 1.15) : 1));
  // Ovals stay oval and the QR panel stays compact; their spare height goes to the other rows, or centres the group.
  const caps = rows.map(r => { const p = page.panels[r.items[0]]; return r.kind === 'full' ? (isQrPanel(p) ? 170 : p.shape === 'oval' ? Math.round(LIVE.w * 0.8) : Infinity) : Infinity; });
  const free = Math.max(rows.length * MIN_ROW_H, panelsBottom - top - Math.max(0, rows.length - 1) * GUTTER);
  const heights = rows.map(() => 0);
  let open = rows.map((_, i) => i); let left = free;
  while (open.length) {
    const sum = open.reduce((a, i) => a + weights[i], 0);
    const over = open.filter(i => (left * weights[i]) / sum > caps[i]);
    if (!over.length) { open.forEach(i => { heights[i] = Math.floor(((left * weights[i]) / sum) * 100) / 100; }); break; }
    over.forEach(i => { heights[i] = caps[i]; left -= caps[i]; });
    open = open.filter(i => !over.includes(i));
  }
  const used = heights.reduce((a, b) => a + b, 0);
  const panels: PanelBox[] = [];
  let y = top + Math.max(0, (free - used) / 2);
  rows.forEach((r, ri) => {
    const h = heights[ri];
    if (r.kind === 'full') {
      const i = r.items[0]; const p = page.panels[i];
      const rect = p.shape === 'bleed' ? { x: 0, y, w: MEDIA.w, h } : { x: LIVE.x, y, w: LIVE.w, h };
      panels.push({ panel: i, shape: p.shape, rect, qr: isQrPanel(p) });
    } else {
      const w = (LIVE.w - GUTTER) / 2;
      r.items.forEach((i, k) => panels.push({ panel: i, shape: page.panels[i].shape, rect: { x: LIVE.x + k * (w + GUTTER), y, w, h }, qr: isQrPanel(page.panels[i]) }));
    }
    y += h + GUTTER;
  });
  return { n: page.n, full: false, panels, body };
}

/** The image model's custom-size rules (mirrored in the comic-art function). */
export function validArtSize(w: number, h: number) {
  return w % 16 === 0 && h % 16 === 0 && w <= 3840 && h <= 3840 && w * h >= 655360 && w * h <= 8294400 && w / h <= 3 && h / w <= 3;
}

/** Pixel size to request for a printed rectangle: at least 300 DPI, same shape, within the model's limits. */
export function artPixels(rect: Rect): { width: number; height: number } {
  let w = rect.w * PX_PER_PT; let h = rect.h * PX_PER_PT;
  if (w / h > 3) h = w / 3; else if (h / w > 3) w = h / 3;
  if (w * h < 655360) { const s = Math.sqrt(655360 / (w * h)); w *= s; h *= s; }
  if (w * h > 8294400) { const s = Math.sqrt(8294400 / (w * h)); w *= s; h *= s; }
  const up = (v: number) => Math.min(3840, Math.ceil(v / 16) * 16);
  let width = up(w); let height = up(h);
  while (width * height > 8294400) { if (width >= height) width -= 16; else height -= 16; }
  return { width, height };
}

/** Effective print resolution of an image scaled to cover a rectangle (centre crop). */
export function effectiveDpi(imgW: number, imgH: number, rect: Rect) {
  const s = Math.max(rect.w / imgW, rect.h / imgH);
  return Math.floor(PT / s);
}

/** Centre-crop placement of an image covering a rectangle. */
export function coverFit(imgW: number, imgH: number, rect: Rect): Rect {
  const s = Math.max(rect.w / imgW, rect.h / imgH);
  const w = imgW * s; const h = imgH * s;
  return { x: rect.x - (w - rect.w) / 2, y: rect.y - (h - rect.h) / 2, w, h };
}

const orientation = (r: Rect) => (r.w / r.h > 1.15 ? 'landscape' : r.h / r.w > 1.15 ? 'portrait' : 'square');

/** Prompt for one panel. The reader is never drawn as a recognisable person, and the art carries no lettering — text is set in the PDF. */
export function artPrompt(issue: ComicIssue, page: ComicPage, panelIndex: number, rect: Rect): string {
  const panel = page.panels[panelIndex];
  const reader = issue.reader?.trim();
  const scene = reader ? panel.scene.split(reader).join('the reader') : panel.scene;
  const cast = CAST.filter(c => scene.includes(c.name)).map(c => `${c.name}, the ${c.planet}: ${c.look}; companion ${c.companion}`);
  const full = isFullPage(page);
  return [
    `Hand-inked comic book ${full ? 'cover' : 'panel'} artwork for a personalised monthly astrology comic. Section: ${page.section}.`,
    `Scene: ${scene}`,
    cast.length ? `Recurring characters — keep these exact designs: ${cast.join(' | ')}.` : '',
    /the reader/.test(scene) ? 'The reader is a simple stylised figure seen from behind or in silhouette, with no identifiable face, age or ethnicity.' : '',
    `Style: ${ART_RULES.rules.slice(0, 3).join('; ')}; ${ART_RULES.rules[4]}.`,
    `Palette: ${ART_RULES.palette.map(([n, h]) => `${n} ${h}`).join(', ')}.`,
    full
      ? `Full-page ${orientation(rect)} composition that runs off every edge. Keep the top third calm and dark for the title, and nothing important in the outer 5%.`
      : `${orientation(rect)} composition filling the whole frame edge to edge, no border drawn. Keep faces and key details away from the edges and leave calm space along the top for a caption box.`,
    'Absolutely no text, letters, numbers, signatures, speech balloons, captions, logos or watermarks anywhere in the image.',
  ].filter(Boolean).join('\n');
}

export type PanelSlot = { key: string; page: number; panel: number; section: string; title: string; scene: string; rect: Rect; width: number; height: number; prompt: string };

/** Every panel the image model must draw, in reading order (the QR panel is excluded). */
export function panelPlan(issue: ComicIssue, measure: Measure): PanelSlot[] {
  return issue.pages.flatMap(page => layoutPage(page, measure).panels.filter(b => !b.qr).map(b => {
    const { width, height } = artPixels(b.rect);
    return { key: artKey(page.n, b.panel), page: page.n, panel: b.panel, section: page.section, title: page.title, scene: page.panels[b.panel].scene, rect: b.rect, width, height, prompt: artPrompt(issue, page, b.panel, b.rect) };
  }));
}

export type ArtRecord = { page_n: number; panel_i: number; width: number; height: number; scene: string; updated_at?: string };
export type PrintReport = { ok: boolean; pages: number; panels: number; illustrated: number; missing: string[]; stale: string[]; lowDpi: { key: string; dpi: number }[]; overflow: number[]; minDpi: number | null; checkedAt: string };

/** Printer preflight: 24 pages, every panel illustrated from the current script, all art at 300 DPI or better, all text inside its box. */
export function preflight(issue: ComicIssue, art: ArtRecord[], measure: Measure, now = new Date()): PrintReport {
  const byKey = new Map(art.map(a => [artKey(a.page_n, a.panel_i), a]));
  const slots = panelPlan(issue, measure);
  const missing: string[] = []; const stale: string[] = []; const lowDpi: { key: string; dpi: number }[] = [];
  let minDpi: number | null = null;
  for (const s of slots) {
    const a = byKey.get(s.key);
    if (!a) { missing.push(s.key); continue; }
    if (a.scene && a.scene !== s.scene) stale.push(s.key);
    const dpi = effectiveDpi(a.width, a.height, s.rect);
    minDpi = minDpi === null ? dpi : Math.min(minDpi, dpi);
    if (dpi < MIN_DPI) lowDpi.push({ key: s.key, dpi });
  }
  const overflow = issue.pages.filter(p => layoutPage(p, measure).body?.overflow).map(p => p.n);
  const pages = issue.pages.length;
  return { ok: pages === PRINT_PAGES && !missing.length && !stale.length && !lowDpi.length && !overflow.length, pages, panels: slots.length, illustrated: slots.length - missing.length, missing, stale, lowDpi, overflow, minDpi, checkedAt: now.toISOString() };
}

/** Plain-language lines for the preflight result. */
export function describeReport(r: PrintReport, label = (k: string) => `page ${k.split('-')[0]}`): string[] {
  const out: string[] = [];
  if (r.pages !== PRINT_PAGES) out.push(`The issue has ${r.pages} pages; print needs exactly ${PRINT_PAGES}.`);
  if (r.missing.length) out.push(`${r.missing.length} panel${r.missing.length === 1 ? '' : 's'} still need artwork.`);
  if (r.stale.length) out.push(`${r.stale.length} panel${r.stale.length === 1 ? ' was' : 's were'} drawn for an older script (${[...new Set(r.stale.map(label))].join(', ')}) — redraw ${r.stale.length === 1 ? 'it' : 'them'}.`);
  if (r.lowDpi.length) out.push(`${r.lowDpi.length} panel${r.lowDpi.length === 1 ? ' is' : 's are'} below ${MIN_DPI} DPI (lowest ${Math.min(...r.lowDpi.map(x => x.dpi))}) — redraw at the planned size.`);
  if (r.overflow.length) out.push(`Text does not fit on page${r.overflow.length === 1 ? '' : 's'} ${r.overflow.join(', ')}.`);
  if (r.ok) out.push(`Ready for print: ${r.pages} pages, ${r.panels} illustrated panels, lowest resolution ${r.minDpi ?? '—'} DPI.`);
  return out;
}

/** Characters the embedded font cannot draw are replaced, so the PDF never shows empty boxes. */
export function fitCharset(text: string, has: (codePoint: number) => boolean) {
  const swaps: Record<string, string> = { '\u2018': "'", '\u2019': "'", '\u201C': '"', '\u201D': '"', '\u2014': '-', '\u2013': '-', '\u2026': '...', '\u00B0': ' deg' };
  return Array.from(text).map(ch => (has(ch.codePointAt(0)!) ? ch : swaps[ch] ?? (/[\u2600-\u27BF]/.test(ch) ? '' : '?'))).join('');
}
