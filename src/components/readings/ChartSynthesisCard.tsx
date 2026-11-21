import { useMemo, useState } from 'react';
import { CastOperator } from '@/components/observatory/CastOperator';
import type { ChartResult } from '@/lib/astro';
import { calculationLedger, crossTraditionCheck, internalParadoxes } from '@/lib/synthesis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Medallion } from '@/components/art/Medallion';
import { Button } from '@/components/ui/button';

/** Three layers of one chart: the human takeaway, the placements, then the raw calculation. No AI. */
export function ChartSynthesisCard({ chart }: { chart: ChartResult }) {
  const [orb, setOrb] = useState(6);
  const paradoxes = useMemo(() => internalParadoxes(chart, 3, orb), [chart, orb]);
  const cross = useMemo(() => crossTraditionCheck(chart), [chart]);
  const ledger = useMemo(() => calculationLedger(chart), [chart]);
  return (
    <section aria-labelledby="synthesis-title" className="relative space-y-4 border-b border-border pb-6">
      <CastOperator id="analyst" className="right-0 top-0 hidden md:block" />
      <h2 id="synthesis-title" className="font-display text-2xl">Your chart in three layers</h2>
      <Tabs defaultValue="signal">
        <TabsList className="ledger-tabs">
          <TabsTrigger value="signal">The Signal</TabsTrigger>
          <TabsTrigger value="blueprint">The Blueprint</TabsTrigger>
          <TabsTrigger value="ledger">Calculation Ledger</TabsTrigger>
        </TabsList>
        <TabsContent value="signal" className="space-y-5 pt-3">
          <div className="flex items-center gap-3" role="group" aria-label="Aspect orb">
            <Button variant="outline" size="icon" aria-label="Tighter orb" disabled={orb <= 2} onClick={() => setOrb(o => o - 1)}>−</Button>
            <span className="rotary-dial h-14 w-14 font-mono text-sm" aria-live="polite" style={{ transform: `rotate(${(orb - 6) * 12}deg)` }}><span style={{ transform: `rotate(${(6 - orb) * 12}deg)` }}>{orb}°</span></span>
            <Button variant="outline" size="icon" aria-label="Wider orb" disabled={orb >= 8} onClick={() => setOrb(o => o + 1)}>+</Button>
            <span className="text-xs text-muted-foreground">Orb for hard contacts</span>
          </div>
          {paradoxes.length ? paradoxes.map(p => (
            <article key={`${p.a}-${p.b}`} className="max-w-3xl space-y-2">
              <h3 className="font-label text-lg">The inner argument · {p.type.toLowerCase()}</h3>
              <p className="text-sm leading-relaxed">{p.text}</p>
              <p className="border-l-2 border-[hsl(var(--brass)/0.6)] pl-3 text-sm italic text-muted-foreground">{p.vignette}</p>
            </article>
          )) : <p className="text-sm text-muted-foreground">No tight squares or oppositions touch your personal planets, so there is no single inner argument to name. Your planet chapters below carry the detail.</p>}
          <article className="max-w-3xl space-y-2 rounded-md border border-border p-4">
            <h3 className="font-label text-lg">Cross-tradition check · today</h3>
            {cross.transits.length > 0 && <ul className="text-sm">{cross.transits.slice(0, 4).map(t => <li key={`${t.transit}-${t.natal}-${t.type}`}>{t.transit} {t.type.toLowerCase()} your {t.natal} · orb {t.orb.toFixed(2)}°</li>)}</ul>}
            <p className="text-sm">{cross.note}</p>
            {cross.balance && <p className="text-xs text-muted-foreground">BaZi Day Master: {cross.balance} ({cross.score}% support){cross.partial ? ' · hour pillar missing, partial' : ''}. A combined reading of two traditions, not a prediction.</p>}
          </article>
        </TabsContent>
        <TabsContent value="blueprint" className="pt-3">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {ledger.positions.map(p => <li key={p.name} className="flex items-center gap-3 rounded-md border border-border p-3">
              <Medallion label={p.name} size={40} />
              <span className="min-w-0 text-sm"><span className="block font-label">{p.name}{p.retro ? ' ℞' : ''}</span><span className="block text-muted-foreground">{p.position}{p.house ? ` · H${p.house}` : ''}</span></span>
            </li>)}
          </ul>
        </TabsContent>
        <TabsContent value="ledger" className="pt-3">
          <div className="ledger-paper overflow-x-auto rounded-md border border-border p-4 font-mono text-xs">
            <p>UTC {ledger.utc} · houses: {ledger.houseSystem}</p>
            <table className="mt-2 w-full text-left"><thead><tr><th>Point</th><th>Ecliptic longitude</th><th>House</th></tr></thead>
              <tbody>{ledger.positions.map(p => <tr key={p.name}><td>{p.name}</td><td>{p.position}{p.retro ? ' R' : ''}</td><td>{p.house ?? '—'}</td></tr>)}</tbody></table>
            {ledger.hiddenStems.length > 0 && <p className="mt-3">Hidden stems (season-weighted): {ledger.hiddenStems.map(h => `${h.pillar} ${h.stem} ${h.element} ${h.weight}`).join(' · ')}</p>}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
