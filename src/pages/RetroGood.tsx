import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { computeChart } from '@/lib/astro';
import { toChartInput, useMyBirth } from '@/lib/myBirth';
import { retroGood } from '@/lib/chartPatterns';
import { retroPatterns, retroPlanets, TIER_GLYPH, type RgTier } from '@/lib/retrogood';
import { chartShape } from '@/lib/advancedDeductions';
import { narrative, perceive } from '@/lib/perception';
import { chartAffirmations } from '@/lib/affirmations';
import { useReadingTone } from '@/hooks/useReadingTone';
import { usePlan } from '@/hooks/usePlan';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Button } from '@/components/ui/button';
import { ToneSwitcher } from '@/components/results/ToneSwitcher';
import { TierGate } from '@/components/common/TierGate';
import { RetroExplorer, RetroBadge, TIER_STYLE } from '@/components/retrogood/RetroExplorer';
import { AffirmationsCarousel } from '@/components/retrogood/AffirmationsCarousel';
import { TransitOverlay } from '@/components/retrogood/TransitOverlay';

const TIER_TEXT = { none: 'No planets were retrograde when you were born. Your planets express themselves outwardly and directly.', light: 'A light retrograde signature: one area of life works more inwardly.', notable: 'A notable retrograde signature: several parts of you process inwardly before acting.', strong: 'A strong retrograde signature: reflection, revision and inner work are central to how you live.', dominant: 'A dominant retrograde signature: much of your chart works inwardly, giving unusual depth and self-reliance.' };
const SECTIONS = [['rg-summary', 'Summary'], ['rg-explorer', 'Explorer'], ['rg-patterns', 'Patterns'], ['rg-insights', 'What stands out'], ['rg-affirm', 'Affirmations'], ['rg-transits', 'Transits']] as const;

