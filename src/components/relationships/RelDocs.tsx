import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '@/hooks/useLibrary';
import { extractSections } from '@/lib/extract';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionEditor } from '@/components/admin/SectionEditor';
import type { Relationship } from '@/hooks/useRelationships';

export const relCategory = (r: Pick<Relationship, 'id'>) => `Relationship · ${r.id}`;

/** Upload PDFs/spreadsheets for one relationship; they become Masterbook uploads with editable sections. */
export function RelDocs({ rel, userId, admin }: { rel: Relationship; userId: string; admin?: boolean }) {
  const { items, upload, remove, reload } = useLibrary('masterbook');
  const [editId, setEditId] = useState<string | null>(null);
  const docs = items.filter(i => i.category === relCategory(rel));
  const [file, setFile] = useState<File | null>(null); const [title, setTitle] = useState('');
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const go = async () => {
    if (!file) return; if (file.size > 20 * 1024 * 1024) { setMsg('Files must be under 20 MB.'); return; }
    setBusy(true); setMsg('Reading the file…');
    try { const sections = await extractSections(file); await upload(file, { title: title.trim().slice(0, 150) || file.name.replace(/\.[^.]+$/, ''), category: relCategory(rel), description: `Document for ${rel.name}`, sections }, userId); setMsg(`Added with ${sections.length} sections.`); setFile(null); setTitle(''); }
    catch (e) { setMsg((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <div className="space-y-3 text-sm">
      {docs.length === 0 ? <p className="text-muted-foreground">No documents for {rel.name} yet.</p> :
        <ul className="space-y-1">{docs.map(d => <li key={d.id} className="flex flex-wrap gap-3 items-center"><Link to={`/masterbook/u/${d.id}`} className="underline font-display">{d.title}</Link><span className="text-xs text-muted-foreground">{Array.isArray(d.sections) ? d.sections.length : 0} sections</span>{(admin || d.owner_id === userId) && <button className="text-xs underline" onClick={() => setEditId(editId === d.id ? null : d.id)}>{editId === d.id ? 'Close editor' : 'Edit sections'}</button>}{(admin || d.owner_id === userId) && <button className="text-xs text-oxblood underline" onClick={() => confirm(`Remove ${d.title}?`) && remove(d)}>Remove</button>}{editId === d.id && <div className="w-full"><SectionEditor item={d} onDone={() => { setEditId(null); reload(); }} /></div>}</li>)}</ul>}
      <div className="flex flex-wrap gap-2 items-center">
        <Input className="max-w-xs" placeholder="Title (optional)" value={title} maxLength={150} onChange={e => setTitle(e.target.value)} />
        <Input className="max-w-xs" type="file" accept=".pdf,.xlsx,.xls,.csv,.txt,.md" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        <Button size="sm" onClick={go} disabled={!file || busy}>Upload</Button>
      </div>
      {msg && <p className="text-xs">{msg}</p>}
    </div>
  );
}
