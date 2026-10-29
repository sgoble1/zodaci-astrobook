import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { computeChart } from '@/lib/astro';
import { toChartInput, type MyBirth } from '@/lib/myBirth';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';

/** How certain each part of the member's chart is, from the birth facts they saved — nothing is inferred. */
export default function MemberDataQuality({ birth }: { birth: MyBirth }) {
  usePageMeta('How exact is your chart? · Zodaci', 'Which parts of your chart are exact, which depend on your birth time, and why.');
  const chart = useMemo(() => computeChart(toChartInput(birth)), [birth]);
  const timed = !!birth.time;
  const rows: { label: string; level: 'confirmed' | 'derived' | 'ambiguous'; note: string }[] = [
    { label: 'Birth date', level: 'confirmed', note: `${birth.date}, as you saved it.` },
    { label: 'Birth time', level: timed ? 'confirmed' : 'ambiguous', note: timed ? `${birth.time}, as you saved it. A time off by a few minutes can move the Rising sign and house cusps.` : 'Not saved. Noon is used; the Moon may be in a different sign, and Rising, Midheaven and houses aren’t calculated.' },
    { label: 'Birth place', level: 'confirmed', note: `${birth.placeLabel} (${birth.lat.toFixed(3)}, ${birth.lon.toFixed(3)}), time zone ${birth.tz}.` },
    { label: 'Sex at birth', level: birth.sex ? 'confirmed' : 'ambiguous', note: birth.sex ? `${birth.sex} — used only for the Kua number.` : 'Not saved, so the Kua number and Feng Shui directions can’t be calculated.' },
    { label: 'Planets', level: 'derived', note: 'Calculated from astronomical data for your exact birth moment.' },
    { label: 'Houses', level: timed ? 'derived' : 'ambiguous', note: timed ? `${birth.houseSystem} houses from your birth time and place.` : 'Need a birth time.' },
  ];
  return (
    <article className="space-y-8">
      <header>
        <p className="font-smallcaps text-xs text-gold">Data quality</p>
        <h1 className="font-display mt-1 text-4xl">How exact is your chart?</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Every reading is built from the facts below. Nothing here is guessed from your answers or from anyone else’s chart.</p>
      </header>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {rows.map(r => <li key={r.label} className="flex flex-wrap items-start justify-between gap-3 p-4 text-sm"><span className="min-w-0"><b>{r.label}</b><span className="mt-1 block text-muted-foreground">{r.note}</span></span><ConfidenceBadge level={r.level} note={r.note} /></li>)}
      </ul>
      <section>
        <h2 className="font-display text-2xl">Close calls in your chart</h2>
        {chart.flags.length ? <ul className="mt-3 space-y-2">{chart.flags.map((f, i) => <li key={i} className="rounded border border-border bg-card p-3 text-sm"><b>{f.topic}</b> <ConfidenceBadge compact level={f.level} note={f.note} /><p className="mt-1">{f.note}</p></li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No placements sit close enough to a boundary to change with a small time error.</p>}
      </section>
      <div className="flex flex-wrap gap-3"><Button asChild><Link to="/start">Edit birth details</Link></Button><Button asChild variant="outline"><Link to="/my-chart">Your chart</Link></Button></div>
    </article>
  );
}
