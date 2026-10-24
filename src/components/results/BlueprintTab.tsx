import { useMemo } from 'react';
import { fmtLon, type ChartResult } from '@/lib/astro';
import { ChartWheel } from '@/components/chart/ChartWheel';
import { balance } from '@/lib/resultsEngine';
import { chartShape, SHAPE_TEXT } from '@/lib/advancedDeductions';
import { lifePath, LP_MEANING } from '@/lib/synastry';
import { retroGood } from '@/lib/chartPatterns';
import { narrative, perceive, type Tone } from '@/lib/perception';
import { OpeningLetterCard } from '@/components/results/OpeningLetterCard';
import { ShadowBreakthrough } from '@/components/results/ShadowBreakthrough';

const EL_CLS: Record<string, string> = { Fire: 'bg-candle', Earth: 'bg-gold', Air: 'bg-primary', Water: 'bg-accent' };

/** Blueprint: wheel, Big Three degrees, element/modality balance, shape, year animal, Life Path and the top-ranked story. Free for everyone. */
export function BlueprintTab({ chart, date, timeKnown, tone, name = '', placeLabel = '' }: { chart: ChartResult; date: string; timeKnown: boolean; tone: Tone; name?: string; placeLabel?: string }) {
  const bal = useMemo(() => balance(chart), [chart]);
  const shape = useMemo(() => chartShape(chart.bodies.filter(b => ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(b.key)).map(b => b.lon)), [chart]);
  const insights = useMemo(() => perceive(chart, timeKnown), [chart, timeKnown]);
  const sun = chart.bodies.find(b => b.key === 'sun')!, moon = chart.bodies.find(b => b.key === 'moon')!;
  const rising = chart.asc != null ? fmtLon(chart.asc) : null;
  const year = chart.bazi.find(p => /year/i.test(p.label));
  const lp = lifePath(date).n;
  const rg = retroGood(chart);
  const big3 = [
    { label: 'Sun', value: `${sun.sign} ${sun.deg}°${String(sun.min).padStart(2, '0')}′`, note: 'who you are becoming' },
    { label: 'Moon', value: `${moon.sign} ${moon.deg}°${String(moon.min).padStart(2, '0')}′${!timeKnown ? ' (approx.)' : ''}`, note: 'what you need to feel safe' },
    { label: 'Rising', value: rising ? `${rising.sign} ${rising.deg}°${String(rising.min).padStart(2, '0')}′` : 'Needs birth time', note: 'how you meet the world' },
  ];
  return (
    <div className="space-y-8">
      <ul className="grid gap-3 sm:grid-cols-3">{big3.map(b => <li key={b.label} className="rounded-lg border border-border bg-card p-4"><p className="font-smallcaps text-xs text-gold">{b.label}</p><p className="font-display text-2xl">{b.value}</p><p className="text-sm text-muted-foreground">{b.note}</p></li>)}</ul>
      <section aria-labelledby="bp-story" className="rounded-lg border border-primary/40 bg-card p-5">
        <h2 id="bp-story" className="font-display text-2xl">Your chart at a glance</h2>
        <p className="mt-2 text-lg leading-relaxed">{narrative(insights, tone)}</p>
      </section>
      <OpeningLetterCard chart={chart} name={name} placeLabel={placeLabel} timeKnown={timeKnown} />
      <ChartWheel r={chart} />
      <ShadowBreakthrough chart={chart} timeKnown={timeKnown} tone={tone} />
      <div className="grid gap-6 md:grid-cols-2">
        <section aria-labelledby="bp-el" className="rounded-lg border border-border bg-card p-5">
          <h2 id="bp-el" className="font-display text-xl">Elements</h2>
          <ul className="mt-3 space-y-2">{Object.entries(bal.el).map(([k, v]) => <li key={k} className="text-sm"><div className="flex justify-between"><span>{k}</span><span>{v}</span></div><div className="mt-1 h-2 rounded bg-muted"><div className={`h-full rounded ${EL_CLS[k]}`} style={{ width: `${(v / Math.max(1, bal.total)) * 100}%` }} /></div></li>)}</ul>
          <p className="mt-3 text-sm text-muted-foreground">Strongest element: {bal.dominant}. Counted from the ten planets{chart.asc != null ? ' and your Rising sign' : ''}.</p>
        </section>
        <section aria-labelledby="bp-mo" className="rounded-lg border border-border bg-card p-5">
          <h2 id="bp-mo" className="font-display text-xl">Modalities</h2>
          <ul className="mt-3 space-y-2">{Object.entries(bal.mo).map(([k, v]) => <li key={k} className="text-sm"><div className="flex justify-between"><span>{k}</span><span>{v}</span></div><div className="mt-1 h-2 rounded bg-muted"><div className="h-full rounded bg-primary" style={{ width: `${(v / Math.max(1, bal.total)) * 100}%` }} /></div></li>)}</ul>
          <p className="mt-3 text-sm text-muted-foreground">{bal.mode === 'Cardinal' ? 'Cardinal: you start things.' : bal.mode === 'Fixed' ? 'Fixed: you sustain and protect things.' : 'Mutable: you adapt and connect things.'}</p>
        </section>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <li className="rounded-lg border border-border bg-card p-4"><p className="font-smallcaps text-xs text-gold">Chart shape</p><p className="font-display text-xl">{shape.shape}</p><p className="text-sm text-muted-foreground">{SHAPE_TEXT[shape.shape]}</p></li>
        <li className="rounded-lg border border-border bg-card p-4"><p className="font-smallcaps text-xs text-gold">Chinese year</p><p className="font-display text-xl">{year ? `${year.stemElement} ${year.animal}` : '—'}</p><p className="text-sm text-muted-foreground">From the solar-term year, not 1 January.</p></li>
        <li className="rounded-lg border border-border bg-card p-4"><p className="font-smallcaps text-xs text-gold">Life Path</p><p className="font-display text-xl">{lp}</p><p className="text-sm text-muted-foreground">{LP_MEANING[lp] ?? ''}</p></li>
        <li className="rounded-lg border border-border bg-card p-4"><p className="font-smallcaps text-xs text-gold">RetroGOOD</p><p className="font-display text-xl capitalize">{rg.tier}</p><p className="text-sm text-muted-foreground">{rg.planets.length} retrograde planet{rg.planets.length === 1 ? '' : 's'}</p></li>
      </ul>
    </div>
  );
}
