import { useMemo } from 'react';
import type { ChartResult } from '@/lib/astro';
import { arabicParts, fixedStarContacts } from '@/lib/resultsEngine';
import { advancedDeductions } from '@/lib/advancedDeductions';
import { TierGate } from '@/components/common/TierGate';
import type { Plan } from '@/content/navigation';

const SENSITIVE = ['chiron', 'lilith', 'northNode', 'southNode', 'vertex', 'fortune'];

/** Deep Dive: fixed stars within 1°, sensitive points and declination (Pro); Hermetic lots and profections (Cosmic). */
export function DeepDiveTab({ chart, date, timeKnown, plan, loading }: { chart: ChartResult; date: string; timeKnown: boolean; plan: Plan; loading: boolean }) {
  const stars = useMemo(() => fixedStarContacts(chart, 1), [chart]);
  const lots = useMemo(() => arabicParts(chart), [chart]);
  const adv = useMemo(() => advancedDeductions(chart, { date, timeKnown }), [chart, date, timeKnown]);
  const points = chart.bodies.filter(b => SENSITIVE.includes(b.key));
  const oob = adv.filter(d => d.id.startsWith('oob'));
  const timing = adv.filter(d => ['profection', 'sect', 'interception', 'voc-moon', 'polarity'].some(k => d.id.startsWith(k)));
  return (
    <div className="space-y-10">
      <section aria-labelledby="dd-stars" className="space-y-3">
        <h2 id="dd-stars" className="font-display text-2xl">Fixed stars</h2>
        <TierGate plan={plan} loading={loading} need="full" title="Fixed stars on your planets">
          {stars.length ? <ul className="grid gap-3 md:grid-cols-2">{stars.map((s, i) => <li key={i} className="rounded-lg border border-border bg-card p-4"><p className="font-medium">{s.star} on your {s.point}</p><p className="text-xs text-muted-foreground">{s.position} · {s.orb.toFixed(2)}° away</p><p className="mt-1 text-sm">Traditionally linked with {s.meaning}.</p></li>)}</ul>
            : <p className="rounded border border-border bg-card p-4 text-sm">None of 50 major fixed stars sits within 1° of your planets or angles.</p>}
          <p className="mt-2 text-xs text-muted-foreground">Star positions are J2000 values precessed to your birth date. Meanings are traditional keywords, offered for reflection.</p>
        </TierGate>
      </section>
      <section aria-labelledby="dd-pts" className="space-y-3">
        <h2 id="dd-pts" className="font-display text-2xl">Sensitive points</h2>
        <TierGate plan={plan} loading={loading} need="full" title="Chiron, Lilith, the Nodes and more">
          <ul className="grid gap-3 md:grid-cols-2">{points.map(b => <li key={b.key} className="rounded-lg border border-border bg-card p-4"><p className="font-medium">{b.glyph} {b.name} in {b.sign} {b.deg}°{String(b.min).padStart(2, '0')}′{b.house && timeKnown ? ` · house ${b.house}` : ''}</p>{b.note && <p className="mt-1 text-xs text-muted-foreground">{b.note}</p>}</li>)}</ul>
          {oob.map(d => <p key={d.id} className="mt-3 rounded border border-border bg-card p-4 text-sm"><span className="font-medium">{d.title}.</span> {d.text}</p>)}
          <p className="mt-2 text-xs text-muted-foreground">Asteroids such as Ceres, Pallas, Juno and Vesta are not yet calculated.</p>
        </TierGate>
      </section>
      <section aria-labelledby="dd-lots" className="space-y-3">
        <h2 id="dd-lots" className="font-display text-2xl">Hermetic lots and timing</h2>
        <TierGate plan={plan} loading={loading} need="creator" title="Arabic Parts and annual profections">
          {lots.length ? <ul className="grid gap-3 md:grid-cols-2">{lots.map(l => <li key={l.name} className="rounded-lg border border-border bg-card p-4"><p className="font-medium">{l.name} · {l.text}</p><p className="mt-1 text-sm">The point of {l.theme}.</p><p className="mt-1 text-xs text-muted-foreground">{l.formula}</p></li>)}</ul>
            : <p className="rounded border border-border bg-card p-4 text-sm">The lots are measured from the Ascendant, so they need an exact birth time.</p>}
          <ul className="mt-3 space-y-2">{timing.map(d => <li key={d.id} className="rounded border border-border bg-card p-4 text-sm"><span className="font-medium">{d.title}.</span> {d.text} <span className="block text-xs text-muted-foreground">Based on: {d.basis}</span></li>)}</ul>
        </TierGate>
      </section>
    </div>
  );
}
