import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useSession, useIsAdmin } from '@/hooks/useLibrary';
import { shippingError, trackingUrl } from '@/lib/tracking';
import { OrderPdfDownload } from '@/components/books/OrderPdfDownload';
import { statusLabel } from '@/lib/bookFulfillment';
import type { Tables } from '@/integrations/supabase/types';

/** Admin dispatch desk: paid books waiting to ship. Saving marks the order shipped so the customer's tracking updates. */
export default function Dispatch() {
  const session = useSession(); const admin = useIsAdmin(session);
  const [orders, setOrders] = useState<Tables<'book_orders'>[]>([]);
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('book_orders').select('*').in('status', ['paid', 'print_brief_sent', 'printing', 'quality_check', 'shipped']).not('payment_total_cents', 'is', null).eq('format', 'print').eq('environment', 'live').is('payment_hold', null).order('created_at');
    if (error) setErr('Orders could not load.'); else setOrders(data ?? []);
  }, []);
  useEffect(() => { if (admin) void load(); }, [admin, load]);
  if (!admin) return <p className="text-muted-foreground">Dispatch is for admins only.</p>;
  const today = new Date().toISOString().slice(0, 10);
  const dispatch = async (o: Tables<'book_orders'>, form: FormData) => {
    setErr(''); setMsg('');
    const carrier = String(form.get('carrier')); const tracking = String(form.get('tracking')).trim(); const date = String(form.get('date'));
    const bad = shippingError(o.status, 'shipped', carrier, tracking) || (!date ? 'Add the dispatch date.' : date > today ? 'Dispatch date can’t be in the future.' : '');
    if (bad) { setErr(bad); return; }
    const { data: changed, error } = await supabase.from('book_orders').update({ status: 'shipped', carrier, tracking_number: tracking, shipped_at: date, updated_at: new Date().toISOString() }).eq('id', o.id).eq('status', o.status).eq('environment', 'live').is('payment_hold', null).select('id');
    if (error) setErr(error.message); else if (!changed?.length) setErr('This order changed. Reload before dispatching.'); else { setMsg(`Order ${o.id.slice(0, 8)} marked shipped — the customer now sees tracking on their orders page.`); void load(); }
  };
  const waiting = orders.filter(o => o.status !== 'shipped'); const sent = orders.filter(o => o.status === 'shipped');
  return (
    <article className="space-y-8">
      <header><p className="text-gold font-smallcaps text-xs">Printed AstroBook</p><h1 className="text-4xl mt-2">Dispatch</h1><p className="text-muted-foreground mt-3">Enter the carrier, tracking number and dispatch date for each printed book.</p><Link to="/orders" className="text-sm underline">All orders</Link></header>
      {msg && <p role="status" className="text-gold">{msg}</p>}{err && <p role="alert" className="text-destructive">{err}</p>}
      <section className="space-y-4"><h2 className="text-2xl">Waiting to ship ({waiting.length})</h2>
        {!waiting.length && <p className="text-muted-foreground">No paid books waiting.</p>}
        {waiting.map(o => { const a = o.shipping_address as Record<string, string>; return (
          <form key={o.id} onSubmit={e => { e.preventDefault(); void dispatch(o, new FormData(e.currentTarget)); }} className="parchment p-4 space-y-3">
            <div className="flex flex-wrap justify-between gap-2"><p className="font-medium capitalize">{o.edition} AstroBook · {o.id.slice(0, 8)} · <span className="text-gold">{statusLabel(o.status)}</span></p><OrderPdfDownload orderId={o.id} /></div>
            <p className="text-sm text-muted-foreground">{a.name} · {[a.line1, a.line2, a.city, a.state, a.postal_code].filter(Boolean).join(', ')}</p>
            <div className="grid gap-3 sm:grid-cols-4">
              <div><Label htmlFor={`c-${o.id}`}>Carrier</Label><select id={`c-${o.id}`} name="carrier" defaultValue={o.carrier} className="w-full bg-input border border-border rounded h-10 px-3"><option value="">Choose</option>{['USPS', 'UPS', 'FedEx'].map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="sm:col-span-2"><Label htmlFor={`t-${o.id}`}>Tracking number</Label><Input id={`t-${o.id}`} name="tracking" defaultValue={o.tracking_number} maxLength={120} /></div>
              <div><Label htmlFor={`d-${o.id}`}>Dispatch date</Label><Input id={`d-${o.id}`} name="date" type="date" max={today} defaultValue={today} /></div>
            </div>
            <Button type="submit">Mark shipped</Button>
          </form>); })}
      </section>
      <section className="space-y-2"><h2 className="text-2xl">Shipped ({sent.length})</h2>
        {sent.map(o => { const u = trackingUrl(o.carrier, o.tracking_number); return <p key={o.id} className="text-sm">{o.id.slice(0, 8)} · {o.carrier} {u ? <a href={u} target="_blank" rel="noopener noreferrer" className="underline">{o.tracking_number}</a> : o.tracking_number} · sent {o.shipped_at ?? '—'}</p>; })}
      </section>
    </article>
  );
}
