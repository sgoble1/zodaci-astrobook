import { FeatureRegisterBoard } from '@/components/common/FeatureRegisterBoard';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BuildCostCard, useBuildCreditSnapshot } from '@/components/admin/BuildCostCard';
import { buildCostLine } from '@/lib/devCost';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePageMeta } from '@/hooks/usePageMeta';
import { DEV_TIMELINE } from '@/content/devTimeline';
import { DevItemEditor } from '@/components/developer/DevItemEditor';
import { RepeatFinder } from '@/components/developer/RepeatFinder';
import { DEV_KINDS as KINDS, DEV_ORDER as ORDER, DEV_PRIORITY as PRIORITY, DEV_STATUSES as STATUSES, DONE_PAGE, devFailure, devFailureMessage, readLayout, restoreRow, sortColumn, statusPatch, validateDraft, writeLayout, type DevFields, type DevItem as Item } from '@/lib/devBoard';

type Stats = Record<string, number>;
type Tally = Pick<Item, 'kind' | 'status' | 'title' | 'cost_cents'>;
const STAT_LABELS: [string, string][] = [['members', 'Accounts'], ['members_7d', 'New this week'], ['readings', 'Readings written'], ['readings_7d', 'Readings this week'], ['podcasts', 'Podcasts'], ['creations', 'Cosmic Studio saves'], ['ai_uses_month', 'AI calls this month'], ['ai_credits_month', 'Member credits used'], ['paid_live', 'Paid memberships'], ['book_orders', 'Paid book orders'], ['comic_subs', 'Comic subscriptions'], ['events_24h', 'Activity, last 24 h'], ['contact_open', 'Unanswered messages']];
const sel = 'h-10 rounded-md border border-input bg-background px-2 text-sm';
const storage = () => (typeof window === 'undefined' ? null : (() => { try { return window.localStorage; } catch { return null; } })());

