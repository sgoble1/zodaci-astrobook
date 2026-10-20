import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { CalendarClock, Plus, Save, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { confirmAction } from '@/components/common/ConfirmHost';
import { useSession } from '@/hooks/useLibrary';
import type { Tables } from '@/integrations/supabase/types';

type Campaign = Tables<'newsletter_campaigns'>;
const SEGMENTS: [string, string][] = [['subscribers', 'Weekly Sky Notes list (opted in)'], ['all', 'All members'], ['free', 'Free members'], ['pro', 'Pro members'], ['cosmic', 'Cosmic members']];
const schema = z.object({ title: z.string().trim().min(1, 'Give the campaign a title').max(150), subject: z.string().trim().max(150), preview_text: z.string().trim().max(200), body_md: z.string().max(50000), segment: z.enum(['all', 'free', 'pro', 'cosmic', 'subscribers']), scheduled_at: z.string().nullable() });
const blank = (): Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'created_by'> => ({ title: '', subject: '', preview_text: '', body_md: '', segment: 'subscribers', status: 'draft', scheduled_at: null, sent_at: null });

/** Draft, segment and schedule newsletters. Sending waits on a connected sender domain, so nothing here emails anyone. */
export function NewsletterManager() {
  const session = useSession();
  const [list, setList] = useState<Campaign[] | null>(null);
  const [err, setErr] = useState('');
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [draft, setDraft] = useState(blank());
  const [audience, setAudience] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const load = async () => {
    setErr('');
    const { data, error } = await supabase.from('newsletter_campaigns').select('*').order('updated_at', { ascending: false });
    if (error) { setErr('Campaigns could not be loaded.'); setList([]); return; }
    setList(data ?? []);
  };
  useEffect(() => { void load(); void Promise.all(SEGMENTS.map(async ([k]) => { const { data } = await supabase.rpc('admin_newsletter_audience', { _segment: k }); return [k, Number(data ?? 0)] as const; })).then(r => setAudience(Object.fromEntries(r))); }, []);
  const open = (c: Campaign | null) => { setEditing(c ? c.id : 'new'); setDraft(c ? { title: c.title, subject: c.subject, preview_text: c.preview_text, body_md: c.body_md, segment: c.segment, status: c.status, scheduled_at: c.scheduled_at, sent_at: c.sent_at } : blank()); };
  const save = async (status: 'draft' | 'scheduled') => {
    const p = schema.safeParse({ ...draft, scheduled_at: status === 'scheduled' ? draft.scheduled_at : null });
    if (!p.success) { toast.error(p.error.issues[0].message); return; }
    if (status === 'scheduled' && (!p.data.scheduled_at || new Date(p.data.scheduled_at) <= new Date())) { toast.error('Choose a send time in the future.'); return; }
    if (status === 'scheduled' && (!p.data.subject || !p.data.body_md.trim())) { toast.error('Add a subject and body before scheduling.'); return; }
    setBusy(true);
    const row = { ...(p.data as z.infer<typeof schema> & { title: string }), scheduled_at: p.data.scheduled_at ? new Date(p.data.scheduled_at).toISOString() : null, status, updated_at: new Date().toISOString() };
    const res = editing === 'new' ? await supabase.from('newsletter_campaigns').insert({ ...row, created_by: session!.user.id }).select('id').single() : await supabase.from('newsletter_campaigns').update(row).eq('id', editing!).neq('status', 'sent').select('id').single();
    setBusy(false);
    if (res.error) { toast.error('Could not save the campaign.'); return; }
    toast.success(status === 'scheduled' ? 'Scheduled — it will send once a sender domain is connected' : 'Draft saved');
    setEditing(res.data.id); void load();
  };
  const remove = async (c: Campaign) => {
    if (!(await confirmAction(`Delete “${c.title}”? This can’t be undone.`, 'Delete'))) return;
    const { error } = await supabase.from('newsletter_campaigns').delete().eq('id', c.id);
    if (error) { toast.error('Could not delete.'); return; }
    if (editing === c.id) setEditing(null);
    toast.success('Campaign deleted'); void load();
  };
  const sent = editing && editing !== 'new' && list?.find(c => c.id === editing)?.status === 'sent';
  const words = useMemo(() => draft.body_md.trim().split(/\s+/).filter(Boolean).length, [draft.body_md]);
  if (!list) return <div role="status" aria-label="Loading campaigns" className="h-40 animate-pulse rounded bg-muted" />;
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-2xl">Newsletter</h2><p className="text-sm text-muted-foreground">Write and schedule campaigns for each audience. Delivery starts once a sender address on your domain is connected.</p></div><Button onClick={() => open(null)}><Plus className="h-4 w-4" />New campaign</Button></div>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      <section aria-label="Audiences" className="grid gap-3 sm:grid-cols-5">{SEGMENTS.map(([k, l]) => <div key={k} className="parchment p-3"><p className="text-xs text-muted-foreground">{l}</p><p className="mt-1 flex items-center gap-1.5 font-display text-2xl"><Users aria-hidden className="h-4 w-4 text-gold" />{audience[k] ?? '—'}</p></div>)}</section>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <ul className="space-y-2" aria-label="Campaigns">{!list.length && <li className="text-sm text-muted-foreground">No campaigns yet.</li>}{list.map(c => (
          <li key={c.id}><button type="button" onClick={() => open(c)} className={`w-full rounded-md border p-3 text-left text-sm transition-colors duration-500 ${editing === c.id ? 'border-primary bg-primary/10' : 'border-border hover:border-foreground/40'}`}><span className="block font-medium">{c.title}</span><span className="mt-0.5 block text-xs text-muted-foreground capitalize">{c.status}{c.scheduled_at && c.status === 'scheduled' ? ` · ${new Date(c.scheduled_at).toLocaleString()}` : ''} · {SEGMENTS.find(s => s[0] === c.segment)?.[1]}</span></button></li>
        ))}</ul>
        {editing ? (
          <form className="vellum space-y-4 p-5" onSubmit={e => { e.preventDefault(); void save('draft'); }}>
            {sent && <p role="status" className="text-sm text-gold">This campaign was sent and can no longer be edited.</p>}
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label htmlFor="nl-title">Internal title</Label><Input id="nl-title" value={draft.title} maxLength={150} disabled={!!sent} onChange={e => setDraft({ ...draft, title: e.target.value })} /></div>
              <div><Label htmlFor="nl-seg">Audience</Label><select id="nl-seg" className="h-10 w-full rounded border border-border bg-input px-2 text-sm" value={draft.segment} disabled={!!sent} onChange={e => setDraft({ ...draft, segment: e.target.value })}>{SEGMENTS.map(([k, l]) => <option key={k} value={k}>{l} ({audience[k] ?? '…'})</option>)}</select></div>
              <div><Label htmlFor="nl-subj">Subject line</Label><Input id="nl-subj" value={draft.subject} maxLength={150} disabled={!!sent} onChange={e => setDraft({ ...draft, subject: e.target.value })} /></div>
              <div><Label htmlFor="nl-prev">Preview text</Label><Input id="nl-prev" value={draft.preview_text} maxLength={200} disabled={!!sent} onChange={e => setDraft({ ...draft, preview_text: e.target.value })} /></div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div><Label htmlFor="nl-body">Body (Markdown)</Label><Textarea id="nl-body" rows={16} value={draft.body_md} maxLength={50000} disabled={!!sent} onChange={e => setDraft({ ...draft, body_md: e.target.value })} /><p className="mt-1 text-xs text-muted-foreground">{words} words</p></div>
              <div aria-label="Preview" className="rounded-md border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Preview</p><p className="mt-2 font-semibold">{draft.subject || 'Subject line'}</p><p className="text-xs text-muted-foreground">{draft.preview_text}</p><div className="prose prose-invert prose-sm mt-4 max-w-none"><ReactMarkdown>{draft.body_md || '_Start writing to see the preview._'}</ReactMarkdown></div><p className="mt-6 border-t border-border pt-3 text-[11px] text-muted-foreground">Every email includes an unsubscribe link and the reflection note: astrology as a tool for reflection, not prediction.</p></div>
            </div>
            {!sent && <div className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
              <Button type="submit" disabled={busy}><Save className="h-4 w-4" />Save draft</Button>
              <div><Label htmlFor="nl-when">Send time</Label><Input id="nl-when" type="datetime-local" value={draft.scheduled_at ? draft.scheduled_at.slice(0, 16) : ''} onChange={e => setDraft({ ...draft, scheduled_at: e.target.value || null })} /></div>
              <Button type="button" variant="outline" disabled={busy} onClick={() => void save('scheduled')}><CalendarClock className="h-4 w-4" />Schedule</Button>
              {editing !== 'new' && <Button type="button" variant="ghost" className="ml-auto text-destructive" onClick={() => { const c = list.find(x => x.id === editing); if (c) void remove(c); }}><Trash2 className="h-4 w-4" />Delete</Button>}
            </div>}
          </form>
        ) : <p className="text-sm text-muted-foreground">Choose a campaign or start a new one.</p>}
      </div>
    </div>
  );
}
