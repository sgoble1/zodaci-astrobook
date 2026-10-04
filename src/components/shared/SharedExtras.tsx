import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleHelp, FolderPlus, MessageCircle, Pencil, Send, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = (name: string): any => supabase.from(name as never);
const EMOJI = ['❤️', '👍', '✨', '😂', '🔥'];
const CATS = ['Movie', 'Show', 'Music', 'Book', 'Podcast', 'Place', 'Other'];
const stamp = (v: string) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(v));

type Rec = { id: string; author_id: string; category: string; title: string; link: string; note: string; created_at: string };
type Media = { id: string; uploaded_by: string; file_path: string; file_name: string; mime_type: string | null; caption: string; created_at: string; folder_id?: string | null; url?: string };
type Comment = { id: string; author_id: string; body: string; created_at: string };
type Reaction = { id: string; user_id: string; emoji: string };

function useDirectory() {
  const [d, setD] = useState<Record<string, string>>({});
  useEffect(() => { supabase.rpc('shared_member_directory').then(({ data }) => setD(Object.fromEntries((data ?? []).map(r => [r.user_id, r.display_name])))); }, []);
  return d;
}

/** Posts a message into the main April & Shane conversation — used by every "Chat about this" button. */
export async function shareToChat(text: string) {
  const { data: s } = await supabase.auth.getSession();
  const uid = s.session?.user.id; if (!uid) throw new Error('Sign in first.');
  const { data: id, error } = await supabase.rpc('ensure_shared_main_conversation');
  if (error || !id) throw new Error('Only April and Shane can chat here.');
  const ins = await db('shared_messages').insert({ conversation_id: id, sender_id: uid, body: text });
  if (ins.error) throw ins.error;
  return id as string;
}

