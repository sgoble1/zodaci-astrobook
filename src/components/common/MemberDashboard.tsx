import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark, BookOpen, Compass, Orbit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeArt } from '@/components/common/ThemeArt';
import { LoadError } from '@/components/common/LoadError';
import { useSession } from '@/hooks/useLibrary';
import { usePlan } from '@/hooks/usePlan';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useMyBirth, toChartInput } from '@/lib/myBirth';
import { computeChart, fmtLon } from '@/lib/astro';
import { ALL_READINGS, loadMyTopicReadings, type TopicRow } from '@/lib/topicReadings';
import { readingVisitKey, type ReadingVisit } from '@/lib/readingExperience';
import { SharedChatFeed } from '@/components/shared/SharedChatFeed';
import { supabase } from '@/integrations/supabase/client';

type OrderSummary = { id: string; status: string; edition: string; format: string };

export function MemberDashboard() {
  const birth = useMyBirth();
  const session = useSession();
  const access = usePlan();
  const bookmarks = useBookmarks();
  const [readings, setReadings] = useState<TopicRow[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [visit, setVisit] = useState<ReadingVisit | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!session) return;
    let alive = true;
    setLoading(true); setError(false);
    try { setVisit(JSON.parse(localStorage.getItem(readingVisitKey(session.user.id)) ?? 'null')); } catch { setVisit(null); }
    void Promise.all([loadMyTopicReadings(), supabase.from('book_orders').select('id,status,edition,format').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(3)]).then(([rows, result]) => {
      if (!alive) return;
      if (result.error) throw result.error;
      setReadings(rows.filter(r => ['ready', 'preview'].includes(r.status))); setOrders(result.data ?? []);
    }).catch(() => { if (alive) setError(true); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [session?.user.id, retry]);
  const chart = useMemo(() => { if (!birth) return null; try { return computeChart(toChartInput(birth)); } catch { return null; } }, [birth]);
  const placements = chart ? [['Sun', chart.bodies.find(b => b.key === 'sun')?.sign], ['Moon', chart.bodies.find(b => b.key === 'moon')?.sign], ['Rising', birth?.time && chart.asc !== null ? fmtLon(chart.asc).sign : 'Time unknown']] : [];
  if (birth === undefined || access.loading) return <p role="status" className="text-muted-foreground">Opening your dashboard…</p>;
  const destination = !birth ? '/start' : visit?.path.startsWith('/my-readings/topic/') ? `${visit.path}${visit.section ? `#${visit.section}` : ''}` : '/my-readings/topic/big-three';
  return <article className="space-y-12">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6"><div className="space-y-2"><p className="text-xs text-gold">Your personal atlas · {access.plan === 'free' ? 'Free' : access.plan === 'creator' ? 'Creator' : 'Full Access'}</p><h1>{birth ? `${birth.name}’s dashboard` : 'Your dashboard'}</h1></div><Button asChild variant="outline"><Link to="/start">{birth ? 'Birth details' : 'Set up my chart'}</Link></Button></header>
    <section className="grid items-center gap-6 sm:grid-cols-[7rem_minmax(0,1fr)]"><ThemeArt label={visit?.title ?? 'Your Big Three'} className="h-28 w-28" /><div className="space-y-4"><p className="text-xs text-gold">{!birth ? 'Begin here' : visit ? 'Continue reading' : 'Your chart is ready'}</p><h2>{!birth ? 'Meet your sky' : visit?.title ?? 'Your Big Three'}</h2>{!birth ? <p className="text-muted-foreground">Your birth date, time and place create your personal chart.</p> : visit ? <p className="text-muted-foreground">Return to your saved place.</p> : <p className="text-muted-foreground">Sun, Moon and Rising: a starting point for your personal readings.</p>}<Button asChild><Link to={destination}>{!birth ? 'Create my chart' : visit ? 'Continue reading' : 'Open my first reading'}<ArrowRight className="h-4 w-4" /></Link></Button></div></section>
    {chart && <section className="border-y border-border py-6"><div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-2xl">Chart snapshot</h2><Button asChild variant="ghost"><Link to="/my-chart"><Orbit className="h-4 w-4" />My Chart</Link></Button></div><dl className="grid gap-4 sm:grid-cols-3">{placements.map(([label, value]) => <div key={label} className="border-l-2 border-primary pl-4"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 font-display text-2xl">{value}</dd></div>)}</dl>{!birth?.time && <p className="mt-4 text-sm text-muted-foreground">Birth time is unknown. Rising sign and houses are not shown.</p>}</section>}
    {loading ? <p role="status" className="text-muted-foreground">Loading your saved items…</p> : error ? <LoadError what="your dashboard" onRetry={() => setRetry(n => n + 1)} /> : <>
    <section className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl">Your reading shelf</h2><Button asChild variant="ghost"><Link to="/my-readings">All readings<ArrowRight className="h-4 w-4" /></Link></Button></div>{readings.length ? <ul className="divide-y divide-border">{readings.slice(0, 4).map(row => <li key={row.id}><Link to={ALL_READINGS.find(t => `topic-${t.slug}` === row.page_key && 'route' in t)?.route ?? `/my-readings/topic/${row.page_key.replace('topic-', '')}`} className="flex min-h-14 items-center justify-between gap-3 py-3"><span>{row.title}</span><span className="shrink-0 text-xs text-muted-foreground">{row.status === 'preview' ? 'First-section preview' : 'Saved'} →</span></Link></li>)}</ul> : <p className="text-muted-foreground">Your saved readings will appear here.</p>}{access.plan === 'free' && <p className="text-sm text-muted-foreground">Two full readings and core-theme first sections are included. <Link className="text-primary underline" to="/pricing">See Full Access</Link></p>}</section>
    {bookmarks.items.length > 0 && <section className="space-y-4"><h2 className="text-2xl">Saved places</h2><ul className="divide-y divide-border">{bookmarks.items.slice(0, 4).map(item => <li key={item.id} className="py-3"><Link to={item.path} className="flex items-center gap-3"><Bookmark className="h-4 w-4 text-gold" />{item.title}</Link>{item.note && <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{item.note}</p>}</li>)}</ul></section>}
    {orders.length > 0 && <section className="space-y-4"><h2 className="text-2xl">Your AstroBooks</h2><ul className="divide-y divide-border">{orders.map(order => <li key={order.id}><Link to={`/orders?order=${order.id}`} className="flex items-center justify-between gap-4 py-4"><span className="capitalize">{order.edition} · {order.format === 'digital' ? 'Digital PDF' : 'Printed book'}</span><span className="text-sm capitalize text-muted-foreground">{order.status.replace(/_/g, ' ')} →</span></Link></li>)}</ul></section>}
    </>}
    <section className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6"><h2 className="text-2xl">Explore next</h2><div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link to="/explore"><Compass className="h-4 w-4" />Explore</Link></Button><Button asChild variant="outline"><Link to="/books"><BookOpen className="h-4 w-4" />AstroBook</Link></Button>{access.plan === 'creator' && <Button asChild variant="outline"><Link to="/creator">Creator Studio</Link></Button>}</div></section>
    <SharedChatFeed />
  </article>;
}