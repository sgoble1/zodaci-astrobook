import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { loadMyTopicReadings, TOPIC_READINGS, CORE_THEMES, writeTopicReading, type TopicRow } from '@/lib/topicReadings';
import { ThemeArt } from '@/components/common/ThemeArt';

const slugify = (s: string) => s.toLowerCase().replace(/[*_`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function MyTopicReading({ slugOverride }: { slugOverride?: string } = {}) {
  const params = useParams();
  const slug = slugOverride ?? params.slug;
  const meta = [...TOPIC_READINGS, ...CORE_THEMES].find(t => t.slug === slug);
  const [row, setRow] = useState<TopicRow | null | undefined>(undefined);
  useEffect(() => { loadMyTopicReadings().then(rs => setRow(rs.find(r => r.page_key === `topic-${slug}`) ?? null)); }, [slug]);
  const [busy, setBusy] = useState(false);
  const rewrite = async () => {
    if (!slug || !confirm('Rewrite this reading from your chart? The current text will be replaced.')) return;
    setBusy(true);
    try {
      const before = row?.updated_at;
      await writeTopicReading(slug, { regenerate: true });
      let fresh: TopicRow | null = null;
      for (let i = 0; i < 24 && !fresh; i++) {
        await new Promise(r => setTimeout(r, 10000));
        const rs = await loadMyTopicReadings().catch(() => []);
        const r = rs.find(x => x.page_key === `topic-${slug}`);
        if (r && r.updated_at !== before) fresh = r;
      }
      if (fresh) { setRow(fresh); toast.success('Reading rewritten'); } else toast.error('The rewrite is taking longer than expected. Check back in a few minutes.');
    }
    catch (e) { toast.error((e as Error).message); }
    setBusy(false);
  };
  const sections = row ? [...row.content.matchAll(/^##\s+(.+)$/gm)].map(m => m[1].replace(/[*_`]/g, '').trim()) : [];
  if (row === undefined) return <div role="status" aria-label="Loading reading" className="mx-auto max-w-3xl space-y-3">{[0,1,2,3].map(i => <div key={i} className="h-6 animate-pulse rounded bg-muted" />)}</div>;
  return (
    <article className="mx-auto max-w-6xl space-y-8">
      <Link to="/my-readings" className="text-sm text-muted-foreground hover:text-foreground">← My readings</Link>
      <header className="vellum flex flex-wrap items-center gap-6 p-6 sm:p-8">
        <ThemeArt label={`${meta?.title ?? ''} ${slug}`} className="h-24 w-24" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-smallcaps text-xs text-gold">Your reading{row ? ` · ${Math.max(1, Math.round(row.content.split(/\s+/).length / 230))} min read · ${sections.length} sections` : ''}</p>
          <h1 className="font-display text-4xl sm:text-5xl">{meta?.title ?? 'Reading'}</h1>
          <p className="text-sm text-muted-foreground">Written from your own birth chart.</p>
        </div>
        {row && <Button variant="outline" size="sm" onClick={rewrite} disabled={busy}>{busy ? 'Rewriting… about a minute' : 'Rewrite this reading'}</Button>}
      </header>
      {row ? <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="reading-prose"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{ h2: ({ children }) => <h2 id={slugify(String(children))}>{children}</h2> }}>{row.content}</ReactMarkdown></div>
        {sections.length > 1 && <nav aria-label="In this reading" className="order-first lg:order-none"><div className="vellum space-y-2 p-4 lg:sticky lg:top-24"><p className="font-smallcaps text-xs text-gold">In this reading</p><ol className="space-y-1.5 text-sm">{sections.map((s, i) => <li key={s}><a href={`#${slugify(s)}`} className="flex gap-2 text-muted-foreground hover:text-foreground"><span className="text-gold">{String(i + 1).padStart(2, '0')}</span><span>{s}</span></a></li>)}</ol></div></nav>}
      </div>
        : <div className="rounded-lg border border-dashed border-border p-5 space-y-3"><p className="text-muted-foreground">This reading hasn’t been written yet. Free accounts include two full readings (Your Big Three and Personality & Strengths); Full Access writes every reading from your chart.</p><Button asChild size="sm"><Link to="/pricing">See Full Access</Link></Button></div>}
    </article>
  );
}
