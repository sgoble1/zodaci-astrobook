import { RelationshipsAdmin } from '@/components/relationships/RelationshipsAdmin';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileUp, Trash2, Save, Plus, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useLibrary, useSession, useIsAdmin, type LibraryItem } from '@/hooks/useLibrary';
import { useDocOverrides, type DocOverride } from '@/hooks/useDocOverrides';
import { AuthGate } from '@/components/common/AuthGate';
import { extractSections, type DocSection } from '@/lib/extract';
import { loadLibraryIndex } from '@/lib/corpus';
import { BUILT_IN_SOURCES, fmtSize } from '@/content/sources';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';

type Tab = 'upload' | 'sections' | 'index' | 'relationships';

export default function Admin() {
  const session = useSession();
  const isAdmin = useIsAdmin(session);
  const [tab, setTab] = useState<Tab>('upload');
  return (
    <div className="space-y-8">
      <header>
        <div className="font-smallcaps text-xs text-gold flex items-center gap-1"><ShieldCheck className="w-3 h-3" />Admin</div>
        <h1 className="text-4xl sm:text-5xl mt-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">Upload new documents, edit their sections, and choose how every document appears in the Document Index — no code needed.</p>
      </header>
      <AuthGate what="open the admin dashboard">{() => !isAdmin ? (
        <div className="parchment p-5 max-w-xl text-sm">This dashboard is for the site admin only. If you are the admin, sign in with your admin email and make sure it’s confirmed, then reload this page.</div>
      ) : (
        <div className="space-y-6">
          <nav className="flex gap-2 text-sm">{([['upload', 'Upload documents'], ['sections', 'Edit sections'], ['index', 'Document Index'], ['relationships', 'Relationships']] as const).map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`px-3 py-1.5 rounded-full border ${tab === k ? 'border-accent bg-accent/15' : 'border-border hover:bg-muted'}`}>{l}</button>)}</nav>
          {tab === 'upload' && <UploadPanel userId={session!.user.id} />}
          {tab === 'sections' && <SectionsPanel />}
          {tab === 'index' && <IndexPanel />}
          {tab === 'relationships' && <RelationshipsAdmin userId={session!.user.id} />}
        </div>
      )}</AuthGate>
    </div>
  );
}

function UploadPanel({ userId }: { userId: string }) {
  const { upload } = useLibrary('masterbook');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(''); const [category, setCategory] = useState(''); const [description, setDescription] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const submit = async () => {
    if (!file) return;
    try {
      setBusy('Reading the document…');
      const sections = await extractSections(file);
      setBusy(`Saving ${sections.length} sections…`);
      await upload(file, { title: title || file.name.replace(/\.[^.]+$/, ''), category: category || 'Admin uploads', description, sections }, userId);
      toast.success(`Added with ${sections.length} sections — edit them under “Edit sections”`);
      setFile(null); setTitle(''); setCategory(''); setDescription('');
    } catch (e) { toast.error((e as Error).message || 'Upload failed'); }
    setBusy(null);
  };
  return (
    <div className="parchment deckle p-5 space-y-3 max-w-2xl">
      <Input type="file" accept=".pdf,.xlsx,.xls,.csv,.ods,.tsv,.txt,.md" onChange={e => { const f = e.target.files?.[0] ?? null; setFile(f); if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, '')); }} />
      <div className="grid sm:grid-cols-2 gap-3"><Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} /><Input placeholder="Group (e.g. Transit notes)" value={category} onChange={e => setCategory(e.target.value)} /></div>
      <Textarea placeholder="Short description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
      <Button onClick={submit} disabled={!file || !!busy}><FileUp className="w-4 h-4 mr-2" />{busy ?? 'Upload & split into sections'}</Button>
      <p className="text-xs text-muted-foreground">The document appears in the Masterbook, the Document Index, ⌘K search and Ask the Sources.</p>
    </div>
  );
}

function SectionsPanel() {
  const { items, loading, remove, reload } = useLibrary('masterbook');
  const [openId, setOpenId] = useState<string | null>(null);
  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!items.length) return <p className="text-sm text-muted-foreground">No uploaded documents yet. Built-in source documents are fixed; you can rename, reorder or hide them under “Document Index”.</p>;
  return (
    <div className="space-y-3">
      {items.map(it => openId === it.id ? <SectionEditor key={it.id} item={it} onDone={() => { setOpenId(null); reload(); }} /> : (
        <div key={it.id} className="parchment p-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-0"><div className="font-display text-lg">{it.title}</div><div className="text-xs text-muted-foreground">{it.category} · {it.file_name} · {fmtSize(it.size_bytes)} · {((it.sections as DocSection[] | null) ?? []).length} sections</div></div>
          <Link to={`/masterbook/u/${it.id}`} className="text-xs underline">View</Link>
          <Button size="sm" variant="outline" onClick={() => setOpenId(it.id)}>Edit</Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { if (confirm(`Delete “${it.title}”?`)) remove(it); }}><Trash2 className="w-4 h-4" /></Button>
        </div>
      ))}
    </div>
  );
}

