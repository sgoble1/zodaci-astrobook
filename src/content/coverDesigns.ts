import coverMidnightStars from '@/assets/cover-design-midnight-stars-hd.jpg';
import coverMidnightEmber from '@/assets/cover-design-midnight-ember-hd.jpg';
import coverMidnightStarsSquare from '@/assets/cover-design-midnight-stars-square.jpg';
import coverMidnightEmberSquare from '@/assets/cover-design-midnight-ember-square.jpg';
import coverMidnightStarsLetter from '@/assets/cover-design-midnight-stars-letter.jpg';
import coverMidnightEmberLetter from '@/assets/cover-design-midnight-ember-letter.jpg';
import coverCartographer from '@/assets/cover-design-celestial-cartographer-hd.jpg';
import coverCartographerLetter from '@/assets/cover-design-celestial-cartographer-letter.jpg';
import coverCartographerSquare from '@/assets/cover-design-celestial-cartographer-square.jpg';
import coverDeepOrbit from '@/assets/cover-design-deep-orbit-hd.jpg';
import coverDeepOrbitLetter from '@/assets/cover-design-deep-orbit-letter.jpg';
import coverDeepOrbitSquare from '@/assets/cover-design-deep-orbit-square.jpg';

/**
 * Free AstroBook cover designs. Artwork covers use an image; solid and gradient covers are painted from print
 * colours with a fine paper grain, a scatter of faint stars and a thin gold inset line, so they read as finished
 * book cloth rather than flat swatches. Painting is seeded, so the same design always paints identically.
 */
/**
 * Artwork comes in reframes for each trim shape — 2:3 (Pocket, Classic, PDF), US Letter (Collector's Linen) and square
 * (Signature) — so the cover fills the trim from the full-resolution file instead of an enlarged crop.
 */
export type ArtVariant = { src: string; size: [number, number] };
/** `monogram` painted covers stamp the reader's initials in a gold seal at the centre of the cover. */
export type CoverDesign = { key: string; label: string; kind: 'art' | 'solid' | 'gradient'; detail: string; src?: string; variants?: ArtVariant[]; colors?: string[]; accent?: string; monogram?: boolean };

export const COVER_DESIGNS: CoverDesign[] = [
  { key: 'midnight-stars', label: 'Midnight Stars', kind: 'art', detail: 'Black night sky with fine gold stars and a faint violet glow.', src: coverMidnightStars, variants: [{ src: coverMidnightStars, size: [1280, 1920] }, { src: coverMidnightStarsLetter, size: [1488, 1920] }, { src: coverMidnightStarsSquare, size: [1920, 1920] }] },
  { key: 'celestial-cartographer', label: 'Celestial Cartographer', kind: 'art', detail: 'A brass star atlas with engraved constellation lines on deep indigo.', src: coverCartographer, variants: [{ src: coverCartographer, size: [1280, 1920] }, { src: coverCartographerLetter, size: [1488, 1920] }, { src: coverCartographerSquare, size: [1920, 1920] }] },
  { key: 'deep-orbit', label: 'Deep Orbit', kind: 'art', detail: 'A ringed planet and sweeping gold orbits in deep space.', src: coverDeepOrbit, variants: [{ src: coverDeepOrbit, size: [1280, 1920] }, { src: coverDeepOrbitLetter, size: [1488, 1920] }, { src: coverDeepOrbitSquare, size: [1920, 1920] }] },
  { key: 'vintage-monogram', label: 'Vintage Monogram', kind: 'solid', detail: 'Oxblood book cloth with your initials in a gold seal.', colors: ['#3B1420'], accent: '#D4A853', monogram: true },
  { key: 'midnight-ember', label: 'Midnight Ember', kind: 'art', detail: 'The Midnight Stars design in wine-plum with rose-gold stars.', src: coverMidnightEmber, variants: [{ src: coverMidnightEmber, size: [1280, 1920] }, { src: coverMidnightEmberLetter, size: [1488, 1920] }, { src: coverMidnightEmberSquare, size: [1920, 1920] }] },
  { key: 'solid-midnight', label: 'Solid Midnight', kind: 'solid', detail: 'Deep-midnight cloth with a fine grain, faint stars and a gold inset line.', colors: ['#0D1028'], accent: '#D4A853' },
  { key: 'gradient-violet-dusk', label: 'Indigo Dusk', kind: 'gradient', detail: 'Deep indigo fading into evening blue, with grain and a scatter of yellow stars.', colors: ['#12123A', '#1E1E5A', '#3A3A8C'], accent: '#FFC61A' },
  { key: 'gradient-gold-dawn', label: 'Gold Dawn', kind: 'gradient', detail: 'Midnight rising into soft gold, with grain and a scatter of stars.', colors: ['#07080F', '#3A2A12', '#D4A853'], accent: '#F4E3B5' },
];

/** Designs no longer offered. Old orders keep their saved cover file; these keys simply can't be chosen again. */
export const RETIRED_COVER_KEYS = ['blue-cosmos', 'gold-aurora', 'solid-ivory', 'solid-violet', 'gradient-deep-sea'];

export const coverByKey = (key: string) => COVER_DESIGNS.find(d => d.key === key);

