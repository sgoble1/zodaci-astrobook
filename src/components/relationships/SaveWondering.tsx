import { useState } from 'react';
import { BookmarkPlus } from 'lucide-react';
import { useRelationships, saveRelationship } from '@/hooks/useRelationships';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function SaveWondering({ text }: { text: string }) {
  const { items } = useRelationships();
  const [id, setId] = useState(''); const [busy, setBusy] = useState(false);
  if (!items.length) return null;
  return <div className="flex flex-wrap gap-2 items-center"><select aria-label="Relationship to save this question to" className="min-w-0 max-w-full rounded border border-input bg-background p-2 text-sm" value={id} onChange={e => setId(e.target.value)}><option value="">Save to a relationship…</option>{items.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><Button variant="outline" size="sm" disabled={!id || busy} onClick={async () => {
    const r = items.find(p => p.id === id); if (!r) return;
    setBusy(true);
    try {
      const addition = `Wondering (${new Date().toLocaleDateString()}): ${text}`;
      if ((r.notes.length + addition.length) > 20000) throw new Error('Relationship notes are full. Shorten them before saving another question.');
      if (!r.notes.includes(text)) await saveRelationship({ id: r.id, notes: `${r.notes}\n\n${addition}`.trim() });
      toast.success('Saved in your private relationship notes.');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not save this question.'); }
    finally { setBusy(false); }
  }}><BookmarkPlus />Save question</Button></div>;
}