import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { loadMyTopicReadings, TOPIC_READINGS, CORE_THEMES, writeTopicReading, type TopicRow } from '@/lib/topicReadings';

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
  if (row === undefined) return <div role="status" aria-label="Loading reading" className="mx-auto max-w-3xl space-y-3">{[0,1,2,3].map(i => <div key={i} className="h-6 animate-pulse rounded bg-muted" />)}</div>;
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Link to="/my-readings" className="text-sm underline">← My readings</Link>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-display text-4xl">{meta?.title ?? 'Reading'}</h1>{row && <Button variant="outline" size="sm" onClick={rewrite} disabled={busy}>{busy ? 'Rewriting… about a minute' : 'Rewrite this reading'}</Button>}</div>
      {row ? <div className="prose prose-invert max-w-none [&_table]:block [&_table]:overflow-x-auto"><ReactMarkdown remarkPlugins={[remarkGfm]}>{row.content}</ReactMarkdown></div>
        : <div className="rounded-lg border border-dashed border-border p-5 space-y-3"><p className="text-muted-foreground">This reading hasn’t been written yet. Free accounts include two full readings (Your Big Three and Personality & Strengths); Full Access writes every reading from your chart.</p><Button asChild size="sm"><Link to="/pricing">See Full Access</Link></Button></div>}
    </article>
  );
}
