import { useEffect, useRef, useState } from 'react';
import { ListPlus, ListX, SkipForward } from 'lucide-react';
import { Headphones, Trash2, Download, Upload } from 'lucide-react';
import { useLibrary, useSession, useIsAdmin, type LibraryItem } from '@/hooks/useLibrary';
import { AuthGate } from '@/components/common/AuthGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { fmtSize } from '@/content/sources';
import { toast } from 'sonner';

export default function Podcasts() {
  const lib = useLibrary('podcast');
  const session = useSession();
  const isAdmin = useIsAdmin(session);
  const [current, setCurrent] = useState<LibraryItem | null>(null);
  const [q, setQ] = useState('');
  const [speed, setSpeed] = useState<number>(() => +(localStorage.getItem('pod:speed') ?? 1));
  const [queue, setQueue] = useState<string[]>(() => JSON.parse(localStorage.getItem('pod:queue') ?? '[]'));
  const [positions, setPositions] = useState<Record<string, number>>(() => JSON.parse(localStorage.getItem('pod:pos') ?? '{}'));
  const audio = useRef<HTMLAudioElement>(null);
  const lastSave = useRef(0);
  useEffect(() => { localStorage.setItem('pod:queue', JSON.stringify(queue)); }, [queue]);
  useEffect(() => { localStorage.setItem('pod:speed', String(speed)); if (audio.current) audio.current.playbackRate = speed; }, [speed]);
  const savePos = (id: string, t: number) => setPositions(p => { const n = { ...p, [id]: t }; localStorage.setItem('pod:pos', JSON.stringify(n)); return n; });
  const byId = (id: string) => lib.items.find(i => i.id === id);
  const play = (ep: LibraryItem) => { setCurrent(ep); setQueue(qu => qu.filter(x => x !== ep.id)); };
  const playNext = () => { const next = queue.map(byId).find(Boolean); if (next) play(next); };
  const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  const shown = lib.items.filter(i => (i.title + ' ' + (i.description ?? '') + ' ' + (i.category ?? '')).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-10">
      <header>
        <div className="font-smallcaps text-xs text-gold">The Listening Room</div>
        <h1 className="text-4xl sm:text-5xl mt-2">Podcasts & Audio Readings</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">Audio episodes about April’s chart. Press any episode to listen; download to keep a copy.</p>
      </header>

      {current?.url && (
        <div className="parchment deckle p-5 sticky top-16 lg:top-4 z-20">
          <div className="font-smallcaps text-[10px] text-gold">Now playing</div>
          <div className="font-display text-xl mt-1">{current.title}</div>
          <audio key={current.id} ref={audio} src={current.url} controls autoPlay className="w-full mt-3"
            onLoadedMetadata={e => { const el = e.currentTarget; el.playbackRate = speed; const p = positions[current.id]; if (p && p < el.duration - 5) el.currentTime = p; }}
            onTimeUpdate={e => { const t = e.currentTarget.currentTime; if (Math.abs(t - lastSave.current) > 5) { lastSave.current = t; savePos(current.id, t); } }}
            onPause={e => savePos(current.id, e.currentTarget.currentTime)}
            onEnded={() => { savePos(current.id, 0); playNext(); }} />
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <span className="font-smallcaps text-[10px] text-gold mr-1">Speed</span>
            {[0.75, 1, 1.25, 1.5, 1.75, 2].map(r => (
              <button key={r} onClick={() => setSpeed(r)} className={`px-2 py-1 rounded border ${speed === r ? 'border-accent bg-accent/15' : 'border-border hover:bg-muted'}`}>{r}×</button>
            ))}
            {queue.length > 0 && <button onClick={playNext} className="ml-auto flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"><SkipForward className="w-3.5 h-3.5" />Next in queue</button>}
          </div>
        </div>
      )}

      {queue.length > 0 && (
        <section className="parchment p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-smallcaps text-[10px] text-gold">Up next · {queue.length}</div>
            <button className="text-xs underline" onClick={() => setQueue([])}>Clear queue</button>
          </div>
          <ol className="space-y-1 text-sm">
            {queue.map((id, i) => { const ep = byId(id); if (!ep) return null; return (
              <li key={id} className="flex items-center gap-2">
                <span className="text-muted-foreground w-5">{i + 1}.</span>
                <button className="flex-1 text-left hover:underline truncate" onClick={() => play(ep)}>{ep.title}</button>
                <button aria-label="Move up" disabled={i === 0} className="px-1 disabled:opacity-30" onClick={() => setQueue(qu => { const n = [...qu]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n; })}>↑</button>
                <button aria-label="Remove from queue" className="p-1" onClick={() => setQueue(qu => qu.filter(x => x !== id))}><ListX className="w-4 h-4" /></button>
              </li>); })}
          </ol>
        </section>
      )}

      <section className="space-y-3">
        <Input placeholder="Search episodes…" value={q} onChange={e => setQ(e.target.value)} className="max-w-sm" />
        {lib.loading ? <p className="text-sm text-muted-foreground">Loading…</p> :
          shown.length === 0 ? <p className="text-sm text-muted-foreground italic">No episodes yet{session ? ' — upload the first one below.' : '.'}</p> :
          <ul className="grid gap-3">
            {shown.map(ep => (
              <li key={ep.id} className={`parchment p-4 flex gap-4 items-start ${current?.id === ep.id ? 'ring-1 ring-accent' : ''}`}>
                <button onClick={() => play(ep)} aria-label={`Play ${ep.title}`} className="shrink-0 w-12 h-12 rounded-full border border-accent/50 grid place-items-center hover:bg-accent/15">
                  <Headphones className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <button onClick={() => play(ep)} className="font-display text-lg text-left hover:underline">{ep.title}</button>
                  <div className="text-xs text-muted-foreground">{ep.category && <>{ep.category} · </>}{new Date(ep.created_at).toLocaleDateString()} · {fmtSize(ep.size_bytes)}{positions[ep.id] > 5 && <> · <span className="text-gold">resume at {fmt(positions[ep.id])}</span></>}</div>
                  {ep.description && <p className="text-sm mt-1">{ep.description}</p>}
                </div>
                <div className="flex gap-1">
                  <button className="p-2 rounded hover:bg-muted" aria-label={queue.includes(ep.id) ? 'Remove from queue' : 'Add to queue'}
                    onClick={() => setQueue(qu => qu.includes(ep.id) ? qu.filter(x => x !== ep.id) : [...qu, ep.id])}>
                    {queue.includes(ep.id) ? <ListX className="w-4 h-4" /> : <ListPlus className="w-4 h-4" />}
                  </button>
                  {ep.url && <a href={ep.url} download={ep.file_name} className="p-2 rounded hover:bg-muted" aria-label="Download"><Download className="w-4 h-4" /></a>}
                  {(isAdmin || session?.user.id === ep.owner_id) && (
                    <button className="p-2 rounded hover:bg-muted" aria-label="Delete" onClick={async () => { if (confirm('Delete this episode?')) { await lib.remove(ep); if (current?.id === ep.id) setCurrent(null); } }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>}
      </section>

      <section>
        <h2 className="text-2xl mb-3">Add an episode</h2>
        <AuthGate what="upload podcast episodes">{(uid) => <UploadForm accept="audio/*" onUpload={(f, m) => lib.upload(f, m, uid)} />}</AuthGate>
      </section>
    </div>
  );
}

export function UploadForm({ accept, onUpload, categoryLabel = 'Series / topic' }: { accept?: string; categoryLabel?: string; onUpload: (f: File, m: { title: string; description: string; category: string }) => Promise<void> }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [category, setCategory] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const f = fileRef.current?.files?.[0]; if (!f) return;
    setBusy(true);
    try { await onUpload(f, { title, description, category }); toast.success('Uploaded'); setTitle(''); setDescription(''); setCategory(''); if (fileRef.current) fileRef.current.value = ''; }
    catch (err) { toast.error((err as Error).message); }
    setBusy(false);
  };
  return (
    <form onSubmit={submit} className="parchment deckle p-5 grid gap-3 max-w-xl">
      <input ref={fileRef} type="file" accept={accept} required className="text-sm" />
      <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <Input placeholder={categoryLabel} value={category} onChange={e => setCategory(e.target.value)} />
      <Textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
      <Button type="submit" disabled={busy} className="justify-self-start"><Upload className="w-4 h-4 mr-2" />{busy ? 'Uploading…' : 'Upload'}</Button>
    </form>
  );
}
