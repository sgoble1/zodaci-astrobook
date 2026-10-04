import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

type Row = { id: string; user_id: string; visit_id: string; kind: string; path: string; label: string; detail: Record<string, unknown>; duration_seconds: number | null; device: string; created_at: string };
type Member = { user_id: string; display_name: string };
type Made = { when: string; what: string; title: string };

const fmtDur = (s: number) => s < 60 ? `${s}s` : s < 3600 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
const fmtTime = (iso: string) => new Date(iso).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const KIND: Record<string, string> = { page_view: 'Opened page', page_leave: 'Left page', click: 'Clicked', submit: 'Sent', away: 'Away', back: 'Back', media_play: 'Played', media_pause: 'Paused', media_ended: 'Finished' };

export function ActivityFeed() {
  const [members, setMembers] = useState<Member[]>([]);
  const [who, setWho] = useState<string>('');
  const [days, setDays] = useState(7);
  const [rows, setRows] = useState<Row[]>([]);
  const [made, setMade] = useState<Made[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => { supabase.rpc('shared_member_directory').then(({ data }) => {
    const list = (data ?? []) as Member[]; setMembers(list);
    setWho(list.find(m => m.display_name === 'April')?.user_id ?? list[0]?.user_id ?? '');
  }); }, []);

  const load = async () => {
    if (!who) return; setLoading(true);
    const since = new Date(Date.now() - days * 864e5).toISOString();
    const { data } = await supabase.from('activity_events').select('*').eq('user_id', who).gte('created_at', since).order('created_at', { ascending: false }).limit(2000);
    setRows((data ?? []) as Row[]);
    const sources: [string, string, string][] = [['custom_pages', 'Created page', 'owner_id'], ['library_items', 'Added item', 'owner_id'], ['shared_posts', 'Posted', 'author_id'], ['shared_recommendations', 'Recommended', 'author_id'], ['shared_media', 'Uploaded media', 'uploaded_by'], ['shared_wonderings', 'Wondering', 'author_id'], ['workbook_entries', 'Workbook answer', 'owner_id']];
    const out: Made[] = [];
    await Promise.all(sources.map(async ([t, what, col]) => {
      const { data: d } = await (supabase.from(t as never) as any).select('*').eq(col, who).gte('created_at', since).limit(100);
      (d ?? []).forEach((r: any) => out.push({ when: r.created_at, what: t === 'library_items' ? (r.kind === 'podcast' ? 'Made podcast' : 'Added file') : what, title: r.title || r.caption || r.question || r.file_name || (r.body ?? '').slice(0, 80) }));
    }));
    setMade(out.sort((a, b) => b.when.localeCompare(a.when)));
    setLoading(false);
  };
  useEffect(() => { void load(); }, [who, days]);

  const stats = useMemo(() => {
    const leaves = rows.filter(r => r.kind === 'page_leave');
    const active = leaves.reduce((n, r) => n + (r.duration_seconds ?? 0), 0);
    const byPage = new Map<string, { secs: number; visits: number }>();
    leaves.forEach(r => { const p = byPage.get(r.path) ?? { secs: 0, visits: 0 }; p.secs += r.duration_seconds ?? 0; p.visits++; byPage.set(r.path, p); });
    const visits = new Map<string, { first: string; last: string; device: string; n: number }>();
    rows.forEach(r => { const v = visits.get(r.visit_id) ?? { first: r.created_at, last: r.created_at, device: r.device, n: 0 }; if (r.created_at < v.first) v.first = r.created_at; if (r.created_at > v.last) v.last = r.created_at; v.n++; visits.set(r.visit_id, v); });
    const media = new Map<string, { plays: number; finished: number; furthest: number; length: number | null }>();
    rows.filter(r => r.kind.startsWith('media_')).forEach(r => { const m = media.get(r.label) ?? { plays: 0, finished: 0, furthest: 0, length: null }; if (r.kind === 'media_play') m.plays++; if (r.kind === 'media_ended') m.finished++; m.furthest = Math.max(m.furthest, Number(r.detail?.position_s ?? 0)); m.length = (r.detail?.length_s as number) ?? m.length; media.set(r.label, m); });
    const tools = new Map<string, number>();
    rows.filter(r => r.kind === 'click' || r.kind === 'submit').forEach(r => tools.set(r.label, (tools.get(r.label) ?? 0) + 1));
    return { active, pages: [...byPage].sort((a, b) => b[1].secs - a[1].secs), visits: [...visits].sort((a, b) => b[1].last.localeCompare(a[1].last)), media: [...media], tools: [...tools].sort((a, b) => b[1] - a[1]).slice(0, 25), last: rows[0]?.created_at };
  }, [rows]);

  const feed = rows.filter(r => filter === 'all' ? true : filter === 'pages' ? r.kind.startsWith('page') : filter === 'clicks' ? r.kind === 'click' || r.kind === 'submit' : filter === 'media' ? r.kind.startsWith('media') : r.kind === 'away' || r.kind === 'back');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 items-center text-sm">
        <label className="flex items-center gap-2">Person
          <select className="border border-border rounded px-2 py-1 bg-background" value={who} onChange={e => setWho(e.target.value)}>{members.map(m => <option key={m.user_id} value={m.user_id}>{m.display_name} · {m.user_id.slice(0, 6)}</option>)}</select>
        </label>
        <label className="flex items-center gap-2">Period
          <select className="border border-border rounded px-2 py-1 bg-background" value={days} onChange={e => setDays(Number(e.target.value))}>{[1, 7, 30, 90].map(d => <option key={d} value={d}>Last {d} day{d > 1 ? 's' : ''}</option>)}</select>
        </label>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}><RefreshCw className="w-3 h-3 mr-1" />{loading ? 'Loading…' : 'Refresh'}</Button>
        <span className="text-muted-foreground text-xs">Admin only. Private counselor chats are counted as visits, but what she types is never recorded.</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[['Active time', fmtDur(stats.active)], ['Visits', String(stats.visits.length)], ['Pages opened', String(rows.filter(r => r.kind === 'page_view').length)], ['Last seen', stats.last ? fmtTime(stats.last) : '—']].map(([k, v]) => <div key={k} className="parchment p-3"><div className="text-xs text-muted-foreground">{k}</div><div className="text-lg">{v}</div></div>)}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Box title="Time on each page (active time only)">{stats.pages.slice(0, 20).map(([p, v]) => <Line key={p} a={p} b={`${fmtDur(v.secs)} · ${v.visits}×`} />)}</Box>
        <Box title="Visits (sessions)">{stats.visits.slice(0, 20).map(([id, v]) => <Line key={id} a={`${fmtTime(v.first)} · ${v.device}`} b={`${fmtDur(Math.round((+new Date(v.last) - +new Date(v.first)) / 1000))} · ${v.n} actions`} />)}</Box>
        <Box title="Podcasts & media listened to">{stats.media.length ? stats.media.map(([t, m]) => <Line key={t} a={t} b={`${m.plays} plays · reached ${fmtDur(m.furthest)}${m.length ? ` of ${fmtDur(m.length)}` : ''}${m.finished ? ' · finished' : ''}`} />) : <Empty />}</Box>
        <Box title="Most-used buttons & tools">{stats.tools.length ? stats.tools.map(([t, n]) => <Line key={t} a={t} b={`${n}×`} />) : <Empty />}</Box>
        <Box title="Things she created">{made.length ? made.slice(0, 40).map((m, i) => <Line key={i} a={`${m.what}: ${m.title}`} b={fmtTime(m.when)} />) : <Empty />}</Box>
      </div>

      <section className="parchment p-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-center"><h3 className="text-lg mr-2">Live feed</h3>{['all', 'pages', 'clicks', 'media', 'away'].map(f => <button key={f} onClick={() => setFilter(f)} className={`px-2.5 py-1 rounded-full border text-xs ${filter === f ? 'border-accent bg-accent/15' : 'border-border'}`}>{f}</button>)}</div>
        <ol className="divide-y divide-border text-sm max-h-[60vh] overflow-y-auto">
          {feed.slice(0, 500).map(r => (
            <li key={r.id} className="py-1.5 grid grid-cols-[7.5rem_5.5rem_1fr] gap-2">
              <span className="text-muted-foreground text-xs">{fmtTime(r.created_at)}</span>
              <span className="text-xs">{KIND[r.kind] ?? r.kind}</span>
              <span className="min-w-0 break-words">{r.label || r.path} {r.kind !== 'page_view' && r.kind !== 'page_leave' ? <span className="text-muted-foreground text-xs">on {r.path}</span> : <span className="text-muted-foreground text-xs">{r.path}</span>}{r.duration_seconds != null && <span className="text-xs"> · {fmtDur(r.duration_seconds)} active{r.detail?.reason ? ` (${r.detail.reason})` : ''}</span>}</span>
            </li>
          ))}
          {!feed.length && <Empty />}
        </ol>
      </section>
    </div>
  );
}
const Box = ({ title, children }: { title: string; children: React.ReactNode }) => <section className="parchment p-4"><h3 className="text-base mb-2">{title}</h3><div className="text-sm divide-y divide-border max-h-72 overflow-y-auto">{children}</div></section>;
const Line = ({ a, b }: { a: string; b: string }) => <div className="flex justify-between gap-3 py-1"><span className="min-w-0 break-words">{a}</span><span className="text-muted-foreground text-xs shrink-0 text-right">{b}</span></div>;
const Empty = () => <p className="text-muted-foreground text-sm py-2">Nothing yet.</p>;
