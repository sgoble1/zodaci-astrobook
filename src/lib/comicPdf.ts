import { PDFDocument, rgb, degrees, pushGraphicsState, popGraphicsState, rectangle, clip, endPath, moveTo, appendBezierCurve, closePath, type PDFFont, type PDFPage, type PDFImage, type RGB } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import QRCode from 'qrcode';
import type { ComicIssue, ComicPage, ComicPanel } from '@/lib/comic';
import { BLEED, LIVE, MEDIA, QR_URL, TRIM, artKey, coverFit, fitCharset, layoutPage, wrapText, type Measure, type PanelBox, type Rect } from '@/lib/comicPrint';

/** Print colours for the physical comic (fixed ink values, independent of the site theme). */
const PAPER = rgb(0.969, 0.945, 0.89);
const INK = rgb(0.027, 0.031, 0.059);
const GOLD = rgb(0.706, 0.325, 0.035);
const NAVY = rgb(0.051, 0.063, 0.157);
const CREAM = rgb(0.957, 0.925, 0.843);
const WHITE = rgb(1, 1, 1);
const PENDING = rgb(0.86, 0.84, 0.8);

export type ComicArt = { bytes: Uint8Array; width: number; height: number };
export type ComicPdfInput = { issue: ComicIssue; fontBytes: Uint8Array; art: Map<string, ComicArt>; mode: 'proof' | 'print'; now?: Date };

/** The embedded font's measuring function, also used to plan artwork sizes so layout and art always agree. */
export async function fontMeasure(fontBytes: Uint8Array): Promise<Measure> {
  const doc = await PDFDocument.create(); doc.registerFontkit(fontkit);
  const font = await doc.embedFont(fontBytes, { subset: true });
  const set = new Set(font.getCharacterSet());
  return (text, size) => font.widthOfTextAtSize(fitCharset(text, c => set.has(c)), size);
}

/**
 * Compose the 24-page AstroComic: 5.5 × 8.5 in trim with 0.125 in bleed on every side (MediaBox = BleedBox),
 * TrimBox set on each page, one embedded font, and lettering set as live text inside the safe area.
 * Proof mode draws missing artwork as labelled placeholders and marks every page; print mode requires all artwork.
 */
