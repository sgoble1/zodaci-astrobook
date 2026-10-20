import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { computeChart } from '@/lib/astro';
import { toChartInput, useMyBirth } from '@/lib/myBirth';
import { deduce, type System } from '@/lib/deductions';
import { usePlan } from '@/hooks/usePlan';
import { Button } from '@/components/ui/button';

const FREE_COUNT = 4;
const SYSTEMS: System[] = ['Western', 'Chinese', 'Numerology', 'Feng Shui'];

/** Results page: deterministic findings with progressive disclosure; Free sees the first few, the rest are locked previews. */
export default function Deductions() {
  const birth = useMyBirth();
  const { plan, loading } = usePlan();
  const chart = useMemo(() => birth ? computeChart(toChartInput(birth)) : null, [birth]);
  if (birth === undefined || loading) return <p role="status">Loading…</p>;
  if (!birth || !chart) return <p>Add your birth details first. <Link className="underline" to="/start">Get started</Link></p>;
  const sex = (birth as { sex?: 'male' | 'female' | 'unspecified' }).sex;
  const all = deduce(chart, { date: birth.date, timeKnown: !!birth.time, sex });
  const locked = plan === 'free';
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header><h1 className="font-display text-4xl">Your key findings</h1><p className="mt-2 text-muted-foreground">{all.length} findings across Western astrology, Chinese Ba Zi, numerology and Feng Shui, each with the calculation behind it.</p></header>
      {SYSTEMS.map(sys => {
        const items = all.map((d, i) => ({ d, i })).filter(x => x.d.system === sys);
        if (!items.length) return null;
        return <section key={sys} aria-labelledby={`s-${sys}`}><h2 id={`s-${sys}`} className="font-display text-2xl">{sys}</h2>
          <ul className="mt-3 space-y-3">{items.map(({ d, i }) => locked && i >= FREE_COUNT
            ? <li key={d.id} className="rounded border border-border bg-card p-4"><p className="flex items-center gap-2 font-medium"><Lock className="h-4 w-4 text-gold" aria-hidden />{d.title}</p><p className="mt-1 select-none text-sm text-muted-foreground blur-sm" aria-hidden>{d.text}</p><p className="sr-only">Locked. Upgrade to Pro to read this finding.</p></li>
            : <li key={d.id} className="rounded border border-border bg-card p-4"><p className="font-medium">{d.title}</p><p className="mt-1 text-sm">{d.text}</p><p className="mt-2 text-xs text-muted-foreground">Based on: {d.basis}</p></li>)}</ul></section>;
      })}
      {locked && <div className="rounded border border-gold/40 bg-card p-5 text-center"><p>{all.length - FREE_COUNT} more findings are included with Pro.</p><Button asChild className="mt-3"><Link to="/pricing">See Pro</Link></Button></div>}
      {!sex && <p className="text-sm text-muted-foreground">Feng Shui Kua needs your sex at birth in your birth details.</p>}
    </article>
  );
}
