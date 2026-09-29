import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileUp, Trash2 } from 'lucide-react';
import { useLibrary, useSession } from '@/hooks/useLibrary';
import { AuthGate } from '@/components/common/AuthGate';
import { extractSections } from '@/lib/extract';
import { fmtSize } from '@/content/sources';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function MyUploads() {
  const session = useSession();
  const { items, loading, upload, remove } = useLibrary('masterbook');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const submit = async () => {
    if (!file || !session) return;
    try {
      setBusy('Reading the document…');
      const sections = await extractSections(file);
      setBusy(`Saving ${sections.length} sections…`);
      await upload(file, { title: title || file.name.replace(/\.[^.]+$/, ''), category: category || 'Your Uploads', sections }, session.user.id);
      toast.success(`Added to the Masterbook with ${sections.length} sections`);
      setFile(null); setTitle(''); setCategory('');
    } catch (e) { toast.error((e as Error).message || 'Upload failed'); }
    setBusy(null);
  };

  return (
    <div className="space-y-8">
      <header>
        <div className="font-smallcaps text-xs text-gold">The Masterbook · your additions</div>
        <h1 className="text-4xl sm:text-5xl mt-2">Upload to the Masterbook</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">Add your own PDFs and spreadsheets. Each is split into clickable sections (by heading or page for PDFs, by sheet for spreadsheets), shown in the Masterbook, searchable with ⌘K and answerable in Ask the Sources.</p>
      </header>

      <AuthGate what="add documents to the Masterbook">{() => (
        <div className="parchment deckle p-5 space-y-3 max-w-2xl">
          <Input type="file" accept=".pdf,.xlsx,.xls,.csv,.ods,.tsv,.txt,.md" onChange={e => { const f = e.target.files?.[0] ?? null; setFile(f); if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, '')); }} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <Input placeholder="Group (e.g. Transit notes)" value={category} onChange={e => setCategory(e.target.value)} />
          </div>
          <Button onClick={submit} disabled={!file || !!busy}><FileUp className="w-4 h-4 mr-2" />{busy ?? 'Add to the Masterbook'}</Button>
          <p className="text-xs text-muted-foreground">PDF, Excel (.xlsx/.xls), CSV, ODS and plain text. Scanned PDFs without selectable text will have empty sections.</p>
        </div>
      )}</AuthGate>

      <section>
        <h2 className="text-2xl mb-1">Uploaded documents <span className="text-sm text-muted-foreground font-sans">· {items.length}</span></h2>
        <div className="gold-rule mb-4" />
        {loading ? <p className="text-muted-foreground text-sm">Loading…</p> : !items.length ? <p className="text-muted-foreground text-sm">Nothing uploaded yet.</p> : (
          <div className="grid sm:grid-cols-2 gap-3">
            {items.map(it => {
              const secs = (it.sections as { title: string }[] | null) ?? [];
              return (
                <div key={it.id} className="parchment p-4">
                  <div className="font-smallcaps text-[10px] text-gold">{it.category} · {secs.length} sections · {fmtSize(it.size_bytes)}</div>
                  <Link to={`/masterbook/u/${it.id}`} className="font-display text-lg leading-snug mt-1 block hover:underline">{it.title}</Link>
                  <div className="flex gap-3 mt-3 text-xs">
                    <Link to={`/masterbook/u/${it.id}`} className="underline">Read</Link>
                    {it.url && <a href={it.url} target="_blank" rel="noreferrer" className="underline">Open original</a>}
                    <Link to={`/ask?doc=up:${it.id}`} className="underline">Ask about it</Link>
                    {(isAdmin || session?.user.id === it.owner_id) && <button onClick={() => remove(it)} className="ml-auto text-destructive flex items-center gap-1"><Trash2 className="w-3 h-3" />Remove</button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
