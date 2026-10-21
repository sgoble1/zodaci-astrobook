import { useId } from 'react';

/** Luminous 3D-style planet spheres drawn in SVG: radial lighting, surface bands, rings and a soft glow. */
type Look = { base: string; light: string; dark: string; glow: string; bands?: string; ring?: boolean };
const LOOKS: Record<string, Look> = {
  sun: { base: '#FFB534', light: '#FFF4C2', dark: '#E2531A', glow: '#FFC24B' },
  moon: { base: '#C9CBDA', light: '#FFFFFF', dark: '#5C6077', glow: '#DADDF5' },
  mercury: { base: '#A99A8C', light: '#F2E6D8', dark: '#4E4239', glow: '#D9C6B0' },
  venus: { base: '#F2B8C6', light: '#FFF0E0', dark: '#B5527A', glow: '#FFC7D6', bands: '#FFE1C2' },
  mars: { base: '#E0532F', light: '#FFB08A', dark: '#7A1C10', glow: '#FF6B3D' },
  jupiter: { base: '#D9A066', light: '#FBE7C6', dark: '#7A4A26', glow: '#F2B880', bands: '#B9703F' },
  saturn: { base: '#E8C98A', light: '#FFF4D6', dark: '#8C6A34', glow: '#F5D99A', bands: '#C9A35E', ring: true },
  uranus: { base: '#6FD6D9', light: '#DFFFFF', dark: '#1F6C7A', glow: '#7DF0F2', ring: true },
  neptune: { base: '#3B6CF0', light: '#A9C4FF', dark: '#13226E', glow: '#4F86FF', bands: '#5C8BFF' },
  pluto: { base: '#9A7B9E', light: '#EAD9EC', dark: '#3A2340', glow: '#B88CC4' },
  chiron: { base: '#8B5CF6', light: '#E2D4FF', dark: '#36206E', glow: '#A57BFF' },
  northNode: { base: '#D4A853', light: '#FFF0C8', dark: '#6E5420', glow: '#E8C46E' },
  southNode: { base: '#7C6A9E', light: '#DCD2F0', dark: '#2E2445', glow: '#9C88C4' },
};
const ALIAS: Record<string, string> = { northnode: 'northNode', southnode: 'southNode', node: 'northNode' };
export const planetLook = (key: string): Look => LOOKS[ALIAS[key] ?? key] ?? { base: '#8B5CF6', light: '#E8E0F0', dark: '#2A1C55', glow: '#A57BFF' };

export function PlanetOrb({ planet, size = 64, label, className = '' }: { planet: string; size?: number; label?: string; className?: string }) {
  const k = ALIAS[planet] ?? planet; const l = planetLook(k);
  const id = `po${useId().replace(/:/g, '')}`;
  const ring = l.ring;
  return (
    <svg width={size} height={size} viewBox="-60 -60 120 120" className={`shrink-0 overflow-visible ${className}`} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <radialGradient id={`${id}g`}><stop offset="0.45" stopColor={l.glow} stopOpacity="0.55" /><stop offset="1" stopColor={l.glow} stopOpacity="0" /></radialGradient>
        <radialGradient id={`${id}b`} cx="0.35" cy="0.32" r="0.75"><stop offset="0" stopColor={l.light} /><stop offset="0.45" stopColor={l.base} /><stop offset="1" stopColor={l.dark} /></radialGradient>
        <radialGradient id={`${id}s`} cx="0.3" cy="0.28" r="0.3"><stop offset="0" stopColor="#FFFFFF" stopOpacity="0.7" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" /></radialGradient>
        <linearGradient id={`${id}r`} x1="0" x2="1"><stop offset="0" stopColor={l.light} stopOpacity="0.15" /><stop offset="0.5" stopColor={l.light} stopOpacity="0.85" /><stop offset="1" stopColor={l.light} stopOpacity="0.15" /></linearGradient>
        <clipPath id={`${id}c`}><circle r="34" /></clipPath>
        <clipPath id={`${id}f`}><rect x="-60" y="0" width="120" height="60" /></clipPath>
      </defs>
      <circle r={k === 'sun' ? 58 : 50} fill={`url(#${id}g)`} />
      {ring && <ellipse rx="54" ry="12" fill="none" stroke={`url(#${id}r)`} strokeWidth="5" transform="rotate(-18)" opacity="0.6" />}
      <circle r="34" fill={`url(#${id}b)`} />
      {l.bands && <g clipPath={`url(#${id}c)`} opacity="0.35">{[-18, -6, 6, 17].map((y, i) => <ellipse key={i} cx="0" cy={y} rx="40" ry={i % 2 ? 3 : 4.5} fill={l.bands} />)}</g>}
      {k === 'moon' && <g fill={l.dark} opacity="0.3"><circle cx="-10" cy="-6" r="6" /><circle cx="12" cy="8" r="4" /><circle cx="2" cy="18" r="3" /></g>}
      {k === 'mars' && <g fill={l.dark} opacity="0.3"><ellipse cx="-8" cy="4" rx="10" ry="5" /><ellipse cx="12" cy="-10" rx="6" ry="3" /></g>}
      <circle r="34" fill={`url(#${id}s)`} />
      {ring && <g transform="rotate(-18)"><ellipse rx="54" ry="12" fill="none" stroke={`url(#${id}r)`} strokeWidth="5" clipPath={`url(#${id}f)`} /></g>}
    </svg>
  );
}
