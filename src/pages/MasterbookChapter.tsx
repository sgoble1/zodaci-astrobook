import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { loadIndex, type MbEntry } from './Masterbook';
import { CopyLinkButton } from '@/components/common/CopyLinkButton';
import { BUILT_IN_SOURCES } from '@/content/sources';
import { loadLibraryIndex } from '@/lib/corpus';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

export default function MasterbookChapter() {
  const { id = '' } = useParams();
  const [entries, setEntries] = useState<MbEntry[]>([]);
  const [text, setText] = useState<string | null>(null);
  useEffect(() => { loadIndex().then(setEntries); }, []);
  useEffect(() => { setText(null); fetch(`/masterbook/${id}.md`).then(r => r.ok ? r.text() : '').then(setText); }, [id]);
  useEffect(() => {
    if (text && window.location.hash) setTimeout(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [text]);

  const i = entries.findIndex(e => e.id === id);
  const e = entries[i]; const prev = entries[i - 1]; const next = entries[i + 1];
  const [libFile, setLibFile] = useState<string | null>(null);
  useEffect(() => { if (e?.doc) loadLibraryIndex().then(l => setLibFile(l.find(d => d.id === e.doc)?.fileName ?? null)); }, [e?.doc]);
  const src = e?.doc ? BUILT_IN_SOURCES.find(s => s.fileName === libFile) : BUILT_IN_SOURCES.find(s => /Masterbook/.test(s.fileName));
  const body = useMemo(() => (text ?? '').replace(/<!-- page (\d+) -->/g, (_m, n) => `\n\n###### Page ${n}\n\n`), [text]);
  const toc = useMemo(() => (text ?? '').split('\n').filter(l => l.startsWith('### ')).map(l => l.slice(4)), [text]);

  if (text === '') return <p>Section not found. <Link className="underline" to="/masterbook">Back to the Masterbook</Link></p>;

  return (
    <div className="grid xl:grid-cols-[1fr_220px] gap-10">
      <article>
        <Link to="/masterbook" className="text-xs font-smallcaps text-muted-foreground hover:text-foreground">← Masterbook contents</Link>
        {e && <>
          <div className="font-smallcaps text-xs text-gold mt-4">{e.part} · {e.label}</div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl mt-2">{e.title}</h1>
            <CopyLinkButton />
          </div>
        </>}
        <div className="gold-rule my-6" />
        {text === null ? <p className="text-muted-foreground">Opening the page…</p> : (
          <div className="mb-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
              h3: ({ children }) => { const t = String(children); return <h3 id={slug(t)} className="scroll-mt-24">{children}</h3>; },
                          h6: ({ children }) => { const n = String(children).replace(/\D/g, ''); return <h6 id={`p${n}`} className="scroll-mt-24 font-smallcaps text-[10px] text-gold border-t border-border pt-3 mt-8 flex justify-between"><span>{children}</span>{src && <Link to={`/masterbook/pdf/${encodeURIComponent(src.id)}?page=${n}`} className="underline">View this page in the app</Link>}</h6>; },
            }}>{body}</ReactMarkdown>
          </div>
        )}
        {src && <div className="parchment p-4 mt-10 text-xs text-muted-foreground">
          <span className="font-smallcaps text-gold">Source</span> · {src.title}{e ? ` — ${e.label}: ${e.title}` : ''} · transcribed verbatim. {e?.doc && src ? <Link to={`/masterbook/pdf/${encodeURIComponent(src.id)}?page=${e.page ?? 1}`} className="underline">Open the PDF in the app</Link> : <Link to="/sources" className="underline">View or download the original</Link>} · <Link to={`/ask${e?.doc ? `?doc=${e.doc}` : '?doc=masterbook'}`} className="underline">Ask about this document</Link>
        </div>}
        <nav className="flex justify-between gap-4 mt-8">
          {prev ? <Link to={`/masterbook/${prev.id}`} className="parchment p-3 flex items-center gap-2 text-sm max-w-[48%]"><ChevronLeft className="w-4 h-4 shrink-0" /><span className="truncate">{prev.title}</span></Link> : <span />}
          {next && <Link to={`/masterbook/${next.id}`} className="parchment p-3 flex items-center gap-2 text-sm max-w-[48%] text-right"><span className="truncate">{next.title}</span><ChevronRight className="w-4 h-4 shrink-0" /></Link>}
        </nav>
      </article>
      {toc.length > 1 && (
        <aside className="hidden xl:block">
          <div className="sticky top-6 max-h-[85vh] overflow-y-auto text-xs space-y-1">
            <div className="font-smallcaps text-[10px] text-gold mb-2">On this page</div>
            {toc.map(t => <a key={t} href={`#${slug(t)}`} className="block text-muted-foreground hover:text-foreground leading-snug py-0.5">{t}</a>)}
          </div>
        </aside>
      )}
    </div>
  );
}
