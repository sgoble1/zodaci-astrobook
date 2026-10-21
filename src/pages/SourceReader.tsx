import { LoadFailed } from '@/components/common/LoadFailed';
import { IllustrationGallery } from '@/components/common/IllustrationGallery';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BUILT_IN_SOURCES } from '@/content/sources';
import { loadLibraryIndex } from '@/lib/corpus';
import { Input } from '@/components/ui/input';
import { loadProtectedJson } from '@/lib/protectedContent';

type Unit = { loc: string; text: string };

/** Readable, searchable full text of one uploaded document, page by page. */
export default function SourceReader() {
  const { id = '' } = useParams();
  const [units, setUnits] = useState<Unit[] | null>(null);
  const [fileName, setFileName] = useState('');
  const [q, setQ] = useState('');
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [docs, setDocs] = useState<{ id: string; fileName: string }[]>([]);
  useEffect(() => {
    setFailed(false); setUnits(null);
    loadLibraryIndex().then(ix => { setDocs(ix); setFileName(ix.find(d => d.id === id)?.fileName ?? ''); }).catch(() => setDocs([]));
    loadProtectedJson<Unit[]>('library', `${id}.json`).then(setUnits).catch(() => setFailed(true));
  }, [id, attempt]);
  const at = docs.findIndex(d => d.id === id);
  const prevDoc = at > 0 ? docs[at - 1] : undefined; const nextDoc = at >= 0 ? docs[at + 1] : undefined;
  useEffect(() => { if (units && location.hash) setTimeout(() => document.getElementById(location.hash.slice(1))?.scrollIntoView(), 50); }, [units]);
  const src = BUILT_IN_SOURCES.find(s => s.fileName === fileName);
  const shown = useMemo(() => (units ?? []).map((u, i) => ({ ...u, i })).filter(u => !q || u.text.toLowerCase().includes(q.toLowerCase())), [units, q]);

  const para = (t: string) => t.split(/\n{2,}|\n(?=[A-Z•\-✦])/).map(s => s.replace(/\n/g, ' ').trim()).filter(Boolean);

  return (
    <div className="space-y-6">
      <Link to="/sources" className="text-xs font-smallcaps text-muted-foreground hover:text-foreground">← Source files</Link>
      <header>
        <div className="font-smallcaps text-xs text-gold">Full text · {units?.length ?? '…'} {units?.[0]?.loc.split(' ')[0].toLowerCase() ?? 'page'}s</div>
        <h1 className="text-3xl sm:text-4xl mt-2">{src?.title ?? fileName}</h1>
        <div className="flex flex-wrap gap-3 items-center mt-4">
          <Input placeholder="Find in this document…" value={q} onChange={e => setQ(e.target.value)} className="max-w-sm" />
          {src && <a href={src.url} download className="text-xs underline">Download original</a>}
          {q && <span className="text-xs text-muted-foreground">{shown.length} matching</span>}
        </div>
      </header>
      {/^d-(8c102f25|b9d9e723)$/.test(id) && <IllustrationGallery />}
      {(units?.length ?? 0) > 1 && <label className="flex max-w-sm items-center gap-3 text-sm"><span className="shrink-0 text-muted-foreground">Jump to</span><select className="h-10 w-full rounded-md border border-input bg-background px-3" defaultValue="" onChange={e => { if (e.target.value) document.getElementById(e.target.value)?.scrollIntoView({ behavior: 'smooth' }); }}><option value="" disabled>Choose a page or section</option>{(units ?? []).map((u, i) => <option key={i} value={`u${i}`}>{u.loc}</option>)}</select></label>}
      {failed && <LoadFailed what="This document" onRetry={() => setAttempt(a => a + 1)} />}
      {units && !failed && shown.length === 0 && <p className="text-sm text-muted-foreground">{q ? `Nothing in this document matches “${q}”.` : 'This document has no readable text yet.'}</p>}
      {shown.map(u => (
        <section key={u.i} id={`u${u.i}`} className="parchment p-5 scroll-mt-24">
          <div className="font-smallcaps text-[10px] text-gold mb-2">{u.loc}</div>
          <div className="mb-prose text-[0.98rem]">{para(u.text).map((p, j) => <p key={j}>{p}</p>)}</div>
        </section>
      ))}
      {units && <nav aria-label="More source files" className="flex flex-wrap justify-between gap-3 border-t border-border pt-6 text-sm">
        {prevDoc ? <Link to={`/sources/read/${prevDoc.id}`} className="underline underline-offset-2">← {prevDoc.fileName.replace(/\.[a-z]+$/i, '')}</Link> : <span />}
        <Link to="/sources" className="underline underline-offset-2">Back to source files</Link>
        {nextDoc ? <Link to={`/sources/read/${nextDoc.id}`} className="underline underline-offset-2">{nextDoc.fileName.replace(/\.[a-z]+$/i, '')} →</Link> : <span />}
      </nav>}
    </div>
  );
}
