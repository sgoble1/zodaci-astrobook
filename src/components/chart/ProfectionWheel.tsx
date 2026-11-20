import { useMemo, useState } from 'react';
import { SIGNS, SIGN_GLYPH, type ChartResult } from '@/lib/astro';
import { annualProfection, birthdayAge } from '@/lib/profections';
import { planetSpeed } from '@/lib/planetaryDynamics';
import * as Astronomy from 'astronomy-engine';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ChartProjection } from './ChartProjection';

export function ProfectionWheel({ chart }: { chart: ChartResult }) {
  const [age, setAge] = useState(() => Math.min(100, birthdayAge(chart.input.date)));
  const active = annualProfection(chart, age);
  const now = useMemo(() => new Date(), []);
  if (!active || chart.asc == null) return <p className="border-l-2 border-primary pl-4 text-muted-foreground">A recorded birth time is needed for the rising sign, activated house and lord of the year. Your planetary positions remain available in My Chart.</p>;
  const first = Math.floor(chart.asc / 30);
  const lordPlanet = active.lord?.name as Astronomy.Body | undefined;
  const speed = lordPlanet ? planetSpeed(lordPlanet, now) : null;
  return <section className="space-y-6" aria-label="Annual profection">
    <div className="grid items-center gap-8 lg:grid-cols-2">
      <ChartProjection caption={`Age ${age} · House ${active.house} · ${active.lord?.name ?? active.lordKey}`}>
        <svg viewBox="0 0 440 440" className="mx-auto aspect-square w-full max-w-lg" role="img" aria-label={`Twelve houses; house ${active.house} in ${active.sign} is active at age ${age}`}>
          <circle cx="220" cy="220" r="195" className="fill-none stroke-current" />
          <circle cx="220" cy="220" r="115" className="fill-none stroke-current opacity-50" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * 30 - 90) * Math.PI / 180, mid = a + Math.PI / 12, end = a + Math.PI / 6;
            const point = (r: number, angle: number) => [220 + r * Math.cos(angle), 220 + r * Math.sin(angle)];
            const p = point(194, a), q = point(194, end), t = point(152, mid), g = point(178, mid);
            const on = active.house === i + 1;
            return <g key={i}>
              <path d={`M220 220 L${p.join(' ')} A194 194 0 0 1 ${q.join(' ')} Z`} className={on ? 'fill-current opacity-20' : 'fill-none'} />
              <line x1="220" y1="220" x2={p[0]} y2={p[1]} className="stroke-current opacity-40" />
              <text x={t[0]} y={t[1]} textAnchor="middle" dominantBaseline="middle" className="fill-current font-label text-xl">{i + 1}</text>
              <text x={g[0]} y={g[1]} textAnchor="middle" dominantBaseline="middle" className="fill-current text-lg">{SIGN_GLYPH[(first + i) % 12]}</text>
            </g>;
          })}
          <circle cx="220" cy="220" r="72" className="fill-background stroke-current" />
          <text x="220" y="212" textAnchor="middle" className="fill-current font-label text-3xl">AGE {age}</text>
          <text x="220" y="241" textAnchor="middle" className="fill-current text-sm">{active.lord?.name}</text>
        </svg>
      </ChartProjection>
      <div className="space-y-5" aria-live="polite">
        <h2 className="font-display text-3xl">House {active.house} · {SIGNS[active.signIndex]}</h2>
        <p>Your lord of the year is <strong>{active.lord?.name}</strong>.</p>
        <p className="text-sm text-muted-foreground">Natal ruler: {active.lord?.sign}{active.lord?.house ? ` · natal house ${active.lord.house}` : ''}{active.lord?.retro ? ' · retrograde at birth' : ''}.</p>
        <p className="text-sm">In the activated whole-sign house: {active.occupants.map(b => b.name).join(', ') || 'no calculated planets or North Node'}.</p>
        {speed != null && <p className="text-sm text-muted-foreground">Ruler today ({now.toISOString().slice(0, 10)} UTC): {speed < 0 ? 'Retrograde' : 'Direct'} · {speed.toFixed(3)}° per day.</p>}
        <p className="text-sm text-muted-foreground">Traditional whole-sign profections advance one house on each birthday. The natal house system is unchanged. A time lord is a symbolic focus, not a prediction of events.</p>
      </div>
    </div>
    <div className="mx-auto max-w-2xl space-y-4"><label id="profection-age-label" className="font-label text-xl">Age · {age}</label><Slider aria-labelledby="profection-age-label" min={0} max={100} step={1} value={[age]} onValueChange={v => setAge(v[0] ?? 0)} /><div className="flex items-center justify-between"><Button variant="outline" size="sm" disabled={age === 0} onClick={() => setAge(n => n - 1)}>Previous age</Button><span className="text-sm text-muted-foreground">Birth → 100</span><Button variant="outline" size="sm" disabled={age === 100} onClick={() => setAge(n => n + 1)}>Next age</Button></div></div>
  </section>;
}