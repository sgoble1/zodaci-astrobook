import type { ChartResult } from '@/lib/astro';
import { baziBalance } from '@/lib/bazi';
import { Progress } from '@/components/ui/progress';

export function BaZiGrid({ chart }: { chart: ChartResult }) {
  const data = baziBalance(chart);
  return <section className="space-y-6" aria-labelledby="bazi-title">
    <h2 id="bazi-title" className="font-display text-3xl">Four Pillars · BaZi</h2>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{['Year', 'Month', 'Day', 'Hour'].map(label => {
      const p = chart.bazi.find(p => p.label === label);
      return <article key={label} className="border border-border bg-card p-4 text-center"><h3 className="font-label text-xl">{label}</h3><p className="my-4 text-4xl leading-relaxed" aria-label={p ? `${p.stem} ${p.branch}` : 'Unknown hour'}>{p ? <>{p.stem}<br />{p.branch}</> : '—'}</p><p className="text-sm">{p?.romanized ?? 'Time needed'}</p><p className="mt-1 text-xs text-muted-foreground">{p ? `${p.stemElement} / ${p.branchElement} · ${p.animal}` : 'No hour pillar assumed'}</p></article>;
    })}</div>
    <p>Day Master: <strong>{data.day?.stem} · {data.day?.polarity} {data.day?.stemElement}</strong>.</p>
    <h3 className="font-display text-xl">Five-element balance</h3>
    <div className="space-y-3">{data.counts.map(e => <div key={e.element} className="grid grid-cols-[4rem_minmax(0,1fr)_3rem] items-center gap-3 text-sm"><span>{e.element}</span><Progress value={data.total ? e.count / data.total * 100 : 0} aria-label={`${e.element}: ${e.count} of ${data.total}`} /><span className="text-right">{e.count}/{data.total}</span></div>)}</div>
    <p className="text-sm text-muted-foreground">Same element + resource ({data.resource}) account for {data.supportPercent.toFixed(0)}% of visible stems and branch primary elements. This is a transparent support count, not a complete Day Master strength judgment: hidden stems, seasonal weighting and combinations can change that assessment.</p>
    <details className="border-t border-border pt-4 text-sm"><summary className="cursor-pointer font-medium">Calculation conventions and uncertainty</summary><ul className="mt-3 space-y-3">{chart.bazi.map(p => <li key={p.label}><strong>{p.label} · {p.confidence}:</strong> {p.note}</li>)}</ul><p className="mt-3 text-muted-foreground">Year and month use calculated solar-term boundaries. Days change at local civil midnight; hours use the recorded clock, not corrected apparent solar time. These are symbolic traditions, not measured personal energy.</p></details>
  </section>;
}