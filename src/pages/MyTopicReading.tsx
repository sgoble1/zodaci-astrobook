import { confirmAction } from '@/components/common/ConfirmHost';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { loadMyTopicReadings, TOPIC_READINGS, CORE_THEMES, writeTopicReading, type TopicRow } from '@/lib/topicReadings';
import { ThemeArt } from '@/components/common/ThemeArt';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';
import { readingIsOlder, readingVisitKey } from '@/lib/readingExperience';
import { useOnDemandReading } from '@/hooks/useOnDemandReading';
import { FounderSourcePanel } from '@/components/readings/FounderSourcePanel';
import { ReadingNavigator } from '@/components/readings/ReadingNavigator';

const slugify = (s: string) => s.toLowerCase().replace(/[*_`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function MyTopicReading({ slugOverride }: { slugOverride?: string } = {}) {
  const params = useParams();
  const slug = slugOverride ?? params.slug;
  const meta = [...TOPIC_READINGS, ...CORE_THEMES].find(t => t.slug === slug);
  const { row, setRow, writing, error, locked, preview, retry } = useOnDemandReading(slug);
  const session = useSession();
  const [birthSavedAt, setBirthSavedAt] = useState<string | null>(null);
  useEffect(() => { if (session) void supabase.from('profiles').select('onboarded_at').eq('id', session.user.id).maybeSingle().then(({ data }) => setBirthSavedAt(data?.onboarded_at ?? null)); }, [session?.user.id]);
  useEffect(() => {
    if (!session || !row || !slug) return;
    const save = () => {
      const headings = Array.from(document.querySelectorAll<HTMLElement>('.reading-prose h2'));
      const current = headings.filter(h => h.getBoundingClientRect().top < window.innerHeight / 2).at(-1);
      localStorage.setItem(readingVisitKey(session.user.id), JSON.stringify({ path: `/my-readings/topic/${slug}`, title: meta?.title ?? row.title, section: current?.id ?? '', progress: Math.min(100, Math.round(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight) * 100)) }));
    };
    window.addEventListener('scroll', save, { passive: true }); save();
    return () => window.removeEventListener('scroll', save);
  }, [session?.user.id, row, slug]);
  const [busy, setBusy] = useState(false);
  const proseRef = useRef<HTMLDivElement>(null);
  const rewrite = async () => {
    if (!slug || !await confirmAction('Rewrite this reading from your chart? The current text will be replaced.')) return;
    setBusy(true);
    try {
      const before = row?.updated_at;
      await writeTopicReading(slug, { regenerate: true });
      let fresh: TopicRow | null = null;
      for (let i = 0; i < 24 && !fresh; i++) {
        await new Promise(r => setTimeout(r, 10000));
        const rs = await loadMyTopicReadings().catch(() => []);
        const r = rs.find(x => x.page_key === `topic-${slug}`);
        if (r?.status === 'failed') throw new Error('The rewrite could not finish. Please retry.');
        if (r && ['ready','hidden'].includes(r.status) && r.updated_at !== before) fresh = r;
      }
      if (fresh) { setRow(fresh); toast.success('Reading rewritten'); } else toast.error('The rewrite is taking longer than expected. Check back in a few minutes.');
    }
    catch (e) { toast.error((e as Error).message); }
    setBusy(false);
  };
  // Free previews show the placements table plus the first written section only, even for older full readings.
  const shown = row && preview ? row.content.split(/^(?=##\s)/m).filter(Boolean).slice(0, 2).join('') : row?.content ?? '';
  const sections = row ? [...row.content.matchAll(/^##\s+(.+)$/gm)].map(m => m[1].replace(/[*_`]/g, '').replace(/^\d+[.)]\s*/, '').trim()) : [];
  if (row === undefined) return <div role="status" aria-label="Loading reading" className="mx-auto max-w-3xl space-y-3">{[0,1,2,3].map(i => <div key={i} className="h-6 animate-pulse rounded bg-muted" />)}</div>;
  return (
    <article className="mx-auto max-w-6xl space-y-8">
      <Link to="/my-readings" className="text-sm text-muted-foreground hover:text-foreground">← My readings</Link>
      <header className="flex flex-wrap border-b border-border items-center gap-6 p-6 sm:p-8">
        <ThemeArt label={`${meta?.title ?? ''} ${slug}`} className="h-24 w-24" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-smallcaps text-xs text-gold">Your reading{row ? ` · ${Math.max(1, Math.round(row.content.split(/\s+/).length / 230))} min read · ${sections.length} sections` : ''}</p>
          <h1 className="font-display text-4xl sm:text-5xl">{meta?.title ?? 'Reading'}</h1>
          <p className="text-sm text-muted-foreground">Written from your own birth chart.</p>
        </div>
        {row && !preview && <Button variant="outline" size="sm" onClick={rewrite} disabled={busy}>{busy ? 'Rewriting…' : 'Rewrite this reading'}</Button>}
      </header>
      {row && !preview && readingIsOlder(row.updated_at, birthSavedAt) && <aside className="border-l-2 border-accent pl-4 text-sm text-muted-foreground">Your birth details changed after this reading was saved. Rewrite it to use your current chart; generation limits apply.</aside>}
      {row ? <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div>{!preview && sections.length > 1 && <ReadingNavigator variant="bar" sections={sections.map(t => ({ id: slugify(t), title: t }))} contentRef={proseRef} path={`/my-readings/topic/${slug}`} readingTitle={meta?.title ?? row.title} />}<div ref={proseRef} className="reading-prose"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{ h2: ({ children }) => { const t = String(Array.isArray(children) ? children.join('') : children).replace(/^\d+[.)]\s*/, ''); return <h2 id={slugify(t)}>{t}</h2>; } }}>{shown}</ReactMarkdown></div>
        {preview && <div className="relative mt-8">
          <div aria-hidden="true" className="pointer-events-none select-none space-y-4 opacity-60 blur-sm">
            {['How this shows up in daily life', 'Strengths & watch-outs', 'Practices to try', 'Reflection questions'].map(h => <div key={h} className="space-y-2"><p className="font-display text-2xl">{h}</p><div className="h-3 w-full rounded bg-muted" /><div className="h-3 w-11/12 rounded bg-muted" /><div className="h-3 w-4/5 rounded bg-muted" /></div>)}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-background/80 to-background">
            <div className="vellum max-w-md space-y-3 p-6 text-center">
              <p className="font-smallcaps text-xs text-gold">Preview · section 1 of 5</p>
              <p className="font-display text-2xl">Unlock the full deep dive</p>
              <p className="text-sm text-muted-foreground">Your chart has four more sections on daily life, strengths, watch-outs, practices and reflection questions.</p>
              <Button asChild><Link to={`/pricing?next=${encodeURIComponent(`/my-readings/topic/${slug}`)}`}>Upgrade to Pro — $9/mo</Link></Button>
            </div>
          </div>
        </div>}</div>
        {!preview && sections.length > 1 && <ReadingNavigator variant="side" sections={sections.map(t => ({ id: slugify(t), title: t }))} contentRef={proseRef} path={`/my-readings/topic/${slug}`} readingTitle={meta?.title ?? row.title} />}
      </div>
        : writing ? <div role="status" aria-live="polite" className="vellum flex items-center gap-4 p-6"><span className="h-8 w-8 shrink-0 animate-spin rounded-full border-4 border-primary/30 border-t-primary" aria-hidden="true" /><div><p className="font-medium">Writing this reading from your chart…</p><p className="text-sm text-muted-foreground">You can keep exploring. The finished reading saves to your account.</p></div></div>
        : error ? <div role="alert" className="rounded-lg border border-destructive/40 p-5 text-sm text-destructive">{error}<Button variant="outline" className="ml-3" onClick={retry}>Try again</Button></div>
        : locked ? <div className="rounded-lg border border-dashed border-border p-5 space-y-3"><p className="text-muted-foreground">This reading hasn’t been written yet. Free accounts include two full readings (Your Big Three and Personality & Strengths); Pro writes every reading from your chart.</p><Button asChild size="sm"><Link to={`/pricing?next=${encodeURIComponent(`/my-readings/topic/${slug}`)}`}>See Pro</Link></Button></div> : null}
      {slug && <FounderSourcePanel theme={slug} />}
    </article>
  );
}