/** Reactions + threaded comments for any shared item (recommendation or media file). */
export function ItemThread({ type, id, userId, title }: { type: string; id: string; userId: string; title: string }) {
  const dir = useDirectory();
  const [comments, setComments] = useState<Comment[]>([]); const [reactions, setReactions] = useState<Reaction[]>([]); const [body, setBody] = useState('');
  const load = useCallback(async () => {
    const [c, r] = await Promise.all([db('shared_item_comments').select('*').eq('item_type', type).eq('item_id', id).order('created_at'), db('shared_item_reactions').select('*').eq('item_type', type).eq('item_id', id)]);
    setComments(c.data ?? []); setReactions(r.data ?? []);
  }, [type, id]);
  useEffect(() => {
    load();
    const ch = supabase.channel(`thread-${type}-${id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'shared_item_comments' }, load).on('postgres_changes', { event: '*', schema: 'public', table: 'shared_item_reactions' }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load, type, id]);
  const toggle = async (emoji: string) => {
    const mine = reactions.find(r => r.user_id === userId && r.emoji === emoji);
    setReactions(rs => mine ? rs.filter(r => r.id !== mine.id) : [...rs, { id: 'tmp' + emoji, user_id: userId, emoji }]);
    const res = mine ? await db('shared_item_reactions').delete().eq('id', mine.id) : await db('shared_item_reactions').insert({ item_type: type, item_id: id, user_id: userId, emoji });
    if (res.error) { toast.error('Reaction not saved.'); load(); }
  };
  const send = async () => {
    if (!body.trim()) return; const text = body.trim(); setBody('');
    const res = await db('shared_item_comments').insert({ item_type: type, item_id: id, author_id: userId, body: text });
    if (res.error) { toast.error('Comment not sent.'); setBody(text); } else load();
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Reactions">
        {EMOJI.map(e => { const n = reactions.filter(r => r.emoji === e).length; const mine = reactions.some(r => r.emoji === e && r.user_id === userId);
          return <button key={e} type="button" onClick={() => toggle(e)} aria-pressed={mine} aria-label={`React ${e}${n ? `, ${n}` : ''}`} className={`min-h-9 rounded-full border px-3 text-sm transition ${mine ? 'border-primary bg-primary/15' : 'border-border hover:border-primary'}`}>{e}{n ? ` ${n}` : ''}</button>; })}
        <Button type="button" variant="outline" size="sm" onClick={() => shareToChat(`💬 About “${title}”`).then(() => toast.success('Added to your conversation')).catch(e => toast.error(e.message))}><MessageCircle className="h-4 w-4" />Chat about this</Button>
        <Button asChild type="button" variant="outline" size="sm"><Link to="/instructions"><CircleHelp className="h-4 w-4" />Instructions</Link></Button>
      </div>
      <ul className="space-y-2">{comments.map(c => <li key={c.id} className="rounded bg-muted/40 px-3 py-2 text-sm"><span className="font-semibold">{dir[c.author_id] ?? 'Member'}</span> <span className="text-xs text-muted-foreground">{stamp(c.created_at)}</span><p className="whitespace-pre-wrap">{c.body}</p>{c.author_id === userId && <button type="button" className="text-xs text-muted-foreground underline" onClick={() => db('shared_item_comments').delete().eq('id', c.id).then(load)}>Delete</button>}</li>)}</ul>
      <form className="flex gap-2" onSubmit={e => { e.preventDefault(); send(); }}><Input value={body} onChange={e => setBody(e.target.value)} placeholder="Write a comment…" aria-label="Comment" /><Button type="submit" size="icon" aria-label="Send comment"><Send className="h-4 w-4" /></Button></form>
    </div>
  );
}

export function Recommendations({ userId, compact = false }: { userId: string; compact?: boolean }) {
  const dir = useDirectory();
  const [items, setItems] = useState<Rec[] | null>(null); const [filter, setFilter] = useState('All'); const [open, setOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ category: 'Movie', title: '', link: '', note: '' });
  const load = useCallback(() => db('shared_recommendations').select('*').order('created_at', { ascending: false }).then(({ data }: { data: Rec[] | null }) => setItems(data ?? [])), []);
  useEffect(() => { load(); const ch = supabase.channel('recs').on('postgres_changes', { event: '*', schema: 'public', table: 'shared_recommendations' }, load).subscribe(); return () => { supabase.removeChannel(ch); }; }, [load]);
  const add = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.title.trim()) return;
    const res = await db('shared_recommendations').insert({ ...form, title: form.title.trim(), author_id: userId });
    if (res.error) toast.error('Could not save.'); else { setForm({ ...form, title: '', link: '', note: '' }); toast.success('Recommendation shared'); load(); }
  };
  const shown = (items ?? []).filter(r => filter === 'All' || r.category === filter).slice(0, compact ? 4 : undefined);
  return (
    <section className="parchment p-5 space-y-4 gentle-fade">
      <div className="flex justify-between gap-2"><h2 className="text-2xl">Recommendations</h2>{compact && <Link to="/shared/recommendations" className="text-xs underline">See all</Link>}</div>
      {!compact && <form onSubmit={add} className="grid gap-2 sm:grid-cols-[8rem_1fr]">
        <select aria-label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="h-10 rounded-md border border-input bg-background px-2 text-sm">{CATS.map(c => <option key={c}>{c}</option>)}</select>
        <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title — e.g. Past Lives" aria-label="Title" required />
        <Input className="sm:col-span-2" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="Link (optional)" aria-label="Link" />
        <Textarea className="sm:col-span-2" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Why you think the other would love it…" aria-label="Why" rows={2} />
        <Button type="submit" className="sm:col-span-2 sm:justify-self-start">Share recommendation</Button>
      </form>}
      {!compact && <div className="flex flex-wrap gap-1.5">{['All', ...CATS].map(c => <Button key={c} size="sm" variant={filter === c ? 'default' : 'outline'} onClick={() => setFilter(c)}>{c}</Button>)}</div>}
      {items === null ? <p role="status" className="text-sm text-muted-foreground">Loading…</p> : !shown.length ? <p className="text-sm text-muted-foreground">No recommendations yet{compact ? '' : ' — share the first one above'}.</p> :
        <ul className="grid gap-3 sm:grid-cols-2">{shown.map(r => <li key={r.id} className="rounded-lg border border-border p-4 space-y-2">
          <div className="flex items-start justify-between gap-2"><div><span className="text-[10px] uppercase tracking-wider text-accent">{r.category}</span><h3 className="text-lg leading-tight">{r.link ? <a href={r.link} target="_blank" rel="noreferrer" className="underline">{r.title}</a> : r.title}</h3><p className="text-xs text-muted-foreground">from {dir[r.author_id] ?? 'Member'} · {stamp(r.created_at)}</p></div>
            {r.author_id === userId && !compact && <Button variant="ghost" size="icon" aria-label={`Delete ${r.title}`} onClick={() => db('shared_recommendations').delete().eq('id', r.id).then(load)}><Trash2 className="h-4 w-4" /></Button>}</div>
          {r.note && <p className="text-sm">{r.note}</p>}
          {!compact && (open === r.id ? <ItemThread type="rec" id={r.id} userId={userId} title={r.title} /> : <Button variant="link" className="px-0" onClick={() => setOpen(r.id)}>React & comment</Button>)}
        </li>)}</ul>}
    </section>
  );
}

type Folder = { id: string; name: string; created_by: string; created_at: string };

export function MediaLibrary({ userId }: { userId: string }) {
  const dir = useDirectory();
  const [items, setItems] = useState<Media[] | null>(null); const [busy, setBusy] = useState(false); const [view, setView] = useState<Media | null>(null); const [caption, setCaption] = useState('');
  const [folders, setFolders] = useState<Folder[]>([]); const [current, setCurrent] = useState<string>('all'); const [newFolder, setNewFolder] = useState('');
  const [q, setQ] = useState(''); const [sort, setSort] = useState<'new' | 'old' | 'name'>('new'); const [dropOn, setDropOn] = useState<string | null>(null); const [editCaption, setEditCaption] = useState('');
  const load = useCallback(async () => {
    const [{ data }, { data: f }] = await Promise.all([db('shared_media').select('*').order('created_at', { ascending: false }), db('shared_media_folders').select('*').order('name')]);
    const rows: Media[] = data ?? [];
    setFolders(f ?? []);
    const signed = rows.length ? await supabase.storage.from('shared-space').createSignedUrls(rows.map(r => r.file_path), 3600) : { data: [] };
    setItems(rows.map((r, i) => ({ ...r, url: signed.data?.[i]?.signedUrl })));
  }, []);
  useEffect(() => {
    load();
    const id = crypto.randomUUID();
    const ch = supabase.channel(`media-${id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'shared_media' }, load).on('postgres_changes', { event: '*', schema: 'public', table: 'shared_media_folders' }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);
  const targetFolder = current === 'all' || current === 'none' ? null : current;
  const upload = async (files: FileList | null) => {
    if (!files?.length) return; setBusy(true);
    try {
      for (const f of Array.from(files)) {
        if (f.size > 50 * 1024 * 1024) { toast.error(`${f.name} is over 50 MB`); continue; }
        const path = `${userId}/media/${Date.now()}-${crypto.randomUUID()}-${f.name.replace(/[^\w.-]+/g, '_')}`;
        const up = await supabase.storage.from('shared-space').upload(path, f, { contentType: f.type });
        if (up.error) throw up.error;
        const ins = await db('shared_media').insert({ uploaded_by: userId, file_path: path, file_name: f.name, mime_type: f.type || null, size_bytes: f.size, caption, folder_id: targetFolder });
        if (ins.error) throw ins.error;
      }
      setCaption(''); toast.success('Added to the library'); load();
    } catch (e) { toast.error((e as Error).message || 'Upload failed'); }
    setBusy(false);
  };
  const remove = async (m: Media) => { if (!confirm('Delete this file for both of you?')) return; await supabase.storage.from('shared-space').remove([m.file_path]); await db('shared_media').delete().eq('id', m.id); setView(null); load(); };
  const move = async (mediaId: string, folderId: string | null) => {
    const { error } = await db('shared_media').update({ folder_id: folderId }).eq('id', mediaId);
    if (error) return toast.error('Could not move that file.');
    toast.success(`Moved to ${folderId ? folders.find(f => f.id === folderId)?.name : 'Unfiled'}`);
    setView(v => v && v.id === mediaId ? { ...v, folder_id: folderId } : v); load();
  };
  const saveCaption = async (m: Media) => { const { error } = await db('shared_media').update({ caption: editCaption }).eq('id', m.id); if (error) return toast.error('Could not save the caption.'); setView({ ...m, caption: editCaption }); load(); };
  const addFolder = async (e: React.FormEvent) => { e.preventDefault(); const name = newFolder.trim(); if (!name) return; const { data, error } = await db('shared_media_folders').insert({ name, created_by: userId }).select().single(); if (error) return toast.error('Could not create the folder.'); setNewFolder(''); setCurrent(data.id); load(); };
  const renameFolder = async (f: Folder) => { const name = prompt('Rename folder', f.name)?.trim(); if (!name || name === f.name) return; await db('shared_media_folders').update({ name }).eq('id', f.id); load(); };
  const deleteFolder = async (f: Folder) => { if (!confirm(`Delete the folder “${f.name}”? Files inside move to Unfiled — nothing is deleted.`)) return; await db('shared_media_folders').delete().eq('id', f.id); setCurrent('all'); load(); };
  const isVideo = (m: Media) => m.mime_type?.startsWith('video/');
  const count = (id: string) => (items ?? []).filter(m => id === 'all' ? true : id === 'none' ? !m.folder_id : m.folder_id === id).length;
  const shown = (items ?? [])
    .filter(m => current === 'all' ? true : current === 'none' ? !m.folder_id : m.folder_id === current)
    .filter(m => !q.trim() || `${m.caption} ${m.file_name}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => sort === 'name' ? (a.caption || a.file_name).localeCompare(b.caption || b.file_name) : sort === 'old' ? a.created_at.localeCompare(b.created_at) : b.created_at.localeCompare(a.created_at));
  const dropProps = (id: string) => ({
    onDragOver: (e: React.DragEvent) => { if (id === 'all') return; e.preventDefault(); setDropOn(id); },
    onDragLeave: () => setDropOn(d => d === id ? null : d),
    onDrop: (e: React.DragEvent) => { e.preventDefault(); setDropOn(null); const m = e.dataTransfer.getData('text/media-id'); if (m && id !== 'all') move(m, id === 'none' ? null : id); },
  });
  const chip = (id: string, label: string) => <button type="button" {...dropProps(id)} onClick={() => setCurrent(id)} aria-pressed={current === id}
    className={`rounded-full border px-3 py-1 text-xs transition ${current === id ? 'border-accent bg-accent/15' : 'border-border'} ${dropOn === id ? 'ring-2 ring-accent scale-105' : ''}`}>{label} <span className="text-muted-foreground">({count(id)})</span></button>;
  const curFolder = folders.find(f => f.id === current);
  return (
    <div className="space-y-5">
      <section className="parchment p-5 space-y-3">
        <h2 className="text-2xl">Media Library</h2>
        <p className="text-sm text-muted-foreground">Photos, videos and screenshots only the two of you can see. Up to 50 MB each. Make folders, then drag any file onto a folder to file it. You can also open a file and choose "Move to folder".</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption (optional)" aria-label="Caption" />
          <Button asChild disabled={busy}><label className="cursor-pointer"><Upload className="h-4 w-4" />{busy ? 'Uploading…' : `Upload${curFolder ? ` to ${curFolder.name}` : ''}`}<input type="file" multiple accept="image/*,video/*" className="sr-only" onChange={e => upload(e.target.files)} /></label></Button>
        </div>
      </section>
      <section aria-label="Folders" className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">{chip('all', 'All files')}{chip('none', 'Unfiled')}{folders.map(f => <span key={f.id}>{chip(f.id, `📁 ${f.name}`)}</span>)}</div>
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={addFolder} className="flex gap-2"><Input value={newFolder} onChange={e => setNewFolder(e.target.value)} placeholder="New folder name" aria-label="New folder name" maxLength={80} className="h-9 w-48" /><Button size="sm" type="submit" variant="outline" disabled={!newFolder.trim()}><FolderPlus className="h-4 w-4" />Add folder</Button></form>
          {curFolder && <><Button size="sm" variant="ghost" onClick={() => renameFolder(curFolder)}><Pencil className="h-4 w-4" />Rename</Button><Button size="sm" variant="ghost" onClick={() => deleteFolder(curFolder)}><Trash2 className="h-4 w-4" />Delete folder</Button></>}
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search captions…" aria-label="Search media" className="h-9 w-48 sm:ml-auto" />
          <select aria-label="Sort media" value={sort} onChange={e => setSort(e.target.value as typeof sort)} className="h-9 rounded-md border border-input bg-background px-2 text-sm"><option value="new">Newest first</option><option value="old">Oldest first</option><option value="name">By name</option></select>
        </div>
      </section>
      {items === null ? <p role="status">Loading the library…</p> : !shown.length ? <p className="text-sm text-muted-foreground">{items.length ? 'Nothing in this view. Drag files here from All files, or upload new ones.' : 'Nothing here yet. Upload the first photo or video.'}</p> :
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{shown.map((m, i) => <li key={m.id} className="gentle-fade" style={{ animationDelay: `${Math.min(i, 12) * 60}ms` }} draggable onDragStart={e => { e.dataTransfer.setData('text/media-id', m.id); e.dataTransfer.effectAllowed = 'move'; }}>
          <button type="button" onClick={() => { setView(m); setEditCaption(m.caption); }} className="group block w-full cursor-grab overflow-hidden rounded-lg border border-border text-left focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing" aria-label={`Open ${m.caption || m.file_name}`}>
            <div className="aspect-square bg-muted">{isVideo(m) ? <video src={m.url} muted preload="metadata" className="pointer-events-none h-full w-full object-cover" /> : <img src={m.url} alt={m.caption || m.file_name} loading="lazy" draggable={false} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />}</div>
            <div className="p-2 text-xs"><p className="truncate">{m.caption || m.file_name}</p><p className="truncate text-muted-foreground">{dir[m.uploaded_by] ?? 'Member'}{isVideo(m) ? ' · video' : ''}{m.folder_id ? ` · ${folders.find(f => f.id === m.folder_id)?.name ?? ''}` : ''}</p></div>
          </button></li>)}</ul>}
      <Dialog open={!!view} onOpenChange={o => !o && setView(null)}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
          {view && <><DialogHeader><DialogTitle>{view.caption || view.file_name}</DialogTitle></DialogHeader>
            {isVideo(view) ? <video src={view.url} controls autoPlay className="max-h-[60vh] w-full rounded" /> : <img src={view.url} alt={view.caption || view.file_name} className="max-h-[60vh] w-full rounded object-contain" />}
            <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-center">
              <Input value={editCaption} onChange={e => setEditCaption(e.target.value)} aria-label="Edit caption" placeholder="Caption" />
              <Button size="sm" variant="outline" onClick={() => saveCaption(view)} disabled={editCaption === view.caption}>Save caption</Button>
              <select aria-label="Move to folder" value={view.folder_id ?? ''} onChange={e => move(view.id, e.target.value || null)} className="h-9 rounded-md border border-input bg-background px-2 text-sm"><option value="">Unfiled</option>{folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground"><span>{dir[view.uploaded_by] ?? 'Member'} · {stamp(view.created_at)}</span><a className="underline" href={view.url} download={view.file_name}>Download</a>{view.uploaded_by === userId && <button type="button" className="underline" onClick={() => remove(view)}>Delete</button>}<button type="button" className="ml-auto underline" onClick={() => setView(null)}><X className="inline h-3 w-3" /> Close</button></div>
            <ItemThread type="media" id={view.id} userId={userId} title={view.caption || view.file_name} /></>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
