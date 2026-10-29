import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { NavigatedProse } from '@/components/readings/NavigatedProse';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { getStripeEnvironment } from '@/lib/stripe';
import { CreatorStudio } from '@/components/payments/CreatorStudio';
import { STARTER_CHAPTERS, STARTER_EVENT } from '@/lib/starterChapters';
import { usePlan } from '@/hooks/usePlan';

const STARTER = STARTER_CHAPTERS;

type Chapter = { id: string; title: string; content: string; created_at: string };
type Episode = { id: string; title: string; file_path: string; created_at: string; url?: string };

/** The member's own Masterbook: readable on Pro or Cosmic (enforced by the database), written by Cosmic Studio. */
export default function MyMasterbook() {
  const sub = useSubscription();
  const effective = usePlan();
  const revision = useRef(0);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [writing, setWriting] = useState<string | null>(null);
  const [startErr, setStartErr] = useState('');

  const load = useCallback(async () => {
    const version = ++revision.current;
    if (!sub.userId) { setChapters([]); setEpisodes([]); return; }
    setLoading(true); setLoadError('');
    try {
      const [{ data, error }, { data: eps, error: episodeError }] = await Promise.all([
        supabase.from('generated_pages').select('id,title,content,created_at').eq('owner_id', sub.userId).eq('section', 'My Masterbook').eq('status', 'ready').order('created_at', { ascending: false }),
        supabase.from('library_items').select('id,title,file_path,created_at').eq('owner_id', sub.userId).eq('kind', 'podcast').eq('category', 'My episodes').order('created_at', { ascending: false }),
      ]);
      if (error || episodeError) throw new Error('Your chapters and episodes could not load.');
      const withUrls = await Promise.all(((eps ?? []) as Episode[]).map(async e => {
        const signed = await supabase.storage.from('library').createSignedUrl(e.file_path, 3600);
        if (signed.error) throw new Error('An episode could not open.');
        return { ...e, url: signed.data?.signedUrl };
      }));
      if (version !== revision.current) return;
      setChapters(data ?? []); setEpisodes(withUrls);
    } catch (e) { if (version === revision.current) setLoadError(e instanceof Error ? e.message : 'Your library could not load.'); }
    finally { if (version === revision.current) setLoading(false); }
  }, [sub.userId]);
  useEffect(() => { setChapters([]); setEpisodes([]); setOpen(null); if (effective.plan !== 'free') void load(); return () => { revision.current++; }; }, [effective.plan, load]);
  useEffect(() => {
    const update = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail?.writing) setWriting(detail.writing);
      if (detail?.saved || detail?.done || detail?.error) void load();
      if (detail?.done || detail?.error) setWriting(null);
      if (detail?.error) setStartErr(detail.error);
    };
    window.addEventListener(STARTER_EVENT, update);
    return () => window.removeEventListener(STARTER_EVENT, update);
  }, [load]);

  // Ready-made chapters: written one at a time the first time a subscriber opens their Masterbook.
  const writeStarter = async () => {
    setStartErr('');
    for (const t of STARTER) {
      if (chapters.some(c => c.title === t)) continue;
      setWriting(t);
      const { data, error } = await supabase.functions.invoke('creator-studio', { body: { kind: 'starter', topic: t, environment: getStripeEnvironment() } });
      if (error || data?.error) { setStartErr(data?.error || 'A chapter could not be written. Please try again.'); break; }
      await load();
    }
    setWriting(null);
  };
  const missing = STARTER.filter(t => !chapters.some(c => c.title === t));

  if (sub.loading || effective.loading) return <p role="status" className="text-muted-foreground">Opening your Masterbook…</p>;
  if (!sub.userId || effective.plan === 'free') return (
    <article className="mx-auto max-w-xl space-y-4 py-12 text-center">
      <h1 className="font-display text-3xl">Your Masterbook</h1>
      <p className="text-muted-foreground">A full book written from your own chart. It unlocks with Pro ($9/month); the Cosmic plan ($19/month) also lets you write new chapters and podcasts.</p>
      <Button asChild><Link to={sub.userId ? '/pricing' : '/auth'}>{sub.userId ? 'See plans' : 'Sign in'}</Link></Button>
    </article>
  );

  const current = chapters.find(c => c.id === open);
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header><h1 className="font-display text-4xl">My Masterbook</h1><p className="text-muted-foreground">Chapters and episodes written from your own chart.</p></header>
      {loading && <p role="status" className="text-muted-foreground">Loading your chapters and episodes…</p>}
      {loadError && <div role="alert" className="space-y-2"><p className="text-destructive">{loadError}</p><Button variant="outline" onClick={() => void load()}>Retry library</Button></div>}
      {missing.length > 0 && <section className="parchment p-5 space-y-2" aria-labelledby="starter-h">
        <h2 id="starter-h" className="text-xl">Your ready-made chapters</h2>
        <p className="text-sm text-muted-foreground" role="status">Your {STARTER.length} chapters, including Sex & Attraction, are written automatically after your birth details are saved and your plan is active. {missing.length} still to write.{writing ? ` Writing “${writing}”…` : ''}</p>
        <Button onClick={writeStarter} disabled={!!writing || loading}>{startErr ? 'Resume my chapters' : 'Write missing chapters'}</Button>
        {startErr && <p className="text-sm text-destructive" role="alert">{startErr}</p>}
      </section>}
      <CreatorStudio onMade={load} />
      {current ? (
        <section className="parchment p-6 space-y-4">
          <Button variant="outline" size="sm" onClick={() => setOpen(null)}>← All chapters</Button>
          <h2 className="text-3xl">{current.title}</h2>
          <NavigatedProse content={current.content} path="/my-masterbook" title={current.title} />
        </section>
      ) : (
        <section aria-labelledby="ch-h" className="space-y-3">
          <h2 id="ch-h" className="text-2xl">Chapters</h2>
          {chapters.length ? <ul className="grid gap-3 sm:grid-cols-2">{chapters.map(c => <li key={c.id}><button onClick={() => setOpen(c.id)} className="parchment w-full p-4 text-left hover:border-gold focus-visible:outline focus-visible:outline-2"><div className="font-medium">{c.title}</div><div className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</div></button></li>)}</ul>
            : <p className="text-sm text-muted-foreground">No chapters yet.{sub.tier && sub.tier !== 'free' ? ' Write your first one above.' : ''}</p>}
        </section>
      )}
      {episodes.length > 0 && <section aria-labelledby="ep-h" className="space-y-3"><h2 id="ep-h" className="text-2xl">My episodes</h2><p className="text-sm text-muted-foreground">Also in <Link to="/podcasts" className="underline">Podcasts</Link> → your private library, with queue and speed controls.</p>
        {episodes.map(e => <div key={e.id} className="parchment p-4 space-y-2"><div className="font-medium">{e.title}</div>{e.url && <audio controls preload="none" src={e.url} className="w-full" aria-label={e.title} />}</div>)}
      </section>}
    </article>
  );
}