function SectionEditor({ item, onDone }: { item: LibraryItem; onDone: () => void }) {
  const [meta, setMeta] = useState({ title: item.title, category: item.category ?? '', description: item.description ?? '' });
  const [secs, setSecs] = useState<DocSection[]>(((item.sections as DocSection[] | null) ?? []).map(s => ({ ...s })));
  const [saving, setSaving] = useState(false);
  const set = (i: number, p: Partial<DocSection>) => setSecs(s => s.map((x, j) => j === i ? { ...x, ...p } : x));
  const move = (i: number, d: number) => setSecs(s => { const n = [...s]; const j = i + d; if (j < 0 || j >= n.length) return s; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('library_items').update({ title: meta.title, category: meta.category || null, description: meta.description || null, sections: secs }).eq('id', item.id);
    setSaving(false);
    if (error) toast.error(error.message); else { toast.success('Saved'); onDone(); }
  };
  return (
    <div className="parchment p-4 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3"><Input value={meta.title} onChange={e => setMeta(m => ({ ...m, title: e.target.value }))} placeholder="Title" /><Input value={meta.category} onChange={e => setMeta(m => ({ ...m, category: e.target.value }))} placeholder="Group" /></div>
      <Textarea value={meta.description} onChange={e => setMeta(m => ({ ...m, description: e.target.value }))} placeholder="Description" />
      <ol className="space-y-3">
        {secs.map((s, i) => (
          <li key={i} className="border border-border rounded p-3 space-y-2">
            <div className="flex gap-2 items-center"><span className="text-xs text-muted-foreground w-6">{i + 1}.</span><Input value={s.title} onChange={e => set(i, { title: e.target.value })} />
              <Button size="sm" variant="ghost" onClick={() => move(i, -1)}>↑</Button><Button size="sm" variant="ghost" onClick={() => move(i, 1)}>↓</Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setSecs(x => x.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></Button></div>
            <div className="grid md:grid-cols-2 gap-3">
              <Textarea rows={8} value={s.text} onChange={e => set(i, { text: e.target.value })} />
              <div className="border border-border rounded p-3 max-h-64 overflow-y-auto bg-card">
                <div className="font-smallcaps text-[10px] text-gold mb-1">Live preview</div>
                <h3 className="text-base font-semibold mb-1">{s.title}</h3>
                <div className="mb-prose text-sm"><ReactMarkdown>{s.text || '_Empty section_'}</ReactMarkdown></div>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setSecs(x => [...x, { title: 'New section', text: '' }])}><Plus className="w-4 h-4 mr-1" />Add section</Button>
        <Button onClick={save} disabled={saving}><Save className="w-4 h-4 mr-1" />{saving ? 'Saving…' : 'Save changes'}</Button>
        <Button variant="ghost" onClick={onDone}>Cancel</Button>
      </div>
    </div>
  );
}

function IndexPanel() {
  const { map, save } = useDocOverrides();
  const uploads = useLibrary('masterbook');
  const [docs, setDocs] = useState<{ key: string; title: string; kind: string }[]>([]);
  const [draft, setDraft] = useState<Record<string, DocOverride>>({});
  useEffect(() => {
    loadLibraryIndex().then(ix => {
      const mb = BUILT_IN_SOURCES.find(s => /Masterbook/.test(s.fileName));
      setDocs([{ key: 'masterbook', title: mb?.title ?? 'Masterbook', kind: 'Built-in' },
        ...ix.map(d => ({ key: 'lib:' + d.id, title: BUILT_IN_SOURCES.find(s => s.fileName === d.fileName)?.title ?? d.fileName, kind: 'Built-in' })),
        ...uploads.items.map(u => ({ key: 'up:' + u.id, title: u.title, kind: 'Upload' }))]);
    });
  }, [uploads.items]);
  const get = (k: string): DocOverride => draft[k] ?? map[k] ?? { doc_key: k, title: null, note: null, hidden: false, sort_order: null };
  const upd = (k: string, p: Partial<DocOverride>) => setDraft(d => ({ ...d, [k]: { ...get(k), ...p } }));
  const commit = async (k: string) => { try { await save(get(k)); setDraft(d => { const n = { ...d }; delete n[k]; return n; }); toast.success('Saved'); } catch (e) { toast.error((e as Error).message); } };
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Rename a document, add a short note under its title, set its position (lower numbers first) or hide it from the <Link to="/masterbook/index" className="underline">Document Index</Link>.</p>
      {docs.map(d => { const o = get(d.key); return (
        <div key={d.key} className={`parchment p-3 grid md:grid-cols-[1fr_1fr_90px_auto_auto] gap-2 items-center ${o.hidden ? 'opacity-60' : ''}`}>
          <Input value={o.title ?? ''} placeholder={d.title} onChange={e => upd(d.key, { title: e.target.value || null })} />
          <Input value={o.note ?? ''} placeholder="Note shown under the title" onChange={e => upd(d.key, { note: e.target.value || null })} />
          <Input type="number" value={o.sort_order ?? ''} placeholder="Order" onChange={e => upd(d.key, { sort_order: e.target.value === '' ? null : +e.target.value })} />
          <Button size="sm" variant="ghost" onClick={() => upd(d.key, { hidden: !o.hidden })} title={o.hidden ? 'Hidden' : 'Visible'}>{o.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</Button>
          <Button size="sm" onClick={() => commit(d.key)} disabled={!draft[d.key]}><Save className="w-4 h-4" /></Button>
          <div className="md:col-span-5 text-[11px] text-muted-foreground">{d.kind} · {d.title}</div>
        </div>
      ); })}
    </div>
  );
}
