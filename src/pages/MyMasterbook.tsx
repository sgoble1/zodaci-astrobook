import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { CreatorStudio } from '@/components/payments/CreatorStudio';

type Chapter = { id: string; title: string; content: string; created_at: string };
type Episode = { id: string; title: string; file_path: string; created_at: string; url?: string };

/** The member's own Masterbook: readable on Full Access or Creator (enforced by the database), written by Creator Studio. */
export default function MyMasterbook() {
  const sub = useSubscription();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!sub.userId) return;
    const { data } = await supabase.from('generated_pages').select('id,title,content,created_at').eq('owner_id', sub.userId).eq('section', 'My Masterbook').order('created_at', { ascending: false });
    setChapters((data ?? []) as Chapter[]);
    const { data: eps } = await supabase.from('library_items').select('id,title,file_path,created_at').eq('owner_id', sub.userId).eq('kind', 'podcast').eq('category', 'My episodes').order('created_at', { ascending: false });
    const withUrls = await Promise.all(((eps ?? []) as Episode[]).map(async e => ({ ...e, url: (await supabase.storage.from('library').createSignedUrl(e.file_path, 3600)).data?.signedUrl })));
    setEpisodes(withUrls);
  }, [sub.userId]);
  useEffect(() => { if (sub.tier !== 'free') load(); }, [sub.tier, load]);

  if (sub.loading) return null;
  if (!sub.userId || sub.tier === 'free') return (
    <article className="mx-auto max-w-xl space-y-4 py-12 text-center">
      <h1 className="font-display text-3xl">Your Masterbook</h1>
      <p className="text-muted-foreground">A full book written from your own chart. It unlocks with Full Access ($12.99/month); the Creator plan ($14.99/month) also lets you write new chapters and podcasts.</p>
      <Button asChild><Link to={sub.userId ? '/pricing' : '/auth'}>{sub.userId ? 'See plans' : 'Sign in'}</Link></Button>
    </article>
  );

  const current = chapters.find(c => c.id === open);
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header><h1 className="font-display text-4xl">My Masterbook</h1><p className="text-muted-foreground">Chapters and episodes written from your own chart.</p></header>
      <CreatorStudio onMade={load} />
      {current ? (
        <section className="parchment p-6 space-y-4">
          <Button variant="outline" size="sm" onClick={() => setOpen(null)}>← All chapters</Button>
          <h2 className="text-3xl">{current.title}</h2>
          <div className="prose prose-sm max-w-none dark:prose-invert"><ReactMarkdown>{current.content}</ReactMarkdown></div>
        </section>
      ) : (
        <section aria-labelledby="ch-h" className="space-y-3">
          <h2 id="ch-h" className="text-2xl">Chapters</h2>
          {chapters.length ? <ul className="grid gap-3 sm:grid-cols-2">{chapters.map(c => <li key={c.id}><button onClick={() => setOpen(c.id)} className="parchment w-full p-4 text-left hover:border-gold focus-visible:outline focus-visible:outline-2"><div className="font-medium">{c.title}</div><div className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</div></button></li>)}</ul>
            : <p className="text-sm text-muted-foreground">No chapters yet.{sub.tier === 'creator' ? ' Write your first one above.' : ''}</p>}
        </section>
      )}
      {episodes.length > 0 && <section aria-labelledby="ep-h" className="space-y-3"><h2 id="ep-h" className="text-2xl">My episodes</h2>
        {episodes.map(e => <div key={e.id} className="parchment p-4 space-y-2"><div className="font-medium">{e.title}</div>{e.url && <audio controls preload="none" src={e.url} className="w-full" aria-label={e.title} />}</div>)}
      </section>}
    </article>
  );
}