/** Admin-only developer dashboard. Everyone with admin can read; only the developer (Shane) can change items — enforced by the database. */
export default function Developer({ view = 'board' }: { view?: 'board' | 'timeline' }) {
  usePageMeta(view === 'timeline' ? 'Build timeline · Developer' : 'Developer dashboard · Zodaci', 'Private developer dashboard.');
  const [access, setAccess] = useState<'checking' | 'admin' | 'none' | 'error'>('checking');
  const [dev, setDev] = useState(false);
  const [open, setOpen] = useState<Item[]>([]);
  const [done, setDone] = useState<Item[]>([]);
  const [doneTotal, setDoneTotal] = useState(0);
  const [doneLimit, setDoneLimit] = useState(DONE_PAGE);
  const [tally, setTally] = useState<Tally[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadErr, setLoadErr] = useState('');
  const [statsErr, setStatsErr] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<'all' | Item['kind']>('all');
  const [draft, setDraft] = useState({ title: '', kind: 'feature' as Item['kind'], area: 'General' });
  const [draftErr, setDraftErr] = useState('');
  const [err, setErr] = useState('');
  const [adding, setAdding] = useState(false);
  const addingRef = useRef(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [layout, setLayout] = useState<'board' | 'list'>(() => readLayout(storage()));
  const chooseLayout = (l: 'board' | 'list') => { setLayout(l); writeLayout(storage(), l); };
  const { snap } = useBuildCreditSnapshot();
  const limitRef = useRef(doneLimit); limitRef.current = doneLimit;

  const loadItems = useCallback(async () => {
    const [o, d, t] = await Promise.all([
      supabase.from('dev_items').select('*').neq('status', 'done').order('priority').order('updated_at', { ascending: false }),
      supabase.from('dev_items').select('*', { count: 'exact' }).eq('status', 'done').order('done_at', { ascending: false, nullsFirst: false }).order('updated_at', { ascending: false }).range(0, limitRef.current - 1),
      supabase.from('dev_items').select('kind,status,title,cost_cents'),
    ]);
    if (o.error || d.error || t.error) { setLoadErr('The implementation list could not load. Your items are safe — check the connection and try again.'); return; }
    setLoadErr(''); setOpen((o.data ?? []) as Item[]); setDone((d.data ?? []) as Item[]); setDoneTotal(d.count ?? 0); setTally((t.data ?? []) as Tally[]); setLoaded(true);
  }, []);
  const loadStats = useCallback(async () => {
    const { data, error } = await supabase.rpc('dev_stats');
    if (error) { setStatsErr(true); return; }
    setStatsErr(false); setStats(((data as Stats[] | null) ?? [])[0] ?? {});
  }, []);
  const load = useCallback(() => Promise.all([loadItems(), loadStats()]), [loadItems, loadStats]);

  const checkAccess = useCallback(async () => {
    setAccess('checking');
    try {
      const { data: u, error: ue } = await supabase.auth.getUser();
      if (ue && !u?.user) throw ue;
      if (!u.user) return setAccess('none');
      const [a, d] = await Promise.all([supabase.rpc('has_role', { _user_id: u.user.id, _role: 'admin' }), supabase.rpc('is_developer')]);
      if (a.error) throw a.error;
      setDev(!d.error && !!d.data);
      if (a.data) { setAccess('admin'); void load(); } else setAccess('none');
    } catch { setAccess('error'); }
  }, [load]);
  useEffect(() => { void checkAccess(); }, [checkAccess]);

  // Live updates: bursts of changes collapse into one reload; numbers refresh each minute while the tab is visible.
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const scheduleItems = useCallback(() => { clearTimeout(timer.current); timer.current = setTimeout(() => void loadItems(), 400); }, [loadItems]);
  useEffect(() => {
    if (access !== 'admin') return;
    const ch = supabase.channel(`dev-items-${Math.random().toString(36).slice(2)}`).on('postgres_changes', { event: '*', schema: 'public', table: 'dev_items' }, scheduleItems).subscribe();
    const t = setInterval(() => { if (document.visibilityState === 'visible') void loadStats(); }, 60_000);
    return () => { supabase.removeChannel(ch); clearInterval(t); clearTimeout(timer.current); };
  }, [access, scheduleItems, loadStats]);
  useEffect(() => { if (access === 'admin' && loaded) void loadItems(); }, [doneLimit]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (id: string, patch: Partial<Item>): Promise<string | null> => {
    setErr('');
    const body = { ...patch, updated_at: new Date().toISOString(), ...(patch.status ? statusPatch(patch.status) : {}) };
    const { data, error } = await supabase.from('dev_items').update(body).eq('id', id).select('id');
    const f = devFailure(error, data?.length ?? 0);
    if (f) { const m = devFailureMessage(f, 'save'); setErr(m); return m; }
    void loadItems(); return null;
  };
  const saveFields = (id: string, fields: DevFields) => {
    const before = [...open, ...done].find(i => i.id === id);
    const patch: Partial<Item> = { ...fields };
    if (before && before.status === fields.status) delete patch.status; // keep the original done date
    return save(id, patch);
  };
  const add = async () => {
    if (addingRef.current) return;
    const r = validateDraft({ title: draft.title, kind: draft.kind, area: draft.area });
    if ('errors' in r) { setDraftErr(r.errors.title ?? r.errors.area ?? 'Check the new item.'); return; }
    addingRef.current = true; setAdding(true); setDraftErr(''); setErr('');
    const { error } = await supabase.from('dev_items').insert({ title: r.value.title, kind: r.value.kind, area: r.value.area });
    addingRef.current = false; setAdding(false);
    const f = devFailure(error);
    if (f) setErr(devFailureMessage(f, 'add')); else { setDraft(d => ({ ...d, title: '' })); void loadItems(); }
  };
  const remove = async (item: Item) => {
    setErr('');
    const { data, error } = await supabase.from('dev_items').delete().eq('id', item.id).select('id');
    const f = devFailure(error, data?.length ?? 0);
    if (f) { setErr(devFailureMessage(f, 'delete')); return; }
    void loadItems();
    const copy = restoreRow(item);
    toast(`Deleted “${item.title}”`, { duration: 8000, action: { label: 'Undo', onClick: async () => {
      const { error: e } = await supabase.from('dev_items').insert(copy);
      const rf = devFailure(e);
      if (rf) toast.error(devFailureMessage(rf, 'restore')); else { toast.success('Item restored'); void loadItems(); }
    } } });
  };

  const items = useMemo(() => [...open, ...done], [open, done]);
  const shown = useMemo(() => items.filter(i => filter === 'all' || i.kind === filter), [items, filter]);
  const count = (k: Item['kind'], s?: Item['status']) => tally.filter(i => i.kind === k && (!s || i.status === s)).length;
  const blocked = tally.filter(i => i.status === 'blocked').map(i => i.title);
  const totalCost = tally.reduce((s, i) => s + (i.cost_cents ?? 0), 0);
  const moreDone = doneTotal > done.length;
  const iconBtn = 'h-10 w-10 p-0';

  if (access === 'checking') return <p role="status" className="text-muted-foreground">Checking access…</p>;
  if (access === 'error') return <article className="mx-auto max-w-xl py-12 text-center"><h1 className="text-3xl">Developer dashboard</h1><p role="alert" className="mt-3 text-muted-foreground">We couldn't check your access — the connection may have dropped.</p><Button className="mt-4" onClick={() => void checkAccess()}>Try again</Button></article>;
  if (access === 'none') return <article className="mx-auto max-w-xl py-12 text-center"><h1 className="text-3xl">Developer dashboard</h1><p className="mt-3 text-muted-foreground">Admins only.</p></article>;

  const tabs = <nav className="flex flex-wrap gap-2" aria-label="Developer views"><Button asChild size="sm" variant={view === 'board' ? 'default' : 'outline'}><Link to="/developer">Dashboard</Link></Button><Button asChild size="sm" variant={view === 'timeline' ? 'default' : 'outline'}><Link to="/developer/timeline">Timeline</Link></Button><Button asChild size="sm" variant="outline"><Link to="/admin">Admin</Link></Button></nav>;
  const listError = loadErr && <p role="alert" className="text-sm text-destructive">{loadErr} <Button variant="link" className="h-auto p-0" onClick={() => void loadItems()}>Try again</Button></p>;

  if (view === 'timeline') return (
    <article className="space-y-8">
      <header className="space-y-3"><p className="font-label text-xs tracking-[0.16em] text-primary">Developer · {dev ? 'editor' : 'read-only'}</p><h1 className="text-4xl">Build timeline</h1><p className="max-w-2xl text-muted-foreground">From the first "Zodiactic" build in October 2025 to today. Summarised from both project chats.</p>{tabs}</header>
      <ol className="relative space-y-6 border-l border-gold/40 pl-6">{DEV_TIMELINE.map((e, i) => (
        <li key={i} className="relative"><span aria-hidden className={`absolute -left-[1.95rem] top-1.5 h-3 w-3 rounded-full ${e.phase === 'Current build' ? 'bg-primary' : 'bg-gold'}`} />
          <p className="text-xs text-muted-foreground">{new Date(e.date + 'T12:00:00Z').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} · {e.phase}</p>
          <h2 className="text-xl">{e.title}</h2><p className="text-sm text-muted-foreground">{e.summary}</p></li>))}
        <li className="relative"><span aria-hidden className="absolute -left-[1.95rem] top-1.5 h-3 w-3 rounded-full bg-primary" /><p className="text-xs text-muted-foreground">Recently finished items</p>
          {listError || <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">{done.slice(0, 10).map(i => <li key={i.id}>{i.title}</li>)}</ul>}</li>
      </ol>
    </article>
  );

  const actions = (i: Item, col: number) => dev && (
    <div className="mt-2 flex items-center justify-between gap-1">
      <Button size="sm" variant="ghost" className={iconBtn} disabled={col === 0} aria-label={`Move ${i.title} to ${col > 0 ? STATUSES[ORDER[col - 1]] : ''}`} onClick={() => void save(i.id, { status: ORDER[col - 1] })}><ChevronLeft className="h-4 w-4" aria-hidden /></Button>
      <Button size="sm" variant="ghost" className={iconBtn} aria-label={`Edit ${i.title}`} onClick={() => setEditing(i)}><Pencil className="h-4 w-4" aria-hidden /></Button>
      <Button size="sm" variant="ghost" className={iconBtn} aria-label={`Delete ${i.title}`} onClick={() => void remove(i)}><Trash2 className="h-4 w-4" aria-hidden /></Button>
      <Button size="sm" variant="ghost" className={iconBtn} disabled={col === ORDER.length - 1} aria-label={`Move ${i.title} to ${col < ORDER.length - 1 ? STATUSES[ORDER[col + 1]] : ''}`} onClick={() => void save(i.id, { status: ORDER[col + 1] })}><ChevronRight className="h-4 w-4" aria-hidden /></Button>
    </div>
  );
  const loadMore = moreDone && <Button size="sm" variant="outline" onClick={() => setDoneLimit(l => l + DONE_PAGE)}>Show {Math.min(DONE_PAGE, doneTotal - done.length)} more finished ({done.length} of {doneTotal})</Button>;

  return (
    <article className="space-y-10">
      <header className="space-y-3"><p className="font-label text-sm tracking-[0.14em] text-accent">Developer · {dev ? 'you can edit' : 'read-only — only Shane can edit'}</p><h1 className="hero-headline !text-[clamp(2rem,1.4rem+2.4vw,3.2rem)]">Developer dashboard</h1><p className="font-script text-2xl text-primary">Live numbers, open work and what it costs.</p><p className="text-muted-foreground">Live numbers update every minute; the list updates instantly.</p>{tabs}</header>

      <section aria-labelledby="dv-s" className="obs-paper rivets space-y-3 p-5 sm:p-6"><h2 id="dv-s" className="plate-title !text-2xl">Live platform</h2>
        {statsErr && !stats ? <p role="alert" className="text-sm text-destructive">Live numbers are unavailable right now. <Button variant="link" className="h-auto p-0" onClick={() => void loadStats()}>Try again</Button></p>
          : stats ? <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">{STAT_LABELS.map(([k, l]) => <div key={k} className="rounded-[var(--cut-card)] border border-[hsl(var(--comic-navy)/0.25)] p-3"><dt className="text-xs text-muted-foreground">{l}</dt><dd className="font-display text-2xl">{Number(stats[k] ?? 0).toLocaleString()}</dd></div>)}<div className="rounded-[var(--cut-card)] border border-[hsl(var(--comic-navy)/0.25)] p-3"><dt className="text-xs text-muted-foreground">Credit pack sales</dt><dd className="font-display text-2xl">${((stats.credit_packs_cents ?? 0) / 100).toFixed(0)}</dd></div></dl>
          : <div role="status" aria-label="Loading live numbers" className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <div key={i} className="h-16 animate-pulse rounded-[var(--cut-card)] bg-muted" />)}</div>}
        {statsErr && stats && <p className="text-xs text-muted-foreground">Couldn't refresh just now — showing the last numbers.</p>}
      </section>

      <section aria-labelledby="dv-n" className="obs-paper space-y-3 p-5 sm:p-6"><h2 id="dv-n" className="plate-title !text-2xl">Next implementations</h2>
        <p className="text-sm text-muted-foreground">Ranked by how visible each is to members and investors. Same list the investor page shows.</p>
        <FeatureRegisterBoard mode="next" />
      </section>

      <BuildCostCard editable={dev} />
      {dev && <RepeatFinder />}

      <section aria-labelledby="dv-c" className="grid gap-4 md:grid-cols-2">
        <div className="obs-paper space-y-2 p-5"><h2 id="dv-c" className="plate-title !text-xl">Other costs</h2>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>{buildCostLine(snap)}</li>
            <li>Member AI usage this month: {stats ? `${stats.ai_credits_month ?? 0} member credits across ${stats.ai_uses_month ?? 0} calls.` : statsErr ? 'unavailable.' : 'loading…'}</li>
            <li>Item costs logged below: ${(totalCost / 100).toFixed(2)}</li>
            <li>Print costs: see <Link className="underline" to="/admin?tab=shop">Admin → Shop & print</Link> (book costing).</li>
          </ul></div>
        <div className="obs-paper space-y-2 p-5"><h2 className="plate-title !text-xl">Summary</h2>
          <ul className="grid grid-cols-2 gap-1 text-sm">{(Object.keys(KINDS) as Item['kind'][]).map(k => <li key={k}><strong>{KINDS[k]}s:</strong> {count(k, 'done')} done / {count(k)} total</li>)}</ul>
          <p className="text-xs text-muted-foreground">Blocked: {blocked.join('; ') || 'none'}</p>
          <div className="flex flex-wrap gap-2 pt-2"><Button asChild size="sm" variant="outline"><Link to="/admin?tab=images">Image library</Link></Button><Button asChild size="sm" variant="outline"><Link to="/admin?tab=activity">Member activity</Link></Button><Button asChild size="sm" variant="outline"><Link to="/admin?tab=launch">Launch checklist</Link></Button></div></div>
      </section>

      <section aria-labelledby="dv-u" className="obs-paper space-y-3 p-5 sm:p-6"><h2 id="dv-u" className="plate-title !text-2xl">Latest updates</h2>
        <ol className="space-y-2">{DEV_TIMELINE.slice(-5).reverse().map((e, i) => <li key={i} className="border-b border-dashed border-[hsl(var(--comic-navy)/0.2)] pb-2"><p className="text-xs text-muted-foreground">{new Date(e.date + 'T12:00:00Z').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p><p className="font-semibold">{e.title}</p><p className="text-sm text-muted-foreground">{e.summary}</p></li>)}</ol>
        <Link to="/developer/timeline" className="text-sm underline">Full build timeline</Link>
      </section>

      <section aria-labelledby="dv-l" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="dv-l" className="text-2xl">Implementation list</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div role="group" aria-label="Layout" className="flex gap-1">{(['board', 'list'] as const).map(l => <Button key={l} size="sm" variant={layout === l ? 'default' : 'outline'} aria-pressed={layout === l} onClick={() => chooseLayout(l)}>{l === 'board' ? 'Status board' : 'List'}</Button>)}</div>
            <select aria-label="Filter by type" className={sel} value={filter} onChange={e => setFilter(e.target.value as typeof filter)}><option value="all">All</option>{Object.entries(KINDS).map(([k, l]) => <option key={k} value={k}>{l}s</option>)}</select>
          </div></div>
        {dev && <form className="flex flex-wrap items-start gap-2" onSubmit={e => { e.preventDefault(); void add(); }} noValidate>
          <div className="w-full max-w-sm"><Input aria-label="New item" placeholder="New item…" value={draft.title} onChange={e => { setDraft({ ...draft, title: e.target.value }); setDraftErr(''); }} aria-invalid={!!draftErr} aria-describedby={draftErr ? 'dv-draft-err' : undefined} />{draftErr && <p id="dv-draft-err" className="mt-1 text-xs text-destructive">{draftErr}</p>}</div>
          <select aria-label="Type" className={sel} value={draft.kind} onChange={e => setDraft({ ...draft, kind: e.target.value as Item['kind'] })}>{Object.entries(KINDS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          <Input aria-label="Area" className="w-36" value={draft.area} onChange={e => setDraft({ ...draft, area: e.target.value })} /><Button type="submit" disabled={adding}><Plus className="h-4 w-4" aria-hidden />{adding ? 'Adding…' : 'Add'}</Button></form>}
        {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
        {listError}
        {!loaded && !loadErr && <div role="status" aria-label="Loading implementation list" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{ORDER.map(s => <div key={s} className="h-48 animate-pulse rounded-[var(--cut-card)] bg-muted" />)}</div>}
        {loaded && (layout === 'board' ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {ORDER.map((st, col) => {
              const list = sortColumn(shown.filter(i => i.status === st));
              const total = st === 'done' ? (filter === 'all' ? doneTotal : count(filter, 'done')) : list.length;
              return (
                <section key={st} aria-labelledby={`col-${st}`} className="obs-paper flex flex-col gap-3 p-3">
                  <h3 id={`col-${st}`} className="flex items-center justify-between font-label !text-sm tracking-[0.14em]"><span>{STATUSES[st]}</span><span className="rounded-full border border-[hsl(var(--comic-navy)/0.3)] px-2 text-xs">{total}</span></h3>
                  {list.length === 0 && <p className="text-xs text-muted-foreground">Nothing here.</p>}
                  <ul className="space-y-2">{(st === 'done' ? list.sort((a, b) => Date.parse(b.done_at ?? b.updated_at) - Date.parse(a.done_at ?? a.updated_at)) : list).map(i => (
                    <li key={i.id} className="rounded-[var(--cut-card)] border border-[hsl(var(--comic-navy)/0.22)] bg-background/5 p-3 text-sm">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]"><span className="rounded-full border border-[hsl(var(--comic-navy)/0.3)] px-1.5">{KINDS[i.kind]}</span><span className="text-muted-foreground">{PRIORITY[i.priority] ?? 'Medium'} · {i.area}</span></div>
                      <p className={`mt-1 font-medium ${i.status === 'done' ? 'line-through opacity-70' : ''}`}>{i.title}</p>
                      {i.details && <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{i.details}</p>}
                      {i.blocker && <p className="mt-1 text-xs text-accent">Blocked by: {i.blocker}</p>}
                      {i.cost_cents != null && <p className="mt-1 text-xs text-muted-foreground">Cost ${(i.cost_cents / 100).toFixed(2)}</p>}
                      {actions(i, col)}
                    </li>))}</ul>
                  {st === 'done' && loadMore}
                </section>
              );
            })}
          </div>
        ) : <>
          <ul className="space-y-2">{shown.map(i => (
            <li key={i.id} className="flex flex-wrap items-start gap-3 rounded-lg border border-border/60 bg-card/40 p-3">
              <span className="rounded-full border border-gold/40 px-2 py-0.5 text-xs text-gold">{KINDS[i.kind]}</span>
              <div className="min-w-[14rem] flex-1"><p className={i.status === 'done' ? 'text-muted-foreground line-through' : ''}>{i.title}</p><p className="text-xs text-muted-foreground">{i.area}{i.details ? ` · ${i.details}` : ''}{i.blocker ? ` · Blocked by: ${i.blocker}` : ''}</p></div>
              {dev ? <>
                <select aria-label={`Status of ${i.title}`} className={sel} value={i.status} onChange={e => void save(i.id, { status: e.target.value as Item['status'] })}>{Object.entries(STATUSES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                <select aria-label={`Priority of ${i.title}`} className={sel} value={i.priority} onChange={e => void save(i.id, { priority: Number(e.target.value) })}><option value={1}>High</option><option value={2}>Medium</option><option value={3}>Low</option></select>
                <Button size="sm" variant="ghost" className={iconBtn} aria-label={`Edit ${i.title}`} onClick={() => setEditing(i)}><Pencil className="h-4 w-4" aria-hidden /></Button>
                <Button size="sm" variant="ghost" className={iconBtn} aria-label={`Delete ${i.title}`} onClick={() => void remove(i)}><Trash2 className="h-4 w-4" aria-hidden /></Button>
              </> : <span className="text-xs text-muted-foreground">{STATUSES[i.status]}</span>}
            </li>))}</ul>
          {loadMore}
        </>)}
      </section>
      <DevItemEditor item={editing} onClose={() => setEditing(null)} onSave={saveFields} />
    </article>
  );
}
