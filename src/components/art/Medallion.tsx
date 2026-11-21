import { useId } from 'react';
import { SIGN_GLYPH, SIGNS } from '@/lib/astro';

const PLANET_GLYPH: Record<string, string> = { Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇', 'North Node': '☊', 'South Node': '☋', Chiron: '⚷', Ascendant: 'AC', Midheaven: 'MC' };
export const medallionGlyph = (label: string) => PLANET_GLYPH[label] ?? SIGN_GLYPH[SIGNS.indexOf(label as typeof SIGNS[number])] ?? (/^\d+$/.test(label) ? label : label.slice(0, 2));

/** One risograph-style marker for planets, signs and houses: stippled cream disc, brass rings, oxblood orbit. Decorative unless titled. */
export function Medallion({ label, size = 48, title }: { label: string; size?: number; title?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title} className="medallion shrink-0">
      <defs><pattern id={`st${id}`} width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.45" fill="hsl(var(--brass) / 0.45)" /></pattern></defs>
      <circle cx="24" cy="24" r="21" fill="hsl(var(--parchment, var(--card)))" stroke="hsl(var(--brass))" strokeWidth="1.6" />
      <circle cx="24" cy="24" r="21" fill={`url(#st${id})`} />
      <circle cx="24" cy="24" r="17" fill="none" stroke="hsl(var(--brass) / 0.8)" strokeWidth="0.6" />
      <ellipse cx="24" cy="24" rx="23" ry="8" fill="none" stroke="hsl(var(--oxblood))" strokeWidth="0.9" transform="rotate(-24 24 24)" opacity="0.85" />
      <circle cx="44" cy="15" r="1.8" fill="hsl(var(--oxblood))" />
      <text x="24" y="25" textAnchor="middle" dominantBaseline="middle" fontSize={label.length > 2 && !PLANET_GLYPH[label] ? 11 : 17} fill="hsl(var(--ink, var(--foreground)))" fontFamily="serif">{medallionGlyph(label)}</text>
    </svg>
  );
}
