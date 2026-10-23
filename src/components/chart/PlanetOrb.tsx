import { useId } from 'react';

/**
 * Luminous 3D-style planet spheres drawn in SVG: radial lighting, surface bands, rings and a soft glow.
 * These are stylized illustrations, not measured sky imagery. Bodies are spheres; mathematical chart points
 * (lunar nodes, Lilith, Part of Fortune, Vertex, angles) are drawn as marked points so they never read as planets.
 * Illustration pigments are intentionally separate from the interface colour tokens.
 */
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
  lilith: { base: '#3A2F4F', light: '#B7A6D6', dark: '#0E0A18', glow: '#7F6AA8' },
  fortune: { base: '#E8C46E', light: '#FFF6D8', dark: '#7A5A1E', glow: '#F2D58A' },
  vertex: { base: '#6FA8F5', light: '#DCEBFF', dark: '#1D3E73', glow: '#86B6FF' },
  asc: { base: '#E8E0F0', light: '#FFFFFF', dark: '#6E6488', glow: '#D9CFF0' },
  mc: { base: '#E8E0F0', light: '#FFFFFF', dark: '#6E6488', glow: '#D9CFF0' },
};
const FALLBACK: Look = { base: '#A89EC0', light: '#F4F0FA', dark: '#3A3354', glow: '#C8BEE0' };

/** Accepts keys, names and common spellings ("North Node", "true_node", "Rahu", "Ascendant") in any case. */
const ALIAS: Record<string, string> = {
  northnode: 'northNode', truenode: 'northNode', meannode: 'northNode', node: 'northNode', rahu: 'northNode',
  southnode: 'southNode', ketu: 'southNode',
  lilith: 'lilith', blackmoon: 'lilith', blackmoonlilith: 'lilith', meanlilith: 'lilith',
  fortune: 'fortune', partoffortune: 'fortune', vertex: 'vertex',
  asc: 'asc', ascendant: 'asc', rising: 'asc', mc: 'mc', midheaven: 'mc',
};
export function planetKey(raw: string): string {
  const flat = String(raw ?? '').toLowerCase().replace(/[^a-z]/g, '');
  return ALIAS[flat] ?? (flat in LOOKS ? flat : flat);
}
const POINTS = new Set(['northNode', 'southNode', 'lilith', 'fortune', 'vertex', 'asc', 'mc']);
export const isChartPoint = (raw: string) => POINTS.has(planetKey(raw));
export const planetLook = (raw: string): Look => LOOKS[planetKey(raw)] ?? FALLBACK;

