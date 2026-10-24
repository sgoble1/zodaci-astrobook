import { useMemo } from 'react';
import type { ChartResult } from '@/lib/astro';
import { detectPatterns } from '@/lib/chartPatterns';
import { advancedDeductions } from '@/lib/advancedDeductions';
import { TierGate } from '@/components/common/TierGate';
import { AspectMatrix } from '@/components/results/AspectMatrix';
import type { Plan } from '@/content/navigation';

// T-squares, grand trines and yods come from detectPatterns (spec orbs), so they are not repeated from the deductions.
const PATTERN_IDS = ['shape', 'focal', 'unaspected', 'reception'];

/** Aspects & Patterns: full matrix and pattern callouts for Pro/Cosmic; Free sees a blurred preview. */
export function AspectsTab({ chart, date, timeKnown, plan, loading }: { chart: ChartResult; date: string; timeKnown: boolean; plan: Plan; loading: boolean }) {
  const patterns = useMemo(() => detectPatterns(timeKnown ? chart : { ...chart, utc: null }).filter(p => timeKnown || !/bucket|bundle|handle/i.test(p.code)), [chart, timeKnown]);
  const extra = useMemo(() => advancedDeductions(chart, { date, timeKnown }).filter(d => PATTERN_IDS.some(id => d.id.startsWith(id))), [chart, date, timeKnown]);
  const tight = [...chart.aspects].sort((a, b) => a.orb - b.orb).slice(0, 2);
  return (
    <div className="space-y-8">
      <section aria-labelledby="as-grid">
        <h2 id="as-grid" className="font-display text-2xl">Aspect grid</h2>
        <p className="mt-1 text-sm text-muted-foreground">Every angle between your planets within orb. The number is how far from exact; smaller means stronger.</p>
        <div className="mt-3"><TierGate plan={plan} loading={loading} need="full" title="Your full aspect grid"
          teaser={<ul className="space-y-2 text-sm">{tight.map((a, i) => <li key={i}>{a.a} {a.symbol} {a.b} · {a.orb.toFixed(1)}°</li>)}<li>☉ ☌ ☿ · 2.1°</li></ul>}>
          <AspectMatrix chart={chart} />
        </TierGate></div>
      </section>
      <section aria-labelledby="as-pat">
        <h2 id="as-pat" className="font-display text-2xl">Patterns</h2>
        <div className="mt-3"><TierGate plan={plan} loading={loading} need="full" title="Pattern callouts">
          {patterns.length + extra.length === 0 ? <p className="rounded border border-border bg-card p-4 text-sm">No major configurations (T-square, grand trine, yod, stellium) form in your chart. Its story lives in the individual aspects above.</p> :
          <ul className="grid gap-3 md:grid-cols-2">
            {patterns.map(p => <li key={`${p.code}-${p.bodies.join()}`} className="rounded-lg border border-border bg-card p-4"><p className="font-medium">{p.title}</p><p className="mt-1 text-sm">{p.detail}</p></li>)}
            {extra.map(d => <li key={d.id} className="rounded-lg border border-border bg-card p-4"><p className="font-medium">{d.title}</p><p className="mt-1 text-sm">{d.text}</p><p className="mt-2 text-xs text-muted-foreground">Based on: {d.basis}</p></li>)}
          </ul>}
        </TierGate></div>
      </section>
    </div>
  );
}
