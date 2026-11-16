import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChartWheel } from '@/components/chart/ChartWheel';
import { computeChart } from '@/lib/astro';
import { withDemoAsteroids } from '@/lib/demoAsteroids';
import { LEAD_COVER as SAMPLE_READER } from '@/content/coverSamples';

const SAMPLES = [
  { label: `${SAMPLE_READER.name} · 3 May 1987 · Asheville`, ...SAMPLE_READER.birth },
  { label: 'Summer solstice 2000 · London', date: '2000-06-21', time: '12:00', lat: 51.5074, lon: -0.1278, tz: 'Europe/London', placeLabel: 'London, UK' },
  { label: 'New Year 1995 · New York', date: '1995-01-01', time: '09:30', lat: 40.7128, lon: -74.006, tz: 'America/New_York', placeLabel: 'New York, USA' },
  { label: 'Spring equinox 1988 · Sydney', date: '1988-03-20', time: '18:15', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney', placeLabel: 'Sydney, Australia' },
];

/** Live example chart for visitors: calculated in the browser from a fictional birth moment, never a member's data. */
export function SampleChartDemo() {
  const [i, setI] = useState(0);
  const s = SAMPLES[i];
  const r = useMemo(() => withDemoAsteroids(computeChart({ ...s, placeSource: 'geocoded' })), [s]);
  const [pick, setPick] = useState('sun');
  const sel = r.bodies.find(b => b.key === pick) ?? r.bodies[0];
  const near = sel ? r.aspects.filter(a => a.a === sel.name || a.b === sel.name).sort((x, y) => x.orb - y.orb).slice(0, 3) : [];
  const big3 = ['Sun', 'Moon'].map(n => r.bodies.find(b => b.name === n)).filter(Boolean) as { name: string; sign: string }[];
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[2fr_3fr]">
      <div className="space-y-5">
        <h2>See a real chart, calculated live.</h2>
        <p className="text-muted-foreground leading-relaxed">This example is worked out right now from a fictional birth moment, the same way yours will be. Pick a moment to watch the sky change.</p>
        <div role="group" aria-label="Example birth moments" className="flex flex-wrap gap-2">{SAMPLES.map((x, k) => <Button key={x.label} size="sm" variant={k === i ? 'default' : 'outline'} onClick={() => setI(k)} aria-pressed={k === i}>{x.label}</Button>)}</div>
        <ul className="space-y-1 text-sm">{big3.map(b => <li key={b.name}><span className="text-accent">{b.name}</span> in {b.sign}</li>)}</ul>
        <div className="space-y-3 border-t border-border pt-4">
          <p className="font-label text-xs tracking-[0.14em] text-primary">Pick a planet to read its position</p>
          <div role="group" aria-label="Planets in this chart" className="flex flex-wrap gap-1">{r.bodies.slice(0, 12).map(b => <Button key={b.key} size="sm" variant={b.key === sel?.key ? 'default' : 'ghost'} aria-pressed={b.key === sel?.key} onClick={() => setPick(b.key)} title={b.name}><span aria-hidden>{b.glyph}</span><span className="sr-only sm:not-sr-only sm:ml-1">{b.name}</span></Button>)}</div>
          {sel && <div className="obs-console-screen p-4 font-mono text-sm" aria-live="polite">
            <p>{sel.name}: {sel.deg}°{String(sel.min).padStart(2, '0')}′ {sel.sign}{sel.retro ? ' · retrograde' : ''}{sel.house ? ` · house ${sel.house}` : ''}</p>
            {near.length ? <ul className="mt-2 space-y-1 opacity-80">{near.map(a => <li key={a.a + a.b + a.type}>{a.a} {a.type} {a.b} · orb {a.orb.toFixed(1)}°</li>)}</ul> : <p className="mt-2 opacity-80">No major aspects within orb.</p>}
          </div>}
        </div>
        <p className="text-sm text-muted-foreground">Ceres ⚳, Pallas ⚴, Juno ⚵ and Vesta ⚶ come from NASA JPL Horizons, the ephemeris Astrodienst is built on.</p>
        <Button asChild size="lg"><Link to="/start">Calculate mine — free<ArrowRight /></Link></Button>
      </div>
      <div className="w-full"><ChartWheel r={r} device="classic" /></div>
    </div>
  );
}
