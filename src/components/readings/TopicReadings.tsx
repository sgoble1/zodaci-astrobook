import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BoxArt } from '@/components/common/BoxArt';
import { loadMyTopicReadings, TOPIC_READINGS, writeTopicReading, type TopicRow } from '@/lib/topicReadings';

/** Writes each in-depth reading once, one at a time, and stops on the first failure. */
export function TopicReadings({ seed }: { seed: string }) {
  const [rows, setRows] = useState<TopicRow[] | null>(null);
  const [writing, setWriting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const started = useRef(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => { supabase.auth.getSession().then(({ data }) => { setSignedIn(!!data.session); if (data.session) loadMyTopicReadings().then(setRows).catch(() => setRows([])); }); }, []);
  useEffect(() => {
    if (!rows || started.current) return;
    started.current = true;
    (async () => {
      for (const t of TOPIC_READINGS) {
        if (rows.some(r => r.page_key === `topic-${t.slug}`)) continue;
        setWriting(t.title);
        const { data: s } = await supabase.auth.getSession();
        if (!s.session) { setError('Please sign in to keep writing your readings.'); break; }
        try { await writeTopicReading(t.slug); setRows(await loadMyTopicReadings()); }
        catch (e) { setError((e as Error).message); break; }
      }
      setWriting(null);
    })();
  }, [rows]);
  const done = (slug: string) => rows?.find(r => r.page_key === `topic-${slug}`);
  if (signedIn === false) return <p className="text-sm text-muted-foreground">Sign in to get your in-depth topic readings.</p>;
  return (
    <section aria-labelledby="deep-h" className="space-y-4">
      <h2 id="deep-h" className="font-display text-3xl">In-depth topic readings</h2>
      <p className="max-w-2xl text-sm text-muted-foreground">Long chapters written from your own calculated chart: each one looks at the signs, houses, links between planets and their rulers that apply to that topic.</p>
      {writing && <p role="status" className="text-sm">Writing “{writing}” for your chart… this takes about a minute per reading. You can keep browsing.</p>}
      {error && <p role="alert" className="text-sm text-destructive">Paused: {error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOPIC_READINGS.map(t => { const r = done(t.slug); return r ? (
          <Link key={t.slug} to={`/my-readings/topic/${t.slug}`} className="block overflow-hidden rounded-lg border border-border bg-card hover:border-primary focus-visible:outline focus-visible:outline-2">
            <BoxArt seed={`${seed}-${t.slug}`} label={t.title} className="aspect-[16/9] w-full" />
            <div className="p-4"><h3 className="font-display text-lg">{t.title}</h3><p className="text-xs text-muted-foreground">{Math.round(r.content.split(/\s+/).length / 230)} min read</p></div>
          </Link>
        ) : (
          <div key={t.slug} className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground"><h3 className="font-display text-lg text-foreground">{t.title}</h3>{writing === t.title ? 'Writing now…' : 'Waiting to be written'}</div>
        ); })}
      </div>
    </section>
  );
}
