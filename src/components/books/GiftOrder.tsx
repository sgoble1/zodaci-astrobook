import { useEffect, useState } from 'react';
import { Gift, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { functionErrorMessage } from '@/lib/functionError';
import { editionName, type BookFormat } from '@/lib/books';
import { statusLabel } from '@/lib/bookFulfillment';
import { OrderPdfDownload } from '@/components/books/OrderPdfDownload';
import type { Tables } from '@/integrations/supabase/types';

/** Gift details on the buyer's order, with the one-time "send gift notice" action once payment is confirmed. */
export function GiftDetails({ order, canNotify, onSent }: { order: Tables<'book_orders'>; canNotify: boolean; onSent: () => void }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [sentAt, setSentAt] = useState(order.recipient_notified_at);
  if (!order.gift) return null;
  const send = async () => {
    setBusy(true); setError('');
    try {
      const { data, error: failure } = await supabase.functions.invoke('book-gift-notice', { body: { orderId: order.id } });
      if (failure || !data?.ok) throw new Error(await functionErrorMessage(failure, data, 'The notice could not be sent. Please try again later.'));
      setSentAt(data.sentAt ?? new Date().toISOString()); onSent();
    } catch (e) { setError(e instanceof Error ? e.message : 'The notice could not be sent.'); } finally { setBusy(false); }
  };
  return <div className="space-y-2 rounded border border-border p-3 text-sm">
    <p className="flex items-center gap-2"><Gift className="h-4 w-4 text-gold" aria-hidden />{order.recipient_name ? `Gift for ${order.recipient_name}, written from their birth details` : 'Gift order'}</p>
    {order.gift_message && <p className="text-muted-foreground">Note: “{order.gift_message}”</p>}
    {order.recipient_email && (sentAt
      ? <p className="text-muted-foreground">Gift notice sent to {order.recipient_email} on {new Date(sentAt).toLocaleDateString()}.</p>
      : canNotify
        ? <div className="flex flex-wrap items-center gap-3"><Button size="sm" variant="outline" disabled={busy} onClick={() => void send()}><Mail />{busy ? 'Sending…' : `Send gift notice to ${order.recipient_email}`}</Button><span className="text-xs text-muted-foreground">Send it whenever you like; it goes once.</span></div>
        : <p className="text-muted-foreground">You can send the gift notice to {order.recipient_email} once payment is confirmed.</p>)}
    {error && <p role="alert" className="text-destructive">{error}</p>}
  </div>;
}

type Received = { id: string; edition: string; format: string; status: string; gift_message: string; recipient_name: string; sender_name: string; pdf_ready: boolean; created_at: string };

/** Gifts addressed to the signed-in member's verified email (paid only). Digital gifts download here. */
export function ReceivedGifts({ userId }: { userId: string }) {
  const [items, setItems] = useState<Received[] | null>(null); const [error, setError] = useState(false); const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true; setError(false);
    void supabase.rpc('my_received_gifts').then(({ data, error: failure }) => { if (!active) return; if (failure) { setError(true); setItems([]); } else setItems((data ?? []) as Received[]); });
    return () => { active = false; };
  }, [userId, retry]);
  if (items === null) return <Skeleton className="h-16 w-full" />;
  if (error) return <p role="alert" className="text-sm text-destructive">Gifts sent to you could not be checked. <button type="button" className="underline" onClick={() => setRetry(n => n + 1)}>Retry</button></p>;
  if (!items.length) return null;
  return <section id="gifts" aria-labelledby="gifts-title" className="scroll-mt-6 space-y-4 rounded-lg border border-gold/40 p-5">
    <h2 id="gifts-title" className="flex items-center gap-2 text-2xl"><Gift className="h-5 w-5 text-gold" aria-hidden />Gifts for you</h2>
    {items.map(g => <div key={g.id} className="space-y-2 border-t border-border pt-3 first:border-0 first:pt-0">
      <p>From {g.sender_name}: AstroBook {editionName(g.edition, g.format as BookFormat)}, written from your birth details.</p>
      {g.gift_message && <p className="text-sm text-muted-foreground">“{g.gift_message}”</p>}
      {g.format === 'digital' ? (g.pdf_ready ? <OrderPdfDownload orderId={g.id} /> : <p className="text-sm text-muted-foreground">Your PDF is being prepared. Check back shortly.</p>) : <p className="text-sm text-muted-foreground">Printed copy · {statusLabel(g.status)}</p>}
    </div>)}
  </section>;
}
