import { useState } from 'react';
import { Trash2, Save, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { LibraryItem } from '@/hooks/useLibrary';
import type { DocSection } from '@/lib/extract';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';

/** Edit an uploaded document's title, group and sections, with a live rendered preview per section. */
export function SectionEditor({ item, onDone }: { item: LibraryItem; onDone: () => void }) {
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

