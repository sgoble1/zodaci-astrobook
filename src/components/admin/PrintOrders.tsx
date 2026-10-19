import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BOOK_COSTING, BOOK_PRICES, money } from '@/lib/books';

type Order = { id: string; edition: string; status: string; payment_hold: string | null; cover_style: string; manuscript_pages: number | null; payment_total_cents: number | null; extra_sections: unknown; shipping_address: Record<string, string> | null; created_at: string; tracking_number: string };
type Cost = { edition: 'standard' | 'expanded'; print_cents: number; delivery_cents: number; fees_cents: number; quote_source: string; updated_at?: string };

const fallback = (): Record<string, Cost> => ({
  standard: { edition: 'standard', print_cents: BOOK_COSTING[0].print, delivery_cents: BOOK_COSTING[0].shipping, fees_cents: BOOK_COSTING[0].fees, quote_source: 'estimate' },
  expanded: { edition: 'expanded', print_cents: BOOK_COSTING[1].print, delivery_cents: BOOK_COSTING[1].shipping, fees_cents: BOOK_COSTING[1].fees, quote_source: 'estimate' },
});
const totalCost = (c: Cost) => c.print_cents + c.delivery_cents + c.fees_cents;
const toCents = (v: string) => Math.max(0, Math.round(Number(v || 0) * 100));

