import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { money } from '@/lib/books';

type Dev = { members: number; members_7d: number; paid_live: number; book_orders: number; comic_subs: number; credit_packs_cents: number; ai_credits_month: number; contact_open: number };
type Growth = { book_revenue_cents: number; paid_recent: number };

/** Admin sidebar snapshot: live revenue sources and member counts from has_role-checked RPCs. Figures are live payments only. */
export function RevenueRail({ onOpen }: { onOpen: (tab: 'stripe' | 'growth' | 'orders' | 'credits') => void }) {
  const [d, setD] = useState<Dev | null>(null); const [g, setG] = useState<Growth | null>(null);
  const [err, setErr] = useState(false); const [n, setN] = useState(0);
  useEffect(() => {
    let on = true; setErr(false);
    void Promise.all([supabase.rpc('dev_stats'), supabase.rpc('admin_growth_stats', { _days: 30 })]).then(([a, b]) => {
      if (!on) return;
      if (a.error || b.error) { setErr(true); return; }
      setD((a.data as Dev[])?.[0] ?? null); setG((b.data as Growth[])?.[0] ?? null);
    });
    return () => { on = false; };
  }, [n]);
  const rows: { label: string; value: string; note?: string; tab: 'stripe' | 'growth' | 'orders' | 'credits' }[] = d && g ? [
    { label: 'Paying members', value: String(d.paid_live), note: `+${g.paid_recent} in 30 days`, tab: 'stripe' },
    { label: 'Book revenue', value: money(g.book_revenue_cents), note: `${d.book_orders} orders`, tab: 'orders' },
    { label: 'Credit packs', value: money(d.credit_packs_cents), note: 'Live purchases', tab: 'credits' },
    { label: 'AstroComic subscribers', value: String(d.comic_subs), tab: 'orders' },
    { label: 'Members', value: String(d.members), note: `+${d.members_7d} this week`, tab: 'growth' },
    { label: 'Open messages', value: String(d.contact_open), tab: 'growth' },
  ] : [];
  return (
    <section aria-labelledby="rev-rail-h" className="vellum space-y-2 p-3">
      <div className="flex items-center justify-between px-1"><h2 id="rev-rail-h" className="font-label !text-sm tracking-[0.14em] text-primary">Revenue & growth</h2>
        <button type="button" onClick={() => setN(x => x + 1)} aria-label="Refresh figures" className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><RefreshCw className="h-3.5 w-3.5" aria-hidden /></button></div>
      {err ? <p role="alert" className="px-1 text-xs text-destructive">Figures could not load. <button type="button" className="underline" onClick={() => setN(x => x + 1)}>Try again</button></p>
        : !d ? <p role="status" className="px-1 text-xs text-muted-foreground">Loading figures…</p>
        : <dl className="grid grid-cols-2 gap-1 lg:grid-cols-1">{rows.map(r => (
          <button key={r.label} type="button" onClick={() => onOpen(r.tab)} className="rounded px-2 py-1.5 text-left transition-colors duration-500 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
            <dt className="text-xs text-muted-foreground">{r.label}</dt><dd className="font-display text-lg leading-tight">{r.value}{r.note && <span className="ml-1.5 align-middle font-sans text-xs text-muted-foreground">{r.note}</span>}</dd>
          </button>))}</dl>}
      <p className="px-1 text-[11px] text-muted-foreground">Live payments only; test purchases are excluded.</p>
    </section>
  );
}
