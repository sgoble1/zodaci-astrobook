import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { writeTopicReading } from '@/lib/topicReadings';

type Profile = { id: string; display_name: string; birth_date: string | null; birth_time: string | null; place_label: string; house_system: string; created_at: string };
type Page = { id: string; page_key?: string; owner_id: string; title: string; content: string; status: string; section: string; updated_at: string };

/** Admin-only: every member chart and its generated readings. April's original edition is not stored here, so it stays separate. */
export function MemberCharts() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [edit, setEdit] = useState<Record<string, { title: string; content: string }>>({});
  const load = async () => {
    const [p, g] = await Promise.all([
      supabase.from('profiles').select('id,display_name,birth_date,birth_time,place_label,house_system,created_at').not('birth_date', 'is', null).order('created_at', { ascending: false }),
      supabase.from('generated_pages').select('id,owner_id,page_key,title,content,status,section,updated_at').order('title'),
    ]);
    setProfiles((p.data ?? []) as Profile[]); setPages((g.data ?? []) as Page[]);
  };
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  useEffect(() => { load(); }, []);
  const rewrite = async (pg: Page & { page_key?: string }) => {
    const slug = (pg.page_key ?? '').replace(/^topic-/, '');
    if (!slug || !confirm(`Rewrite “${pg.title}” for this member?`)) return;
    setBusyId(pg.id);
    try { await writeTopicReading(slug, { regenerate: true, targetUserId: pg.owner_id }); toast.success('Rewritten'); load(); } catch (e) { toast.error((e as Error).message); }
    setBusyId(null);
  };
  const shown = profiles.filter(p => !q || `${p.display_name} ${p.place_label} ${p.birth_date}`.toLowerCase().includes(q.toLowerCase()));
  const save = async (pg: Page, patch: Partial<Page>) => {
    const { error } = await supabase.from('generated_pages').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', pg.id);
    if (error) return toast.error(error.message);
    toast.success('Saved'); setEdit(e => { const n = { ...e }; delete n[pg.id]; return n; }); load();
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{profiles.length} charts created. Open a member to edit their readings or publish/unpublish them. Unpublished readings are hidden from the member.</p>
      <Input placeholder="Search members by name, place or birth date" value={q} onChange={e => setQ(e.target.value)} aria-label="Search members" className="max-w-md" />
      {shown.map(pr => { const mine = pages.filter(p => p.owner_id === pr.id); return (
        <div key={pr.id} className="parchment p-4 space-y-3">
          <button className="flex w-full flex-wrap items-center justify-between gap-2 text-left" onClick={() => setOpen(open === pr.id ? null : pr.id)} aria-expanded={open === pr.id}>
            <span><span className="font-display text-lg">{pr.display_name || 'Unnamed member'}</span><span className="block text-xs text-muted-foreground">{pr.birth_date} · {pr.birth_time ?? 'time unknown'} · {pr.place_label} · {pr.house_system}</span></span>
            <span className="text-xs text-muted-foreground">{mine.length} readings · joined {new Date(pr.created_at).toLocaleDateString()}</span>
          </button>
          {open === pr.id && (mine.length ? mine.map(pg => { const d = edit[pg.id]; return (
            <div key={pg.id} className={`rounded border border-border p-3 space-y-2 ${pg.status === 'hidden' ? 'opacity-70' : ''}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display">{pg.title}</span><span className="text-xs text-muted-foreground">{pg.section} · {pg.content.split(/\s+/).length.toLocaleString()} words · {pg.status === 'hidden' ? 'Unpublished' : 'Published'}</span>
                <div className="ml-auto flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => save(pg, { status: pg.status === 'hidden' ? 'ready' : 'hidden' })}>{pg.status === 'hidden' ? 'Publish' : 'Unpublish'}</Button>
                  {pg.section === 'Topic Reading' && <Button size="sm" variant="outline" disabled={busyId === pg.id} onClick={() => rewrite(pg)}>{busyId === pg.id ? 'Rewriting…' : 'Rewrite'}</Button>}
                  <Button size="sm" variant="ghost" onClick={() => setEdit(e => ({ ...e, [pg.id]: d ? undefined! : { title: pg.title, content: pg.content } }))}>{d ? 'Cancel' : 'Edit'}</Button>
                </div>
              </div>
              {d && <><Input value={d.title} onChange={e => setEdit(x => ({ ...x, [pg.id]: { ...d, title: e.target.value } }))} aria-label="Title" /><Textarea rows={14} value={d.content} onChange={e => setEdit(x => ({ ...x, [pg.id]: { ...d, content: e.target.value } }))} aria-label="Reading text" /><Button size="sm" onClick={() => save(pg, d)}>Save changes</Button></>}
            </div>
          ); }) : <p className="text-sm text-muted-foreground">No readings written yet.</p>)}
        </div>
      ); })}
    </div>
  );
}
