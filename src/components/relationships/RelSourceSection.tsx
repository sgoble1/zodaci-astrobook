import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { MbEntry } from '@/pages/Masterbook';
import { BUILT_IN_SOURCES } from '@/content/sources';
import { loadLibraryIndex } from '@/lib/corpus';
import { SummarisePanel, toPassages } from '@/components/common/SummarisePanel';

/** One relationship-themed source section: full text, page-by-page PDF links, cited summary and Masterbook link. */
export function RelSourceSection({ e }: { e: MbEntry }) {
  const [open, setOpen] = useState(true);
  const [text, setText] = useState<string | null>(null);
  const [libFile, setLibFile] = useState<string | null>(null);
  useEffect(() => { if (open && text === null) fetch(`/masterbook/${e.id}.md`).then(r => r.ok ? r.text() : '').then(setText); }, [open, text, e.id]);
  useEffect(() => { if (e.doc) loadLibraryIndex().then(l => setLibFile(l.find(d => d.id === e.doc)?.fileName ?? null)); }, [e.doc]);
  const src = e.doc ? BUILT_IN_SOURCES.find(s => s.fileName === libFile) : BUILT_IN_SOURCES.find(s => /Masterbook/.test(s.fileName));
  const pages = useMemo(() => [...(text ?? '').matchAll(/<!-- page (\d+) -->/g)].map(m => +m[1]), [text]);
  const body = useMemo(() => (text ?? '').replace(/<!-- page (\d+) -->/g, (_m, n) => `\n\n###### Page ${n}\n\n`), [text]);
  const srcName = src?.title ?? 'Masterbook';
  return (
    <article id={e.id} className="parchment p-5 scroll-mt-24">
      <div className="font-smallcaps text-[10px] text-gold">{srcName} · {e.label}{e.page ? ` · p. ${e.page}` : ''}</div>
      <h2 className="text-xl mt-1">{e.title}</h2>
      {e.excerpt && <blockquote className="mt-2 border-l-2 border-primary pl-3 text-sm text-muted-foreground italic">“{e.excerpt.slice(0, 260)}{e.excerpt.length > 260 ? '…' : ''}”</blockquote>}
      <div className="flex flex-wrap gap-3 mt-3 text-xs">
        <button onClick={() => setOpen(o => !o)} className="px-3 py-1.5 rounded bg-primary text-primary-foreground">{open ? 'Hide full text' : 'Read full text & summarise'}</button>
        <Link to={`/masterbook/${e.id}`} className="underline self-center">Open in the Masterbook</Link>
        {e.doc && src && <Link to={`/masterbook/pdf/${encodeURIComponent(src.id)}?page=${e.page ?? 1}`} className="underline self-center">View PDF page in the app</Link>}
        <Link to={`/ask?doc=${e.doc ?? 'masterbook'}`} className="underline self-center">Ask about this</Link>
      </div>
      {open && (text === null ? <p className="text-sm text-muted-foreground mt-3">Opening…</p> : <>
        <SummarisePanel title={e.title} passages={toPassages(text, srcName, `${e.label} · ${e.title}`)} prompt={`Summarise what "${e.title}" says about love, partnership and relationships for April, in short headed sections. Use only the passages and cite them.`} />
        {pages.length > 0 && src && <div className="text-xs mb-3"><span className="font-smallcaps text-gold">Source pages:</span> {pages.map(p => <Link key={p} to={`/masterbook/pdf/${encodeURIComponent(src.id)}?page=${p}`} className="underline mr-2">p. {p}</Link>)}</div>}
        <div className="mb-prose text-sm max-h-[60vh] overflow-auto pr-2">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ h6: ({ children }) => <h6 className="font-smallcaps text-[10px] text-gold border-t border-border pt-3 mt-6">{children}</h6> }}>{body}</ReactMarkdown>
        </div>
        <p className="text-[11px] text-muted-foreground mt-3"><span className="font-smallcaps text-gold">Citation</span> · {srcName} — {e.label}: {e.title}{e.page ? `, p. ${e.page}` : ''}. Transcribed verbatim.</p>
      </>)}
    </article>
  );
}
