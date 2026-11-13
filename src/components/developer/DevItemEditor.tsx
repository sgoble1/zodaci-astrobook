import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DEV_KINDS, DEV_STATUSES, centsToDollars, validateDraft, type DevFields, type DevItem, type DevKind, type DevStatus, type DraftErrors } from '@/lib/devBoard';

const sel = 'h-10 w-full rounded-md border border-input bg-background px-2 text-sm';

/** Side panel for editing every field of one developer item. Returns validated fields; the caller saves and reports errors. */
export function DevItemEditor({ item, onClose, onSave }: { item: DevItem | null; onClose: () => void; onSave: (id: string, fields: DevFields) => Promise<string | null> }) {
  const [form, setForm] = useState({ title: '', details: '', kind: 'feature' as DevKind, status: 'todo' as DevStatus, area: '', priority: 2, blocker: '', cost: '' });
  const [errors, setErrors] = useState<DraftErrors>({});
  const [failure, setFailure] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!item) return;
    setForm({ title: item.title, details: item.details, kind: item.kind, status: item.status, area: item.area, priority: item.priority, blocker: item.blocker, cost: centsToDollars(item.cost_cents) });
    setErrors({}); setFailure(''); setBusy(false);
  }, [item]);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm(f => ({ ...f, [k]: v }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!item || busy) return;
    const r = validateDraft(form);
    if ('errors' in r) { setErrors(r.errors); return; }
    setErrors({}); setFailure(''); setBusy(true);
    const problem = await onSave(item.id, r.value);
    setBusy(false);
    if (problem) setFailure(problem); else onClose();
  };
  const field = (id: keyof DraftErrors) => errors[id] ? { 'aria-invalid': true, 'aria-describedby': `dev-${id}-err` } : {};
  const err = (id: keyof DraftErrors) => errors[id] && <p id={`dev-${id}-err`} className="text-xs text-destructive">{errors[id]}</p>;
  return (
    <Sheet open={!!item} onOpenChange={o => { if (!o) onClose(); }}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader><SheetTitle>Edit item</SheetTitle><SheetDescription>Changes save to the shared board and show for every admin straight away.</SheetDescription></SheetHeader>
        <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
          <div className="space-y-1"><Label htmlFor="dev-title">Title</Label><Input id="dev-title" value={form.title} onChange={e => set('title', e.target.value)} {...field('title')} />{err('title')}</div>
          <div className="space-y-1"><Label htmlFor="dev-details">Details</Label><Textarea id="dev-details" rows={5} value={form.details} onChange={e => set('details', e.target.value)} {...field('details')} />{err('details')}</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1"><Label htmlFor="dev-kind">Type</Label><select id="dev-kind" className={sel} value={form.kind} onChange={e => set('kind', e.target.value as DevKind)}>{Object.entries(DEV_KINDS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
            <div className="space-y-1"><Label htmlFor="dev-status">Status</Label><select id="dev-status" className={sel} value={form.status} onChange={e => set('status', e.target.value as DevStatus)}>{Object.entries(DEV_STATUSES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
            <div className="space-y-1"><Label htmlFor="dev-priority">Priority</Label><select id="dev-priority" className={sel} value={form.priority} onChange={e => set('priority', Number(e.target.value))}><option value={1}>High</option><option value={2}>Medium</option><option value={3}>Low</option></select></div>
            <div className="space-y-1"><Label htmlFor="dev-area">Area</Label><Input id="dev-area" value={form.area} onChange={e => set('area', e.target.value)} {...field('area')} />{err('area')}</div>
          </div>
          <div className="space-y-1"><Label htmlFor="dev-blocker">Blocked by</Label><Input id="dev-blocker" placeholder="Leave empty if nothing is in the way" value={form.blocker} onChange={e => set('blocker', e.target.value)} {...field('blocker')} />{err('blocker')}</div>
          <div className="space-y-1"><Label htmlFor="dev-cost">Cost (US dollars)</Label><Input id="dev-cost" inputMode="decimal" placeholder="e.g. 12.50" value={form.cost} onChange={e => set('cost', e.target.value)} {...field('cost')} />{err('cost')}</div>
          {failure && <p role="alert" className="text-sm text-destructive">{failure}</p>}
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</Button></div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
