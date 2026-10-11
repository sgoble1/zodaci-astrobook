import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { UPDATES as STATIC, type Update, type UpdateKind } from '@/content/updates';

const KIND_COLOR: Record<UpdateKind, string> = { Feature: '--primary', Content: '--accent', Change: '--candle', Fix: '--oxblood' };

export function UpdatesFeed({ limit = 6 }: { limit?: number }) {
  const [all, setAll] = useState(false);
  const [live, setLive] = useState<Update[]>([]);
  useEffect(() => {
    // Live feed: new podcasts, documents, created pages and shared items appear automatically.
    const load = async () => {
      const [lib, pages, media, recs] = await Promise.all([
        supabase.rpc('recent_library_items'),
        supabase.from('custom_pages').select('id,title,brief,menu_group,created_at').eq('status', 'ready').order('created_at', { ascending: false }).limit(15),
        supabase.from('shared_media').select('id,caption,file_name,created_at').order('created_at', { ascending: false }).limit(10),
        supabase.from('shared_recommendations').select('id,title,category,created_at').order('created_at', { ascending: false }).limit(10),
      ]);
      setLive([
        ...(lib.data ?? []).map(d => ({
          date: d.created_at, kind: 'Content' as UpdateKind,
          title: d.kind === 'podcast' ? `New podcast: ${d.title}` : `New document: ${d.title}`,
          body: d.description || (d.kind === 'podcast' ? 'A new episode was added to Podcasts.' : 'A new source document was added to the library.'),
          to: d.kind === 'podcast' ? '/podcasts' : d.kind === 'masterbook' ? '/masterbook/index' : '/sources',
        })),
        ...(pages.data ?? []).map(p => ({ date: p.created_at, kind: 'Content' as UpdateKind, title: `New page: ${p.title}`, body: p.brief ? p.brief.slice(0, 160) : `Added to the ${p.menu_group} menu.`, to: `/p/${p.id}` })),
        ...(media.data ?? []).map(m => ({ date: m.created_at, kind: 'Content' as UpdateKind, title: `New in the Media Library: ${m.caption || m.file_name}`, body: 'A photo, video or file was added to the shared space.', to: '/shared/media' })),
        ...(recs.data ?? []).map(r => ({ date: r.created_at, kind: 'Content' as UpdateKind, title: `New recommendation: ${r.title}`, body: r.category ? `Filed under ${r.category}.` : 'Added to shared Recommendations.', to: '/shared/recommendations' })),
      ]);
    };
    void load();
    const ch = supabase.channel(`updates-feed-${Math.random().toString(36).slice(2)}`);
    ['library_items', 'custom_pages', 'shared_media', 'shared_recommendations'].forEach(t => ch.on('postgres_changes', { event: 'INSERT', schema: 'public', table: t }, () => void load()));
    ch.subscribe();
    const t = setInterval(() => void load(), 120000);
    return () => { clearInterval(t); void supabase.removeChannel(ch); };
  }, []);
  const UPDATES = useMemo(() => [...live, ...STATIC].sort((a, b) => toTime(b.date) - toTime(a.date)), [live]);
  const shown = all ? UPDATES : UPDATES.slice(0, limit);
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl">Recent updates</h2>
        {UPDATES.length > limit && <button onClick={() => setAll(a => !a)} className="text-xs underline">{all ? 'Show fewer' : `Show all ${UPDATES.length}`}</button>}
      </div>
      <ol className="parchment divide-y divide-border/60">
        {shown.map((u, i) => {
          const c = `hsl(var(${KIND_COLOR[u.kind]}))`;
          const inner = (
            <div className="flex gap-3 p-4">
              <div className="w-20 shrink-0 text-[11px] text-muted-foreground pt-0.5">{new Date(toTime(u.date)).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              <div className="min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mr-2" style={{ color: c, background: `hsl(var(${KIND_COLOR[u.kind]}) / 0.12)` }}>{u.kind}</span>
                <span className="font-medium">{u.title}</span>
                <p className="text-sm text-muted-foreground mt-1">{u.body}</p>
              </div>
            </div>
          );
          return <li key={i}>{u.to ? <Link to={u.to} className="block hover:bg-muted/40 transition-colors">{inner}</Link> : inner}</li>;
        })}
      </ol>
    </section>
  );
}

function toTime(d: string) { return new Date(d.length === 10 ? d + 'T12:00' : d).getTime(); }