/** The artwork file whose shape is closest to the trim (with bleed), so the least of the picture is cropped away. */
export function designVariant(d: CoverDesign, trimPt: [number, number]): ArtVariant | undefined {
  if (!d.variants?.length) return undefined;
  const bleed = 0.125 * 72 * 2, ratio = (trimPt[0] + bleed) / (trimPt[1] + bleed);
  const off = (v: ArtVariant) => Math.abs(Math.log(v.size[0] / v.size[1] / ratio));
  return d.variants.reduce((best, v) => off(v) < off(best) ? v : best);
}
export const designSrc = (d: CoverDesign, trimPt?: [number, number]) => (trimPt && designVariant(d, trimPt)?.src) || d.src;

/** CSS background for a painted cover (used for small swatches). */
export function coverBackground(d: CoverDesign) {
  if (d.kind === 'solid') return d.colors![0];
  return `linear-gradient(180deg, ${d.colors!.join(', ')})`;
}

/** Small deterministic PRNG so texture is identical on every render and in print. */
function seeded(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; };
}

/** Up to three initials from the name on the cover ("Mary Ann Lee" → "MAL"); a star when no name is typed yet. */
export function monogramFor(name: string): string {
  const letters = name.trim().split(/[\s-]+/).map(p => Array.from(p.replace(/[^\p{L}]/gu, ''))[0] ?? '').filter(Boolean).slice(0, 3);
  return letters.length ? letters.join('').toLocaleUpperCase() : '✦';
}

/** The monogram seal: double gold ring, a ring of small ticks, and the initials, centred low enough to clear the title. */
function paintMonogram(ctx: CanvasRenderingContext2D, accent: string, w: number, h: number, initials: string) {
  const cx = w / 2, cy = h * 0.58, r = Math.min(w, h) * 0.24, line = Math.max(1, w / 360);
  ctx.save(); ctx.strokeStyle = accent; ctx.fillStyle = accent; ctx.lineWidth = line * 1.6;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = line * 0.8; ctx.beginPath(); ctx.arc(cx, cy, r * 0.9, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2, r1 = r * 1.06, r2 = r * (i % 4 ? 1.1 : 1.16); ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); ctx.stroke(); }
  const size = r * (initials.length >= 3 ? 0.62 : initials.length === 2 ? 0.8 : 1.05);
  ctx.font = `${size}px "Alfa Slab One", Georgia, serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(initials, cx, cy + size * 0.04);
  ctx.restore();
}

/** Paint a solid or gradient design at any size: base colour, soft vignette, paper grain, faint stars, gold inset line (and the monogram seal on monogram designs). */
export function paintCover(ctx: CanvasRenderingContext2D, d: CoverDesign, w: number, h: number, initials = '✦') {
  if (d.kind === 'solid') ctx.fillStyle = d.colors![0];
  else { const g = ctx.createLinearGradient(0, 0, 0, h); d.colors!.forEach((col, i) => g.addColorStop(i / (d.colors!.length - 1), col)); ctx.fillStyle = g; }
  ctx.fillRect(0, 0, w, h);
  // Vignette: edges a touch darker, like light falling on cloth.
  const v = ctx.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.38)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
  // Paper grain: tiny light and dark flecks proportional to the area.
  const rand = seeded(d.key);
  const flecks = Math.round((w * h) / 90);
  const unit = Math.max(1, w / 900);
  for (let i = 0; i < flecks; i++) {
    const light = rand() > 0.5;
    ctx.fillStyle = light ? `rgba(255,255,255,${0.025 + rand() * 0.04})` : `rgba(0,0,0,${0.05 + rand() * 0.06})`;
    ctx.fillRect(rand() * w, rand() * h, unit, unit);
  }
  // Faint stars, denser toward the top of the cover.
  const stars = Math.round(w / 6);
  for (let i = 0; i < stars; i++) {
    const y = Math.pow(rand(), 1.6) * h; const x = rand() * w; const r = (0.4 + rand() * 1.3) * unit;
    ctx.fillStyle = `rgba(244,236,221,${0.12 + rand() * 0.4})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  // Thin gold inset line inside the trim, well clear of the cut.
  const inset = w * 0.055;
  ctx.strokeStyle = d.accent ?? '#D4A853'; ctx.globalAlpha = 0.55; ctx.lineWidth = Math.max(1, w / 520);
  ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);
  ctx.globalAlpha = 1;
  if (d.monogram) paintMonogram(ctx, d.accent ?? '#D4A853', w, h, initials);
}

const painted = new Map<string, string>();
/** Image URL for any design (swatches and thumbnails). Painted designs are drawn once into a 512×768 JPEG. */
export function coverSrc(d: CoverDesign): string {
  if (d.src) return d.src;
  const hit = painted.get(d.key); if (hit) return hit;
  if (typeof document === 'undefined') return '';
  const c = document.createElement('canvas'); c.width = 512; c.height = 768;
  const ctx = c.getContext('2d'); if (!ctx) return '';
  paintCover(ctx, d, c.width, c.height);
  const url = c.toDataURL('image/jpeg', 0.9); painted.set(d.key, url); return url;
}
