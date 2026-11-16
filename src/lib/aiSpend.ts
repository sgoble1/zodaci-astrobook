/** AI spending summary from ai_usage rows (one row = one credit use). Rows record feature and time only, so this reports uses, not dollars. */
export type UsageRow = { feature: string; created_at: string; user_id: string };
export type SpendSummary = { total: number; byFeature: [string, number][]; byDay: [string, number][]; members: number; projected: number; previous: number };

export function summarizeSpend(rows: UsageRow[], now: Date): SpendSummary {
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
  const prevStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1);
  const days = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
  const feat = new Map<string, number>(); const day = new Map<string, number>(); const who = new Set<string>();
  let total = 0, previous = 0;
  for (const r of rows) {
    const t = Date.parse(r.created_at);
    if (t >= start) { total++; who.add(r.user_id); feat.set(r.feature, (feat.get(r.feature) ?? 0) + 1); const d = r.created_at.slice(0, 10); day.set(d, (day.get(d) ?? 0) + 1); }
    else if (t >= prevStart) previous++;
  }
  const elapsed = Math.max(1, (now.getTime() - start) / 86400000);
  return {
    total, previous, members: who.size,
    projected: Math.round((total / elapsed) * days),
    byFeature: [...feat].sort((a, b) => b[1] - a[1]),
    byDay: [...day].sort((a, b) => a[0].localeCompare(b[0])),
  };
}
