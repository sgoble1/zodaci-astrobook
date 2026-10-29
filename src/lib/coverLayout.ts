/**
 * AstroBook front-cover typography, shared by every place a cover is shown: the cover editor, the 3D book, the
 * manuscript PDF and the print file (which reuses the manuscript's first page). The reader's name is the title,
 * a small line beneath reads COVER_SUBTITLE, and the AstroBook wordmark sits bottom-right — all inside the safe zone.
 */
export const COVER_SUBTITLE = 'Your exact placement in print';
export const COVER_WORDMARK = 'AstroBook';
/** Text stays this far inside the trim (inches), matching the back-cover safe zone of the print file. */
export const COVER_SAFE_IN = 0.5;
/** Artwork extends this far past the trim on the print file (inches). */
export const COVER_BLEED_IN = 0.125;
export const PRINT_PPI = 300;

export type Measure = (text: string, size: number) => number;
export type CoverTextBox = { lines: string[]; size: number; x: number; y: number[]; align: 'center' | 'right' };
export type CoverType = { safe: number; title: CoverTextBox; rule: { x: number; y: number; width: number }; subtitle: CoverTextBox; wordmark: CoverTextBox };

/** The title shown when no name is entered yet. */
export const coverName = (name?: string | null) => (name ?? '').replace(/\s+/g, ' ').trim().slice(0, 40) || 'Your Name';

/** Split a name into at most two balanced lines (only at spaces). */
export function titleLines(name: string): string[][] {
  const words = name.split(' ');
  const options: string[][] = [[name]];
  for (let i = 1; i < words.length; i++) options.push([words.slice(0, i).join(' '), words.slice(i).join(' ')]);
  return options;
}

/**
 * Lay out the cover type for a W×H pixel cover at `ppi` pixels per inch. Positions are top-down baselines in pixels.
 * `serif` measures the display face; `sans` measures the subtitle face (with letter spacing included by the caller).
 */
export function coverType(w: number, h: number, ppi: number, name: string, serif: Measure, sans: Measure): CoverType {
  const safe = COVER_SAFE_IN * ppi;
  const inner = (w - safe * 2) * 0.92; // a little breathing room inside the safe zone
  const title = coverName(name);
  // Largest size where the best one- or two-line split fits the safe width, capped so short names stay elegant.
  let best = { lines: [title], size: 0 };
  for (const lines of titleLines(title)) {
    const widest = Math.max(...lines.map(l => serif(l, 100)));
    const size = Math.min((inner / widest) * 100, w * (lines.length === 1 ? 0.13 : 0.11));
    // Prefer one line unless two lines let the name be clearly larger.
    if (size > best.size * (lines.length === 1 ? 1 : 1.18)) best = { lines, size };
  }
  const tSize = Math.max(w * 0.045, best.size);
  const top = safe + h * 0.045;
  const ys = best.lines.map((_, i) => top + tSize * 0.92 + i * tSize * 1.08);
  const ruleY = ys[ys.length - 1] + tSize * 0.42;
  const sSize = Math.max(w * 0.022, Math.min(w * 0.032, (inner / Math.max(1, sans(COVER_SUBTITLE.toUpperCase(), 100))) * 100));
  const wSize = w * 0.058;
  return {
    safe,
    title: { lines: best.lines, size: tSize, x: w / 2, y: ys, align: 'center' },
    rule: { x: w / 2 - w * 0.09, y: ruleY, width: w * 0.18 },
    subtitle: { lines: [COVER_SUBTITLE.toUpperCase()], size: sSize, x: w / 2, y: [ruleY + sSize * 2.1], align: 'center' },
    wordmark: { lines: [COVER_WORDMARK], size: wSize, x: w - safe, y: [h - safe], align: 'right' },
  };
}

/** Pan and zoom of the artwork inside the trim. x/y run from -1 to 1 across the movable range; zoom 1 fills the trim. */
export type CoverCrop = { zoom: number; x: number; y: number };
export const DEFAULT_CROP: CoverCrop = { zoom: 1, x: 0, y: 0 };
export const clampCrop = (c: CoverCrop): CoverCrop => ({ zoom: Math.min(4, Math.max(1, c.zoom)), x: Math.min(1, Math.max(-1, c.x)), y: Math.min(1, Math.max(-1, c.y)) });

/** Where to draw an iw×ih image so it covers the W×H trim with the given crop. */
export function placeArt(iw: number, ih: number, w: number, h: number, crop: CoverCrop) {
  const c = clampCrop(crop);
  const s = Math.max(w / iw, h / ih) * c.zoom;
  const dw = iw * s, dh = ih * s;
  const panX = (dw - w) / 2, panY = (dh - h) / 2;
  return { x: (w - dw) / 2 + c.x * panX, y: (h - dh) / 2 + c.y * panY, width: dw, height: dh };
}

/** Effective print resolution of an image placed with this crop on a cover `trimInW` inches wide. */
export function artPpi(iw: number, ih: number, trimInW: number, trimInH: number, zoom: number) {
  const s = Math.max(trimInW / iw, trimInH / ih) * Math.max(1, zoom);
  return Math.round(1 / s);
}
