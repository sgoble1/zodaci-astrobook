import { PlanetOrb } from '@/components/chart/PlanetOrb';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { computeChart, type ChartInput } from '@/lib/astro';
import { toChartInput, useMyBirth } from '@/lib/myBirth';
import { interAspects, scoreSummary, composite, signPair } from '@/lib/synastry';
import { useSharedSpaceMember } from '@/hooks/useSharedSpaceMember';
import { useRelationships } from '@/hooks/useRelationships';
import { useShaneAccount } from '@/hooks/useShaneAccount';
import { APRIL } from './ChartCalculator';
import { toInput } from './RelationshipDetail';
import { Button } from '@/components/ui/button';

/** Private Shane × April synastry. Only the two approved shared-space accounts can open it. */
export default function OurCharts() {
  const member = useSharedSpaceMember();
  const isShane = useShaneAccount();
  const birth = useMyBirth();
  const { items, loading } = useRelationships();
  const partnerName = isShane ? 'April' : 'Shane';
  const partner: ChartInput | null = useMemo(() => {
    if (isShane) return APRIL.date ? APRIL : null;
    const r = items.find(x => /shane/i.test(x.name));
    return r ? toInput(r) : null;
  }, [isShane, items]);
  const A = useMemo(() => birth ? computeChart(toChartInput(birth)) : null, [birth]);
  const B = useMemo(() => partner ? computeChart(partner) : null, [partner]);
  const ia = useMemo(() => A && B ? interAspects(A, B, 'You', partnerName) : [], [A, B, partnerName]);
  if (member === undefined || birth === undefined || loading) return <p role="status">Loading…</p>;
  if (!member) return <p>This page is private to the shared space.</p>;
  if (!A) return <p>Add your birth details first. <Link className="underline" to="/start">Get started</Link></p>;
  if (!B) return <article className="mx-auto max-w-lg space-y-4 py-10 text-center"><h1 className="font-display text-3xl">Add {partnerName}'s birth details</h1><p className="text-muted-foreground">Save {partnerName} under Relationships and this page compares your two charts.</p><Button asChild><Link to="/relationships">Open Relationships</Link></Button></article>;
  const s = scoreSummary(ia);
  const comp = composite(A, B);
  const sun = (c: typeof A) => c.bodies.find(b => b.key === 'sun')!.sign;
  const moon = (c: typeof A) => c.bodies.find(b => b.key === 'moon')!.sign;
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header><h1 className="font-display text-4xl">Our two charts</h1><p className="mt-2 text-muted-foreground">You and {partnerName}, compared from both calculated charts. Private to the two of you.</p></header>
      <section className="grid gap-3 sm:grid-cols-3">
        {[['Easy flow', s.harmony], ['Growth friction', s.tension], ['Fusion', s.fusion]].map(([l, v]) => <div key={l as string} className="rounded border border-border bg-card p-4 text-center"><p className="text-sm text-muted-foreground">{l}</p><p className="font-display text-3xl">{v}</p></div>)}
      </section>
      <section><h2 className="font-display text-2xl">Sun and Moon</h2>
        <p className="mt-2">Suns: {signPair(sun(A), sun(B))}</p>
        <p className="mt-2">Moons: {signPair(moon(A), moon(B))}</p></section>
      <section><h2 className="font-display text-2xl">Strongest contacts</h2>
        <ul className="mt-3 space-y-2">{ia.slice().sort((a, b) => b.weight - a.weight).slice(0, 12).map((x, i) => <li key={i} className="rounded border border-border bg-card p-3 text-sm"><span className="inline-flex items-center gap-1.5 font-medium align-middle"><PlanetOrb planet={String(x.aName).toLowerCase()} size={22} />{x.aName} {x.symbol} <PlanetOrb planet={String(x.bName).toLowerCase()} size={22} />{x.bName}</span> · orb {x.orb.toFixed(1)}° — {x.text}</li>)}</ul></section>
      <section><h2 className="font-display text-2xl">Composite chart</h2>
        <p className="mt-2 text-sm text-muted-foreground">{comp.slice(0, 7).map((b: { name: string; sign: string }) => `${b.name} in ${b.sign}`).join(' · ')}</p></section>
    </article>
  );
}