/** Admin view of printed AstroBook orders with editable real print, delivery and fee costs. */
export function PrintOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [costs, setCosts] = useState<Record<string, Cost>>(fallback);
  const [draft, setDraft] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void supabase.from('book_orders').select('id,edition,status,payment_hold,cover_style,manuscript_pages,payment_total_cents,extra_sections,shipping_address,created_at,tracking_number').eq('format', 'print').eq('environment', 'live').order('created_at', { ascending: false }).limit(100).then(({ data }) => setOrders((data ?? []) as Order[]));
    void supabase.from('book_costing').select('*').then(({ data }) => {
      if (!data?.length) return;
      const next = fallback();
      for (const row of data as Cost[]) next[row.edition] = row;
      setCosts(next);
    });
  }, []);

  const field = (ed: string, key: keyof Cost) => draft[ed]?.[key] ?? (typeof costs[ed][key] === 'number' ? ((costs[ed][key] as number) / 100).toFixed(2) : String(costs[ed][key]));
  const setField = (ed: string, key: string, v: string) => setDraft(d => ({ ...d, [ed]: { ...d[ed], [key]: v } }));

  const save = async () => {
    setSaving(true);
    const rows = (['standard', 'expanded'] as const).map(ed => ({ edition: ed, print_cents: toCents(field(ed, 'print_cents')), delivery_cents: toCents(field(ed, 'delivery_cents')), fees_cents: toCents(field(ed, 'fees_cents')), quote_source: field(ed, 'quote_source').slice(0, 200) || 'estimate', updated_at: new Date().toISOString() }));
    const { error } = await supabase.from('book_costing').upsert(rows);
    setSaving(false);
    if (error) { toast.error("Couldn't save costs — please try again"); return; }
    setCosts({ standard: rows[0], expanded: rows[1] }); setDraft({});
    toast.success('Print costs saved — margins updated');
  };

  if (!orders) return <div role="status" className="h-24 animate-pulse rounded bg-muted" />;
  const counts = orders.reduce<Record<string, number>>((m, o) => { m[o.status] = (m[o.status] ?? 0) + 1; return m; }, {});
  const brief = (o: Order) => {
    const a = o.shipping_address ?? {};
    return [`Zodaci AstroBook order ${o.id.slice(0, 8)}`, `Product: Art book, 6x9 in, softcover perfect binding`, `Edition: ${o.edition} · pages: ${o.manuscript_pages ?? 'pending'}`, `Cover: ${o.cover_style}`, `Interior: full colour`, `Quantity: 1`, `Ship to: ${[a.name, a.line1, a.line2, a.city, a.state, a.postal_code, a.country].filter(Boolean).join(', ')}`].join('\n');
  };
  const copy = async (o: Order) => { await navigator.clipboard.writeText(brief(o)); toast.success('Print brief copied — paste it into your Pixartprinting order or quote request'); };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-border p-4 space-y-3">
        <div><h3 className="font-display text-xl">Print costs & margin</h3><p className="text-sm text-muted-foreground">Enter your real printer quote and delivery cost per copy. Margins below and on every order use these numbers.</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm">
          <thead><tr className="text-left border-b border-border"><th className="p-2">Edition</th><th className="p-2">Price</th><th className="p-2">Print ($)</th><th className="p-2">Delivery ($)</th><th className="p-2">Payment fees ($)</th><th className="p-2">Quote source</th><th className="p-2">Total cost</th><th className="p-2">Margin</th></tr></thead>
          <tbody>{(['standard', 'expanded'] as const).map(ed => {
            const price = BOOK_PRICES[ed];
            const live: Cost = { edition: ed, print_cents: toCents(field(ed, 'print_cents')), delivery_cents: toCents(field(ed, 'delivery_cents')), fees_cents: toCents(field(ed, 'fees_cents')), quote_source: '' };
            const cost = totalCost(live); const margin = price - cost;
            return <tr key={ed} className="border-b border-border last:border-0">
              <td className="p-2 capitalize">{ed}</td><td className="p-2">{money(price)}</td>
              {(['print_cents', 'delivery_cents', 'fees_cents'] as const).map(k => <td key={k} className="p-2"><Input aria-label={`${ed} ${k.replace('_cents', '')} cost`} type="number" min={0} step="0.01" className="w-24" value={field(ed, k)} onChange={e => setField(ed, k, e.target.value)} /></td>)}
              <td className="p-2"><Input aria-label={`${ed} quote source`} className="w-40" value={field(ed, 'quote_source')} onChange={e => setField(ed, 'quote_source', e.target.value)} /></td>
              <td className="p-2">{money(cost)}</td>
              <td className={`p-2 font-medium ${margin < 0 ? 'text-destructive' : ''}`}>{money(margin)} ({price ? Math.round((margin / price) * 100) : 0}%)</td>
            </tr>;
          })}</tbody>
        </table></div>
        <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save costs'}</Button>
      </div>

      <div className="flex flex-wrap gap-2">{Object.entries(counts).map(([s, n]) => <span key={s} className="rounded-full border border-border px-3 py-1 text-sm">{s.replace(/_/g, ' ')}: {n}</span>)}{!orders.length && <p className="text-muted-foreground">No book orders yet.</p>}</div>
      <p className="text-sm text-muted-foreground">Pixartprinting does not offer automatic order sending, so each paid order has a print brief to copy into their site. Update status and tracking in <Link to="/orders?all=1" className="underline">order management</Link>.</p>
      <div className="overflow-x-auto rounded-lg border border-border"><table className="w-full min-w-[640px] text-sm">
        <thead><tr className="border-b border-border text-left"><th className="p-3">Date</th><th className="p-3">Edition</th><th className="p-3">Pages</th><th className="p-3">Paid</th><th className="p-3">Print + delivery + fees</th><th className="p-3">Margin</th><th className="p-3">Status</th><th className="p-3">Tracking</th><th className="p-3" /></tr></thead>
        <tbody>{orders.map(o => { const c = costs[o.edition === 'expanded' ? 'expanded' : 'standard']; const cost = totalCost(c); const paid = o.payment_total_cents; return <tr key={o.id} className="border-b border-border last:border-0"><td className="p-3">{new Date(o.created_at).toLocaleDateString()}</td><td className="p-3">{o.edition}</td><td className="p-3">{o.manuscript_pages ?? '—'}</td><td className="p-3">{paid != null ? money(paid) : '—'}</td><td className="p-3">{money(cost)}</td><td className="p-3">{paid != null ? money(paid - cost) : '—'}</td><td className="p-3">{o.payment_hold || o.status.replace(/_/g, ' ')}</td><td className="p-3">{o.tracking_number || '—'}</td><td className="p-3"><Button size="sm" variant="outline" disabled={!!o.payment_hold || !o.payment_total_cents || !['paid','printing','shipped','delivered'].includes(o.status)} onClick={() => copy(o)}>Copy print brief</Button></td></tr>; })}</tbody>
      </table></div>
    </section>
  );
}
