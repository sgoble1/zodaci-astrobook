import { withPlates } from '@/content/plates';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { type MbEntry } from './Masterbook';
import { loadProtectedJson, loadProtectedText } from '@/lib/protectedContent';
import { supabase } from '@/integrations/supabase/client';
import { PrivateEditionGate } from '@/components/common/PrivateEditionGate';
import { markdownSections, NavigatedProse } from '@/components/readings/NavigatedProse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** April's private reading room backed by the extracted Masterbook files: opens for her account and people she shared with. */
function ProtectedRoom({ children }: { children: React.ReactNode }) {
  const [owner, setOwner] = useState<string | null | undefined>(undefined);
  const location = useLocation();
  useEffect(() => {
    let active = true;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { if (active) setOwner(session?.user.id ?? null); });
    void supabase.auth.getSession().then(({ data }) => { if (active) setOwner(data.session?.user.id ?? null); });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  if (owner === undefined) return <Frame><p role="status">Opening the reading room…</p></Frame>;
  if (!owner) return <Frame><h1 className="font-display text-3xl">Private reading room</h1><p className="mt-3 text-muted-foreground">Sign in with your own account. These sources open only for their owner and the people she shares them with.</p><Button asChild className="mt-6"><Link to={`/auth?next=${encodeURIComponent(location.pathname + location.search + location.hash)}`}>Sign in</Link></Button></Frame>;
  return <PrivateEditionGate key={owner}>{children}</PrivateEditionGate>;
}

function useRoomIndex() {
  const [entries, setEntries] = useState<MbEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true; setLoading(true); setError(false);
    void loadProtectedJson<MbEntry[]>('masterbook', 'index.json').then(rows => { if (active) setEntries(rows); }).catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);
  return { entries, loading, error, retry: () => setAttempt(n => n + 1) };
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 px-6 py-4 flex items-center justify-between">
        <Link to="/read" className="font-display text-xl">Sources · Reading Room</Link>
        <Link to="/masterbook" className="text-xs text-muted-foreground hover:text-foreground">Open the Masterbook →</Link>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}

