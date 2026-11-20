import { fmtLon, SIGN_GLYPH, type ChartResult } from '@/lib/astro';
import { ChartProjection } from './ChartProjection';
const KEYS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
export function SolarReturnOverlay({ natal, returned }: { natal: ChartResult; returned: ChartResult }) {
  const origin = natal.asc ?? 0;
  const xy = (lon: number, radius: number) => { const a = (180 - lon + origin) * Math.PI / 180; return [250 + radius * Math.cos(a), 250 + radius * Math.sin(a)]; };
  return <ChartProjection caption="Natal inner ring · Solar return outer ring"><svg viewBox="0 0 500 500" className="mx-auto aspect-square w-full max-w-2xl" role="img" aria-label="Bi-wheel: natal planets inside, relocated solar return outside">
    {[100, 155, 205, 235].map(r => <circle key={r} cx="250" cy="250" r={r} className="fill-none stroke-current opacity-50" />)}
    {SIGN_GLYPH.map((glyph, i) => { const [x, y] = xy(i * 30 + 15, 220), [a, b] = xy(i * 30, 235), [c, d] = xy(i * 30, 100); return <g key={glyph}><line x1={a} y1={b} x2={c} y2={d} className="stroke-current opacity-30" /><text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-current text-xl">{glyph}</text></g>; })}
    {[natal, returned].map((chart, ring) => <g key={ring} className={ring ? 'text-primary' : ''}>{chart.bodies.filter(b => KEYS.includes(b.key)).map((b, i) => { const [x, y] = xy(b.lon, (ring ? 177 : 124) + (i % 3 - 1) * 11); return <g key={b.key}><title>{ring ? 'Return' : 'Natal'} {b.name} · {fmtLon(b.lon).text}</title><text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-current text-lg">{b.glyph}</text></g>; })}{chart.cusps?.map((lon, i) => { const [a, b] = xy(lon, ring ? 158 : 98), [c, d] = xy(lon, ring ? 205 : 154); return <line key={i} x1={a} y1={b} x2={c} y2={d} className="stroke-current opacity-70" />; })}</g>)}
    <text x="250" y="244" textAnchor="middle" className="fill-current font-label text-xl">SOLAR RETURN</text><text x="250" y="269" textAnchor="middle" className="fill-current text-sm">{returned.utc.getUTCFullYear()}</text>
  </svg></ChartProjection>;
}