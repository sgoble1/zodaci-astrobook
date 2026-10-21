import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookHeart, Headphones, Package, Printer, Truck } from 'lucide-react';
import { BoxArt } from '@/components/common/BoxArt';
import { LoadError } from '@/components/common/LoadError';
import { PLAN_LABEL } from '@/components/common/PlanLock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';
import { usePlan } from '@/hooks/usePlan';
import { useCustomPages } from '@/hooks/useCustomPages';
import { STARTER_CHAPTERS } from '@/lib/starterChapters';
import { statusLabel } from '@/lib/bookFulfillment';

const ITEMS = [
  { to: '/my-chart', title: 'My birth chart', group: 'Chart', note: 'Wheel, placements and aspects' },
  { to: '/my-readings', title: 'My readings', group: 'Readings', note: 'Topics, core themes and quick readings' },
  { to: '/other-systems', title: 'Other systems', group: 'Explore', note: 'Chinese, Vedic, Mayan and more' },
  { to: '/explore', title: 'Explore', group: 'Explore', note: 'Timing, relationships and community' },
  { to: '/create', title: 'Create a page', group: 'Created', note: 'Write a new page about anything' },
  { to: '/podcasts', title: 'Podcasts', group: 'Media', note: 'Listen and make episodes' },
  { to: '/dashboard', title: 'Bookmarks', group: 'Created', note: 'Everything you saved' },
  { to: '/start', title: 'Birth details', group: 'Chart', note: 'Edit your date, time and place' },
];

type Order = { id: string; status: string; edition: string; format: string };

/** Book hub: Masterbook progress, latest AstroBook order, media, and a searchable index of everything that's yours. */
export default function MyLibrary() {
  const session = useSession();
  const { plan, loading: planLoading } = usePlan();
  const custom = useCustomPages();
  const [chapters, setChapters] = useState<number | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('All');
  useEffect(() => {
    if (!session) return;
    let alive = true; setError(false); setChapters(null);
    Promise.all([
      supabase.from('generated_pages').select('id', { count: 'exact', head: true }).eq('owner_id', session.user.id).eq('section', 'My Masterbook').eq('status', 'ready'),
      supabase.from('book_orders').select('id,status,edition,format').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(1),
    ]).then(([pages, orders]) => {
      if (!alive) return;
      if (pages.error || orders.error) { setError(true); return; }
      setChapters(pages.count ?? 0); setOrder(orders.data?.[0] ?? null);
    }).catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, [session?.user.id, retry]); // eslint-disable-line react-hooks/exhaustive-deps
  const all = useMemo(() => [...ITEMS, ...custom.filter(c => c.status !== 'failed').map(c => ({ to: `/p/${c.id}`, title: c.title, group: 'Created', note: c.status === 'generating' ? 'Being written…' : 'A page you created' }))], [custom]);
  const groups = ['All', ...new Set(all.map(i => i.group))];
  const shown = all.filter(i => (group === 'All' || i.group === group) && (i.title + i.note).toLowerCase().includes(q.toLowerCase()));
  const total = STARTER_CHAPTERS.length;
  const paid = !planLoading && plan !== 'free';
  return (
    <article className="space-y-12">
      <header className="max-w-3xl space-y-2"><h1 className="font-display text-4xl">My Library</h1><p className="text-muted-foreground">Your Masterbook, printed AstroBook, audio and everything you have made — in one place.</p></header>

      <section aria-labelledby="book-status" className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-md">
          <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-border text-gold"><BookHeart className="h-6 w-6" aria-hidden="true" /></span>
            <div className="min-w-0 flex-1 space-y-1"><h2 id="book-status" className="font-display text-2xl">My Masterbook</h2>
              <p className="text-sm text-muted-foreground">{planLoading ? 'Checking your plan…' : paid ? `${PLAN_LABEL[plan]} includes your foundational chapters, written from your chart.` : 'Pro writes your foundational chapters from your own chart.'}</p></div></div>
          {error ? <div className="mt-4"><LoadError what="your book status" onRetry={() => setRetry(n => n + 1)} /></div> : paid && <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-sm"><span>Chapters ready</span><span className="text-muted-foreground">{chapters === null ? '…' : `${Math.min(chapters, total)} of ${total}`}</span></div>
            <Progress value={chapters === null ? 0 : Math.min(100, (chapters / total) * 100)} aria-label="Masterbook chapters ready" />
          </div>}
          <div className="mt-5 flex flex-wrap gap-2"><Button asChild><Link to="/my-masterbook">{paid ? 'Read my Masterbook' : 'See what’s inside'}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></Button>{!paid && !planLoading && <Button asChild variant="outline"><Link to="/pricing">Compare plans</Link></Button>}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-md">
          <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-border text-gold"><Printer className="h-6 w-6" aria-hidden="true" /></span>
            <div className="min-w-0 space-y-1"><h2 className="font-display text-2xl">AstroBook in print</h2>
              {order ? <p className="text-sm text-muted-foreground"><span className="capitalize">{order.edition}</span> · {order.format === 'digital' ? 'Digital PDF' : 'Printed book'} — {statusLabel(order.status)}</p> : <p className="text-sm text-muted-foreground">Five versions, from a digital PDF to a linen hardcover.</p>}</div></div>
          <div className="mt-5 flex flex-wrap gap-2">{order ? <Button asChild><Link to={`/orders?order=${order.id}`}><Truck className="h-4 w-4" aria-hidden="true" />Track my order</Link></Button> : <Button asChild><Link to="/books">Design my book</Link></Button>}<Button asChild variant="outline"><Link to="/book-preview">Preview a sample</Link></Button></div>
        </div>
      </section>

      <section aria-labelledby="media" className="space-y-4"><h2 id="media" className="font-display text-2xl">Listen and collect</h2>
        <ul className="grid gap-4 sm:grid-cols-3">{[
          { to: '/podcasts', title: 'Podcasts', note: 'Turn readings into audio episodes', Icon: Headphones },
          { to: '/my-comic', title: 'My AstroComic', note: 'Your illustrated monthly issue', Icon: Package },
          { to: '/orders', title: 'My book orders', note: 'Downloads, print status and tracking', Icon: Truck },
        ].map(({ to, title, note, Icon }) => <li key={to}><Link to={to} className="flex min-h-16 items-center gap-3 rounded-xl border border-border bg-card/60 p-4 transition-colors hover:border-primary/60 focus-visible:outline focus-visible:outline-2"><Icon className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" /><span><span className="block font-display">{title}</span><span className="text-xs text-muted-foreground">{note}</span></span></Link></li>)}</ul>
      </section>

      <section aria-labelledby="everything" className="space-y-4">
        <h2 id="everything" className="font-display text-2xl">Everything that’s yours</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Input aria-label="Search my library" placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} className="max-w-xs" />
          {groups.map(g => <button key={g} type="button" aria-pressed={group === g} onClick={() => setGroup(g)} className={`min-h-10 rounded-full border px-3 text-sm ${group === g ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}`}>{g}</button>)}
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map(i => <li key={i.to}><Link to={i.to} className="block overflow-hidden rounded-lg border border-border bg-card hover:border-primary focus-visible:outline focus-visible:outline-2"><BoxArt seed={i.title} label={i.title} /><div className="p-3"><p className="font-display">{i.title}</p><p className="text-xs text-muted-foreground">{i.group} · {i.note}</p></div></Link></li>)}
        </ul>
        {!shown.length && <p role="status" className="text-sm text-muted-foreground">Nothing matches that search.</p>}
      </section>
    </article>
  );
}
