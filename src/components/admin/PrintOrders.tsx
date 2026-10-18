import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

type Order = { id: string; edition: string; status: string; cover_style: string; manuscript_pages: number | null; payment_total_cents: number | null; extra_sections: unknown; shipping_address: Record<string, string> | null; created_at: string; tracking_number: string };

/** Admin view of every printed AstroBook order with a ready-to-send print brief for Pixartprinting. */
export function PrintOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  useEffect(() => { void supabase.from('book_orders').select('id,edition,status,cover_style,manuscript_pages,payment_total_cents,extra_sections,shipping_address,created_at,tracking_number').order('created_at', { ascending: false }).limit(100).then(({ data }) => setOrders((data ?? []) as Order[])); }, []);
  if (!orders) return <div role="status" className="h-24 animate-pulse rounded bg-muted" />;
  const counts = orders.reduce<Record<string, number>>((m, o) => { m[o.status] = (m[o.status] ?? 0) + 1; return m; }, {});
  const brief = (o: Order) => {
    const a = o.shipping_address ?? {};
    return [`Zodaci AstroBook order ${o.id.slice(0, 8)}`, `Product: Art book, 6x9 in, softcover perfect binding`, `Edition: ${o.edition} · pages: ${o.manuscript_pages ?? 'pending'}`, `Cover: ${o.cover_style}`, `Interior: full colour`, `Quantity: 1`, `Ship to: ${[a.name, a.line1, a.line2, a.city, a.state, a.postal_code, a.country].filter(Boolean).join(', ')}`].join('\n');
  };
  const copy = async (o: Order) => { await navigator.clipboard.writeText(brief(o)); toast.success('Print brief copied — paste it into your Pixartprinting order or quote request'); };
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">{Object.entries(counts).map(([s, n]) => <span key={s} className="rounded-full border border-border px-3 py-1 text-sm">{s.replace(/_/g, ' ')}: {n}</span>)}{!orders.length && <p className="text-muted-foreground">No book orders yet.</p>}</div>
      <p className="text-sm text-muted-foreground">Pixartprinting does not offer automatic order sending, so each paid order has a print brief to copy into their site. Update status and tracking in <Link to="/orders?all=1" className="underline">order management</Link>.</p>
      <div className="overflow-x-auto rounded-lg border border-border"><table className="w-full min-w-[640px] text-sm">
        <thead><tr className="border-b border-border text-left"><th className="p-3">Date</th><th className="p-3">Edition</th><th className="p-3">Pages</th><th className="p-3">Paid</th><th className="p-3">Status</th><th className="p-3">Tracking</th><th className="p-3" /></tr></thead>
        <tbody>{orders.map(o => <tr key={o.id} className="border-b border-border last:border-0"><td className="p-3">{new Date(o.created_at).toLocaleDateString()}</td><td className="p-3">{o.edition}</td><td className="p-3">{o.manuscript_pages ?? '—'}</td><td className="p-3">{o.payment_total_cents != null ? `$${(o.payment_total_cents / 100).toFixed(2)}` : '—'}</td><td className="p-3">{o.status.replace(/_/g, ' ')}</td><td className="p-3">{o.tracking_number || '—'}</td><td className="p-3"><Button size="sm" variant="outline" onClick={() => copy(o)}>Copy print brief</Button></td></tr>)}</tbody>
      </table></div>
    </section>
  );
}
