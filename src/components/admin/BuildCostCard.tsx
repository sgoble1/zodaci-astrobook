import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession } from '@/hooks/useLibrary';
import { BUILD_COST_SETTING_KEY, BUILD_CREDIT_SNAPSHOT, DOLLARS_PER_BUILD_CREDIT, OPEN_WORK, creditCost, formatUsd, openWorkCredits, parseSnapshot, spentToDate, type BuildCreditSnapshot } from '@/lib/devCost';

/** Reads the admin-saved snapshot (platform_settings is admin-only) and falls back to the built-in one. */
export function useBuildCreditSnapshot() {
  const [snap, setSnap] = useState<BuildCreditSnapshot>(BUILD_CREDIT_SNAPSHOT);
  const [saved, setSaved] = useState(false);
  const load = async () => {
    const { data } = await supabase.from('platform_settings').select('value').eq('key', BUILD_COST_SETTING_KEY).maybeSingle();
    const parsed = parseSnapshot(data?.value);
    if (parsed) { setSnap(parsed); setSaved(true); }
  };
  useEffect(() => { void load(); }, []);
  return { snap, saved, reload: load };
}

/**
 * Build-cost summary at $0.35 per build credit, shared by Admin and the Developer dashboard. Figures are a dated
 * snapshot of the workspace balance, never presented as live; admins can update them by hand.
 */
export function BuildCostCard({ editable = false }: { editable?: boolean }) {
  const session = useSession();
  const { snap, saved, reload } = useBuildCreditSnapshot();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ usedThisPeriod: '', remaining: '', grantedToDate: '', periodLabel: '', takenOn: '' });
  const [busy, setBusy] = useState(false);
  const open = openWorkCredits();
  const openReady = openWorkCredits(OPEN_WORK.filter(i => !i.blockedBy));
  const start = () => { setForm({ usedThisPeriod: String(snap.usedThisPeriod), remaining: String(snap.remaining), grantedToDate: String(snap.grantedToDate), periodLabel: snap.periodLabel, takenOn: snap.takenOn }); setEditing(true); };
  const save = async () => {
    const next = parseSnapshot({ usedThisPeriod: Number(form.usedThisPeriod), remaining: Number(form.remaining), grantedToDate: Number(form.grantedToDate), periodLabel: form.periodLabel, takenOn: form.takenOn });
    if (!next) { toast.error('Enter each figure as a number of zero or more.'); return; }
    setBusy(true);
    const { error } = await supabase.from('platform_settings').upsert({ key: BUILD_COST_SETTING_KEY, value: next as never, updated_by: session?.user.id ?? null, updated_at: new Date().toISOString() });
    setBusy(false);
    if (error) { toast.error('Could not save the figures — only admins can change them.'); return; }
    toast.success('Build-cost figures updated'); setEditing(false); void reload();
  };
  const rows: [string, string, string][] = [
    ['Used this billing period', `${snap.usedThisPeriod.toLocaleString()} credits`, formatUsd(creditCost(snap.usedThisPeriod))],
    ['Remaining in the workspace', `${snap.remaining.toLocaleString()} credits`, formatUsd(creditCost(snap.remaining))],
    ['Spent to date (workspace)', `${spentToDate(snap).toLocaleString()} credits`, formatUsd(creditCost(spentToDate(snap)))],
    ['Estimated to finish open work', `${open} credits`, formatUsd(creditCost(open))],
  ];
  return (
    <section aria-labelledby="build-cost-h" className="obs-paper rivets space-y-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 id="build-cost-h" className="plate-title !text-2xl">Build costs</h2><p className="text-sm text-muted-foreground">At {formatUsd(DOLLARS_PER_BUILD_CREDIT)} per build credit · {snap.periodLabel} · snapshot {snap.takenOn}{saved ? ' (entered by an admin)' : ''}</p></div>
        {editable && !editing && <Button size="sm" variant="outline" onClick={start}>Update figures</Button>}
      </div>
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map(([l, c, usd]) => <div key={l} className="rounded-[var(--cut-card)] border border-[hsl(var(--comic-navy)/0.25)] p-3"><dt className="text-xs text-muted-foreground">{l}</dt><dd className="font-display text-2xl">{usd}</dd><dd className="text-xs text-muted-foreground">{c}</dd></div>)}
      </dl>
      <details className="text-sm">
        <summary className="cursor-pointer font-label tracking-[0.12em] text-accent">Open work estimate ({OPEN_WORK.length} items, {openReady} credits ready to build)</summary>
        <ul className="mt-2 space-y-1">{OPEN_WORK.map(i => <li key={i.id} className="flex flex-wrap justify-between gap-2 border-b border-dashed border-[hsl(var(--comic-navy)/0.2)] py-1"><span>{i.label}{i.blockedBy && <span className="text-muted-foreground"> · waiting on {i.blockedBy}</span>}</span><span className="tabular-nums text-muted-foreground">{i.credits} cr · {formatUsd(creditCost(i.credits))}</span></li>)}</ul>
        <p className="mt-2 text-xs text-muted-foreground">Rough estimates for planning, not quotes.</p>
      </details>
      {editing && <form className="grid gap-3 sm:grid-cols-3" onSubmit={e => { e.preventDefault(); void save(); }}>
        {([['usedThisPeriod', 'Used this period'], ['remaining', 'Remaining'], ['grantedToDate', 'Granted to date'], ['periodLabel', 'Billing period'], ['takenOn', 'Snapshot date']] as const).map(([k, l]) => (
          <div key={k} className="space-y-1"><Label htmlFor={`bc-${k}`}>{l}</Label><Input id={`bc-${k}`} inputMode={k === 'periodLabel' || k === 'takenOn' ? 'text' : 'decimal'} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} /></div>
        ))}
        <div className="flex items-end gap-2"><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save figures'}</Button><Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button></div>
      </form>}
    </section>
  );
}