export function PlanetOrb({ planet, size = 64, label, className = '' }: { planet: string; size?: number; label?: string; className?: string }) {
  const k = planetKey(planet); const l = LOOKS[k] ?? FALLBACK; const known = k in LOOKS;
  const id = `po${useId().replace(/:/g, '')}`;
  const a11y = { role: label ? 'img' : undefined, 'aria-label': label, 'aria-hidden': label ? undefined : true } as const;
  const svg = (children: React.ReactNode) => (
    <svg width={size} height={size} viewBox="-60 -60 120 120" className={`shrink-0 overflow-hidden ${className}`} {...a11y}>{children}</svg>
  );
  const glow = <radialGradient id={`${id}g`}><stop offset="0.45" stopColor={l.glow} stopOpacity="0.55" /><stop offset="1" stopColor={l.glow} stopOpacity="0" /></radialGradient>;

  // Unknown bodies: a neutral starlight point, never a guessed planet.
  if (!known) return svg(<>
    <defs>{glow}</defs>
    <circle r="46" fill={`url(#${id}g)`} />
    <path d="M0 -30 L6 -6 L30 0 L6 6 L0 30 L-6 6 L-30 0 L-6 -6 Z" fill={l.light} opacity="0.9" />
    <circle r="5" fill="#FFFFFF" />
  </>);

  // Chart points: where orbits cross or a calculated sensitive degree — drawn as a marked point on crossing paths.
  if (POINTS.has(k)) {
    const south = k === 'southNode';
    return svg(<>
      <defs>{glow}<radialGradient id={`${id}p`} cx="0.4" cy="0.35" r="0.7"><stop offset="0" stopColor={l.light} /><stop offset="1" stopColor={l.base} /></radialGradient></defs>
      <circle r="48" fill={`url(#${id}g)`} />
      <ellipse rx="42" ry="14" fill="none" stroke={l.light} strokeOpacity="0.55" strokeWidth="2.5" strokeDasharray={south ? '5 5' : undefined} transform="rotate(-20)" />
      <ellipse rx="42" ry="14" fill="none" stroke={l.light} strokeOpacity="0.35" strokeWidth="2" strokeDasharray={south ? '5 5' : undefined} transform="rotate(20)" />
      {k === 'lilith'
        ? <><circle r="17" fill={l.dark} stroke={l.light} strokeOpacity="0.7" strokeWidth="2" /><circle cx="7" cy="-3" r="13" fill={l.base} /></>
        : <circle r={k === 'asc' || k === 'mc' ? 9 : 12} fill={`url(#${id}p)`} stroke={l.light} strokeWidth="2" />}
      {(k === 'northNode' || k === 'southNode') && <path d={south ? 'M-9 6 a9 9 0 0 0 18 0' : 'M-9 -6 a9 9 0 0 1 18 0'} fill="none" stroke={l.dark} strokeWidth="2.5" strokeLinecap="round" />}
    </>);
  }

  const ring = l.ring; const small = k === 'chiron';
  const r = small ? 26 : 34;
  return svg(<>
    <defs>
      {glow}
      <radialGradient id={`${id}b`} cx="0.35" cy="0.32" r="0.75"><stop offset="0" stopColor={l.light} /><stop offset="0.45" stopColor={l.base} /><stop offset="1" stopColor={l.dark} /></radialGradient>
      <radialGradient id={`${id}s`} cx="0.3" cy="0.28" r="0.3"><stop offset="0" stopColor="#FFFFFF" stopOpacity="0.7" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" /></radialGradient>
      <linearGradient id={`${id}r`} x1="0" x2="1"><stop offset="0" stopColor={l.light} stopOpacity="0.15" /><stop offset="0.5" stopColor={l.light} stopOpacity="0.85" /><stop offset="1" stopColor={l.light} stopOpacity="0.15" /></linearGradient>
      <linearGradient id={`${id}t`} x1="1" x2="0"><stop offset="0" stopColor={l.glow} stopOpacity="0.6" /><stop offset="1" stopColor={l.glow} stopOpacity="0" /></linearGradient>
      <clipPath id={`${id}c`}><circle r={r} /></clipPath>
      <clipPath id={`${id}f`}><rect x="-60" y="0" width="120" height="60" /></clipPath>
    </defs>
    <circle r={k === 'sun' ? 58 : 50} fill={`url(#${id}g)`} />
    {/* Chiron is a small icy body between Saturn and Uranus: a smaller sphere with a faint tail. */}
    {small && <path d="M-6 -10 L-56 -30 L-56 -14 L-6 10 Z" fill={`url(#${id}t)`} transform="translate(8 6)" />}
    {ring && <ellipse rx="54" ry="12" fill="none" stroke={`url(#${id}r)`} strokeWidth="5" transform="rotate(-18)" opacity="0.6" />}
    <circle r={r} fill={`url(#${id}b)`} />
    {l.bands && <g clipPath={`url(#${id}c)`} opacity="0.35">{[-18, -6, 6, 17].map((y, i) => <ellipse key={i} cx="0" cy={y} rx="40" ry={i % 2 ? 3 : 4.5} fill={l.bands} />)}</g>}
    {k === 'moon' && <g fill={l.dark} opacity="0.3"><circle cx="-10" cy="-6" r="6" /><circle cx="12" cy="8" r="4" /><circle cx="2" cy="18" r="3" /></g>}
    {k === 'mars' && <g fill={l.dark} opacity="0.3"><ellipse cx="-8" cy="4" rx="10" ry="5" /><ellipse cx="12" cy="-10" rx="6" ry="3" /></g>}
    <circle r={r} fill={`url(#${id}s)`} />
    {ring && <g transform="rotate(-18)"><ellipse rx="54" ry="12" fill="none" stroke={`url(#${id}r)`} strokeWidth="5" clipPath={`url(#${id}f)`} /></g>}
  </>);
}
