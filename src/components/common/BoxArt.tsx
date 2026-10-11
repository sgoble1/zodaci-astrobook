import { useId } from 'react';
/** Deterministic, unique constellation art for any box. Same key → same art; different keys → different art. */
const GLYPHS: [RegExp, string][] = [
  [/aries/i, '♈'], [/taurus/i, '♉'], [/gemini/i, '♊'], [/cancer/i, '♋'], [/leo\b/i, '♌'], [/virgo/i, '♍'], [/libra/i, '♎'], [/scorpio/i, '♏'], [/sagittarius/i, '♐'], [/capricorn/i, '♑'], [/aquarius/i, '♒'], [/pisces/i, '♓'],
  [/sun\b/i, '☉'], [/moon|lunar/i, '☽'], [/mercury|think|decision|mind/i, '☿'], [/venus|love|relationship|partner/i, '♀'], [/mars|energy|play|creativ/i, '♂'], [/jupiter|growth|luck/i, '♃'], [/saturn|time|timing|cycle|retrograde/i, '♄'], [/uranus/i, '♅'], [/neptune|dream/i, '♆'], [/pluto/i, '♇'], [/chiron|heal|therap/i, '⚷'], [/node|purpose|path/i, '☊'],
  [/home|family|feng|bagua|kua/i, '⌂'], [/house/i, '⌂'], [/source|book|read|masterbook/i, '❦'], [/chart|aspect/i, '✶'], [/chat|counsel|social/i, '✧'], [/podcast|audio|media/i, '♫'],
];

function hash(s: string) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed: number) { return () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export function BoxArt({ seed, label, className = 'h-28 w-full' }: { seed: string; label?: string; className?: string }) {
  const r = rng(hash(seed));
  const hue = Math.floor(r() * 360);
  const hue2 = (hue + 40 + Math.floor(r() * 80)) % 360;
  const stars = Array.from({ length: 7 + Math.floor(r() * 5) }, () => ({ x: 20 + r() * 360, y: 12 + r() * 96, s: 0.8 + r() * 2.2 }));
  const glyph = GLYPHS.find(([re]) => re.test(label ?? seed))?.[1] ?? '✦';
  const uniqueId = useId();
  const id = `ba${uniqueId.replace(/:/g,'')}${hash(seed).toString(36)}`;
  return (
    <svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${hue} 55% 22%)`} /><stop offset="1" stopColor={`hsl(${hue2} 60% 34%)`} />
        </linearGradient>
      </defs>
      <rect width="400" height="120" fill={`url(#${id})`} />
      <circle cx={60 + r() * 280} cy={30 + r() * 60} r={30 + r() * 40} fill={`hsl(${hue2} 80% 70% / 0.12)`} />
      <polyline points={stars.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="hsl(45 90% 80% / 0.35)" strokeWidth="0.8" />
      {stars.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.s} fill="hsl(45 95% 88%)" />)}
      <text x="370" y="100" textAnchor="end" fontSize="44" fill="hsl(45 95% 85% / 0.85)">{glyph}</text>
    </svg>
  );
}
