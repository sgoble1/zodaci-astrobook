import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

type Row = { user_id: string; display_name: string; feature: string; uses: number; credits: number };

/** Admin-only: this month's AI credit use by member and feature. */
export function CreditLedger() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState('');
  const load = async () => {
    setErr(''); setRows(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('admin_credit_usage');
    if (error) setErr('Could not load credit use.'); else setRows(data ?? []);
  };
  useEffect(() => { void load(); }, []);
  if (err) return <p role="alert">{err} <Button variant="outline" size="sm" onClick={load}>Retry</Button></p>;
  if (!rows) return <p role="status">Loading credit use…</p>;
  const total = rows.reduce((s, r) => s + Number(r.credits), 0);
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl">AI credit use this month</h2>
      <p className="text-sm text-muted-foreground">{total} credits across {new Set(rows.map(r => r.user_id)).size} members. Readings use their own daily limits and aren't counted here.</p>
      {rows.length === 0 ? <p>No AI use yet this month.</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-muted-foreground"><th className="py-2">Member</th><th>Feature</th><th>Uses</th><th>Credits</th></tr></thead>
        <tbody>{rows.map(r => <tr key={r.user_id + r.feature} className="border-t border-border"><td className="py-2">{r.display_name || r.user_id.slice(0, 8)}</td><td>{r.feature}</td><td>{r.uses}</td><td>{r.credits}</td></tr>)}</tbody></table></div>}
    </section>
  );
}
