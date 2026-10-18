import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePlan } from '@/hooks/usePlan';
import { readingStatus } from '@/lib/readingExperience';
import { LoadError } from '@/components/common/LoadError';
import { useSubscription } from '@/hooks/useSubscription';
import { CreatorStudio } from '@/components/payments/CreatorStudio';
import { ALL_READINGS, loadMyTopicReadings, type TopicRow } from '@/lib/topicReadings';
import { usePageMeta } from '@/hooks/usePageMeta';

const TOOLS: [string, string, string][] = [
  ['/my-chart', 'My chart', 'Your wheel, placements and house rulers'],
  ['/relationships', 'People & charts', 'Add charts for partners, friends and family'],
  ['/my-masterbook', 'My Masterbook', 'Chapters and podcasts you have made'],
  ['/podcasts', 'Podcasts', 'Listen to and share your episodes'],
  ['/personal-context', 'Life context', 'Examples you choose to inform your readings'],
  ['/books', 'AstroBook', 'Turn your readings into a printed book'],
];

/** Creator members' home: their charts, readings and creation tools in one place. Server checks still gate every Creator action. */
export default function CreatorDashboard() {
  usePageMeta('Creator dashboard | Zodaci', 'Manage your charts, readings and creations.');
  const sub = useSubscription();
  const access = usePlan();
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [rows, setRows] = useState<TopicRow[] | null>(null);
  useEffect(() => { if (access.plan === 'creator') { setError(false); void loadMyTopicReadings().then(setRows).catch(() => setError(true)); } }, [access.plan, retry]);
  if (access.loading) return <div role="status" className="h-40 animate-pulse rounded bg-muted" />;
  if (access.plan !== 'creator') return (
    <article className="mx-auto max-w-xl space-y-4 text-center">
      <h1 className="font-display text-4xl">Creator dashboard</h1>
      <p className="text-muted-foreground">The Creator plan lets you manage several charts, write new chapters and make podcasts from your readings.</p>
      <Button asChild><Link to="/pricing">See the Creator plan</Link></Button>
    </article>
  );
  if (error) return <LoadError what="your readings" onRetry={() => setRetry(n => n + 1)} />;
  const ready = new Set((rows ?? []).map(r => r.page_key));
  return (
    <article className="mx-auto max-w-5xl space-y-10">
      <header className="space-y-2"><p className="font-smallcaps text-xs text-gold">Creator</p><h1 className="font-display text-4xl">Your Creator dashboard</h1><p className="text-muted-foreground">{sub.periodEnd ? `${sub.cancelAtEnd ? 'Ends' : 'Renews'} ${new Date(sub.periodEnd).toLocaleDateString()}` : 'Active'} · <Link to="/pricing" className="underline">Manage plan</Link></p></header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{TOOLS.map(([to, t, d]) => <Link key={to} to={to} className="rounded-lg border border-border bg-card p-5 hover:border-primary focus-visible:outline focus-visible:outline-2"><h2 className="font-semibold">{t}</h2><p className="mt-1 text-sm text-muted-foreground">{d}</p></Link>)}</section>
      <section className="space-y-3">
        <h2 className="text-2xl">Your readings · {ready.size ? ALL_READINGS.filter(t => ready.has(`topic-${t.slug}`)).length : 0} of {ALL_READINGS.length} written</h2>
        <ul className="grid gap-2 sm:grid-cols-2">{ALL_READINGS.map(t => { const done = ready.has(`topic-${t.slug}`); const to = 'route' in t ? (t as { route: string }).route : `/my-readings/topic/${t.slug}`; return <li key={t.slug}><Link to={to} className="flex justify-between rounded border border-border px-3 py-2 text-sm hover:bg-muted"><span>{t.title}</span><span className="text-muted-foreground">{done ? (readingStatus(rows?.find(r => r.page_key === `topic-${t.slug}`)?.status) === 'preview' ? 'Preview' : 'Saved') : 'Open to create'}</span></Link></li>; })}</ul>
      </section>
      <section className="space-y-3"><h2 className="text-2xl">Create something new</h2><CreatorStudio /></section>
    </article>
  );
}
