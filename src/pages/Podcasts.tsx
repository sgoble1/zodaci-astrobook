import { confirmAction } from '@/components/common/ConfirmHost';
import { PodcastMaker } from '@/components/podcast/PodcastMaker';
import { useEffect, useRef, useState } from 'react';
import { ListPlus, ListX, SkipForward, BookOpen } from 'lucide-react';
import { Headphones, Lock, Trash2, Download, Upload, Users } from 'lucide-react';
import { useLibrary, useSession, useIsAdmin, type LibraryItem } from '@/hooks/useLibrary';
import { AuthGate } from '@/components/common/AuthGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { fmtSize } from '@/content/sources';
import { toast } from 'sonner';
import { usePlayer } from '@/components/podcast/PlayerContext';
import { Link } from 'react-router-dom';
import { CreatorStudio } from '@/components/payments/CreatorStudio';
import { useAprilSpace } from '@/hooks/useAprilSpace';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { supabase } from '@/integrations/supabase/client';

export default function Podcasts() {
  const lib = useLibrary('podcast');
  const april=useAprilSpace();
  const spaces=useWorkspaces();
  const session = useSession();
  const isAdmin = useIsAdmin(session);
  const { current, queue, setQueue, speed, setSpeed, positions, play, playNext, stop, setCatalog } = usePlayer();
  const setCurrent = (v: null) => { if (v === null) stop(); };
  const [q, setQ] = useState('');
  const [library, setLibrary] = useState<'shared' | 'private'>('private');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'title' | 'series'>('newest');
  useEffect(() => { setCatalog(lib.items); }, [lib.items, setCatalog]);
  const byId = (id: string) => lib.items.find(i => i.id === id);
  const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  const shown = lib.items
    .filter(i => library === 'shared' ? (april && i.shared_with_space) || spaces.some(s => s.id === i.workspace_id) : !i.shared_with_space && !i.workspace_id && i.owner_id === session?.user.id)
    .filter(i => (i.title + ' ' + (i.description ?? '') + ' ' + (i.category ?? '')).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title) : sort === 'series' ? (a.category ?? '').localeCompare(b.category ?? '') || a.title.localeCompare(b.title) : sort === 'oldest' ? +new Date(a.created_at) - +new Date(b.created_at) : +new Date(b.created_at) - +new Date(a.created_at));

  return (
    <div className="space-y-10">
      <header>
        <div className="font-smallcaps text-xs text-gold">The Listening Room</div>
        <h1 className="text-4xl sm:text-5xl mt-2">Podcasts & Audio Readings</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">Personal chart episodes, private to you or shared with invited workspace members.</p>
      </header>

      {current?.url && (
        <div className="parchment deckle p-5">
          <div className="font-smallcaps text-[10px] text-gold">Now playing · controls in the mini player</div>
          <div className="font-display text-xl mt-1">{current.title}</div>
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
            <button className="text-xs underline" onClick={() => setQueue(() => [])}>Clear queue</button>
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
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choose a podcast library">
          <Button variant={library === 'shared' ? 'default' : 'outline'} aria-pressed={library === 'shared'} onClick={() => setLibrary('shared')}><Users />Shared Library</Button>
          <Button variant={library === 'private' ? 'default' : 'outline'} aria-pressed={library === 'private'} onClick={() => setLibrary('private')}><Lock />My Private Library</Button>
        </div>
        <p className="text-sm text-muted-foreground">{library === 'shared' ? 'Episodes shared with members of your workspaces.' : 'Episodes only you can open. Share one whenever you are ready.'}</p>
        <div className="flex flex-wrap gap-3">
          <Input aria-label="Search podcast episodes" placeholder="Search episodes…" value={q} onChange={e => setQ(e.target.value)} className="max-w-sm" />
          <label className="flex items-center gap-2 text-sm"><span>Sort by</span><select value={sort} onChange={e => setSort(e.target.value as typeof sort)} className="h-10 rounded-md border border-input bg-background px-3"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option><option value="series">Series / topic</option></select></label>
        </div>
        {lib.loading ? <p className="text-sm text-muted-foreground">Loading…</p> :
          shown.length === 0 ? <p className="text-sm text-muted-foreground italic">No {library} episodes match this search{session ? ' — create or upload one below.' : '.'}</p> :
          <ul className="grid gap-3">
            {shown.map(ep => (
              <li key={ep.id} className={`parchment p-4 flex gap-4 items-start ${current?.id === ep.id ? 'ring-1 ring-accent' : ''}`}>
                <button onClick={() => play(ep)} aria-label={`Play ${ep.title}`} className="relative shrink-0 w-20 h-20 overflow-hidden rounded border border-accent/50 grid place-items-center hover:bg-accent/15">
                  {ep.cover_url ? <img src={ep.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover"/> : <Headphones className="w-6 h-6" />}
                </button>
                <div className="flex-1 min-w-0">
                  <button onClick={() => play(ep)} className="font-display text-lg text-left hover:underline">{ep.title}</button>
                  <div className="text-xs text-muted-foreground">{ep.category && <>{ep.category} · </>}{new Date(ep.created_at).toLocaleDateString()} · <EpisodeLength ep={ep} /> · {fmtSize(ep.size_bytes)}{positions[ep.id] > 5 && <> · <span className="text-gold">resume at {fmt(positions[ep.id])}</span></>}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">{ep.workspace_id || ep.shared_with_space ? <><Users className="h-3.5 w-3.5"/>Shared workspace</> : <><Lock className="h-3.5 w-3.5"/>Private to you</>}</div>
                  {session?.user.id === ep.owner_id && <select aria-label={`Visibility of ${ep.title}`} value={ep.workspace_id ?? ''} className="mt-3 h-10 max-w-full border border-input rounded bg-background px-2 text-sm" onChange={async e=>{const r=await supabase.from('library_items').update({workspace_id:e.target.value||null,shared_with_space:false}).eq('id',ep.id);if(r.error)toast.error(r.error.message);else void lib.reload();}}><option value="">Private</option>{spaces.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>}
                  {ep.description && <p className="text-sm mt-1">{ep.description}</p>}
                  {Array.isArray(ep.sections) && ep.sections.length > 0 && <EpisodeSources episode={ep} />}
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-1">
                  <button className="p-2 rounded hover:bg-muted" aria-label={queue.includes(ep.id) ? 'Remove from queue' : 'Add to queue'}
                    onClick={() => setQueue(qu => qu.includes(ep.id) ? qu.filter(x => x !== ep.id) : [...qu, ep.id])}>
                    {queue.includes(ep.id) ? <ListX className="w-4 h-4" /> : <ListPlus className="w-4 h-4" />}
                  </button>
                  {ep.url && <a href={ep.url} download={ep.file_name} className="p-2 rounded hover:bg-muted" aria-label="Download"><Download className="w-4 h-4" /></a>}
                  {april && (isAdmin || session?.user.id === ep.owner_id) && (
                    <><Button variant="ghost" size="sm" onClick={async () => { try { await lib.setShared(ep, !ep.shared_with_space); toast.success(ep.shared_with_space ? 'Episode is now private' : 'Episode shared with April & Shane'); } catch (error) { toast.error((error as Error).message); } }}>{ep.shared_with_space ? <Lock className="h-4 w-4"/> : <Users className="h-4 w-4"/>}{ep.shared_with_space ? 'Make private' : 'Share'}</Button><button className="p-2 rounded hover:bg-muted" aria-label="Delete" onClick={async () => { if (await confirmAction('Delete this episode?')) { await lib.remove(ep); if (current?.id === ep.id) setCurrent(null); } }}><Trash2 className="w-4 h-4" /></button></>
                  )}
                </div>
              </li>
            ))}
          </ul>}
      </section>

      <section>
        {april ? <AuthGate what="create podcast episodes">{() => <div className="mb-6"><PodcastMaker onCreated={lib.reload} /></div>}</AuthGate> : <CreatorStudio onMade={lib.reload} />}
        <h2 className="text-2xl mb-3">Upload an episode</h2>
        <AuthGate what="upload podcast episodes">{(uid) => <UploadForm accept="audio/*" onUpload={(f, m) => lib.upload(f, m, uid)} />}</AuthGate>
      </section>
    </div>
  );
}

function EpisodeSources({ episode }: { episode: LibraryItem }) {
  const sections = (episode.sections as { title?: string; text?: string; loc?: string; href?: string; n?: number }[]) ?? [];
  const transcript = sections.find(s => s.title === 'Episode transcript');
  const sources = sections.filter(s => typeof s.n === 'number');
  if (!transcript && sources.length === 0) return null;
  return <details className="mt-3 text-sm"><summary className="inline-flex cursor-pointer items-center gap-1 font-medium text-gold"><BookOpen className="h-4 w-4" />Transcript &amp; sources</summary>{transcript?.text && <p className="mt-3 whitespace-pre-wrap leading-relaxed">{transcript.text}</p>}{sources.length > 0 && <div className="mt-4"><h4 className="font-medium">Masterbook passages used</h4><ol className="mt-2 space-y-2">{sources.map((source, index) => <li key={`${source.n}-${index}`} id={`episode-${episode.id}-source-${source.n}`} className="border-l border-gold/50 pl-3"><div className="text-xs text-muted-foreground">[{source.n}] {source.title}{source.loc ? ` · ${source.loc}` : ''}</div><p className="mt-1 line-clamp-3">{source.text}</p>{source.href?.startsWith('/') && <Link to={source.href} className="mt-1 inline-block text-xs underline">Open protected source</Link>}</li>)}</ol></div>}</details>;
}

export function UploadForm({ accept, onUpload, categoryLabel = 'Series / topic' }: { accept?: string; categoryLabel?: string; onUpload: (f: File, m: { title: string; description: string; category: string; shared_with_space: boolean; workspace_id?: string | null }) => Promise<void> }) {
  const april = useAprilSpace();
  const spaces = useWorkspaces();
  const [workspaceId, setWorkspaceId] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [category, setCategory] = useState('');
  const [shared, setShared] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const f = fileRef.current?.files?.[0]; if (!f) return;
    setBusy(true);
    try { await onUpload(f, { title, description, category, shared_with_space: april && shared, workspace_id: workspaceId || null }); toast.success(shared || workspaceId ? 'Uploaded to the shared library' : 'Uploaded privately'); setTitle(''); setDescription(''); setCategory(''); if (fileRef.current) fileRef.current.value = ''; }
    catch (err) { toast.error((err as Error).message); }
    setBusy(false);
  };
  return (
    <form onSubmit={submit} className="parchment deckle p-5 grid gap-3 max-w-xl">
      <input ref={fileRef} aria-label="Audio file" type="file" accept={accept} required className="text-sm" />
      <Input aria-label="Episode title" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <Input aria-label={categoryLabel} placeholder={categoryLabel} value={category} onChange={e => setCategory(e.target.value)} />
      <Textarea aria-label="Episode description" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
      {april ? <fieldset className="space-y-2"><legend className="text-sm font-medium">Who can listen?</legend><label className="mr-4 inline-flex items-center gap-2 text-sm"><input type="radio" name="uploaded-podcast-sharing" checked={!shared} onChange={() => setShared(false)} />Only me</label><label className="inline-flex items-center gap-2 text-sm"><input type="radio" name="uploaded-podcast-sharing" checked={shared} onChange={() => setShared(true)} />April &amp; Shane</label></fieldset> : <label className="space-y-2 text-sm">Who can listen?<select aria-label="Upload visibility" value={workspaceId} onChange={e => setWorkspaceId(e.target.value)} className="block w-full rounded border border-input bg-background p-2"><option value="">Only me</option>{spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>}
      <Button type="submit" disabled={busy} className="justify-self-start"><Upload className="w-4 h-4 mr-2" />{busy ? 'Uploading…' : 'Upload'}</Button>
    </form>
  );
}

/** Episode length: exact from WAV size (24 kHz 16-bit mono), otherwise read from the audio file's metadata. */
function EpisodeLength({ ep }: { ep: LibraryItem }) {
  const isWav = /wav/i.test(ep.mime_type ?? '') || /\.wav$/i.test(ep.file_name ?? '');
  const [secs, setSecs] = useState<number | null>(isWav && ep.size_bytes ? Math.max(0, (ep.size_bytes - 44) / 48000) : null);
  useEffect(() => {
    if (secs != null || !ep.url) return;
    const a = new Audio(); a.preload = 'metadata';
    a.onloadedmetadata = () => { if (Number.isFinite(a.duration)) setSecs(a.duration); };
    a.src = ep.url;
    return () => { a.src = ''; };
  }, [ep.url, secs]);
  if (secs == null) return <span>length loading…</span>;
  const m = Math.floor(secs / 60), s = Math.round(secs % 60);
  return <span className="text-foreground">{m ? `${m} min ${s}s` : `${s}s`}</span>;
}
