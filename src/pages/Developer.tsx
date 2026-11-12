import { useCallback, useEffect, useMemo, useState } from 'react';
import { BuildCostCard, useBuildCreditSnapshot } from '@/components/admin/BuildCostCard';
import { buildCostLine } from '@/lib/devCost';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePageMeta } from '@/hooks/usePageMeta';
import { DEV_TIMELINE } from '@/content/devTimeline';

type Item = { id: string; title: string; details: string; kind: 'feature' | 'bug' | 'gap' | 'plan'; status: 'todo' | 'doing' | 'blocked' | 'done'; area: string; priority: number; blocker: string; cost_cents: number | null; updated_at: string };
type Stats = Record<string, number>;
const KINDS = { feature: 'Feature', bug: 'Bug', gap: 'Gap', plan: 'Future plan' } as const;
const STATUSES = { todo: 'To do', doing: 'In progress', blocked: 'Blocked', done: 'Done' } as const;
const STAT_LABELS: [string, string][] = [['members', 'Accounts'], ['members_7d', 'New this week'], ['readings', 'Readings written'], ['readings_7d', 'Readings this week'], ['podcasts', 'Podcasts'], ['creations', 'Creator Studio saves'], ['ai_uses_month', 'AI calls this month'], ['ai_credits_month', 'Member credits used'], ['paid_live', 'Paid memberships'], ['book_orders', 'Paid book orders'], ['comic_subs', 'Comic subscriptions'], ['events_24h', 'Activity, last 24 h'], ['contact_open', 'Unanswered messages']];
const sel = 'h-9 rounded-md border border-input bg-background px-2 text-sm';
const ORDER: Item['status'][] = ['todo', 'doing', 'blocked', 'done'];
const PRIORITY = { 1: 'High', 2: 'Medium', 3: 'Low' } as Record<number, string>;
const LAYOUT_KEY = 'zodaci-dev-layout';
const DONE_SHOWN = 12;

