import coverMidnightStars from '@/assets/cover-design-midnight-stars.jpg';
import coverMidnightEmber from '@/assets/cover-design-midnight-ember.jpg';

/**
 * Free AstroBook cover designs. Artwork covers use an image; solid and gradient covers are painted from print
 * colours with a fine paper grain, a scatter of faint stars and a thin gold inset line, so they read as finished
 * book cloth rather than flat swatches. Painting is seeded, so the same design always paints identically.
 */
export type CoverDesign = { key: string; label: string; kind: 'art' | 'solid' | 'gradient'; detail: string; src?: string; colors?: string[]; accent?: string };

export const COVER_DESIGNS: CoverDesign[] = [
  { key: 'midnight-stars', label: 'Midnight Stars', kind: 'art', detail: 'Black night sky with fine gold stars and a faint violet glow.', src: coverMidnightStars },
  { key: 'midnight-ember', label: 'Midnight Ember', kind: 'art', detail: 'The Midnight Stars design in wine-plum with rose-gold stars.', src: coverMidnightEmber },
  { key: 'solid-midnight', label: 'Solid Midnight', kind: 'solid', detail: 'Deep-midnight cloth with a fine grain, faint stars and a gold inset line.', colors: ['#0D1028'], accent: '#D4A853' },
  { key: 'gradient-violet-dusk', label: 'Violet Dusk', kind: 'gradient', detail: 'Midnight fading into violet, with grain and a scatter of stars.', colors: ['#07080F', '#2A1458', '#8B5CF6'], accent: '#E9D9A6' },
  { key: 'gradient-gold-dawn', label: 'Gold Dawn', kind: 'gradient', detail: 'Midnight rising into soft gold, with grain and a scatter of stars.', colors: ['#07080F', '#3A2A12', '#D4A853'], accent: '#F4E3B5' },
];

/** Designs no longer offered. Old orders keep their saved cover file; these keys simply can't be chosen again. */
export const RETIRED_COVER_KEYS = ['blue-cosmos', 'gold-aurora', 'solid-ivory', 'solid-violet', 'gradient-deep-sea'];

export const coverByKey = (key: string) => COVER_DESIGNS.find(d => d.key === key);

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

/** Paint a solid or gradient design at any size: base colour, soft vignette, paper grain, faint stars, gold inset line. */
export function paintCover(ctx: CanvasRenderingContext2D, d: CoverDesign, w: number, h: number) {
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
