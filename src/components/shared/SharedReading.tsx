import { useCallback, useEffect, useRef, useState } from 'react';
import { FileText, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { confirmAction } from '@/components/common/ConfirmHost';
import { createSingleFlight } from '@/lib/singleFlight';

type Doc = { id: string; title: string; description: string; file_path: string; file_name: string; mime_type: string | null; uploaded_by: string; created_at: string };
type Note = { id: string; document_id: string; author_id: string; page: number | null; quote: string; note: string; created_at: string };

export function SharedReading({ userId }: { userId: string }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Doc | null>(null);
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({ page: '', quote: '', note: '' });
  const selectedRef = useRef('');
  selectedRef.current = selected?.id ?? '';
  const identity = useRef(userId); identity.current = userId;
  const uploadGate = useRef(createSingleFlight<void>());
  const noteGate = useRef(createSingleFlight<void>());
  const deleteGate = useRef(createSingleFlight<void>());
  const [deleting, setDeleting] = useState(false);
  const [fileError, setFileError] = useState(false);
  const [noteError, setNoteError] = useState('');
  const [cleanup, setCleanup] = useState<string | null>(null);

  const loadDocs = useCallback(async () => {
    const { data, error } = await supabase.from('shared_documents').select('*').order('created_at', { ascending: false });
    if (error) toast.error('Shared documents could not be loaded.');
    if (identity.current === userId && !error) setDocs((data ?? []) as Doc[]);
  }, [userId]);
  const loadNotes = useCallback(async (id: string) => {
    const owner = userId;
    const { data, error } = await supabase.from('shared_annotations').select('*').eq('document_id', id).order('created_at');
    if (identity.current !== owner || selectedRef.current !== id) return;
    if (error) { toast.error('Notes could not be loaded. Try opening this document again.'); return; }
    setNotes((data ?? []) as Note[]);
  }, [userId]);

  useEffect(() => {
    loadDocs();
    supabase.rpc('shared_member_directory').then(({ data }) => setNames(Object.fromEntries((data ?? []).map((m: { user_id: string; display_name: string }) => [m.user_id, m.display_name]))), () => undefined);
    const ch = supabase.channel(`shared-reading:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shared_documents' }, loadDocs)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shared_annotations' }, () => { if (selectedRef.current) loadNotes(selectedRef.current); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId, loadDocs, loadNotes]);

  useEffect(() => {
    let active = true;
    setUrl(''); setNotes([]); setFileError(false);
    if (!selected) return;
    loadNotes(selected.id);
    supabase.storage.from('shared-space').createSignedUrl(selected.file_path, 3600).then(({ data, error }) => { if (active) { setUrl(data?.signedUrl ?? ''); setFileError(Boolean(error) || !data?.signedUrl); } }).catch(() => { if (active) setFileError(true); });
    return () => { active = false; };
  }, [selected, loadNotes]);

  const upload = () => uploadGate.current(async () => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { toast.error('Please choose a file under 20 MB.'); return; }
    setBusy(true);
    const path = `${userId}/reading/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]+/g, '_')}`;
    const up = await supabase.storage.from('shared-space').upload(path, file, { contentType: file.type });
    if (up.error) { setBusy(false); toast.error('Upload failed. Please try again.'); return; }
    const { error } = await supabase.from('shared_documents').insert({ title: title.trim() || file.name, file_path: path, file_name: file.name, mime_type: file.type || null, size_bytes: file.size, uploaded_by: userId });
    setBusy(false);
    if (error) { const removed = await supabase.storage.from('shared-space').remove([path]); if (removed.error) setCleanup(path); toast.error('The file could not be added to the reading room. Please try again.'); return; }
    setTitle(''); setFile(null); toast.success('Document shared.'); loadDocs();
  });

  const addNote = () => noteGate.current(async () => {
    if (!selected || !draft.note.trim()) return;
    if (draft.page && (!Number.isSafeInteger(Number(draft.page)) || Number(draft.page) < 1)) { setNoteError('Use a whole page number starting at 1, or leave it blank.'); return; }
    setNoteError('');
    const selectedId = selected.id;
    const { error } = await supabase.from('shared_annotations').insert({ document_id: selected.id, author_id: userId, page: draft.page ? Number(draft.page) : null, quote: draft.quote.trim(), note: draft.note.trim() });
    if (error) { toast.error('The note could not be saved. Please try again.'); return; }
    if (selectedRef.current === selectedId) { setDraft({ page: '', quote: '', note: '' }); loadNotes(selectedId); }
  });
  const removeNote = (id: string) => deleteGate.current(async () => { if (!await confirmAction('Delete this note? It will be removed for both readers.', 'Delete note')) return; const { error } = await supabase.from('shared_annotations').delete().eq('id', id).eq('author_id', userId); if (error) toast.error('The note could not be deleted. Please try again.'); else if (selected) loadNotes(selected.id); });
  const removeDoc = (d: Doc) => deleteGate.current(async () => {
    if (!await confirmAction(`Delete “${d.title}” and its shared notes? This removes it for both readers.`, 'Delete document')) return;
    setDeleting(true);
    try {
    const { error } = await supabase.from('shared_documents').delete().eq('id', d.id);
    if (error) { toast.error('The document could not be deleted. Please try again.'); return; }
    const removed = await supabase.storage.from('shared-space').remove([d.file_path]);
    if (removed.error) { setCleanup(d.file_path); toast.error('Document removed. Its file still needs cleanup; please retry below.'); }
    else toast.success('Document deleted.');
    setSelected(null); loadDocs();
    } finally { setDeleting(false); }
  });

  const isPdf = selected?.mime_type === 'application/pdf';
  const isImage = selected?.mime_type?.startsWith('image/');

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="parchment space-y-3 p-3" aria-label="Shared documents">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="shared-doc-title">Share a document</label>
          <Input id="shared-doc-title" placeholder="Title (optional)" value={title} onChange={e => setTitle(e.target.value)} />
          <Input aria-label="Choose a file" type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
          <Button className="w-full" onClick={upload} disabled={!file || busy}><Upload />{busy ? 'Uploading…' : 'Upload'}</Button>
          {cleanup && <Button variant="outline" onClick={async () => { const r = await supabase.storage.from('shared-space').remove([cleanup]); if (r.error) toast.error('File cleanup is still unavailable. Try again later.'); else { setCleanup(null); toast.success('File cleanup complete.'); } }}>Retry file cleanup</Button>}
        </div>
        <ul className="space-y-1">
          {docs.length === 0 && <li className="text-sm text-muted-foreground">No shared documents yet.</li>}
          {docs.map(d => (
            <li key={d.id}>
              <button onClick={() => setSelected(d)} aria-current={selected?.id === d.id} className={`flex min-h-11 w-full items-start gap-2 rounded p-2 text-left ${selected?.id === d.id ? 'bg-accent/15' : 'hover:bg-muted/60'}`}>
                <FileText className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span><span className="block text-sm font-medium">{d.title}</span><span className="block text-xs text-muted-foreground">{names[d.uploaded_by] ?? 'Member'} · {new Date(d.created_at).toLocaleDateString()}</span></span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {!selected ? (
        <section className="parchment p-6 text-sm text-muted-foreground">Choose a document to read it together and add notes.</section>
      ) : (
        <section className="min-w-0 space-y-4" aria-label={selected.title}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl">{selected.title}</h2>
            <div className="flex gap-2">
              {url && <Button asChild variant="outline" size="sm"><a href={url} target="_blank" rel="noreferrer">Open file</a></Button>}
              {selected.uploaded_by === userId && <Button variant="outline" size="sm" disabled={deleting} onClick={() => removeDoc(selected)}><Trash2 />{deleting ? 'Deleting…' : 'Delete'}</Button>}
            </div>
          </div>
          {url && (isPdf ? <iframe title={selected.title} src={url} className="h-[60vh] w-full rounded border border-border bg-card" />
            : isImage ? <img loading="lazy" decoding="async" src={url} alt={selected.title} className="max-h-[60vh] w-full rounded object-contain" />
            : <p className="text-sm text-muted-foreground">This file type opens in a new tab — use “Open file”.</p>)}
          {fileError && <div role="alert" className="space-y-2"><p>The file could not be opened. Your document and notes are still here.</p><Button variant="outline" onClick={() => setSelected({ ...selected })}>Retry file</Button></div>}
          <div className="parchment space-y-3 p-4">
            <h3 className="text-lg">Notes on this document</h3>
            {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
            <ul className="space-y-3">
              {notes.map(n => (
                <li key={n.id} className="rounded border border-border/60 p-3">
                  <div className="flex items-start justify-between gap-2 text-xs text-muted-foreground">
                    <span>{names[n.author_id] ?? 'Member'}{n.page ? ` · page ${n.page}` : ''} · {new Date(n.created_at).toLocaleString()}</span>
                    {n.author_id === userId && <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label="Delete note" onClick={() => removeNote(n.id)}><Trash2 /></Button>}
                  </div>
                  {n.quote && <blockquote className="my-2 border-l-2 border-primary pl-3 text-sm italic">{n.quote}</blockquote>}
                  <p className="whitespace-pre-wrap text-sm">{n.note}</p>
                </li>
              ))}
            </ul>
            <div className="grid gap-2 sm:grid-cols-[100px_1fr]">
              <Input aria-label="Page number" inputMode="numeric" placeholder="Page" value={draft.page} onChange={e => setDraft(d => ({ ...d, page: e.target.value.replace(/\D/g, '') }))} />
              <Input aria-label="Quoted passage" placeholder="Quote a passage (optional)" value={draft.quote} onChange={e => setDraft(d => ({ ...d, quote: e.target.value }))} />
            </div>
            <Textarea aria-label="Your note" placeholder="Your note…" value={draft.note} onChange={e => setDraft(d => ({ ...d, note: e.target.value }))} />
            {noteError && <p role="alert" className="text-sm text-destructive">{noteError}</p>}
            <Button onClick={addNote} disabled={!draft.note.trim()}>Add note</Button>
          </div>
        </section>
      )}
    </div>
  );
}
