import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { compareAreas, missingFiles, type AuditSnapshot, type Flag } from '@/lib/founderAudit';

const SNAP_KEY = 'founder_audit_snapshot';
const FLAG_TEXT: Record<Flag, string> = { ok: 'Complete', lost: 'Fewer than last snapshot', missing: 'Edition file unreadable', unindexed: 'Chapters missing from index', new: 'New since snapshot' };

/**
 * Founder preservation inventory (Wave 10): chapter, word and file counts for April's, Shane's and Zac's editions,
 * compared with the last saved snapshot so a migration can't silently lose material. Counts only — no titles or text.
 */
export function FounderAudit() {
  const [now, setNow] = useState<AuditSnapshot | null>(null);
  const [saved, setSaved] = useState<AuditSnapshot | null>(null);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const run = useCallback(async () => {
    setBusy(true); setErr('');
    const [{ data, error }, snap] = await Promise.all([
      supabase.functions.invoke('protected-content', { body: { action: 'audit' } }),
      supabase.from('platform_settings').select('value').eq('key', SNAP_KEY).maybeSingle(),
    ]);
    setBusy(false);
    if (error || !data?.audit) { setErr('The inventory could not run. Try again in a moment.'); return; }
    setNow({ ...data.audit, checkedAt: data.checkedAt });
    setSaved((snap.data?.value as unknown as AuditSnapshot) ?? null);
  }, []);
  useEffect(() => { void run(); }, [run]);
  const save = async () => {
    if (!now) return;
    const { data: s } = await supabase.auth.getSession();
    const { error } = await supabase.from('platform_settings').upsert({ key: SNAP_KEY, value: now as never, updated_by: s.session?.user.id ?? null, updated_at: new Date().toISOString() });
    if (error) { toast.error('Snapshot could not be saved.'); return; }
    setSaved(now); toast.success('Snapshot saved. Future checks compare against it.');
  };
  const rows = now ? compareAreas(now.areas, saved?.areas) : [];
  const gone = now ? missingFiles(now.files, saved?.files) : [];
  const trouble = rows.some(r => r.flags.some(f => f === 'lost' || f === 'missing')) || gone.some(g => g.vanished);
  return (
    <section aria-labelledby="fa-h" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 id="fa-h" className="font-display text-2xl">Founder inventory</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">Counts of every chapter, word and stored file in April’s, Shane’s and Zac’s editions. Run it before and after any content move: a drop shows up here. Only numbers are read — no titles or text open.</p></div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => void run()} disabled={busy}><RefreshCw className={`mr-2 h-4 w-4 ${busy ? 'animate-spin' : ''}`} aria-hidden />Check again</Button>
          <Button onClick={() => void save()} disabled={!now || busy}><Save className="mr-2 h-4 w-4" aria-hidden />Save as snapshot</Button></div>
      </div>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      {busy && !now && <p role="status" className="text-sm text-muted-foreground">Counting the editions…</p>}
      {now && <>
        <p role="status" className={`flex items-center gap-2 text-sm ${trouble ? 'text-destructive' : 'text-foreground'}`}>{trouble ? <AlertTriangle className="h-4 w-4" aria-hidden /> : <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />}
          {trouble ? 'Something is smaller or missing compared with the snapshot — check before publishing changes.' : saved ? `Nothing lost since the snapshot of ${new Date(saved.checkedAt).toLocaleString()}.` : 'No snapshot yet. Save one now so later checks have something to compare against.'}</p>
        <div className="overflow-x-auto"><table className="w-full min-w-[34rem] text-sm">
          <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="py-2 pr-3 font-medium">Edition</th><th className="py-2 pr-3 font-medium">Chapters</th><th className="py-2 pr-3 font-medium">In index</th><th className="py-2 pr-3 font-medium">Words</th><th className="py-2 font-medium">Status</th></tr></thead>
          <tbody>{rows.map(r => <tr key={r.area} className="border-b border-border/60">
            <td className="py-2 pr-3">{r.label}</td>
            <td className="py-2 pr-3 tabular-nums">{r.chapters}{r.was && r.was.chapters !== r.chapters && <span className="ml-1 text-xs text-muted-foreground">(was {r.was.chapters})</span>}</td>
            <td className="py-2 pr-3 tabular-nums">{r.area === 'library' ? '—' : r.indexed}</td>
            <td className="py-2 pr-3 tabular-nums">{r.words.toLocaleString()}{r.was && r.was.words !== r.words && <span className="ml-1 text-xs text-muted-foreground">(was {r.was.words.toLocaleString()})</span>}</td>
            <td className="py-2">{r.flags.map(f => <span key={f} className={`mr-1 inline-block rounded-full border px-2 py-0.5 text-xs ${f === 'ok' || f === 'new' ? 'border-primary/40' : 'border-destructive/50 text-destructive'}`}>{FLAG_TEXT[f]}</span>)}</td>
          </tr>)}</tbody></table></div>
        <div><h3 className="font-label !text-sm tracking-[0.14em]">Stored files</h3>
          <p className="mt-1 text-sm text-muted-foreground">{now.files.filter(f => f.present).length} of {now.files.length} present{gone.length ? ` · missing: ${gone.map(g => `${g.file.area}/${g.file.file}${g.vanished ? ' (was present)' : ''}`).join(', ')}` : ''}.</p></div>
        <p className="text-xs text-muted-foreground">Checked {new Date(now.checkedAt).toLocaleString()}.</p>
      </>}
    </section>
  );
}
