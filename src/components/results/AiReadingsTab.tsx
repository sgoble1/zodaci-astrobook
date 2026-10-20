import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CreditBalance } from '@/components/common/CreditBalance';
import { ALL_READINGS, FREE_READINGS } from '@/lib/topicReadings';
import { Button } from '@/components/ui/button';
import type { Plan } from '@/content/navigation';

type Row = { page_key: string; title: string; status: string; updated_at: string };
const label = (s: string) => s === 'published' ? 'Ready' : s === 'preview' ? 'Preview' : s === 'writing' ? 'Writing…' : s === 'failed' ? 'Needs a retry' : s;

/** AI Readings: credit meter and a chronological history of the member's written readings. */
export function AiReadingsTab({ plan }: { plan: Plan }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState(false);
  const load = async () => {
    setError(false);
    const { data: s } = await supabase.auth.getSession();
    const uid = s.session?.user.id; if (!uid) { setRows([]); return; }
    const { data, error } = await supabase.from('generated_pages').select('page_key,title,status,updated_at').eq('owner_id', uid).eq('section', 'Topic Reading').order('updated_at', { ascending: false }).limit(60);
    if (error) { setError(true); return; }
    setRows((data ?? []) as Row[]);
  };
  useEffect(() => { void load(); }, []);
  return (
    <div className="space-y-6">
      <CreditBalance />
      <p className="text-sm text-muted-foreground">{plan === 'free' ? `Free includes ${FREE_READINGS.length} full readings and a preview section of each core theme.` : `Your plan opens all ${ALL_READINGS.length} readings. Each one is written once from your chart and saved, so reopening it never uses credits.`}</p>
      {error ? <div className="rounded border border-destructive/50 p-4 text-sm">Your reading history couldn’t load. <Button size="sm" variant="outline" onClick={load}>Try again</Button></div>
        : rows === null ? <div className="h-24 animate-pulse rounded border border-border bg-card" role="status" aria-label="Loading readings" />
        : rows.length === 0 ? <p className="rounded border border-border bg-card p-4 text-sm">No readings written yet. <Link to="/my-readings" className="text-primary underline">Choose your first reading</Link>.</p>
        : <ol className="divide-y divide-border rounded-lg border border-border bg-card">{rows.map(r => (
          <li key={r.page_key}><Link to={`/my-readings/topic/${r.page_key}`} className="flex items-center justify-between gap-3 p-4 transition-colors duration-500 hover:bg-primary/5">
            <span><span className="font-medium">{r.title || ALL_READINGS.find(x => x.slug === r.page_key)?.title || r.page_key}</span><span className="block text-xs text-muted-foreground">{new Date(r.updated_at).toLocaleString()}</span></span>
            <span className={`rounded-full border px-2 py-0.5 text-xs ${r.status === 'failed' ? 'border-destructive text-destructive' : 'border-border'}`}>{label(r.status)}</span></Link></li>))}</ol>}
      <Button asChild variant="outline"><Link to="/my-readings">All readings</Link></Button>
    </div>
  );
}