/** RetroGOOD + Perception Engine, calculated from the member's saved birth details. */
export default function RetroGood() {
  usePageMeta('RetroGOOD — Zodaci', 'Your retrograde planets scored and explained: tiers, gifts, shadows, affirmations and the transits activating them.');
  const birth = useMyBirth();
  const { plan, loading } = usePlan();
  const [tone, setTone] = useReadingTone();
  const chart = useMemo(() => birth ? computeChart(toChartInput(birth)) : null, [birth]);
  const data = useMemo(() => {
    if (!chart || !birth) return null;
    const planets = retroPlanets(chart);
    const shape = chartShape(chart.bodies.filter(b => ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(b.key)).map(b => b.lon));
    const handle = shape.shape === 'Bucket' && shape.handle != null ? chart.bodies.find(b => Math.abs(b.lon - shape.handle!) < 1e-6)?.key ?? null : null;
    return { planets, patterns: retroPatterns(chart, planets, handle), rg: retroGood(chart), insights: perceive(chart, !!birth.time), affirmations: chartAffirmations(chart, birth.date) };
  }, [chart, birth]);
  if (birth === undefined) return <div className="mx-auto max-w-3xl space-y-4" role="status" aria-label="Loading your chart"><div className="h-10 w-48 animate-pulse rounded bg-card" /><div className="h-64 animate-pulse rounded-lg bg-card" /></div>;
  if (!birth || !chart || !data) return <article className="mx-auto max-w-lg space-y-4 py-10 text-center"><h1 className="font-display text-3xl">Add your birth details first</h1><Button asChild><Link to="/start">Create my chart</Link></Button></article>;
  const { planets, patterns, rg, insights, affirmations } = data;
  const counts = (['Amplified', 'Internalized', 'Refined', 'Karmic'] as RgTier[]).map(t => [t, planets.filter(p => p.tier === t).length] as const);
  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[180px_minmax(0,1fr)]">
      <nav aria-label="RetroGOOD sections" className="hidden lg:block"><ul className="sticky top-6 space-y-1 text-sm">{SECTIONS.map(([id, l]) => <li key={id}><a href={`#${id}`} className="block rounded px-2 py-1 text-muted-foreground transition-colors duration-500 hover:bg-primary/10 hover:text-foreground">{l}</a></li>)}</ul></nav>
      <article className="min-w-0 space-y-12">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="font-display text-4xl">RetroGOOD</h1><p className="mt-2 max-w-2xl text-muted-foreground">How the planets that were retrograde at your birth shape you. Retrograde is not bad luck: it is energy turned inward, reviewed and refined before it is shown.</p></div>
          <ToneSwitcher tone={tone} onChange={setTone} />
        </header>
        <section id="rg-summary" aria-labelledby="rg-summary-h" className="scroll-mt-6 rounded-lg border border-gold/40 bg-card p-6">
          <h2 id="rg-summary-h" className="font-display text-2xl capitalize">Your signature: {rg.tier}</h2>
          <p className="mt-2">{TIER_TEXT[rg.tier]}</p>
          {planets.length > 0 && <><div className="mt-4 flex flex-wrap gap-2">{planets.map(p => <RetroBadge key={p.key} p={p} />)}</div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">{counts.map(([t, n]) => <span key={t} className={`rounded border px-2 py-1 ${TIER_STYLE[t]} ${n ? '' : 'opacity-40'}`}>{TIER_GLYPH[t]} {t}: {n}</span>)}</div></>}
          {patterns[0] && <p className="mt-4 font-display text-lg text-gold">{patterns[0].label} — {patterns[0].name}</p>}
        </section>
        <section id="rg-explorer" aria-labelledby="rg-explorer-h" className="scroll-mt-6">
          <h2 id="rg-explorer-h" className="font-display text-2xl">RetroGOOD Explorer</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sorted by score. Open a planet for its gift, shadow, integration path and affirmation.</p>
          <div className="mt-4">{planets.length <= 1 ? <RetroExplorer planets={planets} tone={tone} /> : <><RetroExplorer planets={planets.slice(0, 1)} tone={tone} />
            <div className="mt-3"><TierGate plan={plan} loading={loading} need="full" title={`${planets.length - 1} more retrograde planet${planets.length > 2 ? 's' : ''}`}><RetroExplorer planets={planets.slice(1)} tone={tone} /></TierGate></div></>}</div>
        </section>
        <section id="rg-patterns" aria-labelledby="rg-patterns-h" className="scroll-mt-6">
          <h2 id="rg-patterns-h" className="font-display text-2xl">Retrograde patterns</h2>
          {patterns.length ? <ul className="mt-3 grid gap-3 md:grid-cols-2">{patterns.map(p => <li key={p.name} className="rounded-lg border border-border bg-card p-4"><p className="font-display text-lg text-gold">{p.label}</p><p className="text-xs text-muted-foreground">{p.name}</p><p className="mt-2 text-sm">{p.text}</p></li>)}</ul>
            : <p className="mt-2 text-sm text-muted-foreground">No compound retrograde patterns (stellium, handle, Deep Thinker, outer cluster or personal trio) form in your chart.</p>}
        </section>
        <section id="rg-insights" aria-labelledby="rg-insights-h" className="scroll-mt-6">
          <h2 id="rg-insights-h" className="font-display text-2xl">What stands out</h2>
          <p className="mt-3 text-lg leading-relaxed">{narrative(insights, tone)}</p>
          <ol className="mt-4 space-y-3">{insights.map(i => <li key={i.id} className="rounded border border-border bg-card p-4"><p className="font-medium">{i.title}</p><p className="mt-1 text-sm text-muted-foreground">{i.text}</p></li>)}</ol>
          <p className="mt-3 text-sm"><Link to="/results?tab=systems" className="text-primary underline">Cross-reference with your numerology</Link></p>
        </section>
        <section id="rg-affirm" aria-labelledby="rg-affirm-h" className="scroll-mt-6">
          <h2 id="rg-affirm-h" className="font-display text-2xl">Your affirmations</h2>
          <p className="mt-1 text-sm text-muted-foreground">{affirmations.length} statements drawn from your own placements.</p>
          <div className="mt-4"><AffirmationsCarousel items={affirmations} /></div>
        </section>
        <section id="rg-transits" aria-labelledby="rg-transits-h" className="scroll-mt-6">
          <h2 id="rg-transits-h" className="font-display text-2xl">Transit overlay</h2>
          <p className="mt-1 text-sm text-muted-foreground">Today’s sky against your birth chart, and the major events of the next 90 days. Gold marks “double Rx” windows, when a planet retrograde now touches one that was retrograde at your birth.</p>
          <div className="mt-4"><TierGate plan={plan} loading={loading} need="full" title="Transit overlay and 90-day timeline"><TransitOverlay chart={chart} /></TierGate></div>
        </section>
      </article>
    </div>
  );
}
