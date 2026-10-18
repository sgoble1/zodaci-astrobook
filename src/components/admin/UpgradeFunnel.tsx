import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type F = { free_members: number; upgrade_clickers: number; pricing_visitors: number; paid_converts: number };

/** Admin-only funnel: free members → clicked Upgrade → viewed Pricing → paid (live payments only). */
export function UpgradeFunnel() {
  const [days, setDays] = useState(30);
  const [f, setF] = useState<F | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => { setErr(''); void supabase.rpc('admin_upgrade_funnel', { _days: days }).then(({ data, error }) => { if (error) setErr('Funnel could not load.'); else setF((data as F[])?.[0] ?? null); }); }, [days]);
  const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : '—');
  const steps: [string, number, string][] = f ? [
    ['Free members', f.free_members, 'Not paying before this period'],
    ['Clicked Upgrade', f.upgrade_clickers, `${pct(f.upgrade_clickers, f.free_members)} of free members`],
    ['Viewed Pricing', f.pricing_visitors, `${pct(f.pricing_visitors, f.free_members)} of free members`],
    ['Completed payment', f.paid_converts, `${pct(f.paid_converts, f.upgrade_clickers)} of upgrade clickers`],
  ] : [];
  const max = Math.max(1, f?.free_members ?? 1);
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-2xl">Upgrade funnel</h2>
        <select value={days} onChange={e => setDays(Number(e.target.value))} className="bg-input border border-border rounded h-9 px-2 text-sm" aria-label="Funnel time range">
          {[7, 30, 90, 365].map(d => <option key={d} value={d}>Last {d} days</option>)}
        </select>
      </div>
      {err && <p role="alert" className="text-destructive text-sm">{err}</p>}
      <div className="space-y-2">
        {steps.map(([l, v, d]) => <div key={l} className="parchment p-3">
          <div className="flex items-baseline justify-between gap-3"><p className="text-sm">{l}</p><p className="font-display text-2xl">{v}</p></div>
          <div className="mt-2 h-2 rounded bg-muted"><div className="h-2 rounded bg-primary" style={{ width: `${Math.max(2, (v / max) * 100)}%` }} /></div>
          <p className="mt-1 text-xs text-muted-foreground">{d}</p>
        </div>)}
      </div>
      <p className="text-xs text-muted-foreground">Admins and the private shared accounts are excluded; test payments aren’t counted.</p>
    </section>
  );
}