export async function composeComicPdf({ issue, fontBytes, art, mode, now = new Date() }: ComicPdfInput) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fontBytes, { subset: true });
  const charset = new Set(font.getCharacterSet());
  const t = (s: string) => fitCharset(s, c => charset.has(c));
  const measure: Measure = (s, size) => font.widthOfTextAtSize(t(s), size);
  const images = new Map<string, PDFImage>();
  const imageFor = async (key: string) => {
    const a = art.get(key);
    if (!a) return null;
    if (!images.has(key)) images.set(key, a.bytes[0] === 0x89 ? await pdf.embedPng(a.bytes) : await pdf.embedJpg(a.bytes));
    return images.get(key)!;
  };

  pdf.setTitle(`${issue.title} — AstroComic No. ${issue.issueNumber}`);
  pdf.setAuthor('Zodaci');
  pdf.setSubject(`AstroComic · ${issue.monthLabel} · 5.5 × 8.5 in digest, 0.125 in bleed${mode === 'proof' ? ' · PROOF' : ''}`);
  pdf.setKeywords(['AstroComic', 'Zodaci', issue.monthLabel, `Issue ${issue.issueNumber}`]);
  pdf.setCreator('Zodaci AstroComic');
  pdf.setProducer('Zodaci');
  pdf.setCreationDate(now);
  pdf.setModificationDate(now);

  const Y = (y: number, h = 0) => MEDIA.h - y - h; // layout is top-down; PDF is bottom-up
  const text = (page: PDFPage, s: string, x: number, yTop: number, size: number, color: RGB = INK, opacity = 1) => page.drawText(t(s), { x, y: Y(yTop + size * 0.8), size, font, color, opacity });

  for (const p of issue.pages) {
    const page = pdf.addPage([MEDIA.w, MEDIA.h]);
    page.setMediaBox(0, 0, MEDIA.w, MEDIA.h);
    page.setBleedBox(0, 0, MEDIA.w, MEDIA.h);
    page.setTrimBox(BLEED, BLEED, TRIM.w, TRIM.h);
    const layout = layoutPage(p, measure);
    if (layout.full) {
      await drawFullPage(page, p, layout.panels[0], await imageFor(artKey(p.n, 0)));
    } else {
      page.drawRectangle({ x: 0, y: 0, width: MEDIA.w, height: MEDIA.h, color: PAPER });
      // Header: section, page number, rule and title inside the safe area.
      text(page, p.section.toUpperCase(), LIVE.x, LIVE.y, 6.5, GOLD);
      const num = String(p.n); text(page, num, LIVE.x + LIVE.w - measure(num, 7), LIVE.y, 7);
      page.drawLine({ start: { x: LIVE.x, y: Y(LIVE.y + 11) }, end: { x: LIVE.x + LIVE.w, y: Y(LIVE.y + 11) }, thickness: 0.5, color: GOLD });
      let ts = 14; while (ts > 9.5 && measure(p.title, ts) > LIVE.w) ts -= 0.5;
      text(page, p.title, LIVE.x, LIVE.y + 16, ts);
      for (const box of layout.panels) await drawPanel(page, p.panels[box.panel], box, box.qr ? null : await imageFor(artKey(p.n, box.panel)));
      if (layout.body) {
        const b = layout.body;
        page.drawLine({ start: { x: b.rect.x, y: Y(b.rect.y - 5) }, end: { x: b.rect.x + 48, y: Y(b.rect.y - 5) }, thickness: 0.75, color: GOLD });
        const colW = b.columns === 2 ? (b.rect.w - b.colGap) / 2 : b.rect.w;
        const split = b.columns === 2 ? Math.ceil(b.paragraphs.length / 2) : b.paragraphs.length;
        [b.paragraphs.slice(0, split), b.paragraphs.slice(split)].forEach((col, ci) => {
          let y = b.rect.y;
          for (const para of col) {
            for (const line of para) { if (y + b.leading <= b.rect.y + b.rect.h + 0.5) text(page, line, b.rect.x + ci * (colW + b.colGap), y, b.size); y += b.leading; }
            y += b.size * 0.45;
          }
        });
      }
    }
    if (mode === 'proof') {
      page.drawText('PROOF', { x: MEDIA.w * 0.18, y: MEDIA.h * 0.3, size: 96, font, color: GOLD, opacity: 0.07, rotate: degrees(52) });
      page.drawText(t(`PROOF — not for print · ${issue.title} · page ${p.n} of ${issue.pages.length}`), { x: BLEED + 4, y: MEDIA.h - BLEED + 2, size: 4.5, font, color: GOLD });
    }
  }

  async function drawFullPage(page: PDFPage, p: ComicPage, box: PanelBox, img: PDFImage | null) {
    const r = box.rect;
    if (img) drawClippedImage(page, img, r, false);
    else drawPending(page, r, p.panels[0]?.scene ?? '', true);
    if (p.section === 'Cover') {
      page.drawRectangle({ x: 0, y: Y(0, MEDIA.h * 0.34), width: MEDIA.w, height: MEDIA.h * 0.34, color: NAVY, opacity: 0.38 });
      text(page, 'ASTROCOMIC', LIVE.x, LIVE.y + 4, 9, GOLD);
      const lines = wrapText(p.title, LIVE.w, 24, measure).slice(0, 3);
      lines.forEach((l, i) => text(page, l, LIVE.x, LIVE.y + 20 + i * 28, 24, CREAM));
      text(page, `by Zodaci · ${issue.monthLabel}`, LIVE.x, LIVE.y + 24 + lines.length * 28, 10, CREAM);
      const cap = p.panels[0]?.caption;
      if (cap) {
        const w = measure(cap, 8) + 14;
        const x = LIVE.x + LIVE.w - w; const y = LIVE.y + LIVE.h - 20;
        page.drawRectangle({ x, y: Y(y, 20), width: w, height: 20, color: CREAM, borderColor: INK, borderWidth: 0.75 });
        text(page, cap, x + 7, y + 6, 8);
      }
    } else {
      const bandH = MEDIA.h * 0.22;
      page.drawRectangle({ x: 0, y: 0, width: MEDIA.w, height: bandH, color: NAVY, opacity: 0.72 });
      const top = MEDIA.h - bandH + 14;
      text(page, (p.body?.[0] ?? 'AstroComic by Zodaci'), LIVE.x, top, 15, CREAM);
      text(page, `${p.title}`, LIVE.x, top + 22, 9, CREAM);
      text(page, 'zodaci.com', LIVE.x, top + 36, 9, GOLD);
      const note = wrapText('A creative reflection on your chart and this month’s sky — not prediction or advice.', LIVE.w, 6.5, measure);
      note.forEach((l, i) => text(page, l, LIVE.x, top + 54 + i * 9, 6.5, CREAM));
    }
  }

  async function drawPanel(page: PDFPage, panel: ComicPanel, box: PanelBox, img: PDFImage | null) {
    const r = box.rect;
    const oval = box.shape === 'oval';
    if (box.qr) await drawQr(page, r);
    else if (img) drawClippedImage(page, img, r, oval);
    else drawPending(page, r, panel.scene, false, oval);
    // Borders: bleed rows run off both side edges, so only their top and bottom carry a line.
    if (oval) page.drawEllipse({ x: r.x + r.w / 2, y: Y(r.y + r.h / 2), xScale: r.w / 2, yScale: r.h / 2, borderColor: INK, borderWidth: 2 });
    else if (box.shape === 'bleed') {
      page.drawLine({ start: { x: 0, y: Y(r.y) }, end: { x: MEDIA.w, y: Y(r.y) }, thickness: 2, color: INK });
      page.drawLine({ start: { x: 0, y: Y(r.y + r.h) }, end: { x: MEDIA.w, y: Y(r.y + r.h) }, thickness: 2, color: INK });
    } else page.drawRectangle({ x: r.x, y: Y(r.y, r.h), width: r.w, height: r.h, borderColor: INK, borderWidth: 2 });
    letter(page, panel, r, oval);
  }

  /** Captions (serif-style boxes) and speech balloons, kept inside the panel and the page's safe area. */
  function letter(page: PDFPage, panel: ComicPanel, r: Rect, oval: boolean) {
    const inset = oval ? Math.min(r.w, r.h) * 0.16 : 6;
    const x0 = Math.max(r.x, LIVE.x) + inset; const x1 = Math.min(r.x + r.w, LIVE.x + LIVE.w) - inset;
    const maxW = (x1 - x0) * (oval ? 0.8 : 0.66);
    let y = r.y + inset;
    if (panel.caption) {
      const size = 7.5; const lines = wrapText(panel.caption, maxW - 10, size, measure);
      const w = Math.max(...lines.map(l => measure(l, size))) + 10; const h = lines.length * size * 1.3 + 7;
      const x = oval ? r.x + (r.w - w) / 2 : x0;
      page.drawRectangle({ x, y: Y(y, h), width: w, height: h, color: CREAM, borderColor: INK, borderWidth: 0.75 });
      lines.forEach((l, i) => text(page, l, x + 5, y + 4 + i * size * 1.3, size));
      y += h + 5;
    }
    (panel.balloons ?? []).forEach((b, i) => {
      const size = 7.5; const lines = wrapText(b.text, maxW - 14, size, measure);
      const w = Math.max(measure(b.who.toUpperCase(), 5.5), ...lines.map(l => measure(l, size))) + 14; const h = lines.length * size * 1.3 + 15;
      const right = i % 2 === 1;
      const x = right ? x1 - w : x0;
      const rad = 7;
      const tailX = right ? w - 18 : 18;
      // Rounded balloon with a short tail, drawn as one SVG path from its top-left corner.
      const path = `M ${rad} 0 H ${w - rad} Q ${w} 0 ${w} ${rad} V ${h - rad} Q ${w} ${h} ${w - rad} ${h} H ${tailX + 6} L ${tailX + (right ? 8 : -4)} ${h + 8} L ${tailX - 2} ${h} H ${rad} Q 0 ${h} 0 ${h - rad} V ${rad} Q 0 0 ${rad} 0 Z`;
      page.drawSvgPath(path, { x, y: Y(y), color: WHITE, borderColor: INK, borderWidth: 0.9 });
      text(page, b.who.toUpperCase(), x + 7, y + 4, 5.5, GOLD);
      lines.forEach((l, k) => text(page, l, x + 7, y + 11 + k * size * 1.3, size));
      y += h + 12;
    });
  }

  function drawClippedImage(page: PDFPage, img: PDFImage, r: Rect, oval: boolean) {
    const f = coverFit(img.width, img.height, r);
    page.pushOperators(pushGraphicsState());
    if (oval) {
      const cx = r.x + r.w / 2; const cy = Y(r.y + r.h / 2); const rx = r.w / 2; const ry = r.h / 2; const k = 0.5523;
      page.pushOperators(
        moveTo(cx + rx, cy),
        appendBezierCurve(cx + rx, cy + ry * k, cx + rx * k, cy + ry, cx, cy + ry),
        appendBezierCurve(cx - rx * k, cy + ry, cx - rx, cy + ry * k, cx - rx, cy),
        appendBezierCurve(cx - rx, cy - ry * k, cx - rx * k, cy - ry, cx, cy - ry),
        appendBezierCurve(cx + rx * k, cy - ry, cx + rx, cy - ry * k, cx + rx, cy),
        closePath(), clip(), endPath(),
      );
    } else page.pushOperators(rectangle(r.x, Y(r.y, r.h), r.w, r.h), clip(), endPath());
    page.drawImage(img, { x: f.x, y: Y(f.y, f.h), width: f.w, height: f.h });
    page.pushOperators(popGraphicsState());
  }

  function drawPending(page: PDFPage, r: Rect, scene: string, full: boolean, oval = false) {
    if (mode === 'print') throw new Error('Every panel needs artwork before the print file can be built.');
    if (oval) page.drawEllipse({ x: r.x + r.w / 2, y: Y(r.y + r.h / 2), xScale: r.w / 2, yScale: r.h / 2, color: PENDING });
    else page.drawRectangle({ x: r.x, y: Y(r.y, r.h), width: r.w, height: r.h, color: full ? NAVY : PENDING });
    const inner = { x: Math.max(r.x, LIVE.x) + (oval ? r.w * 0.18 : 10), w: Math.min(r.w, LIVE.w) - (oval ? r.w * 0.36 : 20) };
    const y0 = full ? MEDIA.h * 0.45 : r.y + r.h * (oval ? 0.3 : 0.38);
    text(page, 'ARTWORK PENDING', inner.x, y0, 6.5, GOLD);
    wrapText(scene, inner.w, 6.5, measure).slice(0, full ? 8 : 4).forEach((l, i) => text(page, l, inner.x, y0 + 10 + i * 8.5, 6.5, full ? CREAM : INK, 0.85));
  }

  async function drawQr(page: PDFPage, r: Rect) {
    page.drawRectangle({ x: r.x, y: Y(r.y, r.h), width: r.w, height: r.h, color: WHITE });
    const qr = QRCode.create(QR_URL, { errorCorrectionLevel: 'M' });
    const n = qr.modules.size; const quiet = 4;
    const side = Math.min(r.h - 16, r.w * 0.45, 150);
    const m = side / (n + quiet * 2);
    const ox = r.x + 12; const oy = r.y + (r.h - side) / 2;
    for (let row = 0; row < n; row++) for (let col = 0; col < n; col++) {
      if (qr.modules.get(row, col)) page.drawRectangle({ x: ox + (col + quiet) * m, y: Y(oy + (row + quiet) * m, m), width: m + 0.05, height: m + 0.05, color: INK });
    }
    const tx = ox + side + 14; const tw = r.x + r.w - tx - 10;
    text(page, 'Scan to open your chart', tx, oy + side / 2 - 16, 10);
    wrapText('zodaci.com/my-chart', tw, 8, measure).forEach((l, i) => text(page, l, tx, oy + side / 2 + i * 10, 8, GOLD));
  }

  const bytes = await pdf.save();
  return { bytes, pages: pdf.getPageCount() };
}
