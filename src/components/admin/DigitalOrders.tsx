import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileDown, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { STAGE_LABEL, isPaidStage, type OrderStatus } from '@/lib/bookFulfillment';
import { editionName } from '@/lib/books';

type Row = { id: string; edition: string; status: string; environment: string; payment_total_cents: number | null; payment_hold: string | null; pdf_ready_at: string | null; created_at: string };
type Filter = 'attention' | 'paid' | 'all';

/** Paid without a delivered PDF yet, or held for payment review: the digital orders an admin may need to act on. */
export const needsAttention = (o: Pick<Row, 'status' | 'payment_hold' | 'pdf_ready_at'>) => !!o.payment_hold || (isPaidStage(o.status) && !o.pdf_ready_at);

/** Digital AstroBook orders: delivered automatically after payment, listed here so support can check or re-prepare a PDF. */
export function DigitalOrders() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('attention');
  const [showTest, setShowTest] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setError('');
    const r = await supabase.from('book_orders').select('id,edition,status,environment,payment_total_cents,payment_hold,pdf_ready_at,created_at')
      .eq('format', 'digital').in('environment', showTest ? ['live', 'sandbox'] : ['live']).order('created_at', { ascending: false }).limit(200);
    if (r.error) { setError('Digital orders could not be loaded.'); setRows([]); return; }
    setRows((r.data ?? []) as Row[]);
  }, [showTest]);
  useEffect(() => { setRows(null); void load(); }, [load]);

  const shown = useMemo(() => (rows ?? []).filter(o => filter === 'all' || (filter === 'paid' ? isPaidStage(o.status) : needsAttention(o))), [rows, filter]);
  const attention = (rows ?? []).filter(needsAttention).length;

  // The same server function members use; it authorizes admins, refuses unpaid or held orders, and finalizes the frozen PDF.
  const openPdf = async (o: Row) => {
    setBusy(o.id); setNotes(n => ({ ...n, [o.id]: '' }));
    // Opened before the request so pop-up blockers allow it; the opener link is cut before navigating.
    const tab = window.open('', '_blank'); if (tab) tab.opener = null;
    try {
      const { data, error: failure } = await supabase.functions.invoke('book-order-pdf', { body: { orderId: o.id } });
      if (failure || typeof data?.url !== 'string') {
        let message = 'The PDF could not be prepared.';
        try { const body = await (failure as { context?: Response })?.context?.json?.(); if (body?.error) message = body.error; } catch { /* keep default */ }
        tab?.close(); setNotes(n => ({ ...n, [o.id]: message })); return;
      }
      if (tab) tab.location.href = data.url; else window.location.assign(data.url);
      void load();
    } finally { setBusy(null); }
  };

  return (
    <section aria-labelledby="digital-orders" className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h3 id="digital-orders" className="font-display text-xl">Digital orders</h3><p className="text-sm text-muted-foreground">PDF editions are delivered automatically once payment is verified. {attention ? `${attention} need${attention === 1 ? 's' : ''} a look.` : 'None need attention.'}</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Show" className="flex gap-1">{([['attention', 'Needs attention'], ['paid', 'Paid'], ['all', 'All']] as [Filter, string][]).map(([id, label]) => <Button key={id} size="sm" variant={filter === id ? 'default' : 'outline'} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</Button>)}</div>
          <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={showTest} onChange={e => setShowTest(e.target.checked)} />Include test orders</label>
          <Button size="sm" variant="ghost" aria-label="Refresh digital orders" onClick={() => void load()}><RefreshCw className="h-4 w-4" aria-hidden /></Button>
        </div>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {rows === null ? <div role="status" aria-label="Loading digital orders" className="h-20 animate-pulse rounded bg-muted" />
        : shown.length === 0 ? <p className="text-sm text-muted-foreground">{filter === 'attention' ? 'Every paid digital order has its PDF.' : 'No digital orders yet.'}</p>
        : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-xs text-muted-foreground"><th className="p-2">Order</th><th className="p-2">Edition</th><th className="p-2">Status</th><th className="p-2">Paid</th><th className="p-2">PDF</th><th className="p-2"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{shown.map(o => (
            <tr key={o.id} className="border-t border-border align-top">
              <td className="p-2"><span className="font-mono text-xs">{o.id.slice(0, 8)}</span><br /><span className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}{o.environment !== 'live' ? ' · test' : ''}</span></td>
              <td className="p-2">{editionName(o.edition, 'digital')}</td>
              <td className="p-2">{STAGE_LABEL[o.status as OrderStatus] ?? o.status.replace(/_/g, ' ')}{o.payment_hold && <span className="block text-xs text-destructive">Payment review: {o.payment_hold}</span>}</td>
              <td className="p-2">{o.payment_total_cents != null ? `$${(o.payment_total_cents / 100).toFixed(2)}` : '—'}</td>
              <td className="p-2">{o.pdf_ready_at ? new Date(o.pdf_ready_at).toLocaleString() : isPaidStage(o.status) ? <span className="text-destructive">Not prepared yet</span> : 'After payment'}</td>
              <td className="p-2">{isPaidStage(o.status) && !o.payment_hold && <Button size="sm" variant="outline" disabled={busy === o.id} onClick={() => void openPdf(o)}><FileDown className="h-4 w-4" aria-hidden />{o.pdf_ready_at ? 'Open PDF' : 'Prepare PDF'}</Button>}{notes[o.id] && <p role="alert" className="mt-1 max-w-[16rem] text-xs text-destructive">{notes[o.id]}</p>}</td>
            </tr>))}</tbody></table></div>}
    </section>
  );
}
