import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { money } from '@/lib/books';

type Stats = { signups_total: number; signups_recent: number; onboarded_total: number; paid_total: number; paid_recent: number; books_paid_total: number; books_paid_recent: number; books_shipped_total: number; book_revenue_cents: number };

/** Admin-only customer funnel: sign-ups, paid plans and completed (live, paid) book orders. */
export function GrowthStats() {
  const [days, setDays] = useState(30);
  const [s, setS] = useState<Stats | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => { setErr(''); void supabase.rpc('admin_growth_stats', { _days: days }).then(({ data, error }) => { if (error) setErr('Customer numbers could not load.'); else setS((data as Stats[])?.[0] ?? null); }); }, [days]);
  const cards: [string, string, string][] = s ? [
    ['Sign-ups', String(s.signups_total), `+${s.signups_recent} in ${days} days · ${s.onboarded_total} added birth details`],
    ['Paying members', String(s.paid_total), `${s.paid_recent} new plan upgrades in ${days} days`],
    ['Books paid', String(s.books_paid_total), `+${s.books_paid_recent} in ${days} days · ${s.books_shipped_total} shipped`],
    ['Book revenue', money(s.book_revenue_cents), 'Real (live) payments only'],
  ] : [];
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-2xl">Customers</h2>
        <select value={days} onChange={e => setDays(Number(e.target.value))} className="bg-input border border-border rounded h-9 px-2 text-sm" aria-label="Time range">
          {[7, 30, 90, 365].map(d => <option key={d} value={d}>Last {d} days</option>)}
        </select>
      </div>
      {err && <p role="alert" className="text-destructive text-sm">{err}</p>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([l, v, d]) => <div key={l} className="parchment p-4"><p className="text-xs text-muted-foreground">{l}</p><p className="font-display text-3xl mt-1">{v}</p><p className="text-xs text-muted-foreground mt-1">{d}</p></div>)}
      </div>
      <p className="text-xs text-muted-foreground">Test-mode payments are excluded, so these are real customers only.</p>
    </section>
  );
}