/** Admin-only developer dashboard. Everyone with admin can read; only the developer (Shane) can change items — enforced by the database. */
export default function Developer({ view = 'board' }: { view?: 'board' | 'timeline' }) {
  usePageMeta(view === 'timeline' ? 'Build timeline · Developer' : 'Developer dashboard · Zodaci', 'Private developer dashboard.');
  const [admin, setAdmin] = useState<boolean | null>(null);
  const [dev, setDev] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState<'all' | Item['kind']>('all');
  const [draft, setDraft] = useState({ title: '', kind: 'feature' as Item['kind'], area: 'General' });
  const [err, setErr] = useState('');
  const [layout, setLayout] = useState<'board' | 'list'>(() => (typeof localStorage !== 'undefined' && localStorage.getItem(LAYOUT_KEY) === 'list' ? 'list' : 'board'));
  const [allDone, setAllDone] = useState(false);
  const chooseLayout = (l: 'board' | 'list') => { setLayout(l); try { localStorage.setItem(LAYOUT_KEY, l); } catch { /* private mode */ } };
  const { snap } = useBuildCreditSnapshot();

  const load = useCallback(async () => {
    const [{ data: it }, { data: st }] = await Promise.all([supabase.from('dev_items').select('*').order('priority').order('updated_at', { ascending: false }), supabase.rpc('dev_stats')]);
    setItems((it ?? []) as Item[]); setStats(((st as Stats[] | null) ?? [])[0] ?? null);
  }, []);
  useEffect(() => {
    void (async () => {
      const { data: u } = await supabase.auth.getUser(); if (!u.user) return setAdmin(false);
      const [{ data: a }, { data: d }] = await Promise.all([supabase.rpc('has_role', { _user_id: u.user.id, _role: 'admin' }), supabase.rpc('is_developer')]);
      setAdmin(!!a); setDev(!!d); if (a) void load();
    })();
  }, [load]);
  useEffect(() => {
    if (!admin) return;
    const ch = supabase.channel(`dev-items-${Math.random().toString(36).slice(2)}`).on('postgres_changes', { event: '*', schema: 'public', table: 'dev_items' }, () => void load()).subscribe();
    const t = setInterval(() => { if (document.visibilityState === 'visible') void load(); }, 60_000);
    return () => { supabase.removeChannel(ch); clearInterval(t); };
  }, [admin, load]);

  const save = async (id: string, patch: Partial<Item>) => {
    setErr('');
    const { data, error } = await supabase.from('dev_items').update({ ...patch, updated_at: new Date().toISOString(), ...(patch.status ? { done_at: patch.status === 'done' ? new Date().toISOString() : null } : {}) }).eq('id', id).select('id');
    if (error || !data?.length) setErr('Only the developer can change items.'); else void load();
  };
  const add = async () => {
    if (draft.title.trim().length < 3) return;
    const { error } = await supabase.from('dev_items').insert({ title: draft.title.trim(), kind: draft.kind, area: draft.area || 'General' });
    if (error) setErr('Only the developer can add items.'); else { setDraft(d => ({ ...d, title: '' })); void load(); }
  };
  const remove = async (id: string) => { const { data } = await supabase.from('dev_items').delete().eq('id', id).select('id'); if (!data?.length) setErr('Only the developer can delete items.'); else void load(); };

  const shown = useMemo(() => items.filter(i => filter === 'all' || i.kind === filter), [items, filter]);
  const count = (k: Item['kind'], s?: Item['status']) => items.filter(i => i.kind === k && (!s || i.status === s)).length;

  if (admin === null) return <p role="status" className="text-muted-foreground">Checking access…</p>;
  if (!admin) return <article className="mx-auto max-w-xl py-12 text-center"><h1 className="text-3xl">Developer dashboard</h1><p className="mt-3 text-muted-foreground">Admins only.</p></article>;

  const tabs = <nav className="flex gap-2" aria-label="Developer views"><Button asChild size="sm" variant={view === 'board' ? 'default' : 'outline'}><Link to="/developer">Dashboard</Link></Button><Button asChild size="sm" variant={view === 'timeline' ? 'default' : 'outline'}><Link to="/developer/timeline">Timeline</Link></Button><Button asChild size="sm" variant="outline"><Link to="/admin">Admin</Link></Button></nav>;

  if (view === 'timeline') return (
    <article className="space-y-8">
      <header className="space-y-3"><p className="font-label text-xs tracking-[0.16em] text-primary">Developer · {dev ? 'editor' : 'read-only'}</p><h1 className="text-4xl">Build timeline</h1><p className="max-w-2xl text-muted-foreground">From the first "Zodiactic" build in October 2025 to today. Summarised from both project chats.</p>{tabs}</header>
      <ol className="relative space-y-6 border-l border-gold/40 pl-6">{DEV_TIMELINE.map((e, i) => (
        <li key={i} className="relative"><span aria-hidden className={`absolute -left-[1.95rem] top-1.5 h-3 w-3 rounded-full ${e.phase === 'Current build' ? 'bg-primary' : 'bg-gold'}`} />
          <p className="text-xs text-muted-foreground">{new Date(e.date + 'T12:00:00Z').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} · {e.phase}</p>
          <h2 className="text-xl">{e.title}</h2><p className="text-sm text-muted-foreground">{e.summary}</p></li>))}
        <li className="relative"><span aria-hidden className="absolute -left-[1.95rem] top-1.5 h-3 w-3 rounded-full bg-primary" /><p className="text-xs text-muted-foreground">Recently finished items</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">{items.filter(i => i.status === 'done').slice(0, 10).map(i => <li key={i.id}>{i.title}</li>)}</ul></li>
      </ol>
    </article>
  );

  return (
    <article className="space-y-10">
      <header className="space-y-3"><p className="font-label text-sm tracking-[0.14em] text-accent">Developer · {dev ? 'you can edit' : 'read-only — only Shane can edit'}</p><h1 className="hero-headline !text-[clamp(2rem,1.4rem+2.4vw,3.2rem)]">Developer dashboard</h1><p className="font-script text-2xl text-primary">Live numbers, open work and what it costs.</p><p className="text-muted-foreground">Live numbers update every minute; the list updates instantly.</p>{tabs}</header>

      <section aria-labelledby="dv-s" className="obs-paper rivets space-y-3 p-5 sm:p-6"><h2 id="dv-s" className="plate-title !text-2xl">Live platform</h2>
        {stats ? <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">{STAT_LABELS.map(([k, l]) => <div key={k} className="rounded-[var(--cut-card)] border border-[hsl(var(--comic-navy)/0.25)] p-3"><dt className="text-xs text-muted-foreground">{l}</dt><dd className="font-display text-2xl">{Number(stats[k] ?? 0).toLocaleString()}</dd></div>)}<div className="rounded-[var(--cut-card)] border border-[hsl(var(--comic-navy)/0.25)] p-3"><dt className="text-xs text-muted-foreground">Credit pack sales</dt><dd className="font-display text-2xl">${((stats.credit_packs_cents ?? 0) / 100).toFixed(0)}</dd></div></dl> : <div role="status" aria-label="Loading live numbers" className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <div key={i} className="h-16 animate-pulse rounded-[var(--cut-card)] bg-muted" />)}</div>}
      </section>

      <BuildCostCard editable={dev} />

      <section aria-labelledby="dv-c" className="grid gap-4 md:grid-cols-2">
        <div className="obs-paper space-y-2 p-5"><h2 id="dv-c" className="plate-title !text-xl">Other costs</h2>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>{buildCostLine(snap)}</li>
            <li>Member AI usage this month: {stats?.ai_credits_month ?? '…'} member credits across {stats?.ai_uses_month ?? '…'} calls.</li>
            <li>Item costs logged below: ${(items.reduce((s, i) => s + (i.cost_cents ?? 0), 0) / 100).toFixed(2)}</li>
            <li>Print costs: see <Link className="underline" to="/admin?tab=shop">Admin → Shop & print</Link> (book costing).</li>
          </ul></div>
        <div className="obs-paper space-y-2 p-5"><h2 className="plate-title !text-xl">Summary</h2>
          <ul className="grid grid-cols-2 gap-1 text-sm">{(Object.keys(KINDS) as Item['kind'][]).map(k => <li key={k}><strong>{KINDS[k]}s:</strong> {count(k, 'done')} done / {count(k)} total</li>)}</ul>
          <p className="text-xs text-muted-foreground">Blocked: {items.filter(i => i.status === 'blocked').map(i => i.title).join('; ') || 'none'}</p>
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
        {dev && <div className="flex flex-wrap gap-2"><Input aria-label="New item" className="max-w-sm" placeholder="New item…" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} onKeyDown={e => e.key === 'Enter' && add()} />
          <select aria-label="Type" className={sel} value={draft.kind} onChange={e => setDraft({ ...draft, kind: e.target.value as Item['kind'] })}>{Object.entries(KINDS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          <Input aria-label="Area" className="w-36" value={draft.area} onChange={e => setDraft({ ...draft, area: e.target.value })} /><Button onClick={add}><Plus className="h-4 w-4" aria-hidden />Add</Button></div>}
        {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
        {layout === 'board' ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {ORDER.map((st, col) => {
              const list = shown.filter(i => i.status === st).sort((a, b) => a.priority - b.priority || Date.parse(b.updated_at) - Date.parse(a.updated_at));
              const visible = st === 'done' && !allDone ? list.slice(0, DONE_SHOWN) : list;
              return (
                <section key={st} aria-labelledby={`col-${st}`} className="obs-paper flex flex-col gap-3 p-3">
                  <h3 id={`col-${st}`} className="flex items-center justify-between font-label !text-sm tracking-[0.14em]"><span>{STATUSES[st]}</span><span className="rounded-full border border-[hsl(var(--comic-navy)/0.3)] px-2 text-xs">{list.length}</span></h3>
                  {visible.length === 0 && <p className="text-xs text-muted-foreground">Nothing here.</p>}
                  <ul className="space-y-2">{visible.map(i => (
                    <li key={i.id} className="rounded-[var(--cut-card)] border border-[hsl(var(--comic-navy)/0.22)] bg-background/5 p-3 text-sm">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]"><span className="rounded-full border border-[hsl(var(--comic-navy)/0.3)] px-1.5">{KINDS[i.kind]}</span><span className="text-muted-foreground">{PRIORITY[i.priority] ?? 'Medium'} · {i.area}</span></div>
                      <p className={`mt-1 font-medium ${i.status === 'done' ? 'line-through opacity-70' : ''}`}>{i.title}</p>
                      {i.blocker && <p className="mt-1 text-xs text-accent">Blocked by: {i.blocker}</p>}
                      {dev && <div className="mt-2 flex items-center justify-between gap-1">
                        <Button size="sm" variant="ghost" className="h-7 px-2" disabled={col === 0} aria-label={`Move ${i.title} to ${col > 0 ? STATUSES[ORDER[col - 1]] : ''}`} onClick={() => save(i.id, { status: ORDER[col - 1] })}><ChevronLeft className="h-4 w-4" aria-hidden /></Button>
                        <Button size="sm" variant="ghost" className="h-7 px-2" aria-label={`Delete ${i.title}`} onClick={() => remove(i.id)}><Trash2 className="h-3.5 w-3.5" aria-hidden /></Button>
                        <Button size="sm" variant="ghost" className="h-7 px-2" disabled={col === ORDER.length - 1} aria-label={`Move ${i.title} to ${col < ORDER.length - 1 ? STATUSES[ORDER[col + 1]] : ''}`} onClick={() => save(i.id, { status: ORDER[col + 1] })}><ChevronRight className="h-4 w-4" aria-hidden /></Button>
                      </div>}
                    </li>))}</ul>
                  {st === 'done' && list.length > DONE_SHOWN && <Button size="sm" variant="ghost" onClick={() => setAllDone(v => !v)}>{allDone ? 'Show fewer' : `Show all ${list.length}`}</Button>}
                </section>
              );
            })}
          </div>
        ) : <ul className="space-y-2">{shown.map(i => (
          <li key={i.id} className="flex flex-wrap items-start gap-3 rounded-lg border border-border/60 bg-card/40 p-3">
            <span className="rounded-full border border-gold/40 px-2 py-0.5 text-xs text-gold">{KINDS[i.kind]}</span>
            <div className="min-w-[14rem] flex-1"><p className={i.status === 'done' ? 'text-muted-foreground line-through' : ''}>{i.title}</p><p className="text-xs text-muted-foreground">{i.area}{i.details ? ` · ${i.details}` : ''}{i.blocker ? ` · Blocked by: ${i.blocker}` : ''}</p></div>
            {dev ? <>
              <select aria-label={`Status of ${i.title}`} className={sel} value={i.status} onChange={e => save(i.id, { status: e.target.value as Item['status'] })}>{Object.entries(STATUSES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
              <select aria-label={`Priority of ${i.title}`} className={sel} value={i.priority} onChange={e => save(i.id, { priority: Number(e.target.value) })}><option value={1}>High</option><option value={2}>Medium</option><option value={3}>Low</option></select>
              <Button size="sm" variant="ghost" aria-label={`Delete ${i.title}`} onClick={() => remove(i.id)}><Trash2 className="h-4 w-4" aria-hidden /></Button>
            </> : <span className="text-xs text-muted-foreground">{STATUSES[i.status]}</span>}
          </li>))}</ul>}
      </section>
    </article>
  );
}
