import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { loadLibraryIndex } from '@/lib/corpus';
import { Download, Eye, Trash2, FileText, X } from 'lucide-react';
import { BUILT_IN_SOURCES, fmtSize } from '@/content/sources';
import { useLibrary, useSession } from '@/hooks/useLibrary';
import { AuthGate } from '@/components/common/AuthGate';
import { UploadForm } from './Podcasts';
import { Input } from '@/components/ui/input';

type Viewable = { title: string; url: string; ext: string };

export default function Sources() {
  const lib = useLibrary('source');
  const session = useSession();
  const [view, setView] = useState<Viewable | null>(null);
  const [q, setQ] = useState('');
  const [readIds, setReadIds] = useState<Record<string, string>>({});
  useEffect(() => { loadLibraryIndex().then(ix => setReadIds(Object.fromEntries(ix.map(d => [d.fileName, d.id])))); }, []);
  const match = (s: string) => s.toLowerCase().includes(q.toLowerCase());
  const abs = (u: string) => new URL(u, window.location.origin).href;

  const viewer = view && (
    <div className="fixed inset-0 z-50 bg-background/95 flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="font-display text-lg truncate">{view.title}</div>
        <div className="flex gap-2">
          <a href={view.url} download className="p-2 rounded hover:bg-muted" aria-label="Download"><Download className="w-4 h-4" /></a>
          <button onClick={() => setView(null)} className="p-2 rounded hover:bg-muted" aria-label="Close"><X className="w-4 h-4" /></button>
        </div>
      </div>
      {view.ext === 'pdf' || /^(png|jpe?g|webp|gif|txt|mp3|wav|m4a)$/.test(view.ext)
        ? <iframe title={view.title} src={view.url} className="flex-1 w-full bg-card" />
        : <iframe title={view.title} src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(abs(view.url))}`} className="flex-1 w-full bg-card" />}
      {view.ext !== 'pdf' && <p className="text-xs text-muted-foreground px-5 py-2">Word and PowerPoint files are previewed with Microsoft’s online viewer; it works on the published site. If it doesn’t load, use Download.</p>}
    </div>
  );

  const Row = ({ title, sub, url, ext, onDelete, read }: { title: string; sub: string; url?: string; ext: string; onDelete?: () => void; read?: string }) => (
    <li className="parchment p-4 flex items-center gap-4">
      <div className="w-10 h-12 shrink-0 border border-border grid place-items-center text-[10px] font-smallcaps text-gold"><FileText className="w-4 h-4" />{ext}</div>
      <div className="flex-1 min-w-0">
        <button className="font-display text-lg text-left hover:underline" onClick={() => url && setView({ title, url, ext })}>{title}</button>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      {read && <Link to={`/sources/read/${read}`} className="p-2 rounded hover:bg-muted flex items-center gap-1 text-xs" aria-label="Read text"><BookOpen className="w-4 h-4" /><span className="hidden sm:inline">Read</span></Link>}
      {url && <button onClick={() => setView({ title, url, ext })} className="p-2 rounded hover:bg-muted" aria-label="View"><Eye className="w-4 h-4" /></button>}
      {url && <a href={url} download className="p-2 rounded hover:bg-muted" aria-label="Download"><Download className="w-4 h-4" /></a>}
      {onDelete && <button onClick={onDelete} className="p-2 rounded hover:bg-muted" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>}
    </li>
  );

  return (
    <div className="space-y-10">
      {viewer}
      <header>
        <div className="font-smallcaps text-xs text-gold">The Archive</div>
        <h1 className="text-4xl sm:text-5xl mt-2">Source Files</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">Every original document this site was built from. Open one to read it, or download it to verify any passage.</p>
        <Input placeholder="Filter files…" value={q} onChange={e => setQ(e.target.value)} className="max-w-sm mt-4" />
      </header>

      <section>
        <p className="text-sm text-muted-foreground mb-3">The Masterbook is readable chapter by chapter in <Link to="/masterbook" className="underline">The Masterbook</Link>. Every other document has a “Read” view with its full text, page by page. Have a question? <Link to="/ask" className="underline">Ask the Sources</Link>.</p>
        <h2 className="text-2xl mb-3">Original documents ({BUILT_IN_SOURCES.length})</h2>
        <ul className="grid gap-3">
          {BUILT_IN_SOURCES.filter(s => match(s.title + s.fileName)).map(s => (
            <Row key={s.id} read={/Masterbook/.test(s.fileName) ? undefined : readIds[s.fileName]} title={s.title} ext={s.ext} url={s.url} sub={`${s.fileName} · ${fmtSize(s.size)} · Used in: ${s.usedIn}`} />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl mb-3">Added files ({lib.items.length})</h2>
        {lib.items.length === 0 ? <p className="text-sm italic text-muted-foreground">Nothing added yet.</p> :
          <ul className="grid gap-3">
            {lib.items.filter(i => match(i.title + i.file_name + (i.category ?? ''))).map(i => (
              <Row key={i.id} title={i.title} ext={i.file_name.split('.').pop()!.toLowerCase()} url={i.url}
                sub={`${i.category ? i.category + ' · ' : ''}${i.file_name} · ${fmtSize(i.size_bytes)} · ${new Date(i.created_at).toLocaleDateString()}${i.description ? ' · ' + i.description : ''}`}
                onDelete={(isAdmin || session?.user.id === i.owner_id) ? () => { if (confirm('Delete this file?')) lib.remove(i); } : undefined} />
            ))}
          </ul>}
      </section>

      <section>
        <h2 className="text-2xl mb-3">Add a source file</h2>
        <AuthGate what="add and manage source files">{(uid) => <UploadForm categoryLabel="Category (e.g. Reports, Charts)" onUpload={(f, m) => lib.upload(f, m, uid)} />}</AuthGate>
      </section>
    </div>
  );
}
