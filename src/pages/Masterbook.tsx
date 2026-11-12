import { LoadFailed } from '@/components/common/LoadFailed';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useLibrary } from '@/hooks/useLibrary';
import { ACCESS_CHANGED_EVENT, loadProtectedJson } from '@/lib/protectedContent';
import { onAccountChange } from '@/lib/authEvents';
import { useOwnsEdition } from '@/lib/editionSharing';
import { EditionSharingPanel, SharedByNote } from '@/components/sharing/EditionSharing';
import { CATEGORIES, catsFor } from '@/lib/chapterTopics';
import { ArrangeToggle, ChapterCard, ChapterPart, TopicFilter } from '@/components/observatory/EditionPieces';

export type MbEntry = { id: string; label: string; title: string; part: string; words: number; sections: string[]; excerpt: string; doc?: string; page?: number };

let cache: Promise<MbEntry[]> | null = null;
export const loadIndex = () => (cache ??= loadProtectedJson<MbEntry[]>('masterbook', 'index.json').catch(e => { cache = null; throw e; }));
onAccountChange(() => { cache = null; });
if (typeof window !== 'undefined') window.addEventListener(ACCESS_CHANGED_EVENT, () => { cache = null; });

export { CATEGORIES, catsFor } from '@/lib/chapterTopics';

export default function Masterbook() {
  const [entries, setEntries] = useState<MbEntry[]>([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string | null>(null);
  const [view, setView] = useState<'parts' | 'topics'>('parts');
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => { setFailed(false); loadIndex().then(setEntries).catch(() => setFailed(true)); }, [attempt]);
  const parts = useMemo(() => {
    const m = new Map<string, MbEntry[]>();
    entries.filter(e => (!cat || catsFor(e).includes(cat)) && (e.title + e.label + e.sections.join(' ') + e.excerpt).toLowerCase().includes(q.toLowerCase()))
      .forEach(e => { const keys = view === 'parts' ? [e.part] : (catsFor(e).length ? catsFor(e) : ['Other']); keys.forEach(k => m.set(k, [...(m.get(k) ?? []), e])); });
    return view === 'parts' ? [...m.entries()] : [...m.entries()].sort((a, b) => { const o = (k: string) => { const i = CATEGORIES.findIndex(c => c[0] === k); return i < 0 ? 99 : i; }; return o(a[0]) - o(b[0]); });
  }, [entries, q, cat, view]);
  const uploads = useLibrary('masterbook');
  const owns = useOwnsEdition('april');
  const total = entries.reduce((a, e) => a + e.words, 0);

  return (
    <div className="space-y-10">
      <header>
        <div className="font-label text-xs tracking-[0.16em] text-primary">The Masterbook · complete text</div>
        <h1 className="text-4xl sm:text-5xl mt-2">April’s Astrological Masterbook</h1>
        {owns === false && <div className="mt-3"><SharedByNote ownerName="April" scope="edition" /></div>}
        <p className="text-muted-foreground mt-3 max-w-2xl">Every chapter, appendix, extended analysis and illustration plate from the Masterbook, reproduced in full{entries.length ? ` — ${entries.length} sections, about ${Math.round(total / 1000)}k words` : ''}. Pick any entry to read it.</p>
        <div className="flex flex-wrap gap-4 text-sm mt-3"><Link to="/masterbook/index" className="underline">Document index — every source & section</Link><Link to="/masterbook/upload" className="underline">Upload your own PDFs & spreadsheets</Link><Link to="/reading" className="underline">The complete reading</Link><Link to="/chart-calculator" className="underline">Chart calculator</Link><Link to="/feng-shui/bagua" className="underline">Feng Shui · Bagua & home</Link><Link to="/feng-shui/flying-stars" className="underline">Feng Shui · Flying Stars</Link></div>
        <Input aria-label="Search chapters and sections" placeholder="Search chapter titles and section headings…" value={q} onChange={e => setQ(e.target.value)} className="max-w-md mt-4" />
        <div className="mt-4"><ArrangeToggle value={view} onChange={setView} /></div>
        <div className="mt-3"><TopicFilter entries={entries} value={cat} onChange={setCat} /></div>
      </header>
      {owns && <EditionSharingPanel edition="april" />}
      {failed && <LoadFailed what="The Masterbook contents" onRetry={() => setAttempt(a => a + 1)} />}
      {!failed && entries.length > 0 && parts.length === 0 && <p className="text-sm text-muted-foreground">No sections match. Clear the search or choose another topic.</p>}
      <div className="space-y-5">
        {parts.map(([part, list], idx) => (
          <ChapterPart key={part} title={part} count={list.length} open={idx === 0 || !!q || !!cat}>
            {list.map(e => <ChapterCard key={e.id} to={`/masterbook/${e.id}`} entry={e} seed={`april-${e.id}`} />)}
          </ChapterPart>
        ))}
      </div>
      {uploads.items.length > 0 && !cat && (
        <section>
          <h2 className="text-2xl mb-1">Your Uploaded Documents <span className="text-sm text-muted-foreground font-sans">· {uploads.items.length}</span></h2>
          <div className="gold-rule mb-4" />
          <div className="grid sm:grid-cols-2 gap-3">
            {uploads.items.filter(u => (u.title + (u.category ?? '')).toLowerCase().includes(q.toLowerCase())).map(u => {
              const secs = (u.sections as { title: string }[] | null) ?? [];
              return (
                <div key={u.id} className="parchment p-4">
                  <div className="font-label text-[10px] tracking-[0.14em] text-primary">{u.category} · {secs.length} sections</div>
                  <Link to={`/masterbook/u/${u.id}`} className="font-display text-lg leading-snug mt-1 block hover:underline">{u.title}</Link>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs">{secs.slice(0, 6).map((s, i) => <Link key={i} to={`/masterbook/u/${u.id}#s${i}`} className="text-muted-foreground hover:text-foreground underline">{s.title.slice(0, 40)}</Link>)}{secs.length > 6 && <span className="text-muted-foreground">+{secs.length - 6} more</span>}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
