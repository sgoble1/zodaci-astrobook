import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { getStripeEnvironment } from '@/lib/stripe';
import { PLAN_NAME, PRICE_TIER } from '@/lib/plans';
import { COMIC_PLANS } from '@/lib/comic';

type Overview = {
  environment: 'sandbox' | 'live'; generated_at: string; active_subscriptions: number; mrr_cents: number;
  by_price: Record<string, { count: number; mrr_cents: number; past_due: number; canceling: number }>;
  charges: { id: string; created: number; amount: number; currency: string; status: string; refunded: boolean; amount_refunded: number; description: string; email: string; disputed: boolean }[];
  disputes: { id: string; created: number; amount: number; reason: string; status: string; due_by: number | null }[];
  unpaid_invoices: { id: string; created: number; amount_due: number; email: string; attempts: number; next_attempt: number | null }[];
};
const usd = (c: number) => `$${(c / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const day = (s: number) => new Date(s * 1000).toLocaleDateString();
const envOr = (): 'sandbox' | 'live' => { try { return getStripeEnvironment(); } catch { return 'live'; } };
function priceName(id: string) {
  const tier = PRICE_TIER[id];
  if (tier) return `${PLAN_NAME[tier]} · ${id.endsWith('yearly') ? 'yearly' : 'monthly'}${/^(full_access|creator)_/.test(id) ? ' (earlier price)' : ''}`;
  const comic = Object.values(COMIC_PLANS).find(p => p.priceId === id);
  return comic ? `AstroComic · ${comic.name.toLowerCase()}` : id;
}

/** Read-only payments overview, fetched through an admin-checked server function. */
export function StripeOverview() {
  const [env, setEnv] = useState<'sandbox' | 'live'>(envOr);
  const [data, setData] = useState<Overview | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setErr('');
    const { data: d, error } = await supabase.functions.invoke('admin-stripe-overview', { body: { environment: env } });
    setLoading(false);
    if (error || !d || d.error) { setErr(d?.error || 'The payments overview is unavailable right now.'); return; }
    setData(d as Overview);
  }, [env]);
  useEffect(() => { void load(); }, [load]);
  const rows = data ? Object.entries(data.by_price).sort((a, b) => b[1].mrr_cents - a[1].mrr_cents) : [];
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="font-display text-2xl">Payments</h2><p className="text-sm text-muted-foreground">Live figures from the payment provider. Refunds and dispute responses are handled in the provider’s dashboard.</p></div>
        <div className="flex items-center gap-2"><div role="radiogroup" aria-label="Payment mode" className="flex rounded-md border border-border p-0.5 text-sm">{(['live', 'sandbox'] as const).map(e => <button key={e} type="button" role="radio" aria-checked={env === e} onClick={() => setEnv(e)} className={`rounded px-3 py-1 ${env === e ? 'bg-primary/15' : 'text-muted-foreground'}`}>{e === 'live' ? 'Live' : 'Test'}</button>)}</div><Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</Button></div>
      </div>
      {err && <p role="alert" className="text-sm text-destructive">{err} <Button variant="link" className="h-auto p-0" onClick={() => void load()}>Retry</Button></p>}
      {!data && !err && <div role="status" aria-label="Loading payments" className="h-40 animate-pulse rounded bg-muted" />}
      {data && <>
        <section aria-label="Totals" className="grid gap-3 sm:grid-cols-4">{[['Monthly recurring revenue', usd(data.mrr_cents)], ['Yearly run rate', usd(data.mrr_cents * 12)], ['Active subscriptions', String(data.active_subscriptions)], ['Open disputes', String(data.disputes.length)]].map(([k, v]) => <div key={k} className="parchment p-4"><p className="text-xs text-muted-foreground">{k}</p><p className="mt-1 font-display text-3xl">{v}</p></div>)}</section>
        <section aria-labelledby="so-prices"><h3 id="so-prices" className="text-lg">By plan</h3>{!rows.length ? <p className="mt-2 text-sm text-muted-foreground">No active subscriptions.</p> : <div className="mt-2 overflow-x-auto"><table className="w-full min-w-[560px] text-sm"><thead><tr className="border-b border-border text-left text-muted-foreground"><th className="py-2">Plan</th><th>Subscribers</th><th>Monthly revenue</th><th>Payment failed</th><th>Canceling</th></tr></thead><tbody>{rows.map(([id, r]) => <tr key={id} className="border-b border-border"><td className="py-2">{priceName(id)}</td><td>{r.count}</td><td>{usd(r.mrr_cents)}</td><td className={r.past_due ? 'text-destructive' : ''}>{r.past_due}</td><td>{r.canceling}</td></tr>)}</tbody></table></div>}</section>
        {(data.disputes.length > 0 || data.unpaid_invoices.length > 0) && <section className="grid gap-6 lg:grid-cols-2">
          {data.disputes.length > 0 && <div className="vellum p-5"><h3 className="flex items-center gap-2 text-lg"><AlertTriangle aria-hidden className="h-4 w-4 text-destructive" />Open disputes</h3><ul className="mt-3 divide-y divide-border text-sm">{data.disputes.map(d => <li key={d.id} className="flex flex-wrap justify-between gap-2 py-2"><span>{usd(d.amount)} · {d.reason.replace(/_/g, ' ')}</span><span className="text-muted-foreground">{d.status.replace(/_/g, ' ')}{d.due_by ? ` · respond by ${day(d.due_by)}` : ''}</span></li>)}</ul></div>}
          {data.unpaid_invoices.length > 0 && <div className="vellum p-5"><h3 className="text-lg">Failed renewals</h3><ul className="mt-3 divide-y divide-border text-sm">{data.unpaid_invoices.map(i => <li key={i.id} className="flex flex-wrap justify-between gap-2 py-2"><span>{i.email || 'Customer'} · {usd(i.amount_due)}</span><span className="text-muted-foreground">{i.attempts} attempt{i.attempts === 1 ? '' : 's'}{i.next_attempt ? ` · retry ${day(i.next_attempt)}` : ''}</span></li>)}</ul></div>}
        </section>}
        <section aria-labelledby="so-charges"><h3 id="so-charges" className="text-lg">Recent payments</h3>{!data.charges.length ? <p className="mt-2 text-sm text-muted-foreground">No payments yet.</p> : <div className="mt-2 overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead><tr className="border-b border-border text-left text-muted-foreground"><th className="py-2">Date</th><th>Customer</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead><tbody>{data.charges.map(c => <tr key={c.id} className="border-b border-border"><td className="py-2">{day(c.created)}</td><td>{c.email || '—'}</td><td>{c.description || '—'}</td><td>{usd(c.amount)}{c.amount_refunded ? <span className="block text-xs text-muted-foreground">{usd(c.amount_refunded)} refunded</span> : null}</td><td className={c.status === 'failed' || c.disputed ? 'text-destructive' : ''}>{c.disputed ? 'disputed' : c.refunded ? 'refunded' : c.status}</td></tr>)}</tbody></table></div>}</section>
        <p className="flex items-center gap-1 text-xs text-muted-foreground"><ExternalLink aria-hidden className="h-3 w-3" />Updated {new Date(data.generated_at).toLocaleTimeString()} · {data.environment === 'live' ? 'live payments' : 'test payments'}. Monthly revenue counts yearly plans as one twelfth per month and leaves out failed payments.</p>
      </>}
    </div>
  );
}
