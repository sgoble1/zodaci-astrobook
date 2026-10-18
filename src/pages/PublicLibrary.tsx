import { withPlates } from '@/content/plates';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { loadIndex, type MbEntry } from './Masterbook';
import { loadProtectedText } from '@/lib/protectedContent';

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Password-protected reading room backed by the extracted Masterbook files. */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 px-6 py-4 flex items-center justify-between">
        <Link to="/read" className="font-display text-xl">Sources · Reading Room</Link>
        <Link to="/masterbook" className="text-xs text-muted-foreground hover:text-foreground">Open the Masterbook →</Link>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}

export function PublicLibrary() {
  const [entries, setEntries] = useState<MbEntry[]>([]);
  const [q, setQ] = useState('');
  useEffect(() => { loadIndex().then(setEntries).catch(() => setEntries([])); }, []);
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
      <p className="text-muted-foreground mb-6">Browse and read all {entries.length} extracted chapters from the real Masterbook documents. The site password protects this room and every chapter.</p>
      <input aria-label="Find a chapter or section" value={q} onChange={e => setQ(e.target.value)} placeholder="Find a chapter or section…" className="w-full rounded-md border border-input bg-background px-3 py-2 mb-8" />
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
  const { id = '' } = useParams();
  const [entries, setEntries] = useState<MbEntry[]>([]);
  const [text, setText] = useState<string | null>(null);
  useEffect(() => { loadIndex().then(setEntries).catch(() => setEntries([])); }, []);
  useEffect(() => { setText(null); window.scrollTo(0, 0); loadProtectedText('masterbook', `${id}.md`).then(t => setText(withPlates(t))).catch(() => setText('')); }, [id]);
  const i = entries.findIndex(e => e.id === id);
  const e = entries[i], prev = entries[i - 1], next = entries[i + 1];
  const body = (text ?? '').replace(/<!-- page (\d+) -->/g, (_m, n) => `\n\n###### Page ${n}\n\n`);
  return (
    <Frame>
      <Link to="/read" className="text-xs text-muted-foreground hover:text-foreground">← All sources</Link>
      {text === '' ? <p className="mt-6">Chapter not found.</p> : <>
        {e && <div className="text-xs text-muted-foreground mt-4">{e.part}</div>}
        <h1 className="font-display text-3xl sm:text-4xl mt-2">{e?.label ?? 'Masterbook chapter'}</h1>
        <article className="reading-prose mt-4">{text === null ? <p role="status">Loading chapter…</p> : <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>}</article>
        <div className="flex justify-between mt-10 text-sm">
          {prev ? <Link to={`/read/${prev.id}`} aria-label={`Previous chapter: ${prev.title}`} className="underline">← {prev.title}</Link> : <span />}
          {next ? <Link to={`/read/${next.id}`} aria-label={`Next chapter: ${next.title}`} className="underline">{next.title} →</Link> : <span />}
        </div>
      </>}
    </Frame>
  );
}

/** One whole Masterbook document (every chapter of a part) on a single page; text loads through the password. */
export function PublicDocument() {
  const { slug = '' } = useParams();
  const [entries, setEntries] = useState<MbEntry[]>([]);
  const [texts, setTexts] = useState<string[] | null>(null);
  useEffect(() => { loadIndex().then(setEntries).catch(() => setEntries([])); }, []);
  const list = useMemo(() => entries.filter(e => slugify(e.part) === slug), [entries, slug]);
  useEffect(() => {
    if (!list.length) return; setTexts(null);
    Promise.all(list.map(e => loadProtectedText('masterbook', `${e.id}.md`).then(withPlates).catch(() => ''))).then(setTexts);
  }, [list]);
  const part = list[0]?.part;
  return (
    <Frame>
      <Link to="/read" className="text-xs text-muted-foreground hover:text-foreground">← All sources</Link>
      {entries.length > 0 && !list.length ? <p className="mt-6">Document not found.</p> : <>
        <h1 className="font-display text-4xl mt-4 mb-2">{part ?? 'Masterbook source document'}</h1>
        <p className="text-muted-foreground mb-6">{list.length} chapters · the complete text</p>
        <nav aria-label="Chapters" className="flex flex-wrap gap-2 mb-8 text-xs">{list.map(e => <a key={e.id} href={`#ch-${e.id}`} className="px-3 py-1 rounded-full border border-border hover:bg-muted">{e.title}</a>)}</nav>
        {!texts ? <p role="status">Loading the full document…</p> : list.map((e, i) => (
          <article key={e.id} id={`ch-${e.id}`} className="reading-prose mb-12 scroll-mt-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{(texts[i] || '_This chapter could not be loaded._').replace(/<!-- page (\d+) -->/g, (_m, n) => `\n\n###### Page ${n}\n\n`)}</ReactMarkdown>
          </article>
        ))}
      </>}
    </Frame>
  );
}
