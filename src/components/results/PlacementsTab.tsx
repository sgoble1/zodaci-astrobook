import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { fmtLon, SIGN_KEYWORDS, type ChartResult } from '@/lib/astro';
import { placementText, CORE_KEYS } from '@/lib/resultsEngine';
import { dignityOf, tierOf, TIER_GLYPH } from '@/lib/retrogood';
import { TierGate } from '@/components/common/TierGate';
import { HouseExplorer } from '@/components/results/HouseExplorer';
import type { Plan } from '@/content/navigation';

const FREE_KEYS = ['sun', 'moon'];

/** Placements: Free sees Sun, Moon and Rising; Pro and Cosmic see the ten planets, Chiron and the North Node, plus the House Explorer. */
export function PlacementsTab({ chart, timeKnown, plan, loading }: { chart: ChartResult; timeKnown: boolean; plan: Plan; loading: boolean }) {
  const [open, setOpen] = useState<string | null>('sun');
  const all = chart.bodies.filter(b => [...CORE_KEYS, 'chiron', 'northNode'].includes(b.key));
  const free = all.filter(b => FREE_KEYS.includes(b.key));
  const rest = all.filter(b => !FREE_KEYS.includes(b.key));
  const rising = chart.asc != null ? fmtLon(chart.asc) : null;
  const Row = ({ b }: { b: typeof all[number] }) => (
    <li>
      <button type="button" aria-expanded={open === b.key} onClick={() => setOpen(open === b.key ? null : b.key)} className="flex w-full items-center gap-3 p-4 text-left transition-colors duration-500 hover:bg-primary/5 focus-visible:outline focus-visible:outline-2">
        <span className="w-8 text-center text-xl" aria-hidden>{b.glyph}</span>
        <span className="flex-1"><span className="font-medium">{b.name} in {b.sign}</span>
          <span className="block text-xs text-muted-foreground">{b.deg}°{String(b.min).padStart(2, '0')}′{b.house && timeKnown ? ` · house ${b.house}` : ''}{b.retro && b.key !== 'northNode' ? ' · retrograde' : ''}</span></span>
        {b.retro && CORE_KEYS.includes(b.key) && <span className="rounded-full border border-gold/50 px-2 py-0.5 text-xs text-gold">{TIER_GLYPH[tierOf(dignityOf(b.key, b.sign))]} {tierOf(dignityOf(b.key, b.sign))}</span>}
        <ChevronDown className={`h-4 w-4 transition-transform duration-500 ${open === b.key ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open === b.key && <p className="px-4 pb-4 pl-15 text-sm leading-relaxed sm:pl-[3.75rem]">{placementText(b, timeKnown)}</p>}
    </li>
  );
  return (
    <div className="space-y-8">
      <section aria-labelledby="pl-core">
        <h2 id="pl-core" className="font-display text-2xl">Your core placements</h2>
        <ul className="mt-3 divide-y divide-border rounded-lg border border-border bg-card">
          {free.map(b => <Row key={b.key} b={b} />)}
          <li className="flex items-center gap-3 p-4"><span className="w-8 text-center text-xl" aria-hidden>AC</span><span><span className="font-medium">Rising {rising ? `in ${rising.sign}` : ''}</span>
            <span className="block text-sm text-muted-foreground">{rising ? `${rising.deg}°${String(rising.min).padStart(2, '0')}′ — how you meet the world: ${SIGN_KEYWORDS[rising.sign]}.` : 'Add your birth time to calculate your Rising sign.'}</span></span></li>
        </ul>
      </section>
      <section aria-labelledby="pl-rest">
        <h2 id="pl-rest" className="font-display text-2xl">Every planet</h2>
        <div className="mt-3"><TierGate plan={plan} loading={loading} need="full" title="Mercury to Pluto, Chiron and your North Node"
          teaser={<ul className="space-y-3">{rest.slice(0, 4).map(b => <li key={b.key} className="text-sm">{b.glyph} {b.name} — interpretation</li>)}</ul>}>
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">{rest.map(b => <Row key={b.key} b={b} />)}</ul>
        </TierGate></div>
      </section>
      <section aria-labelledby="pl-houses">
        <h2 id="pl-houses" className="font-display text-2xl">Your twelve houses</h2>
        <p className="mt-1 text-sm text-muted-foreground">Each house is one area of life. Open one to see which planets live there and where its ruler leads.</p>
        <div className="mt-3"><TierGate plan={plan} loading={loading} need="full" title="House Explorer"><HouseExplorer chart={chart} /></TierGate></div>
      </section>
    </div>
  );
}
