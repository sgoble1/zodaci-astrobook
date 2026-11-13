import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PlanetOrb } from '@/components/chart/PlanetOrb';
import { AuthGate } from '@/components/common/AuthGate';
import { SelfGate } from '@/components/relationships/SelfGate';
import { PanelTitle, Stamp } from '@/components/observatory/Observatory';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRelationships } from '@/hooks/useRelationships';
import type { RelationshipSelf } from '@/hooks/useRelationshipSelf';
import { usePageMeta } from '@/hooks/usePageMeta';
import { computeChart } from '@/lib/astro';
import { isSiblingRelation, possessive, siblingLens, type SiblingChannel } from '@/lib/synastry';
import { toInput } from './RelationshipDetail';

const TONE_LABEL: Record<SiblingChannel['tone'], string> = { harmony: 'Easy flow', tension: 'Growth edge', fusion: 'Strong blend', none: 'Separate tracks' };

/** Sibling Bureau: two siblings' charts read channel by channel, with one practice per channel. Owner-only, like every relationship. */
export default function Siblings() {
  usePageMeta('Sibling Bureau · Zodaci', 'Compare your chart with a brother or sister: how you talk, feel at home, compete, share responsibility and encourage each other.');
  return <AuthGate what="compare sibling charts">{() => <SelfGate>{self => <SiblingView self={self} />}</SelfGate>}</AuthGate>;
}

const ADD_SIBLING = `/relationships?add=sibling&next=${encodeURIComponent('/siblings')}`;

function SiblingView({ self }: { self: RelationshipSelf }) {
  const [params, setParams] = useSearchParams();
  const { items, loading } = useRelationships();
  const siblings = useMemo(() => items.filter(r => isSiblingRelation(r.relation)), [items]);
  const picked = siblings.find(r => r.id === params.get('with')) ?? siblings[0];
  const B = useMemo(() => (picked ? computeChart(toInput(picked)) : null), [picked]);
  const me = self.name;
  const lens = useMemo(() => (B && picked ? siblingLens(self.chart, B, me, picked.name) : null), [self.chart, B, me, picked]);

  if (loading) return <p role="status" className="text-muted-foreground">Opening the Sibling Bureau…</p>;
  if (!picked || !lens) return (
    <article className="obs-paper mx-auto max-w-xl space-y-4 p-8 text-center">
      <h1 className="font-display text-3xl uppercase">The Sibling Bureau</h1>
      <p className="text-muted-foreground">Add a brother, sister, twin, half- or step-sibling with their birth date, and this page compares your two charts channel by channel. You come straight back here after saving.</p>
      <Button asChild variant="signal"><Link to={ADD_SIBLING}>Add a sibling<ArrowRight /></Link></Button>
    </article>
  );
  const { channels, thirdHouse, summary } = lens;
  return (
    <article className="space-y-6">
      <header className="obs-panel p-6 sm:p-8">
        <Stamp>Relationship Bureau · Siblings</Stamp>
        <h1 className="mt-4 font-display text-4xl uppercase leading-none sm:text-5xl">The Sibling Bureau</h1>
        <p className="mt-2 font-script text-2xl text-primary sm:text-3xl">{me === 'You' ? 'You' : me} &amp; {picked.name}</p>
        <p className="mt-3 max-w-2xl text-muted-foreground">Read from both calculated charts. It shows patterns and things to try — it does not describe your family history or events.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link to={ADD_SIBLING} className="inline-flex min-h-10 items-center text-sm text-primary underline-offset-4 hover:underline">Add another sibling</Link>
        </div>
        {siblings.length > 1 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Label htmlFor="sibling-pick" className="text-sm">Compare with</Label>
            <select id="sibling-pick" className="h-10 rounded-full border border-input bg-background px-4 text-sm" value={picked.id} onChange={e => setParams({ with: e.target.value }, { replace: true })}>
              {siblings.map(r => <option key={r.id} value={r.id}>{r.name} · {r.relation}</option>)}
            </select>
          </div>
        )}
        <dl className="mt-6 grid grid-cols-3 gap-3">
          {([['Easy flow', summary.harmony], ['Growth edge', summary.tension], ['Strong blend', summary.fusion]] as const).map(([l, v]) => (
            <div key={l} className="parchment p-3 text-center"><dt className="font-label text-xs text-muted-foreground">{l}</dt><dd className="font-display text-3xl text-primary">{v}</dd></div>
          ))}
        </dl>
      </header>

      <section aria-labelledby="third-h" className="obs-paper p-6 sm:p-8">
        <h2 id="third-h" className="font-display text-2xl uppercase">The house of siblings</h2>
        <p className="mt-2 text-sm text-muted-foreground">The third house is the traditional house of brothers, sisters and everyday talk. Planets one of you places there tend to feel familiar to the other.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ThirdHouse label={`${possessive(me)} planets in ${picked.name}’s third house`} names={thirdHouse.aInB} missing={`${picked.name}’s birth time isn’t saved, so their houses can’t be calculated.`} />
          <ThirdHouse label={`${picked.name}’s planets in ${me === 'You' ? 'your' : `${me}’s`} third house`} names={thirdHouse.bInA} missing="Your birth time isn’t saved, so your houses can’t be calculated." />
        </div>
      </section>

      <section aria-labelledby="channels-h" className="space-y-4">
        <h2 id="channels-h" className="sr-only">Five sibling channels</h2>
        {channels.map(c => (
          <div key={c.id} className="obs-panel p-5 sm:p-6">
            <PanelTitle eyebrow={TONE_LABEL[c.tone]}>{c.label}</PanelTitle>
            <p className="text-sm text-muted-foreground">{c.about}</p>
            {c.contacts.length > 0 ? (
              <ul className="mt-3 space-y-2">{c.contacts.map((x, i) => (
                <li key={i} className="parchment p-3 text-sm">
                  <span className="inline-flex flex-wrap items-center gap-1.5 font-medium"><PlanetOrb planet={x.aKey} size={20} />{possessive(me)} {x.aName} {x.symbol} <PlanetOrb planet={x.bKey} size={20} />{picked.name}’s {x.bName}<span className="text-muted-foreground">· orb {x.orb.toFixed(1)}°{x.uncertain ? ' · Moon position approximate' : ''}</span></span>
                  <span className="mt-1 block text-muted-foreground">{x.text}</span>
                </li>
              ))}</ul>
            ) : <p className="mt-3 text-sm">No close contacts on this channel.</p>}
            <p className="mt-4 rounded-2xl border border-[hsl(var(--brass)/0.5)] bg-primary/10 p-4 text-sm"><span className="font-label text-primary">Try this · </span>{c.practice}</p>
          </div>
        ))}
      </section>

      <nav aria-label="More with this sibling" className="flex flex-wrap gap-3">
        <Button asChild variant="outline"><Link to={`/relationships/${picked.id}`}>Full comparison with {picked.name}<ArrowRight /></Link></Button>
        <Button asChild variant="ghost"><Link to={`/our-charts?with=${picked.id}`}>Charts side by side</Link></Button>
      </nav>
    </article>
  );
}

function ThirdHouse({ label, names, missing }: { label: string; names: string[] | null; missing: string }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--brass)/0.6)] p-4">
      <p className="font-label text-sm">{label}</p>
      <p className="mt-2 text-sm">{names === null ? missing : names.length ? names.join(' · ') : 'None — no planets fall there.'}</p>
    </div>
  );
}
