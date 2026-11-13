import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { confirmAction } from '@/components/common/ConfirmHost';
import { callLulu, luluStatusText, type LuluStatus } from './LuluPrint';
import type { Tables } from '@/integrations/supabase/types';

export function LuluComicActions({ issue, status, jobs, onChanged }: { issue: Tables<'comic_issues'>; status: LuluStatus | null; jobs: Tables<'comic_lulu_print_jobs'>[]; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState<{ interiorUrl: string; coverUrl: string; pages: number } | null>(null);
  const active = jobs.find(j => j.issue_id === issue.id && j.environment === status?.environment && !['FAILED','REJECTED','CANCELED','ERROR'].includes(j.status));
  const run = async (action: string) => {
    if (action === 'submit' && !await confirmAction(status?.environment === 'production' ? 'Send this AstroComic to Lulu for real printing? This creates a charge in your Lulu account.' : 'Send a test comic job to Lulu? Nothing will be printed.', 'Send to Lulu')) return;
    if (action === 'cancel' && !await confirmAction('Cancel this unpaid comic print job?', 'Cancel job')) return;
    setBusy(true);
    try {
      const r = await callLulu<{ interiorUrl?: string; coverUrl?: string; pages?: number; status?: string; note?: string; quote?: { total_cost_incl_tax?: string; currency?: string } }>({ action, ...(['sync','cancel'].includes(action) ? { jobId: active?.id, product: 'comic' } : { issueId: issue.id }) });
      if (r.interiorUrl && r.coverUrl && r.pages) setFiles({ interiorUrl: r.interiorUrl, coverUrl: r.coverUrl, pages: r.pages });
      else if (r.quote) toast.success(`Lulu quote: ${r.quote.currency ?? 'USD'} ${r.quote.total_cost_incl_tax ?? 'unavailable'} including delivery and tax`);
      else toast.success(r.note || `Lulu: ${luluStatusText(r.status || 'CREATED')}`);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Lulu could not be reached.'); }
    finally { setBusy(false); onChanged(); }
  };
  return <div className="space-y-2 mt-2">
    {active && <><p className="text-xs text-gold">Lulu: {luluStatusText(active.status)}{active.lulu_job_id ? ` · ${active.lulu_job_id}` : ''}</p>{active.status_message && <p className="text-xs text-muted-foreground">{active.status_message}</p>}</>}
    {files && <p className="text-xs"><a className="underline text-primary" href={files.coverUrl} target="_blank" rel="noreferrer">Two cover spreads</a> · <a className="underline text-primary" href={files.interiorUrl} target="_blank" rel="noreferrer">{files.pages}-page interior</a> · links expire in 10 minutes</p>}
    {status?.connected && <div className="flex flex-wrap gap-1">
      {!active && issue.status === 'approved' && issue.print_pdf_path && <><Button size="sm" variant="outline" disabled={busy} onClick={() => void run('quote')}>Lulu quote</Button><Button size="sm" variant="outline" disabled={busy} onClick={() => void run('proof')}>Preview Lulu files</Button><Button size="sm" disabled={busy} onClick={() => void run('submit')}>{status.environment === 'production' ? 'Send comic to Lulu' : 'Send test comic'}</Button></>}
      {active?.lulu_job_id && <Button size="sm" variant="outline" disabled={busy} onClick={() => void run('sync')}>Refresh Lulu</Button>}
      {active && ['CREATED','UNPAID'].includes(active.status) && <Button size="sm" variant="ghost" disabled={busy} onClick={() => void run('cancel')}>Cancel Lulu job</Button>}
    </div>}
  </div>;
}