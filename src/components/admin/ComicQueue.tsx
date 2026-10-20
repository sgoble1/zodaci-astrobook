import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, Download, Printer, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ComicProduction } from '@/components/admin/ComicProduction';
import { confirmAction } from '@/components/common/ConfirmHost';
import { computeChart, type HouseSystem } from '@/lib/astro';
import { buildComicIssue, COMIC_PLANS, comicDueFor, manifestCsv, monthKey, monthLabel, shipBy, type ComicIssue, type ComicPlan } from '@/lib/comic';
import { downloadText } from '@/lib/bookFulfillment';
import { trackingUrl } from '@/lib/tracking';
import type { Tables } from '@/integrations/supabase/types';

type Sub = { subscription_id: string; user_id: string; plan: string; status: string; environment: string; created_at: string; paused_until: string | null; skip_months: string[]; current_period_end: string | null; cancel_at_period_end: boolean; shipping_address: Record<string, string> | null; email: string; display_name: string; birth_date: string | null; birth_time: string | null; lat: number | null; lon: number | null; tz: string | null; place_label: string | null; house_system: string | null };
type Issue = Tables<'comic_issues'>;
type Run = Tables<'comic_print_runs'>;
const ISSUE_STATUSES = ['draft', 'approved', 'printing', 'shipped', 'skipped'] as const;
const RUN_STATUSES = ['planning', 'quoted', 'ordered', 'printed', 'shipped'] as const;
const addressOk = (a: Record<string, string> | null) => !!a && a.country === 'US' && !!a.name?.trim() && !!a.line1?.trim() && !!a.city?.trim() && a.state?.length === 2 && /^\d{5}(-\d{4})?$/.test(a.postal_code ?? '');
const defaultMonth = () => { const n = new Date(); return n.getUTCDate() <= 8 ? new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), 1)) : new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() + 1, 1)); };
const dollars = (c: number | null | undefined) => c == null ? '' : (c / 100).toFixed(2);
const cents = (v: string) => v.trim() === '' ? null : Math.max(0, Math.round(Number(v) * 100));

