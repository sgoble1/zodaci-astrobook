import { withPlates } from '@/content/plates';
import { BookmarkButton } from '@/components/common/BookmarkButton';
import { loadProtectedJson, loadProtectedText } from '@/lib/protectedContent';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen } from 'lucide-react';

type Entry = { id: string; title: string; part?: string; words?: number };
let indexCache: Promise<Entry[]> | null = null;
const loadIndex = () => (indexCache ??= loadProtectedJson<Entry[]>('masterbook', 'index.json').catch(e => { indexCache = undefined; throw e; }));
const textCache = new Map<string, Promise<string>>();
const loadText = (id: string) => {
  if (!textCache.has(id)) textCache.set(id, loadProtectedText('masterbook', `${id}.md`).then(withPlates).catch(() => ''));
  return textCache.get(id) ?? Promise.resolve('');
};

/**
 * Renders the full text of every Masterbook chapter whose title matches `match`,
 * each as its own section with a jump menu and a link back to the chapter.
 */
export function SourceChapters({ match, ids = [], title = 'The full text from the sources', exclude, limit = 40 }: { match?: RegExp; ids?: string[]; title?: string; exclude?: RegExp; limit?: number }) {
  const [items, setItems] = useState<(Entry & { text: string })[] | null>(null);
  useEffect(() => {
    let live = true;
    loadIndex().then(async idx => {
      const selected = new Set(ids);
      const hits = idx.filter(e => (selected.has(e.id) || (match?.test(e.title) ?? false)) && !(exclude && exclude.test(e.title))).slice(0, limit);
      const texts = await Promise.all(hits.map(h => loadText(h.id)));
      if (live) setItems(hits.map((h, i) => ({ ...h, text: texts[i].replace(/^#\s.*\n/, '') })));
    });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match?.source, ids.join('|'), exclude?.source]);

  if (!items) return <p className="text-sm text-muted-foreground">Loading the source chapters…</p>;
  if (!items.length) return null;
  return (
    <section className="space-y-6">
      <div>
        <div className="font-smallcaps text-[11px] text-gold">From the Masterbook · {items.length} {items.length === 1 ? 'chapter' : 'chapters'}</div>
        <h2 className="font-display mt-1">{title}</h2>
        <div className="gold-rule my-4 max-w-xs" />
      </div>
      {items.length > 1 && (
        <nav className="vellum p-4 flex flex-wrap gap-2 text-xs">
          {items.map(it => <a key={it.id} href={`#src-${it.id}`} className="px-3 py-1 rounded-full border border-border hover:border-accent">{it.title}</a>)}
        </nav>
      )}
      {items.map(it => (
        <article key={it.id} id={`src-${it.id}`} className="vellum p-6 sm:p-8 scroll-mt-20 gentle-fade">
          <div className="text-xs text-muted-foreground">{it.part}</div>
          <h3 className="font-display text-2xl mt-1 mb-4">{it.title}</h3>
          <div className="mb-prose"><ReactMarkdown remarkPlugins={[remarkGfm]}>{it.text}</ReactMarkdown></div>
          <div className="flex flex-wrap gap-4 mt-4"><Link to={`/masterbook/${it.id}`} className="inline-flex items-center gap-1 text-xs underline"><BookOpen className="w-3 h-3" />Open this chapter in the Masterbook</Link><BookmarkButton compact path={`/masterbook/${it.id}`} label={it.title} /></div>
        </article>
      ))}
    </section>
  );
}
