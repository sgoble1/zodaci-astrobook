import { useId } from 'react';
import { cn } from '@/lib/utils';
import { SpotArt } from '@/components/art/SpotArt';

/** Small hand-drawn style illustrations in the logo palette (purple planet, yellow land, white clouds). */
export type ArtKind = 'chart' | 'self' | 'love' | 'purpose' | 'healing' | 'year' | 'planet' | 'sign' | 'house' | 'aspect' | 'fire' | 'earth' | 'air' | 'water';

const RULES: [RegExp, ArtKind][] = [
  [/snapshot|chart|wheel/i, 'chart'], [/who you are|self|personal|big three/i, 'self'], [/love|connect|venus|relationship|attraction/i, 'love'],
  [/purpose|work|career|midheaven/i, 'purpose'], [/heal|growth|chiron/i, 'healing'], [/year|transit|timing|cycle/i, 'year'],
  [/^fire$/i, 'fire'], [/^earth$/i, 'earth'], [/^air$/i, 'air'], [/^water$/i, 'water'],
  [/planet/i, 'planet'], [/sign/i, 'sign'], [/house/i, 'house'], [/aspect/i, 'aspect'],
];
export const artFor = (label: string): ArtKind => RULES.find(([re]) => re.test(label))?.[1] ?? 'planet';

const P = 'hsl(var(--primary))', Y = 'hsl(var(--candle))', W = 'hsl(var(--foreground))', D = 'hsl(var(--background))';

export function Scene({ kind }: { kind: ArtKind }) {
  switch (kind) {
    case 'chart': return <g><circle cx="50" cy="50" r="30" fill="none" stroke={W} strokeOpacity=".7" /><circle cx="50" cy="50" r="18" fill="none" stroke={P} strokeWidth="2" />{Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return <line key={i} x1={50 + 18 * Math.cos(a)} y1={50 + 18 * Math.sin(a)} x2={50 + 30 * Math.cos(a)} y2={50 + 30 * Math.sin(a)} stroke={W} strokeOpacity=".5" />; })}<circle cx="72" cy="36" r="4" fill={Y} /><circle cx="34" cy="68" r="3" fill={W} /></g>;
    case 'self': return <g><circle cx="38" cy="54" r="16" fill={Y} /><path d="M66 30a14 14 0 1 0 8 24a11 11 0 1 1-8-24z" fill={W} /><path d="M20 82h60" stroke={P} strokeWidth="2.5" /><path d="M30 82l20-14 20 14" fill="none" stroke={W} strokeOpacity=".8" /></g>;
    case 'love': return <g><path d="M50 76C26 60 24 42 36 36c7-3 12 1 14 6 2-5 7-9 14-6 12 6 10 24-14 40z" fill={P} /><circle cx="70" cy="28" r="5" fill={Y} /><circle cx="28" cy="26" r="2.5" fill={W} /></g>;
    case 'purpose': return <g><path d="M14 80l24-34 14 18 10-12 24 28z" fill={P} /><path d="M38 46l6 8-6-2-6 2z" fill={W} /><circle cx="70" cy="26" r="7" fill={Y} /><path d="M70 14v-4M82 26h4M70 38v4M58 26h-4" stroke={Y} strokeWidth="2" /></g>;
    case 'healing': return <g><path d="M50 50m0-4a4 4 0 1 1-4 4a8 8 0 1 1 8 8a12 12 0 1 1-12-12a16 16 0 1 1 16 16a20 20 0 1 1-20-20" fill="none" stroke={P} strokeWidth="2.5" strokeLinecap="round" /><circle cx="50" cy="50" r="3" fill={Y} /></g>;
    case 'year': return <g><ellipse cx="50" cy="52" rx="34" ry="14" fill="none" stroke={W} strokeOpacity=".6" /><circle cx="50" cy="52" r="10" fill={Y} /><circle cx="83" cy="50" r="5" fill={P} /><circle cx="24" cy="62" r="3" fill={W} /></g>;
    case 'sign': return <g><circle cx="50" cy="50" r="28" fill={P} fillOpacity=".25" stroke={P} /><text x="50" y="62" textAnchor="middle" fontSize="34" fill={Y}>♈</text></g>;
    case 'house': return <g><path d="M24 50L50 28l26 22v26H24z" fill={P} /><rect x="44" y="58" width="12" height="18" fill={Y} /><circle cx="72" cy="22" r="3" fill={W} /></g>;
    case 'aspect': return <g><line x1="24" y1="70" x2="76" y2="30" stroke={W} strokeOpacity=".7" strokeDasharray="4 3" /><circle cx="24" cy="70" r="9" fill={P} /><circle cx="76" cy="30" r="8" fill={Y} /></g>;
    case 'fire': return <g><path d="M50 82c-16 0-22-12-18-24 3-8 10-12 10-24 10 6 18 16 16 26 4-2 6-6 6-10 8 10 8 32-14 32z" fill={Y} /><path d="M50 82c-6 0-9-6-6-12 2-4 6-6 6-12 6 6 9 24 0 24z" fill={P} /></g>;
    case 'earth': return <g><path d="M12 78l26-30 12 12 14-20 24 38z" fill={Y} fillOpacity=".85" /><path d="M12 78h76" stroke={P} strokeWidth="3" /></g>;
    case 'air': return <g>{[34, 50, 66].map((y, i) => <path key={y} d={`M${18 + i * 6} ${y}h40a8 8 0 1 0-8-8`} fill="none" stroke={i === 1 ? Y : W} strokeWidth="3" strokeLinecap="round" />)}</g>;
    case 'water': return <g><path d="M50 20c14 20 22 30 22 42a22 22 0 0 1-44 0c0-12 8-22 22-42z" fill={P} /><path d="M40 62a10 10 0 0 0 10 10" stroke={W} strokeWidth="2.5" fill="none" strokeLinecap="round" /></g>;
    default: return <g><circle cx="50" cy="50" r="24" fill={P} /><path d="M36 44c6-6 14-2 16 4s-8 8-12 6-6-6-4-10zM56 58c4-4 12-2 12 4s-8 4-12-4z" fill={Y} /><path d="M30 56c6-3 12 2 18 0" stroke={W} strokeWidth="3" fill="none" strokeLinecap="round" /><ellipse cx="50" cy="50" rx="38" ry="10" fill="none" stroke={W} strokeOpacity=".5" transform="rotate(-18 50 50)" /></g>;
  }
}

export function ThemeArt({ kind, label, className, badge }: { kind?: ArtKind; label?: string; className?: string; badge?: string | number }) {
  // Raster 1950s atomic-zodiac spot art; the hand-drawn SVG scenes above remain for print/inline use.
  const k = kind ?? artFor(label ?? '');
  return <SpotArt kind={k} className={cn('h-20 w-20', className)} badge={badge} />;
}
