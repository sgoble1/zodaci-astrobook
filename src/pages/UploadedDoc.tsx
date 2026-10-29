import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '@/integrations/supabase/client';
import { CopyLinkButton } from '@/components/common/CopyLinkButton';
import type { DocSection } from '@/lib/extract';

type Row = { id: string; title: string; category: string | null; file_path: string; file_name: string; sections: DocSection[] | null };

export default function UploadedDoc() {
  const { id = '' } = useParams();
  const [row, setRow] = useState<Row | null | undefined>(undefined);
  const [url, setUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(0);

  useEffect(() => {
    supabase.from('library_items').select('id,title,category,file_path,file_name,sections').eq('id', id).maybeSingle().then(async ({ data }) => {
      setRow(data as Row | null);
      if (data) { const s = await supabase.storage.from('library').createSignedUrl(data.file_path, 60 * 60 * 6); setUrl(s.data?.signedUrl ?? null); }
    });
  }, [id]);
  useEffect(() => { const m = window.location.hash.match(/^#s(\d+)/); if (m) setOpen(+m[1]); }, [row]);

  if (row === undefined) return <p className="text-muted-foreground">Opening…</p>;
  if (!row) return <p>Document not found. <Link to="/library" className="underline">Back to your library</Link></p>;
  const secs = row.sections ?? [];
  const cur = secs[open];
  const isPdf = /\.pdf$/i.test(row.file_name);

  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-8">
      <aside className="space-y-1 text-sm lg:sticky lg:top-6 lg:self-start lg:max-h-[85vh] overflow-y-auto">
        <Link to="/library" className="text-xs font-smallcaps text-muted-foreground hover:text-foreground">← Your library</Link>
        <div className="font-smallcaps text-[10px] text-gold pt-3">{secs.length} sections</div>
        {secs.map((s, i) => (
          <button key={i} onClick={() => { setOpen(i); history.replaceState(null, '', `#s${i}`); }}
            className={`block w-full text-left px-2 py-1.5 rounded leading-snug ${i === open ? 'bg-accent/15 border-l-2 border-accent' : 'hover:bg-muted text-muted-foreground'}`}>{s.title}</button>
        ))}
      </aside>
      <article>
        <div className="font-smallcaps text-xs text-gold">{row.category ?? 'Your Uploads'} · uploaded document</div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl mt-2">{row.title}</h1>
          <CopyLinkButton />
        </div>
        <div className="flex flex-wrap gap-4 text-xs mt-3">
          {url && <a href={isPdf && cur?.page ? `${url}#page=${cur.page}` : url} target="_blank" rel="noreferrer" className="underline">{isPdf ? 'Open PDF at this section' : 'Download original'}</a>}
          <Link to={`/ask?doc=up:${row.id}`} className="underline">Ask about this document</Link>
        </div>
        <div className="gold-rule my-6" />
        {cur ? <>
          <h2 className="text-2xl mb-4">{cur.title}</h2>
          <div className="mb-prose overflow-x-auto">
            {cur.text.trim().startsWith('|')
              ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{cur.text}</ReactMarkdown>
              : cur.text.split(/\n{2,}/).map((p, i) => <p key={i} className="whitespace-pre-wrap">{p}</p>)}
          </div>
          <nav className="flex justify-between mt-8 text-sm">
            {open > 0 ? <button className="parchment p-3" onClick={() => setOpen(open - 1)}>← {secs[open - 1].title.slice(0, 40)}</button> : <span />}
            {open < secs.length - 1 && <button className="parchment p-3" onClick={() => setOpen(open + 1)}>{secs[open + 1].title.slice(0, 40)} →</button>}
          </nav>
        </> : <p className="text-muted-foreground">No readable text was found in this file.</p>}
      </article>
    </div>
  );
}
