import coverMidnightStars from '@/assets/cover-design-midnight-stars.jpg';
import coverMidnightEmber from '@/assets/cover-design-midnight-ember.jpg';

/** Free AstroBook cover designs. Artwork covers use an image; solid and gradient covers are painted from print colors. */
export type CoverDesign = { key: string; label: string; kind: 'art' | 'solid' | 'gradient'; detail: string; src?: string; colors?: string[] };

export const COVER_DESIGNS: CoverDesign[] = [
  { key: 'midnight-stars', label: 'Midnight Stars', kind: 'art', detail: 'Black night sky with fine gold stars and a faint violet glow.', src: coverMidnightStars },
  { key: 'midnight-ember', label: 'Midnight Ember', kind: 'art', detail: 'The Midnight Stars design in wine-plum with rose-gold stars.', src: coverMidnightEmber },
  { key: 'solid-midnight', label: 'Solid Midnight', kind: 'solid', detail: 'A plain deep-midnight cover.', colors: ['#0D1028'] },
  { key: 'solid-violet', label: 'Solid Violet', kind: 'solid', detail: 'A plain rich violet cover.', colors: ['#3B1E7A'] },
  { key: 'solid-ivory', label: 'Solid Ivory', kind: 'solid', detail: 'A plain warm ivory cover.', colors: ['#E8E0D0'] },
  { key: 'gradient-violet-dusk', label: 'Violet Dusk', kind: 'gradient', detail: 'Midnight fading into violet.', colors: ['#07080F', '#2A1458', '#8B5CF6'] },
  { key: 'gradient-gold-dawn', label: 'Gold Dawn', kind: 'gradient', detail: 'Midnight rising into soft gold.', colors: ['#07080F', '#3A2A12', '#D4A853'] },
  { key: 'gradient-deep-sea', label: 'Deep Sea', kind: 'gradient', detail: 'Midnight blue deepening toward teal.', colors: ['#07080F', '#0F2A4A', '#3B82F6'] },
];

export const RETIRED_COVER_KEYS = ['blue-cosmos', 'gold-aurora'];

/** CSS background for a painted cover (used for swatches). */
export function coverBackground(d: CoverDesign) {
  if (d.kind === 'solid') return d.colors![0];
  return `linear-gradient(180deg, ${d.colors!.join(', ')})`;
}

const painted = new Map<string, string>();
/** Image URL for any design. Solid and gradient covers are painted once into a 768×1152 JPEG in the browser. */
export function coverSrc(d: CoverDesign): string {
  if (d.src) return d.src;
  const hit = painted.get(d.key); if (hit) return hit;
  if (typeof document === 'undefined') return '';
  const c = document.createElement('canvas'); c.width = 768; c.height = 1152;
  const ctx = c.getContext('2d'); if (!ctx) return '';
  if (d.kind === 'solid') ctx.fillStyle = d.colors![0];
  else { const g = ctx.createLinearGradient(0, 0, 0, 1152); d.colors!.forEach((col, i) => g.addColorStop(i / (d.colors!.length - 1), col)); ctx.fillStyle = g; }
  ctx.fillRect(0, 0, 768, 1152);
  const url = c.toDataURL('image/jpeg', 0.92); painted.set(d.key, url); return url;
}
