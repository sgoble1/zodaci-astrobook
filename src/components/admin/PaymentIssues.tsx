import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

type Issue = { event_id: string; event_type: string; environment: string; object_id: string; status: string; attempts: number; last_error: string; received_at: string };

/** Payment events the site received but could not finish (the provider keeps retrying them). Read-only; fix in the provider dashboard if retries stop. */
export function PaymentIssues({ environment }: { environment: 'sandbox' | 'live' }) {
  const [rows, setRows] = useState<Issue[] | null>(null);
  const [err, setErr] = useState('');
  const load = useCallback(async () => {
    setErr('');
    const { data, error } = await supabase.rpc('admin_payment_issues');
    if (error) { setErr('Could not load unfinished payment events.'); return; }
    setRows(((data ?? []) as Issue[]).filter(r => r.environment === environment));
  }, [environment]);
  useEffect(() => { void load(); }, [load]);
  if (err) return <p role="alert" className="text-sm text-destructive">{err} <Button variant="link" className="h-auto p-0" onClick={() => void load()}>Retry</Button></p>;
  if (!rows) return null;
  return (
    <section aria-labelledby="pi-head">
      <h3 id="pi-head" className="text-lg">Unfinished payment events</h3>
      {!rows.length ? <p className="mt-2 text-sm text-muted-foreground">Every payment event was handled.</p> : <>
        <p className="mt-2 flex items-center gap-2 text-sm text-destructive"><AlertTriangle className="h-4 w-4" aria-hidden />These were received but not finished. The provider retries them; check the order or membership if one stays here.</p>
        <ul className="mt-2 divide-y divide-border text-sm">{rows.map(r => <li key={r.event_id} className="py-2"><p>{r.event_type} · {r.status} · {r.attempts} {r.attempts === 1 ? 'try' : 'tries'} · {new Date(r.received_at).toLocaleString()}</p>{r.last_error && <p className="text-xs text-muted-foreground break-all">{r.last_error}</p>}<p className="text-xs text-muted-foreground break-all">{r.object_id}</p></li>)}</ul>
      </>}
    </section>
  );
}
