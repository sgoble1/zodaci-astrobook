import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { loadIndex, type MbEntry } from './Masterbook';

/** Public reading room: open to visitors without the site password. Only links within /read. */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 px-6 py-4 flex items-center justify-between">
        <Link to="/read" className="font-display text-xl">Sources · Reading Room</Link>
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">Full site (password) →</Link>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}

export function PublicLibrary() {
  const [entries, setEntries] = useState<MbEntry[]>([]);
  const [q, setQ] = useState('');
  useEffect(() => { loadIndex().then(setEntries); }, []);
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
      <p className="text-muted-foreground mb-6">Browse and read all {entries.length} chapters from every document. No password needed.</p>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Find a chapter or section…" className="w-full rounded-md border border-input bg-background px-3 py-2 mb-8" />
      <nav className="flex flex-wrap gap-2 mb-8 text-xs">
        {groups.map(([part]) => <a key={part} href={`#${encodeURIComponent(part)}`} className="px-3 py-1 rounded-full border border-border hover:bg-muted">{part}</a>)}
      </nav>
      {groups.map(([part, list]) => (
        <section key={part} id={encodeURIComponent(part)} className="mb-10">
          <h2 className="font-display text-2xl mb-3">{part} <span className="text-sm text-muted-foreground">({list.length})</span></h2>
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
  useEffect(() => { loadIndex().then(setEntries); }, []);
  useEffect(() => { setText(null); window.scrollTo(0, 0); fetch(`/masterbook/${id}.md`).then(r => r.ok ? r.text() : '').then(t => setText(t.startsWith('<!doctype') || t.startsWith('<!DOCTYPE') ? '' : t)); }, [id]);
  const i = entries.findIndex(e => e.id === id);
  const e = entries[i], prev = entries[i - 1], next = entries[i + 1];
  const body = (text ?? '').replace(/<!-- page (\d+) -->/g, (_m, n) => `\n\n###### Page ${n}\n\n`);
  return (
    <Frame>
      <Link to="/read" className="text-xs text-muted-foreground hover:text-foreground">← All sources</Link>
      {text === '' ? <p className="mt-6">Chapter not found.</p> : <>
        {e && <div className="text-xs text-muted-foreground mt-4">{e.part} · {e.label}</div>}
        <article className="prose prose-invert max-w-none mt-4"><ReactMarkdown remarkPlugins={[remarkGfm]}>{text === null ? 'Loading…' : body}</ReactMarkdown></article>
        <div className="flex justify-between mt-10 text-sm">
          {prev ? <Link to={`/read/${prev.id}`} className="underline">← {prev.title}</Link> : <span />}
          {next ? <Link to={`/read/${next.id}`} className="underline">{next.title} →</Link> : <span />}
        </div>
      </>}
    </Frame>
  );
}
