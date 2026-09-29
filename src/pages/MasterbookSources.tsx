import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { loadIndex, type MbEntry } from './Masterbook';
import { loadLibraryIndex } from '@/lib/corpus';
import { BUILT_IN_SOURCES, fmtSize } from '@/content/sources';
import { useLibrary } from '@/hooks/useLibrary';
import { Input } from '@/components/ui/input';

type Sec = { title: string; to?: string; pdf?: string; meta?: string };
type Doc = { key: string; title: string; kind: string; size?: string; open?: string; read?: string; ask: string; sections: Sec[] };

export default function MasterbookSources() {
  const [mb, setMb] = useState<MbEntry[]>([]);
  const [lib, setLib] = useState<{ id: string; fileName: string; units: number }[]>([]);
  const [units, setUnits] = useState<Record<string, { loc: string; text: string }[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const uploads = useLibrary('masterbook');
  useEffect(() => { loadIndex().then(setMb); loadLibraryIndex().then(setLib); }, []);

  useEffect(() => {
    if (!expanded?.startsWith('lib:')) return;
    const id = expanded.slice(4);
    if (units[id]) return;
    fetch(`/library/${id}.json`).then(r => r.json()).then(u => setUnits(x => ({ ...x, [id]: u })));
  }, [expanded, units]);

  const docs = useMemo<Doc[]>(() => {
    const out: Doc[] = [];
    const mbSrc = BUILT_IN_SOURCES.find(s => /Masterbook/.test(s.fileName));
    out.push({
      key: 'masterbook', title: mbSrc?.title ?? 'Masterbook', kind: 'DOCX', size: fmtSize(mbSrc?.size), open: mbSrc?.url, read: '/masterbook', ask: '/ask?doc=masterbook',
      sections: mb.filter(e => !e.id.startsWith('c-')).map(e => ({ title: e.title, meta: `${e.part} · ${e.label}`, to: `/masterbook/${e.id}` })),
    });
    lib.forEach(d => {
      const src = BUILT_IN_SOURCES.find(s => s.fileName === d.fileName);
      const isPdf = src?.ext === 'pdf';
      const companion = mb.filter(e => e.doc === d.id);
      const secs: Sec[] = companion.length
        ? companion.map(e => ({ title: e.title, meta: e.label, to: `/masterbook/${e.id}`, pdf: isPdf && src ? `/masterbook/pdf/${d.id}?page=${e.page}` : undefined }))
        : (units[d.id] ?? []).map((u, i) => ({ title: u.text.split('\n').find(l => l.trim())?.slice(0, 90) ?? u.loc, meta: u.loc, to: `/sources/read/${d.id}#u${i}`, pdf: isPdf && src ? `/masterbook/pdf/${d.id}?page=${i + 1}` : undefined }));
      out.push({ key: 'lib:' + d.id, title: src?.title ?? d.fileName, kind: (src?.ext ?? '').toUpperCase(), size: fmtSize(src?.size), open: src?.url, read: `/sources/read/${d.id}`, ask: `/ask?doc=${d.id}`, sections: secs.length ? secs : [{ title: `${d.units} pages/slides — expand to list` }] });
    });
    uploads.items.forEach(u => {
      const secs = ((u.sections as { title: string; page?: number }[] | null) ?? []);
      out.push({ key: 'up:' + u.id, title: u.title, kind: `Upload · ${u.file_name.split('.').pop()?.toUpperCase()}`, size: fmtSize(u.size_bytes), open: u.url, read: `/masterbook/u/${u.id}`, ask: `/ask?doc=up:${u.id}`,
        sections: secs.map((s, i) => ({ title: s.title, to: `/masterbook/u/${u.id}#s${i}`, pdf: u.url && s.page && /pdf$/i.test(u.file_name) ? `/masterbook/pdf/upload?src=${encodeURIComponent(u.url)}&title=${encodeURIComponent(u.title)}&page=${s.page}` : undefined })) });
    });
    return out;
  }, [mb, lib, units, uploads.items]);

  const shown = docs.filter(d => !q || (d.title + d.sections.map(s => s.title).join(' ')).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-8">
      <header>
        <div className="font-smallcaps text-xs text-gold">The Masterbook · document index</div>
        <h1 className="text-4xl sm:text-5xl mt-2">Every Source Document</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">All {docs.length} documents behind this site, each with its sections. Open the original PDF straight to a section, read it here, or ask a question about just that document.</p>
        <div className="flex flex-wrap gap-3 mt-4 items-center">
          <Input placeholder="Filter documents and sections…" value={q} onChange={e => setQ(e.target.value)} className="max-w-md" />
          <Link to="/masterbook/upload" className="text-sm underline">Upload your own →</Link>
        </div>
      </header>
      <div className="space-y-3">
        {shown.map(d => {
          const isOpen = expanded === d.key || !!q;
          const secs = q ? d.sections.filter(s => s.title.toLowerCase().includes(q.toLowerCase()) || d.title.toLowerCase().includes(q.toLowerCase())) : d.sections;
          return (
            <section key={d.key} className="parchment">
              <button onClick={() => setExpanded(isOpen && !q ? null : d.key)} className="w-full flex items-center justify-between gap-4 p-4 text-left">
                <div>
                  <div className="font-smallcaps text-[10px] text-gold">{d.kind} {d.size && `· ${d.size}`} · {d.sections.length} sections</div>
                  <div className="font-display text-lg leading-snug">{d.title}</div>
                </div>
                <ChevronDown className={`w-4 h-4 shrink-0 transition ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-4 pb-4">
                  <div className="flex flex-wrap gap-4 text-xs mb-3">
                    {d.open && <a href={d.open} target="_blank" rel="noreferrer" className="underline flex items-center gap-1"><ExternalLink className="w-3 h-3" />Open original</a>}
                    {d.read && <Link to={d.read} className="underline">Read in the app</Link>}
                    {d.key.startsWith('lib:') && d.kind === 'PDF' && <Link to={`/masterbook/pdf/${d.key.slice(4)}`} className="underline">View pages in the app</Link>}
                    <Link to={d.ask} className="underline">Ask about this document</Link>
                  </div>
                  <ol className="divide-y divide-border/60 text-sm">
                    {secs.map((s, i) => (
                      <li key={i} className="py-2 flex items-baseline justify-between gap-3">
                        <div className="min-w-0">
                          {s.to ? <Link to={s.to} className="hover:underline">{s.title}</Link> : <span className="text-muted-foreground">{s.title}</span>}
                          {s.meta && <span className="text-[11px] text-muted-foreground"> · {s.meta}</span>}
                        </div>
                        {s.pdf && <Link to={s.pdf} className="text-xs underline shrink-0">View page</Link>}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
