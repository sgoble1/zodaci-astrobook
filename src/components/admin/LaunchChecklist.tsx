import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, CircleAlert, Clock, HelpCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { parseSiteSettings } from '@/hooks/useSiteSettings';
import { launchChecks, parseProofs, proofCheck, PROOFS, type Check, type CheckState, type ProofRecord, type Signals } from '@/lib/launchReadiness';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const LOOK: Record<CheckState, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  ready: { label: 'Ready', icon: CheckCircle2, cls: 'text-primary' },
  action: { label: 'Needs action', icon: CircleAlert, cls: 'text-destructive' },
  external: { label: 'Waiting on you', icon: Clock, cls: 'text-gold' },
  unknown: { label: 'Could not check', icon: HelpCircle, cls: 'text-muted-foreground' },
};

/** Admin launch checklist built from live signals (payments, printing, admins, settings). */
export function LaunchChecklist() {
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [proofs, setProofs] = useState<Record<string, ProofRecord> | null>(null);
  const [proofsFailed, setProofsFailed] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    const [pay, lulu, cfg, ad] = await Promise.all([
      supabase.functions.invoke('admin-stripe-overview', { body: { environment: 'live' } }).catch(() => null),
      supabase.functions.invoke('lulu-print', { body: { action: 'status' } }).catch(() => null),
      supabase.from('platform_settings').select('key,value'),
      supabase.rpc('admin_list_admins'),
    ]);
    const signals: Signals = {
      payments: pay ? { reachable: !pay.error && !!pay.data && !pay.data.error, activeSubscriptions: pay.data?.active_subscriptions } : null,
      lulu: lulu && !lulu.error && lulu.data && !lulu.data.error ? { configured: !!lulu.data.configured, connected: !!lulu.data.connected, environment: lulu.data.environment, webhook: !!lulu.data.webhook } : null,
      admins: ad.error ? null : ((ad.data ?? []) as unknown[]).length,
      maintenance: cfg.error ? null : parseSiteSettings(cfg.data ?? []).maintenance.enabled,
    };
    setChecks(launchChecks(signals));
    setProofsFailed(!!cfg.error);
    setProofs(cfg.error ? null : parseProofs((cfg.data ?? []).find(r => r.key === 'launch_proofs')?.value));
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const ready = checks?.filter(c => c.state === 'ready').length ?? 0;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="font-display text-2xl">Launch readiness</h2><p className="text-sm text-muted-foreground">{checks ? `${ready} of ${checks.length} ready, checked live just now.` : 'Checking the live systems…'}</p></div>
        <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Check again</Button>
      </div>
      <ul className="divide-y divide-border rounded-2xl border border-border bg-card/60">
        {(checks ?? []).map(c => {
          const look = LOOK[c.state]; const Icon = look.icon;
          return <li key={c.id} className="flex flex-wrap items-start gap-3 p-4">
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${look.cls}`} aria-hidden="true" />
            <div className="min-w-0 flex-1"><p className="font-medium">{c.label} <span className={`ml-2 text-xs ${look.cls}`}>{look.label}</span></p><p className="text-sm text-muted-foreground">{c.detail}</p></div>
            {c.tab && <Button asChild size="sm" variant="ghost"><Link to={`/admin?tab=${c.tab}`}>Open</Link></Button>}
          </li>;
        })}
      </ul>
      <ProofList proofs={proofs} failed={proofsFailed} onSaved={setProofs} />
    </div>
  );
}

/** Real-world proof the owner records once each step has actually been done; dates make stale proof visible. */
function ProofList({ proofs, failed, onSaved }: { proofs: Record<string, ProofRecord> | null; failed: boolean; onSaved: (p: Record<string, ProofRecord>) => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const save = async (id: string, record: ProofRecord | null) => {
    if (!proofs || saving) return;
    setSaving(true);
    const next = { ...proofs };
    if (record) next[id] = record; else delete next[id];
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from('platform_settings').upsert({ key: 'launch_proofs', value: next as never, updated_by: session?.user.id ?? null, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) { toast.error("The proof couldn't be saved. Please try again."); return; }
    onSaved(next); setEditing(null);
    toast.success(record ? 'Proof recorded.' : 'Proof cleared.');
  };
  return (
    <section aria-labelledby="launch-proofs" className="space-y-3">
      <div><h3 id="launch-proofs" className="font-display text-xl">Proven end to end</h3>
        <p className="text-sm text-muted-foreground">Connected services above only show that systems answer. Record each real-world step here after you've done it once.</p></div>
      {failed ? <p role="alert" className="text-sm text-destructive">Saved proofs couldn't load. Use “Check again”.</p>
        : !proofs ? <p role="status" className="text-sm text-muted-foreground">Loading proofs…</p>
        : <ul className="divide-y divide-border rounded-2xl border border-border bg-card/60">
          {PROOFS.map(def => {
            const c = proofCheck(def, proofs[def.id]); const look = LOOK[c.state]; const Icon = look.icon;
            const open = editing === def.id;
            return <li key={def.id} className="space-y-3 p-4">
              <div className="flex flex-wrap items-start gap-3">
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${look.cls}`} aria-hidden="true" />
                <div className="min-w-0 flex-1"><p className="font-medium">{def.label} <span className={`ml-2 text-xs ${look.cls}`}>{c.state === 'external' ? 'Not proven yet' : look.label}</span></p><p className="text-sm text-muted-foreground">{c.detail}</p></div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(open ? null : def.id); setDate(proofs[def.id]?.date ?? new Date().toISOString().slice(0, 10)); setNote(proofs[def.id]?.note ?? ''); }} aria-expanded={open}>{proofs[def.id] ? 'Update' : 'Record'}</Button>
                  {proofs[def.id] && <Button size="sm" variant="ghost" disabled={saving} onClick={() => void save(def.id, null)}>Clear</Button>}
                </div>
              </div>
              {open && <form className="grid gap-3 sm:grid-cols-[10rem_1fr_auto] sm:items-end" onSubmit={e => { e.preventDefault(); void save(def.id, { date, note: note.trim() || undefined }); }}>
                <div><Label htmlFor={`proof-date-${def.id}`}>Date done</Label><Input id={`proof-date-${def.id}`} type="date" required max={new Date().toISOString().slice(0, 10)} value={date} onChange={e => setDate(e.target.value)} /></div>
                <div><Label htmlFor={`proof-note-${def.id}`}>Note (optional)</Label><Input id={`proof-note-${def.id}`} maxLength={200} value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. order number or what you checked" /></div>
                <Button type="submit" disabled={saving || !date}>{saving ? 'Saving…' : 'Save proof'}</Button>
              </form>}
            </li>;
          })}
        </ul>}
    </section>
  );
}