/** Admin AstroComic production: who gets this month's issue, draft scripts from each chart, approve, print and ship, with the print-run record and mailing manifest. */
export function ComicQueue() {
  const [month, setMonth] = useState(defaultMonth);
  const [subs, setSubs] = useState<Sub[] | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [run, setRun] = useState<Run | null>(null);
  const [showTest, setShowTest] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const key = monthKey(month);
  const load = useCallback(async () => {
    setErr('');
    const [m, i, r] = await Promise.all([supabase.rpc('admin_comic_manifest'), supabase.from('comic_issues').select('*').order('issue_month', { ascending: false }).limit(2000), supabase.from('comic_print_runs').select('*').eq('issue_month', key).maybeSingle()]);
    if (m.error || i.error) { setErr('The AstroComic queue could not be loaded.'); setSubs([]); return; }
    setSubs((m.data ?? []) as Sub[]); setIssues(i.data ?? []); setRun(r.data ?? null);
  }, [key]);
  useEffect(() => { void load(); }, [load]);

  const rows = useMemo(() => (subs ?? []).filter(s => showTest || s.environment === 'live').map(s => {
    const mine = issues.filter(i => i.subscription_id === s.subscription_id);
    const issue = mine.find(i => i.issue_month === key) ?? null;
    const due = comicDueFor({ ...s, plan: s.plan as ComicPlan, skip_months: s.skip_months ?? [] }, month, s.plan === 'single' && mine.some(i => i.issue_month !== key));
    const number = issue?.issue_number ?? mine.filter(i => i.issue_month < key && i.status !== 'skipped').length + 1;
    const birthOk = !!s.birth_date && s.lat != null && s.lon != null && !!s.tz;
    return { s, issue, due, number, birthOk, addrOk: addressOk(s.shipping_address) };
  }), [subs, issues, key, month, showTest]);
  const dueRows = rows.filter(r => r.due.due || r.issue);
  const notDue = rows.filter(r => !r.due.due && !r.issue);
  const toDraft = dueRows.filter(r => r.due.due && !r.issue && r.birthOk);
  const counts = ISSUE_STATUSES.reduce<Record<string, number>>((m, st) => { m[st] = dueRows.filter(r => r.issue?.status === st).length; return m; }, {});

  const draftAll = async () => {
    if (!toDraft.length) return;
    setBusy('draft');
    const made = toDraft.map(r => {
      const chart = computeChart({ date: r.s.birth_date!, time: r.s.birth_time || null, lat: r.s.lat!, lon: r.s.lon!, tz: r.s.tz!, placeLabel: r.s.place_label ?? '', placeSource: 'geocoded', houseSystem: (r.s.house_system as HouseSystem) || 'placidus' });
      const script = buildComicIssue(chart, { reader: r.s.display_name || r.s.shipping_address?.name || 'Reader', month, issueNumber: r.number });
      return { user_id: r.s.user_id, subscription_id: r.s.subscription_id, issue_month: key, issue_number: r.number, status: 'draft', title: script.title.slice(0, 200), script: script as never };
    });
    const { error } = await supabase.from('comic_issues').upsert(made, { onConflict: 'subscription_id,issue_month', ignoreDuplicates: true });
    setBusy('');
    if (error) { toast.error('Drafts could not be created.'); return; }
    toast.success(`${made.length} issue draft${made.length === 1 ? '' : 's'} created for ${monthLabel(month)}`); void load();
  };
  const setStatus = async (i: Issue, status: string, extra: Partial<Issue> = {}) => {
    if (status === 'printing' && i.status !== 'approved') { toast.error('Approve the issue before printing.'); return; }
    if (status === 'printing' && !i.print_pdf_path) { toast.error('Build the print file under Production before sending this issue to print.'); return; }
    if (status === 'skipped' && !(await confirmAction('Skip this member’s issue for this month? It will not be printed.', 'Skip issue'))) return;
    const { data, error } = await supabase.from('comic_issues').update({ status, ...extra, updated_at: new Date().toISOString() }).eq('id', i.id).eq('status', i.status).select('id');
    if (error || !data?.length) { toast.error('This issue changed — refresh and try again.'); return; }
    void load();
  };
  const approveAll = async () => {
    const ids = dueRows.filter(r => r.issue?.status === 'draft' && r.addrOk).map(r => r.issue!.id);
    if (!ids.length) return;
    if (!(await confirmAction(`Approve ${ids.length} draft${ids.length === 1 ? '' : 's'}? Members can read approved issues in their archive.`, 'Approve'))) return;
    const { error } = await supabase.from('comic_issues').update({ status: 'approved', updated_at: new Date().toISOString() }).in('id', ids).eq('status', 'draft');
    if (error) toast.error('Could not approve.'); else { toast.success(`${ids.length} approved`); void load(); }
  };
  const ship = async (i: Issue, form: FormData) => {
    const carrier = String(form.get('carrier') ?? ''); const tracking = String(form.get('tracking') ?? '').trim(); const date = String(form.get('date') ?? '');
    if (!carrier || !tracking) { toast.error('Add the carrier and tracking number.'); return; }
    if (!date || date > new Date().toISOString().slice(0, 10)) { toast.error('Add a dispatch date that isn’t in the future.'); return; }
    await setStatus(i, 'shipped', { carrier, tracking_number: tracking.slice(0, 120), shipped_at: date });
  };
  const saveRun = async (form: FormData) => {
    const row = { issue_month: key, printer: String(form.get('printer') ?? '').slice(0, 120), quantity: Math.max(0, Number(form.get('quantity')) || 0), quote_cents: cents(String(form.get('quote') ?? '')), actual_cents: cents(String(form.get('actual') ?? '')), order_ref: String(form.get('ref') ?? '').slice(0, 120), status: String(form.get('status') ?? 'planning'), due_date: String(form.get('due') ?? '') || null, notes: String(form.get('notes') ?? '').slice(0, 2000), updated_at: new Date().toISOString() };
    const { error } = run ? await supabase.from('comic_print_runs').update(row).eq('id', run.id) : await supabase.from('comic_print_runs').insert(row);
    if (error) toast.error('Could not save the print run.'); else { toast.success('Print run saved'); void load(); }
  };
  const exportManifest = () => {
    const list = dueRows.filter(r => r.issue && ['approved', 'printing', 'shipped'].includes(r.issue.status));
    if (!list.length) { toast.error('Approve issues first — the manifest lists approved issues only.'); return; }
    downloadText(`astrocomic-manifest-${key.slice(0, 7)}.csv`, manifestCsv(list.map(r => { const sc = r.issue!.script as unknown as ComicIssue; return { name: r.s.display_name, email: r.s.email, sun: sc?.signs?.sun ?? '', moon: sc?.signs?.moon ?? '', rising: sc?.signs?.rising ?? '', plan: COMIC_PLANS[r.s.plan as ComicPlan]?.name ?? r.s.plan, status: r.s.status, address: r.s.shipping_address ?? {}, issue: r.issue!.title, issueNumber: r.issue!.issue_number, issueStatus: r.issue!.status }; })));
  };

  if (!subs) return <div role="status" aria-label="Loading AstroComic queue" className="h-40 animate-pulse rounded bg-muted" />;
  const shift = (n: number) => setMonth(m => new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + n, 1)));
  const approvedCount = dueRows.filter(r => r.issue && ['approved', 'printing', 'shipped'].includes(r.issue.status)).length;
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h2 className="font-display text-2xl">AstroComic queue</h2><p className="text-sm text-muted-foreground">Issues ship by the 8th. Drafts are planned from each subscriber’s saved chart and that month’s sky without AI. Artwork is drawn only when you start it under Production.</p></div>
        <div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => shift(-1)} aria-label="Previous month">←</Button><p className="min-w-40 text-center font-display text-xl">{monthLabel(month)}</p><Button variant="outline" size="sm" onClick={() => shift(1)} aria-label="Next month">→</Button><Button variant="ghost" size="sm" onClick={() => void load()} aria-label="Refresh"><RefreshCw className="h-4 w-4" /></Button></div>
      </div>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full border border-border px-3 py-1">Ships by {shipBy(month).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>
        <span className="rounded-full border border-border px-3 py-1">Due {dueRows.length}</span>
        {ISSUE_STATUSES.map(st => counts[st] ? <span key={st} className="rounded-full border border-border px-3 py-1 capitalize">{st} {counts[st]}</span> : null)}
        <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground"><Switch checked={showTest} onCheckedChange={setShowTest} aria-label="Include test subscriptions" />Include test subscriptions</label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void draftAll()} disabled={!toDraft.length || busy === 'draft'}><Sparkles className="h-4 w-4" />{busy === 'draft' ? 'Creating…' : `Create ${toDraft.length} draft${toDraft.length === 1 ? '' : 's'}`}</Button>
        <Button variant="outline" onClick={() => void approveAll()} disabled={!counts.draft}>Approve drafts with complete addresses</Button>
        <Button variant="outline" onClick={exportManifest}><Download className="h-4 w-4" />Mailing manifest (CSV)</Button>
      </div>

      {!dueRows.length ? <p className="text-muted-foreground">No issues due for {monthLabel(month)}.</p> : (
        <div className="overflow-x-auto rounded-lg border border-border"><table className="w-full min-w-[960px] text-sm">
          <thead><tr className="border-b border-border text-left"><th className="p-3">Subscriber</th><th className="p-3">Plan</th><th className="p-3">Address</th><th className="p-3">Issue</th><th className="p-3">Status</th><th className="p-3">Next step</th></tr></thead>
          <tbody>{dueRows.map(r => { const i = r.issue; const sc = i?.script as unknown as ComicIssue | undefined; const a = r.s.shipping_address ?? {}; return (
            <tr key={r.s.subscription_id} className="border-b border-border align-top last:border-0">
              <td className="p-3"><p className="font-medium">{r.s.display_name || a.name || 'Member'}</p><p className="text-xs text-muted-foreground">{r.s.email}{r.s.environment === 'sandbox' ? ' · test' : ''}</p>{!r.birthOk && <p className="mt-1 text-xs text-destructive">Needs saved birth details</p>}</td>
              <td className="p-3">{COMIC_PLANS[r.s.plan as ComicPlan]?.name ?? r.s.plan}<p className="text-xs text-muted-foreground">No. {r.number}</p></td>
              <td className="p-3">{r.addrOk ? <span className="text-xs">{a.name}<br />{[a.line1, a.line2].filter(Boolean).join(', ')}<br />{a.city}, {a.state} {a.postal_code}</span> : <span className="text-xs text-destructive">Incomplete address</span>}</td>
              <td className="p-3">{i ? <><p>{i.title || sc?.title}</p><p className="text-xs text-muted-foreground">{sc?.signs ? `${sc.signs.sun} Sun${sc.signs.moon ? ` · ${sc.signs.moon} Moon` : ''}${sc.signs.rising ? ` · ${sc.signs.rising} Rising` : ''}` : ''}</p>{sc?.pages?.length ? <><Button size="sm" variant="ghost" className="mt-1 h-7 px-2" aria-expanded={preview === i.id} onClick={() => setPreview(preview === i.id ? null : i.id)}><BookOpen className="h-3.5 w-3.5" />{preview === i.id ? 'Close' : 'Production'}</Button>{i.print_pdf_path && <p className="text-xs text-gold">Print file ready</p>}</> : null}</> : <span className="text-xs text-muted-foreground">{r.birthOk ? 'Not drafted yet' : '—'}</span>}</td>
              <td className="p-3 capitalize">{i ? <span className={i.status === 'skipped' ? 'text-muted-foreground' : 'text-gold'}>{i.status}</span> : <span className="text-muted-foreground">due</span>}{i?.status === 'shipped' && i.tracking_number && <p className="text-xs normal-case">{i.carrier} {(() => { const u = trackingUrl(i.carrier, i.tracking_number); return u ? <a href={u} target="_blank" rel="noopener noreferrer" className="underline">{i.tracking_number}</a> : i.tracking_number; })()}</p>}</td>
              <td className="p-3">{!i ? null : i.status === 'draft' ? <div className="flex flex-wrap gap-1"><Button size="sm" disabled={!r.addrOk} onClick={() => void setStatus(i, 'approved')}>Approve</Button><Button size="sm" variant="ghost" onClick={() => void setStatus(i, 'skipped')}>Skip</Button></div>
                : i.status === 'approved' ? <div className="flex flex-wrap gap-1"><Button size="sm" variant="outline" onClick={() => void setStatus(i, 'printing')}><Printer className="h-3.5 w-3.5" />Mark printing</Button><Button size="sm" variant="ghost" onClick={() => void setStatus(i, 'draft')}>Back to draft</Button></div>
                : i.status === 'printing' ? <form className="grid gap-1" onSubmit={e => { e.preventDefault(); void ship(i, new FormData(e.currentTarget)); }}><select name="carrier" aria-label="Carrier" className="h-8 rounded border border-border bg-input px-2 text-xs" defaultValue="USPS">{['USPS', 'UPS', 'FedEx'].map(c => <option key={c}>{c}</option>)}</select><Input name="tracking" aria-label="Tracking number" placeholder="Tracking" className="h-8 text-xs" maxLength={120} /><Input name="date" aria-label="Dispatch date" type="date" className="h-8 text-xs" defaultValue={new Date().toISOString().slice(0, 10)} max={new Date().toISOString().slice(0, 10)} /><Button size="sm" type="submit">Mark shipped</Button></form>
                : i.status === 'skipped' ? <Button size="sm" variant="ghost" onClick={() => void setStatus(i, 'draft')}>Restore draft</Button> : <span className="text-xs text-muted-foreground">Done</span>}</td>
            </tr>
          ); })}</tbody>
        </table></div>
      )}
      {preview && (() => { const i = issues.find(x => x.id === preview); return i ? <ComicProduction key={i.id} issue={i} onChanged={() => void load()} /> : null; })()}

      <form key={run?.id ?? key} className="vellum grid gap-3 p-5 sm:grid-cols-4" onSubmit={e => { e.preventDefault(); void saveRun(new FormData(e.currentTarget)); }} aria-labelledby="run-h">
        <div className="sm:col-span-4"><h3 id="run-h" className="text-lg">Print run · {monthLabel(month)}</h3><p className="text-xs text-muted-foreground">{approvedCount} approved issue{approvedCount === 1 ? '' : 's'} this month. Record the printer’s quote and order so costs stay visible.</p></div>
        <div><Label htmlFor="run-printer">Printer</Label><Input id="run-printer" name="printer" defaultValue={run?.printer ?? ''} maxLength={120} placeholder="Printer name" /></div>
        <div><Label htmlFor="run-qty">Quantity</Label><Input id="run-qty" name="quantity" type="number" min={0} defaultValue={run?.quantity ?? approvedCount} /></div>
        <div><Label htmlFor="run-quote">Quote ($)</Label><Input id="run-quote" name="quote" type="number" min={0} step="0.01" defaultValue={dollars(run?.quote_cents)} /></div>
        <div><Label htmlFor="run-actual">Actual cost ($)</Label><Input id="run-actual" name="actual" type="number" min={0} step="0.01" defaultValue={dollars(run?.actual_cents)} /></div>
        <div><Label htmlFor="run-ref">Order reference</Label><Input id="run-ref" name="ref" defaultValue={run?.order_ref ?? ''} maxLength={120} /></div>
        <div><Label htmlFor="run-status">Stage</Label><select id="run-status" name="status" defaultValue={run?.status ?? 'planning'} className="h-10 w-full rounded border border-border bg-input px-2 text-sm">{RUN_STATUSES.map(st => <option key={st} value={st} className="capitalize">{st}</option>)}</select></div>
        <div><Label htmlFor="run-due">Due date</Label><Input id="run-due" name="due" type="date" defaultValue={run?.due_date ?? ''} /></div>
        <div className="sm:col-span-4"><Label htmlFor="run-notes">Notes</Label><Textarea id="run-notes" name="notes" rows={2} maxLength={2000} defaultValue={run?.notes ?? ''} /></div>
        <Button type="submit" className="sm:w-fit">Save print run</Button>
        {run?.quote_cents != null && approvedCount > 0 && <p className="self-center text-sm text-muted-foreground sm:col-span-3">≈ ${(run.quote_cents / 100 / Math.max(1, run.quantity || approvedCount)).toFixed(2)} per copy quoted</p>}
      </form>

      {notDue.length > 0 && <details className="text-sm"><summary className="cursor-pointer text-muted-foreground">Not due this month ({notDue.length})</summary><ul className="mt-2 space-y-1">{notDue.map(r => <li key={r.s.subscription_id}>{r.s.display_name || r.s.email} · {COMIC_PLANS[r.s.plan as ComicPlan]?.name ?? r.s.plan} · <span className="text-muted-foreground">{r.due.reason}</span></li>)}</ul></details>}
      <p className="text-xs text-muted-foreground">The manifest contains names and delivery addresses for printing and mailing only. Each issue’s print file is built under Production once every panel is illustrated. Until a printer account is connected, send the manifest and print files to the printer by hand.</p>
    </div>
  );
}
