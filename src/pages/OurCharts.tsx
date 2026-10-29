import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlanetOrb } from '@/components/chart/PlanetOrb';
import { computeChart, type ChartInput } from '@/lib/astro';
import { interAspects, scoreSummary, composite, signPair, possessive } from '@/lib/synastry';
import { useRelationships } from '@/hooks/useRelationships';
import { useShaneAccount } from '@/hooks/useShaneAccount';
import { useWholeEditionAccess } from '@/lib/editionSharing';
import { AuthGate } from '@/components/common/AuthGate';
import { SelfGate } from '@/components/relationships/SelfGate';
import type { RelationshipSelf } from '@/hooks/useRelationshipSelf';
import { usePageMeta } from '@/hooks/usePageMeta';
import { APRIL } from './ChartCalculator';
import { toInput } from './RelationshipDetail';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

/** Your chart side by side with someone you saved under Relationships. Comparisons stay private to your account. */
export default function OurCharts() {
  usePageMeta('Our two charts · Zodaci', 'Your chart compared with someone you saved, from both calculated charts.');
  return <AuthGate what="compare charts">{() => <SelfGate>{self => <Compare self={self} />}</SelfGate>}</AuthGate>;
}

function Compare({ self }: { self: RelationshipSelf }) {
  const [params, setParams] = useSearchParams();
  const { items, loading } = useRelationships();
  const isShane = useShaneAccount();
  // April's archive chart is used only when this account may read her whole edition and hasn't saved her separately.
  const aprilShared = useWholeEditionAccess('april');
  const wanted = params.get('with');
  const defaultFor = self.isApril ? /shane/i : isShane ? /april/i : null;
  const picked = items.find(r => r.id === wanted) ?? (defaultFor ? items.find(r => defaultFor.test(r.name)) : undefined) ?? items[0];
  const useArchiveApril = !picked && isShane && aprilShared === true && !self.isApril;
  const partnerName = picked?.name ?? (useArchiveApril ? 'April' : '');
  const partner: ChartInput | null = useMemo(() => (picked ? toInput(picked) : useArchiveApril ? APRIL : null), [picked, useArchiveApril]);
  const A = self.chart;
  const B = useMemo(() => (partner ? computeChart(partner) : null), [partner]);
  const me = self.name;
  const ia = useMemo(() => (B ? interAspects(A, B, me, partnerName) : []), [A, B, me, partnerName]);

  if (loading) return <p role="status">Loading…</p>;
  if (!B) return (
    <article className="mx-auto max-w-lg space-y-4 py-10 text-center">
      <h1 className="font-display text-3xl">Add someone to compare with</h1>
      <p className="text-muted-foreground">Save a partner, friend or family member under Relationships and this page compares your two charts.</p>
      <Button asChild><Link to="/relationships">Open Relationships</Link></Button>
    </article>
  );
  const s = scoreSummary(ia);
  const comp = composite(A, B);
  const sun = (c: typeof A) => c.bodies.find(b => b.key === 'sun')!.sign;
  const moon = (c: typeof A) => c.bodies.find(b => b.key === 'moon')!.sign;
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="font-display text-4xl">Our two charts</h1>
        <p className="mt-2 text-muted-foreground">{me === 'You' ? 'You' : me} and {partnerName}, compared from both calculated charts. Saved comparisons are private to your account.</p>
        {items.length > 1 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Label htmlFor="compare-with" className="text-sm">Compare with</Label>
            <select id="compare-with" className="rounded-md border border-input bg-background px-2 py-1 text-sm" value={picked?.id ?? ''} onChange={e => setParams({ with: e.target.value }, { replace: true })}>
              {items.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        )}
        {picked && <p className="mt-2 text-sm"><Link to={`/relationships/${picked.id}`} className="underline underline-offset-2">Full comparison with {picked.name}</Link></p>}
      </header>
      <section className="grid gap-3 sm:grid-cols-3">
        {[['Easy flow', s.harmony], ['Growth friction', s.tension], ['Fusion', s.fusion]].map(([l, v]) => <div key={l as string} className="rounded border border-border bg-card p-4 text-center"><p className="text-sm text-muted-foreground">{l}</p><p className="font-display text-3xl">{v}</p></div>)}
      </section>
      <section><h2 className="font-display text-2xl">Sun and Moon</h2>
        <p className="mt-2">Suns: {signPair(sun(A), sun(B))}</p>
        <p className="mt-2">Moons: {signPair(moon(A), moon(B))}</p></section>
      <section><h2 className="font-display text-2xl">Strongest contacts</h2>
        <ul className="mt-3 space-y-2">{ia.slice().sort((a, b) => b.weight - a.weight).slice(0, 12).map((x, i) => <li key={i} className="rounded border border-border bg-card p-3 text-sm"><span className="inline-flex items-center gap-1.5 align-middle font-medium"><PlanetOrb planet={x.aKey} size={22} />{possessive(me)} {x.aName} {x.symbol} <PlanetOrb planet={x.bKey} size={22} />{partnerName}’s {x.bName}</span> · orb {x.orb.toFixed(1)}° — {x.text}</li>)}</ul></section>
      <section><h2 className="font-display text-2xl">Composite chart</h2>
        <p className="mt-2 text-sm text-muted-foreground">{comp.slice(0, 7).map((b: { name: string; sign: string }) => `${b.name} in ${b.sign}`).join(' · ')}</p></section>
    </article>
  );
}
