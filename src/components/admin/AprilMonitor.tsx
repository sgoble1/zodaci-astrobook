import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

type Overview = { found: boolean; display_name: string; joined: string | null; last_seen: string | null; visits_30d: number; page_views_30d: number; minutes_30d: number; clicks_30d: number; media_30d: number; ai_uses_month: number; counselor_sessions: number; social_sessions: number; workbook_entries: number; readings_ready: number; readings_writing: number };
type Ev = { created_at: string; kind: string; label: string; path: string; duration_seconds: number | null; device: string; visit_id: string };
type Use = { feature: string; uses: number; credits: number };
const KINDS: [string, string][] = [['', 'All'], ['page_view', 'Pages'], ['click', 'Clicks'], ['media_play', 'Media'], ['away', 'Away']];

/** April's account at a glance: visits, time, tools used and credit use. Shows activity only — never her messages, answers or reading text. */
export function AprilMonitor() {
  const [o, setO] = useState<Overview | null>(null);
  const [events, setEvents] = useState<Ev[]>([]);
  const [usage, setUsage] = useState<Use[]>([]);
  const [kind, setKind] = useState('');
  const [err, setErr] = useState('');
  const load = async () => {
    setErr('');
    const [a, e, u] = await Promise.all([supabase.rpc('admin_april_overview'), supabase.rpc('admin_april_events', { _limit: 200, _kind: kind || null }), supabase.rpc('admin_april_usage')]);
    if (a.error || e.error || u.error) { setErr('April’s activity could not be loaded.'); return; }
    setO(((a.data ?? []) as Overview[])[0] ?? null); setEvents((e.data ?? []) as Ev[]); setUsage((u.data ?? []) as Use[]);
  };
  useEffect(() => { void load(); const t = window.setInterval(() => void load(), 30000); return () => window.clearInterval(t); }, [kind]); // eslint-disable-line react-hooks/exhaustive-deps
  if (err) return <p role="alert" className="text-destructive">{err} <Button variant="link" className="h-auto p-0" onClick={() => void load()}>Retry</Button></p>;
  if (!o) return <div role="status" aria-label="Loading April's activity" className="h-40 animate-pulse rounded bg-muted" />;
  if (!o.found) return <p className="text-muted-foreground">April’s account hasn’t been created yet.</p>;
  const stats: [string, string | number][] = [['Last seen', o.last_seen ? new Date(o.last_seen).toLocaleString() : 'Not yet'], ['Visits (30 days)', o.visits_30d], ['Pages opened', o.page_views_30d], ['Active minutes', o.minutes_30d], ['Clicks', o.clicks_30d], ['Audio & video', o.media_30d]];
  const made: [string, number][] = [['Counselor sessions', o.counselor_sessions], ['Social Integration sessions', o.social_sessions], ['Workbook entries', o.workbook_entries], ['Readings ready', o.readings_ready], ['Readings being written', o.readings_writing], ['AI uses this month', o.ai_uses_month]];
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-2xl">April monitor</h2><p className="text-sm text-muted-foreground">{o.display_name || 'April'} · joined {o.joined ? new Date(o.joined).toLocaleDateString() : '—'} · updates every 30 seconds</p></div><Button size="sm" variant="outline" onClick={() => void load()}><RefreshCw className="h-4 w-4" />Refresh</Button></div>
      <section aria-label="Activity, last 30 days" className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">{stats.map(([k, v]) => <div key={k} className="parchment p-3"><p className="text-xs text-muted-foreground">{k}</p><p className="mt-1 text-lg">{v}</p></div>)}</section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="vellum p-5" aria-labelledby="am-made"><h3 id="am-made" className="text-lg">What she has made</h3><ul className="mt-3 divide-y divide-border text-sm">{made.map(([k, v]) => <li key={k} className="flex justify-between py-2"><span>{k}</span><span className="tabular-nums">{v}</span></li>)}</ul><p className="mt-3 text-xs text-muted-foreground">Counts only. Session, journal and reading text stays private to April.</p></section>
        <section className="vellum p-5" aria-labelledby="am-ai"><h3 id="am-ai" className="text-lg">AI use this month</h3>{usage.length ? <ul className="mt-3 divide-y divide-border text-sm">{usage.map(u => <li key={u.feature} className="flex justify-between py-2"><span>{u.feature}</span><span className="tabular-nums">{u.uses} uses · {u.credits} credits</span></li>)}</ul> : <p className="mt-3 text-sm text-muted-foreground">No AI use yet this month.</p>}</section>
      </div>
      <section aria-labelledby="am-feed" className="space-y-3">
        <div className="flex flex-wrap items-center gap-2"><h3 id="am-feed" className="mr-2 text-lg">Recent activity</h3>{KINDS.map(([k, l]) => <Button key={k || 'all'} size="sm" variant={kind === k ? 'secondary' : 'ghost'} className="rounded-full" onClick={() => setKind(k)}>{l}</Button>)}</div>
        {!events.length ? <p className="text-sm text-muted-foreground">No activity recorded.</p> : <ul className="divide-y divide-border border-y border-border text-sm">{events.map((e, i) => <li key={i} className="grid gap-1 py-2 sm:grid-cols-[11rem_7rem_1fr_6rem]"><span className="text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span><span className="text-gold">{e.kind.replace(/_/g, ' ')}</span><span className="truncate">{e.label || e.path}<span className="ml-2 text-xs text-muted-foreground">{e.path}</span></span><span className="text-xs text-muted-foreground">{e.duration_seconds ? `${Math.round(e.duration_seconds / 60)} min · ` : ''}{e.device}</span></li>)}</ul>}
      </section>
    </div>
  );
}
