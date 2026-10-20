import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { STAGE_DETAIL, STAGE_LABEL, isPaidStage, stagesFor, statusLabel, type OrderStatus } from '@/lib/bookFulfillment';

type Event = { id: string; status: string; previous_status: string | null; actor: string; note: string; created_at: string };

/** Progress line and stage history for one AstroBook order. History is readable by the order owner and admins only. */
export function OrderTimeline({ orderId, status, format, updatedAt, showActor = false }: { orderId: string; status: string; format: string; updatedAt: string; showActor?: boolean }) {
  const [events, setEvents] = useState<Event[] | null>(null);
  useEffect(() => {
    let alive = true;
    void supabase.from('book_order_events').select('id,status,previous_status,actor,note,created_at').eq('order_id', orderId).order('created_at').then(({ data }) => { if (alive) setEvents((data ?? []) as Event[]); });
    return () => { alive = false; };
  }, [orderId, updatedAt]);
  if (!isPaidStage(status)) return null;
  const stages = stagesFor(format);
  const at = stages.indexOf(status as never);
  const when = (s: string) => events?.filter(e => e.status === s).at(-1)?.created_at;
  return (
    <div className="space-y-3">
      <ol aria-label="Order progress" className="grid gap-2 sm:grid-flow-col sm:auto-cols-fr">
        {stages.map((s, i) => { const done = i <= at; const t = when(s); return (
          <li key={s} aria-current={i === at ? 'step' : undefined} className={`rounded-md border px-3 py-2 text-xs transition-colors duration-700 ${i === at ? 'border-primary bg-primary/10' : done ? 'border-border bg-muted/40' : 'border-dashed border-border text-muted-foreground'}`}>
            <span className="flex items-center gap-1.5 font-medium">{done && <Check aria-hidden className="h-3.5 w-3.5 text-gold" />}{STAGE_LABEL[s]}</span>
            {t && <span className="mt-0.5 block text-muted-foreground">{new Date(t).toLocaleDateString()}</span>}
          </li>
        ); })}
      </ol>
      <p className="text-sm text-muted-foreground">{STAGE_DETAIL[status as OrderStatus]}</p>
      {showActor && !!events?.length && (
        <details className="text-xs"><summary className="cursor-pointer text-muted-foreground">Stage history ({events.length})</summary>
          <ul className="mt-2 space-y-1">{events.map(e => <li key={e.id}>{new Date(e.created_at).toLocaleString()} · {e.previous_status ? `${statusLabel(e.previous_status)} → ` : ''}{statusLabel(e.status)} · {e.actor}{e.note ? ` · ${e.note}` : ''}</li>)}</ul>
        </details>
      )}
    </div>
  );
}
