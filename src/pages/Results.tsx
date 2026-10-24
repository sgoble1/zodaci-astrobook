import { lazy, Suspense, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { computeChart } from '@/lib/astro';
import { kuaSex, toChartInput, useMyBirth } from '@/lib/myBirth';
import { usePlan } from '@/hooks/usePlan';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useReadingTone } from '@/hooks/useReadingTone';
import { Button } from '@/components/ui/button';
import { BlueprintTab } from '@/components/results/BlueprintTab';
import { ToneSwitcher } from '@/components/results/ToneSwitcher';
import { PLAN_NAME } from '@/lib/plans';

const PlacementsTab = lazy(() => import('@/components/results/PlacementsTab').then(m => ({ default: m.PlacementsTab })));
const AspectsTab = lazy(() => import('@/components/results/AspectsTab').then(m => ({ default: m.AspectsTab })));
const SystemsTab = lazy(() => import('@/components/results/SystemsTab').then(m => ({ default: m.SystemsTab })));
const DeepDiveTab = lazy(() => import('@/components/results/DeepDiveTab').then(m => ({ default: m.DeepDiveTab })));
const AiReadingsTab = lazy(() => import('@/components/results/AiReadingsTab').then(m => ({ default: m.AiReadingsTab })));

export const RESULT_TABS = [
  { id: 'blueprint', label: 'Your Blueprint' }, { id: 'placements', label: 'Placements' }, { id: 'aspects', label: 'Aspects & Patterns' },
  { id: 'systems', label: 'Systems' }, { id: 'deep-dive', label: 'Deep Dive' }, { id: 'ai', label: 'AI Readings' },
] as const;
type TabId = typeof RESULT_TABS[number]['id'];

/** Results: the member's whole chart in six tabs, calculated on the device from saved birth details. Paid depth uses rank-based gates. */
export default function Results() {
  usePageMeta('Your results — Zodaci', 'Your birth chart blueprint, placements, aspects, systems and deep-dive points, calculated from your exact birth details.');
  const birth = useMyBirth();
  const { plan, loading } = usePlan();
  const [tone, setTone] = useReadingTone();
  const [params, setParams] = useSearchParams();
  const tab = (RESULT_TABS.find(t => t.id === params.get('tab'))?.id ?? 'blueprint') as TabId;
  const chart = useMemo(() => birth ? computeChart({ ...toChartInput(birth), sex: kuaSex(birth.sex) }) : null, [birth]);
  useEffect(() => { document.getElementById('results-panel')?.focus({ preventScroll: true }); }, [tab]);
  if (birth === undefined) return <div className="mx-auto max-w-4xl space-y-4" role="status" aria-label="Loading your chart"><div className="h-10 w-64 animate-pulse rounded bg-card" /><div className="h-96 animate-pulse rounded-lg bg-card" /></div>;
  if (!birth || !chart) return <article className="mx-auto max-w-lg space-y-4 py-10 text-center"><h1 className="font-display text-3xl">Add your birth details first</h1><p className="text-muted-foreground">Your results are calculated from your birth date, time and place.</p><Button asChild><Link to="/start">Create my chart</Link></Button></article>;
  const timeKnown = !!birth.time;
  const select = (id: TabId) => { const n = new URLSearchParams(params); n.set('tab', id); setParams(n, { replace: true }); };
  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = RESULT_TABS[(i + (e.key === 'ArrowRight' ? 1 : RESULT_TABS.length - 1)) % RESULT_TABS.length];
    select(next.id); document.getElementById(`tab-${next.id}`)?.focus();
  };
  return (
    <article className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="font-display text-4xl">{birth.name ? `${birth.name}, your results` : 'Your results'}</h1>
          <p className="mt-1 text-muted-foreground">{birth.date}{timeKnown ? ` · ${birth.time}` : ' · time unknown'} · {birth.placeLabel} · {PLAN_NAME[plan]} plan</p></div>
        <ToneSwitcher tone={tone} onChange={setTone} />
      </header>
      <div role="tablist" aria-label="Results sections" className="sticky top-0 z-10 -mx-2 flex gap-1 overflow-x-auto border-b border-border bg-background/90 px-2 backdrop-blur">
        {RESULT_TABS.map((t, i) => <button key={t.id} id={`tab-${t.id}`} role="tab" type="button" aria-selected={tab === t.id} aria-controls="results-panel" tabIndex={tab === t.id ? 0 : -1} onKeyDown={e => onKey(e, i)} onClick={() => select(t.id)}
          className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm transition-colors duration-500 focus-visible:outline focus-visible:outline-2 ${tab === t.id ? 'border-gold text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{t.label}</button>)}
      </div>
      <section id="results-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={-1} className="outline-none">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-card" role="status" aria-label="Loading" />}>
          {tab === 'blueprint' && <BlueprintTab chart={chart} date={birth.date} timeKnown={timeKnown} tone={tone} name={birth.name} placeLabel={birth.placeLabel} />}
          {tab === 'placements' && <PlacementsTab chart={chart} timeKnown={timeKnown} plan={plan} loading={loading} />}
          {tab === 'aspects' && <AspectsTab chart={chart} date={birth.date} timeKnown={timeKnown} plan={plan} loading={loading} />}
          {tab === 'systems' && <SystemsTab chart={chart} date={birth.date} name={birth.name} sex={kuaSex(birth.sex)} plan={plan} loading={loading} />}
          {tab === 'deep-dive' && <DeepDiveTab chart={chart} date={birth.date} timeKnown={timeKnown} plan={plan} loading={loading} />}
          {tab === 'ai' && <AiReadingsTab plan={plan} />}
        </Suspense>
      </section>
      {plan === 'free' && <aside className="rounded-lg border border-gold/40 bg-card p-5 text-center"><p>Pro opens every planet, your house explorer, the aspect grid, all numbers and Feng Shui directions.</p><Button asChild className="mt-3"><Link to="/pricing?plan=pro">See Pro</Link></Button></aside>}
    </article>
  );
}
