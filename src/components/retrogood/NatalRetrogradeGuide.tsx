import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { ChartResult } from '@/lib/astro';
import { retroPlanets, retroPatterns } from '@/lib/retrogood';
import { chartShape } from '@/lib/advancedDeductions';
import { narrative, perceive } from '@/lib/perception';
import { chartAffirmations } from '@/lib/affirmations';
import { detectPatterns, rankPatterns } from '@/lib/chartPatterns';
import { practiceAffirmations, shadowBreakthroughBlock } from '@/content/shadowBreakthrough';
import { useReadingTone } from '@/hooks/useReadingTone';
import { usePlan } from '@/hooks/usePlan';
import { TierGate, meetsPlan } from '@/components/common/TierGate';
import { ToneSwitcher } from '@/components/results/ToneSwitcher';
import { RetroExplorer } from './RetroExplorer';
import { AffirmationsCarousel } from './AffirmationsCarousel';
import { TransitOverlay } from './TransitOverlay';

/** Uses only the chart supplied by the authorized birth-data path. Never loads another account's edition. */
export function NatalRetrogradeGuide({ chart, date }: { chart: ChartResult; date: string }) {
  const [tone, setTone] = useReadingTone();
  const { plan, loading } = usePlan();
  const data = useMemo(() => {
    const planets = retroPlanets(chart);
    const shape = chartShape(chart.bodies.filter(b => ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(b.key)).map(b => b.lon));
    const handle = shape.shape === 'Bucket' && shape.handle != null
      ? chart.bodies.find(b => Math.abs(b.lon - Number(shape.handle)) < 1e-6)?.key : null;
    const patternChart = chart.input.time ? chart : { ...chart, asc: null, cusps: null, utc: null };
    return {
      planets, patterns: retroPatterns(chart, planets, handle), insights: perceive(chart, !!chart.input.time),
      affirmations: [...chartAffirmations(chart, date), ...practiceAffirmations(shadowBreakthroughBlock(rankPatterns(detectPatterns(patternChart), chart)))],
    };
  }, [chart, date]);
  return <section id="natal-inward" aria-labelledby="natal-heading" className="scroll-mt-28 space-y-8">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-3xl space-y-3"><h2 id="natal-heading" className="text-2xl sm:text-3xl">Your natal inward patterns</h2><p>{data.planets.length} planet{data.planets.length === 1 ? ' was' : 's were'} retrograde at birth. Astrology associates these placements with reflection and revision. They do not measure your worth or make you more or less capable.</p><p className="text-sm text-muted-foreground">Outer planets spend months retrograde each year, so these placements are shared by many people. Dignity describes a planet’s relationship to its sign within an astrological tradition, not a scientific strength score.</p></div>
      <ToneSwitcher tone={tone} onChange={setTone} />
    </header>
    {data.planets.length <= 1 || (!loading && meetsPlan(plan, 'full')) ? <RetroExplorer planets={data.planets} tone={tone} /> : <>
      <RetroExplorer planets={data.planets.slice(0, 1)} tone={tone} />
      <TierGate plan={plan} loading={loading} need="full" title="All natal retrograde interpretations" preview={`${data.planets.slice(1).map(p => `${p.name} in ${p.sign}`).join(', ')}: dignity, reflection and practical reframing.`}><RetroExplorer planets={data.planets.slice(1)} tone={tone} /></TierGate>
    </>}
    <details className="border-y border-border py-5"><summary className="cursor-pointer font-display text-xl">Patterns across your retrograde planets</summary>
      {data.patterns.length ? <ul className="mt-4 grid gap-4 md:grid-cols-2">{data.patterns.map(p => <li key={p.name} className="space-y-2"><h3 className="font-semibold">{p.name}</h3><p className="text-sm leading-relaxed">{p.text}</p></li>)}</ul> : <p className="mt-4 text-muted-foreground">No shared retrograde stellium, handle, Mercury–Saturn pair, outer cluster or personal-planet trio was detected.</p>}
    </details>
    <details className="border-b border-border pb-5"><summary className="cursor-pointer font-display text-xl">Read these placements in the wider chart</summary><div className="mt-4 space-y-4"><p className="leading-relaxed">{narrative(data.insights, tone)}</p><ol className="space-y-3">{data.insights.map(i => <li key={i.id}><h3 className="font-semibold">{i.title}</h3><p className="text-sm text-muted-foreground">{i.text}</p></li>)}</ol><Link className="ink-link" to="/results?tab=systems">Compare your other systems</Link></div></details>
    <details className="border-b border-border pb-5"><summary className="cursor-pointer font-display text-xl">Reflections and affirmations</summary><div className="mt-4"><AffirmationsCarousel items={data.affirmations} /></div></details>
    <details className="border-b border-border pb-5"><summary className="cursor-pointer font-display text-xl">Explore transits on another date</summary><div className="mt-4"><TierGate plan={plan} loading={loading} need="full" title="Transit overlay and ninety-day timeline"><TransitOverlay chart={chart} /></TierGate></div></details>
  </section>;
}