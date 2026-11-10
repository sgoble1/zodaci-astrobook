import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bookmark, Check, Link2 } from 'lucide-react';
import { READING_ROOM, READING_ROOM_HERO, ROOM_CATEGORIES, type RoomArticle } from '@/content/readingRoom';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useJsonLd } from '@/hooks/useJsonLd';
import { useSession } from '@/hooks/useLibrary';
import { useBookmarks } from '@/hooks/useBookmarks';
import { NavigatedProse } from '@/components/readings/NavigatedProse';
import { roomReadingContent } from '@/content/readingRoomDepth';

/** Public Reading Room: seven storybook-illustrated guides to reading a chart. */
export default function ReadingRoom() {
  usePageMeta('The Reading Room | Zodaci', 'Seven illustrated guides to the Big Three, houses, retrogrades, Moon phases, transits and reading your own chart.');
  const [cat, setCat] = useState<string | null>(null);
  const shown = READING_ROOM.filter(a => !cat || a.category === cat);
  return (
    <div className="space-y-10">
      <header className="relative -mx-5 overflow-hidden rounded-sm sm:-mx-10">
        <img src={READING_ROOM_HERO} alt="A lantern-lit reading room under a night sky full of constellations" width={1600} height={900} className="h-72 w-full object-cover sm:h-96" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 p-6 sm:p-10">
          <div className="font-label text-xs tracking-[0.16em] text-primary">Zodaci · The Reading Room</div>
          <h1 className="mt-2 text-4xl sm:text-6xl">The Reading Room</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">Short, illustrated guides that teach you to read your own sky — one idea at a time.</p>
        </div>
      </header>
      <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
        {[null, ...ROOM_CATEGORIES].map(c => <Button key={c ?? 'all'} size="sm" variant={cat === c ? 'secondary' : 'outline'} aria-pressed={cat === c} onClick={() => setCat(c)} className="rounded-full">{c ?? 'All'}</Button>)}
      </div>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map(a => <li key={a.slug}><ArticleCard a={a} /></li>)}
      </ul>
    </div>
  );
}

function ArticleCard({ a }: { a: RoomArticle }) {
  return (
    <Link to={`/reading-room/${a.slug}`} className="group block h-full overflow-hidden rounded-sm border border-gold/30 bg-card/60 transition hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <img src={a.image} alt="" loading="lazy" decoding="async" width={800} height={450} className="aspect-video w-full object-cover" />
      <div className="space-y-2 p-5">
        <div className="font-label text-xs tracking-[0.16em] text-primary">{a.category} · {a.minutes} min read</div>
        <h2 className="text-xl leading-snug">{a.title}</h2>
        <p className="text-sm text-muted-foreground">{a.glance}</p>
      </div>
    </Link>
  );
}

/** One Reading Room article: At a glance, plain explanation, Words to know (tap for meaning), Try this. */
export function ReadingRoomArticle() {
  const { slug } = useParams();
  const a = READING_ROOM.find(x => x.slug === slug);
  usePageMeta(a ? `${a.title} | Zodaci Reading Room` : 'Article not found | Zodaci', a?.glance ?? 'Zodaci Reading Room');
  useJsonLd('article-schema', a ? { '@type': 'Article', headline: a.title, description: a.glance, author: { '@type': 'Organization', name: 'Zodaci' }, mainEntityOfPage: `https://zodaci.com/reading-room/${a.slug}` } : null);
  const session = useSession();
  const bookmarks = useBookmarks();
  const [saving, setSaving] = useState(false);
  const bookmarked = bookmarks.items.some(item => item.path === `/reading-room/${slug}`);
  const content = useMemo(() => a ? roomReadingContent(a) : '', [a]);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState<'idle' | 'saved' | 'error'>('idle');
  const related = useMemo(() => READING_ROOM.filter(x => x.slug !== slug).sort((x, y) => Number(y.category === a?.category) - Number(x.category === a?.category)).slice(0, 3), [slug, a?.category]);
  if (!a) return <div><h1 className="text-3xl">Article not found</h1><Link to="/learn#guides" className="underline">Back to Learn</Link></div>;
  const share = async () => { try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ } };
  const save = async () => {
    if (!session) return;
    setSaving(true);
    try { await bookmarks.add(`/reading-room/${a.slug}`, a.title); setSaved('saved'); }
    catch { setSaved('error'); }
    finally { setSaving(false); }
  };
  return (
    <>
      <article className="mx-auto max-w-5xl space-y-8">
        <Link to="/learn#guides" className="text-sm text-accent underline">← Guides in Learn</Link>
        <img src={a.image} alt="" width={1600} height={900} className="aspect-video w-full rounded-sm object-cover" />
        <header className="space-y-2">
          <div className="font-label text-xs tracking-[0.16em] text-primary">{a.category} · {a.minutes} min read</div>
          <h1 className="text-4xl sm:text-5xl">{a.title}</h1>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={share}>{copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}{copied ? 'Link copied' : 'Copy link'}</Button>
            {session ? <Button size="sm" variant="outline" onClick={save} disabled={saving || bookmarked || saved === 'saved'}><Bookmark className="h-4 w-4" />{saving ? 'Saving…' : bookmarked || saved === 'saved' ? 'Saved to bookmarks' : saved === 'error' ? 'Could not save — try again' : 'Save for later'}</Button>
              : <Button size="sm" variant="ghost" asChild><Link to={`/auth?next=/reading-room/${a.slug}`}>Sign in to save</Link></Button>}
          </div>
        </header>
        <NavigatedProse content={content} path={`/reading-room/${a.slug}`} title={a.title} />
        <div className="flex flex-wrap gap-3"><Button asChild><Link to={session ? '/my-chart' : '/start'}>See this in your own chart</Link></Button></div>
        <section aria-labelledby="rel-h" className="border-t border-border pt-8"><h2 id="rel-h" className="text-2xl">Keep reading</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-3">{related.map(r => <li key={r.slug}><ArticleCard a={r} /></li>)}</ul>
          <p className="mt-6 text-sm text-muted-foreground">Want longer essays? <Link to="/learn#articles" className="text-accent underline underline-offset-2">Read the articles in Learn</Link>.</p>
        </section>
      </article>
    </>
  );
}
