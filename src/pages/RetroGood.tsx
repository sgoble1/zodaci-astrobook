import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { computeChart } from '@/lib/astro';
import { toChartInput, useMyBirth } from '@/lib/myBirth';
import { retroGood } from '@/lib/chartPatterns';
import { narrative, perceive, retroMeaning, type Tone } from '@/lib/perception';
import { Button } from '@/components/ui/button';

const TIER_TEXT = { none: 'No planets were retrograde when you were born. Your planets express themselves outwardly and directly.', light: 'A light retrograde signature: one area of life works more inwardly.', notable: 'A notable retrograde signature: several parts of you process inwardly before acting.', strong: 'A strong retrograde signature: reflection, revision and inner work are central to how you live.', dominant: 'A dominant retrograde signature: much of your chart works inwardly, giving unusual depth and self-reliance.' };

/** RetroGOOD + Perception Engine, calculated from the member's saved birth details. */
export default function RetroGood() {
  const birth = useMyBirth();
  const [tone, setTone] = useState<Tone>('gentle');
  const chart = useMemo(() => birth ? computeChart(toChartInput(birth)) : null, [birth]);
  if (birth === undefined) return <p role="status">Loading your chart…</p>;
  if (!birth || !chart) return <article className="mx-auto max-w-lg space-y-4 py-10 text-center"><h1 className="font-display text-3xl">Add your birth details first</h1><Button asChild><Link to="/start">Create my chart</Link></Button></article>;
  const rg = retroGood(chart);
  const insights = perceive(chart, !!birth.time);
  const retro = chart.bodies.filter(b => rg.planets.includes(b.name));
  return (
    <article className="mx-auto max-w-3xl space-y-10">
      <header>
        <h1 className="font-display text-4xl">RetroGOOD</h1>
        <p className="mt-2 text-muted-foreground">How retrograde planets at your birth shape you, and what stands out most in your chart. Calculated directly from your birth details.</p>
      </header>
      <section aria-labelledby="tier" className="rounded-lg border border-gold/40 bg-card p-6">
        <h2 id="tier" className="font-display text-2xl capitalize">Your rating: {rg.tier}</h2>
        <p className="mt-2">{TIER_TEXT[rg.tier]}</p>
        <p className="mt-1 text-sm text-muted-foreground">Score {rg.score} · {rg.planets.length} retrograde · {rg.personal} personal planet{rg.personal === 1 ? '' : 's'} (counted double)</p>
      </section>
      {retro.length > 0 && <section aria-labelledby="rx"><h2 id="rx" className="font-display text-2xl">Your retrograde planets</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">{retro.map(b => <li key={b.key} className="rounded border border-border bg-card p-4"><p className="font-medium">{b.name} in {b.sign}{b.house ? ` · house ${b.house}` : ''}</p><p className="mt-1 text-sm text-muted-foreground">{retroMeaning(b.name)}</p></li>)}</ul></section>}
      <section aria-labelledby="pe">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="pe" className="font-display text-2xl">What stands out</h2>
          <label className="text-sm">Tone <select aria-label="Tone" className="ml-2 rounded border border-border bg-background px-2 py-1" value={tone} onChange={e => setTone(e.target.value as Tone)}><option value="gentle">Gentle</option><option value="direct">Direct</option></select></label></div>
        <p className="mt-3 text-lg">{narrative(insights, tone)}</p>
        <ol className="mt-4 space-y-3">{insights.map(i => <li key={i.id} className="rounded border border-border bg-card p-4"><p className="font-medium">{i.title}</p><p className="mt-1 text-sm text-muted-foreground">{i.text}</p></li>)}</ol>
      </section>
    </article>
  );
}