export function PublicLibrary() {
  return <ProtectedRoom><LibraryInner /></ProtectedRoom>;
}
function LibraryInner() {
  const { entries, loading, error, retry } = useRoomIndex();
  const [q, setQ] = useState('');
  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const m = new Map<string, MbEntry[]>();
    entries.filter(e => !needle || [e.title, e.label, e.part, ...e.sections].join(' ').toLowerCase().includes(needle))
      .forEach(e => m.set(e.part, [...(m.get(e.part) ?? []), e]));
    return [...m.entries()];
  }, [entries, q]);
  return (
    <Frame>
      <h1 className="font-display text-4xl mb-2">Every source, chapter and section</h1>
      <p className="text-muted-foreground mb-6">Browse and read all {entries.length} extracted chapters from the real Masterbook documents. This room and every chapter open only for the edition's owner and the people she shares it with.</p>
      <Input aria-label="Find a chapter or section" value={q} onChange={e => setQ(e.target.value)} placeholder="Find a chapter or section…" className="mb-8" />
      {loading && <p role="status">Opening the chapter index…</p>}
      {error && <div className="space-y-3"><p role="alert">The chapter index couldn’t be opened.</p><Button variant="outline" onClick={retry}>Try again</Button></div>}
      {!loading && !error && !groups.length && <p className="text-muted-foreground">{q ? 'No chapters match your search.' : 'No chapters are available.'}</p>}
      <nav className="flex flex-wrap gap-2 mb-8 text-xs" aria-label="Reading room sections">
        {groups.map(([part]) => <a key={part} href={`#${encodeURIComponent(part)}`} className="px-3 py-1 rounded-full border border-border hover:bg-muted">{part}</a>)}
      </nav>
      {groups.map(([part, list]) => (
        <section key={part} id={encodeURIComponent(part)} className="mb-10">
          <h2 className="font-display text-2xl mb-3">{part} <span className="text-sm text-muted-foreground">({list.length})</span> <Link to={`/read/document/${slugify(part)}`} className="ml-2 text-sm underline">Read the whole document →</Link></h2>
          <ol className="parchment divide-y divide-border/60">
            {list.map(e => (
              <li key={e.id} className="p-4">
                <Link to={`/read/${e.id}`} className="font-medium hover:underline">{e.title}</Link>
                <span className="text-xs text-muted-foreground ml-2">{e.label} · {e.words.toLocaleString()} words</span>
                {e.sections.length > 0 && <p className="text-xs text-muted-foreground mt-1">{e.sections.slice(0, 12).join(' · ')}</p>}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </Frame>
  );
}

export function PublicReader() {
  return <ProtectedRoom><ReaderInner /></ProtectedRoom>;
}
function ReaderInner() {
  const { id = '' } = useParams();
  const { entries, error, retry: retryIndex } = useRoomIndex();
  const [text, setText] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => { let active = true; setText(null); if (!window.location.hash) window.scrollTo(0, 0); void loadProtectedText('masterbook', `${id}.md`).then(t => { if (active) setText(withPlates(t)); }).catch(() => { if (active) setText(''); }); return () => { active = false; }; }, [id, attempt]);
  const i = entries.findIndex(e => e.id === id);
  const e = entries[i], prev = entries[i - 1], next = entries[i + 1];
  const body = (text ?? '').replace(/<!-- page (\d+) -->/g, (_m, n) => `\n\n###### Page ${n}\n\n`);
  return (
    <Frame>
      <Link to="/read" className="text-xs text-muted-foreground hover:text-foreground">← All sources</Link>
      {error && <Button variant="outline" className="mt-4" onClick={retryIndex}>Retry chapter index</Button>}
      {text === '' ? <div className="mt-6 space-y-3"><p role="alert">This chapter couldn’t be opened.</p><Button variant="outline" onClick={() => setAttempt(n => n + 1)}>Try again</Button></div> : <>
        {e && <div className="text-xs text-muted-foreground mt-4">{e.part}</div>}
        <h1 className="font-display text-3xl sm:text-4xl mt-2">{e?.label ?? 'Masterbook chapter'}</h1>
        <article className="mt-4">{text === null ? <p role="status">Loading chapter…</p> : <NavigatedProse content={body} path={`/read/${id}`} title={e?.title ?? 'Masterbook chapter'} headingLevel={markdownSections(body).length > 1 ? 2 : 3} />}</article>
        <div className="flex justify-between mt-10 text-sm">
          {prev ? <Link to={`/read/${prev.id}`} aria-label={`Previous chapter: ${prev.title}`} className="underline">← {prev.title}</Link> : <span />}
          {next ? <Link to={`/read/${next.id}`} aria-label={`Next chapter: ${next.title}`} className="underline">{next.title} →</Link> : <span />}
        </div>
      </>}
    </Frame>
  );
}

/** One whole Masterbook document (every chapter of a part) on a single page; text loads only for accounts with access. */
export function PublicDocument() {
  return <ProtectedRoom><DocumentInner /></ProtectedRoom>;
}
function DocumentInner() {
  const { slug = '' } = useParams();
  const { entries, loading, error, retry } = useRoomIndex();
  const [texts, setTexts] = useState<string[] | null>(null);
  const [attempt, setAttempt] = useState(0);
  const list = useMemo(() => entries.filter(e => slugify(e.part) === slug), [entries, slug]);
  useEffect(() => {
    let active = true; setTexts(null);
    if (list.length) void Promise.all(list.map(e => loadProtectedText('masterbook', `${e.id}.md`).then(withPlates).catch(() => ''))).then(rows => { if (active) setTexts(rows); });
    return () => { active = false; };
  }, [list, attempt]);
  const part = list[0]?.part;
  return (
    <Frame>
      <Link to="/read" className="text-xs text-muted-foreground hover:text-foreground">← All sources</Link>
      {loading ? <p role="status" className="mt-6">Opening the document index…</p> : error ? <div className="mt-6 space-y-3"><p role="alert">The document index couldn’t be opened.</p><Button variant="outline" onClick={retry}>Try again</Button></div> : !list.length ? <p className="mt-6">Document not found.</p> : <>
        <h1 className="font-display text-4xl mt-4 mb-2">{part ?? 'Masterbook source document'}</h1>
        <p className="text-muted-foreground mb-6">{list.length} chapters · the complete text</p>
        <nav aria-label="Chapters" className="flex flex-wrap gap-2 mb-8 text-xs">{list.map(e => <a key={e.id} href={`#ch-${e.id}`} className="px-3 py-1 rounded-full border border-border hover:bg-muted">{e.title}</a>)}</nav>
        {!texts ? <p role="status">Loading the full document…</p> : list.map((e, i) => (
          <article key={e.id} id={`ch-${e.id}`} className="mb-12 scroll-mt-24">
            {texts[i] ? <NavigatedProse content={texts[i].replace(/<!-- page (\d+) -->/g, (_m, n) => `\n\n###### Page ${n}\n\n`)} path={`/read/document/${slug}`} title={e.title} headingLevel={markdownSections(texts[i]).length > 1 ? 2 : 3} idPrefix={`ch-${e.id}-`} /> : <div className="space-y-3"><p role="alert">{e.title} couldn’t be opened.</p><Button variant="outline" onClick={() => setAttempt(n => n + 1)}>Retry missing chapters</Button></div>}
          </article>
        ))}
      </>}
    </Frame>
  );
}
