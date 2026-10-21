import { useEffect, useState } from 'react';
import { readingMatches, type ReadingFilter } from '@/lib/topicReadings';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BoxArt } from '@/components/common/BoxArt';
import { FREE_READINGS, loadMyTopicReadings, TOPIC_READINGS, type TopicRow } from '@/lib/topicReadings';
import { usePlan } from '@/hooks/usePlan';
import { Lock } from 'lucide-react';

/** Writes each in-depth reading once, one at a time, and stops on the first failure. */
export function TopicReadings({ seed, filter = null }: { seed: string; filter?: ReadingFilter | null }) {
  const [all, setAll] = useState(false);
  const [rows, setRows] = useState<TopicRow[] | null>(null);
  const [writing, setWriting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const { plan } = usePlan();
  const isLocked = (slug: string) => plan === 'free' && !FREE_READINGS.includes(slug);
  const ordered = [...TOPIC_READINGS].sort((a, b) => Number(isLocked(a.slug)) - Number(isLocked(b.slug)));
  useEffect(() => { supabase.auth.getSession().then(({ data }) => { setSignedIn(!!data.session); if (data.session) loadMyTopicReadings().then(setRows).catch(() => setRows([])); }); }, []);
  useEffect(() => {
    if (!rows) return;
    const timer = setInterval(async () => {
      const next = await loadMyTopicReadings().catch(() => null);
      if (!next) return;
      setRows(next);
      const left = TOPIC_READINGS.filter(t => !next.some(r => r.page_key === `topic-${t.slug}`));
      setWriting(left[0]?.title ?? null);
      if (!left.length) clearInterval(timer);
    }, 20000);
    return () => clearInterval(timer);
  }, [rows !== null]); // eslint-disable-line react-hooks/exhaustive-deps
  const done = (slug: string) => rows?.find(r => r.page_key === `topic-${slug}`);
  if (signedIn === false) return <p className="text-sm text-muted-foreground">Sign in to get your in-depth topic readings.</p>;
  return (
    <section id="topics" aria-labelledby="deep-h" className="scroll-mt-24 space-y-4">
      <h2 id="deep-h" className="font-display text-3xl">In-depth topic readings</h2>
      <p className="max-w-2xl text-sm text-muted-foreground">Long chapters written from your own calculated chart: each one looks at the signs, houses, links between planets and their rulers that apply to that topic.</p>
      {writing && <p role="status" className="text-sm">Pages still being written are tracked in the progress bar at the top of the screen.</p>}
      {plan === 'free' && <p className="text-sm">Your free plan includes <strong>Your Big Three</strong> and <strong>Personality & Strengths</strong>. Readings marked with a lock unlock with <Link to="/pricing" className="text-primary underline">Pro</Link>.</p>}
      {error && <p role="alert" className="text-sm text-destructive">Paused: {error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.filter(t => readingMatches(t.slug, filter)).slice(0, all || filter ? undefined : 8).map(t => { const r = done(t.slug); if (isLocked(t.slug)) return (
          <Link key={t.slug} to="/pricing" className="flex flex-col gap-1 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground opacity-70 hover:opacity-100"><h3 className="font-display text-lg text-foreground">{t.title}</h3><span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" aria-hidden="true" /> Unlock with Pro</span></Link>
        ); return r ? (
          <Link key={t.slug} to={`/my-readings/topic/${t.slug}`} className="block overflow-hidden rounded-lg border border-border bg-card hover:border-primary focus-visible:outline focus-visible:outline-2">
            <BoxArt seed={`${seed}-${t.slug}`} label={t.title} className="aspect-[16/9] w-full" />
            <div className="p-4"><h3 className="font-display text-lg">{t.title}</h3><p className="text-xs text-muted-foreground">{Math.round(r.content.split(/\s+/).length / 230)} min read</p></div>
          </Link>
        ) : (
          <div key={t.slug} className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground"><h3 className="font-display text-lg text-foreground">{t.title}</h3>{writing === t.title ? 'Writing now…' : 'Waiting to be written'}</div>
        ); })}
      </div>
      {!all && !filter && ordered.length > 8 && <button type="button" onClick={() => setAll(true)} className="text-sm text-primary underline underline-offset-2">Show all {ordered.length} topics</button>}
    </section>
  );
}
