import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { summarizeSpend, type UsageRow } from '@/lib/aiSpend';

/** Admin AI spending: credit uses this month by feature and day, with a month-end projection at the current pace. */
export function AiSpending() {
  const [rows, setRows] = useState<UsageRow[] | null>(null);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    setError(false); setRows(null);
    const n = new Date(); const since = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() - 1, 1)).toISOString();
    const all: UsageRow[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await supabase.from('ai_usage').select('feature, created_at, user_id').gte('created_at', since).order('created_at').range(from, from + 999);
      if (error) { setError(true); return; }
      all.push(...(data ?? []));
      if (!data || data.length < 1000) break;
    }
    setRows(all);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const s = useMemo(() => rows && summarizeSpend(rows, new Date()), [rows]);
  if (error) return <div role="alert" className="space-y-2"><p className="text-sm text-destructive">AI usage couldn’t be loaded.</p><Button size="sm" variant="outline" onClick={() => void load()}>Try again</Button></div>;
  if (!s) return <p role="status" className="text-sm text-muted-foreground">Loading AI usage…</p>;
  const peak = Math.max(1, ...s.byDay.map(d => d[1]));
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl">AI spending</h2><p className="text-sm text-muted-foreground">Each count is one credit use by a member (readings, podcasts, art and so on). Usage records don’t store tokens or dollar costs, so this shows uses, not money.</p></div>
      <section aria-label="This month" className="grid gap-3 sm:grid-cols-4">{[['Uses this month', s.total], ['Projected by month end', s.projected], ['Last month', s.previous], ['Members using AI', s.members]].map(([k, v]) => <div key={k} className="parchment p-4"><p className="text-xs text-muted-foreground">{k}</p><p className="mt-1 font-display text-3xl">{v}</p></div>)}</section>
      <section aria-labelledby="ai-feat"><h3 id="ai-feat" className="text-lg">By feature</h3>{!s.byFeature.length ? <p className="mt-2 text-sm text-muted-foreground">No AI use yet this month.</p> : <table className="mt-2 w-full text-sm"><tbody>{s.byFeature.map(([f, c]) => <tr key={f} className="border-b border-border"><td className="py-2">{f}</td><td className="text-right">{c}</td></tr>)}</tbody></table>}</section>
      {s.byDay.length > 0 && <section aria-labelledby="ai-day"><h3 id="ai-day" className="text-lg">By day</h3><ul className="mt-2 space-y-1">{s.byDay.map(([d, c]) => <li key={d} className="flex items-center gap-3 text-sm"><span className="w-24 shrink-0 font-mono">{d.slice(5)}</span><span className="h-3 bg-primary" style={{ width: `${(c / peak) * 100}%` }} aria-hidden /><span>{c}</span></li>)}</ul></section>}
    </div>
  );
}
