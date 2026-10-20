import { Fragment, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { csvCell, downloadText } from '@/lib/bookFulfillment';
import type { Tables } from '@/integrations/supabase/types';

type Row = Tables<'audit_log'>;
const tone = (action: string) => /delete|revoke/.test(action) ? 'text-destructive' : /grant|send|insert/.test(action) ? 'text-primary' : 'text-gold';
const ago = (iso: string) => { const s = (Date.now() - new Date(iso).getTime()) / 1000; return s < 60 ? 'just now' : s < 3600 ? `${Math.floor(s / 60)} min ago` : s < 86400 ? `${Math.floor(s / 3600)} h ago` : `${Math.floor(s / 86400)} d ago`; };

/** Changed keys between two saved versions of a record. */
export function diffRows(before: Record<string, unknown> | null, after: Record<string, unknown> | null) {
  const keys = [...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])].sort();
  return keys.map(k => ({ key: k, before: before?.[k], after: after?.[k] })).filter(r => JSON.stringify(r.before) !== JSON.stringify(r.after));
}
const show = (v: unknown) => v === undefined ? '—' : typeof v === 'string' ? v : JSON.stringify(v);

/** Read-only admin audit trail with filters, row diffs and CSV export. Entries can never be edited or deleted. */
export function AuditLog() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [err, setErr] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [f, setF] = useState({ from: '', to: '', action: '', table: '', admin: '', text: '' });
  const load = async () => {
    setErr('');
    const { data, error } = await supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(1000);
    if (error) { setErr('The audit log could not be loaded.'); setRows([]); return; }
    setRows(data ?? []);
    const ids = [...new Set((data ?? []).map(r => r.admin_id))];
    if (ids.length) { const { data: e } = await supabase.rpc('admin_member_emails', { _ids: ids }); setEmails(Object.fromEntries(((e ?? []) as { id: string; email: string }[]).map(x => [x.id, x.email]))); }
  };
  useEffect(() => { void load(); }, []);
  const opts = useMemo(() => ({ actions: [...new Set((rows ?? []).map(r => r.action))].sort(), tables: [...new Set((rows ?? []).map(r => r.target_table).filter(Boolean))].sort(), admins: [...new Set((rows ?? []).map(r => r.admin_id))] }), [rows]);
  const shown = useMemo(() => (rows ?? []).filter(r => (!f.from || r.created_at.slice(0, 10) >= f.from) && (!f.to || r.created_at.slice(0, 10) <= f.to) && (!f.action || r.action === f.action) && (!f.table || r.target_table === f.table) && (!f.admin || r.admin_id === f.admin) && (!f.text || `${r.summary} ${r.target_id}`.toLowerCase().includes(f.text.toLowerCase()))), [rows, f]);
  const exportCsv = () => downloadText(`zodaci-audit-${new Date().toISOString().slice(0, 10)}.csv`, [['When', 'Admin', 'Action', 'Table', 'Target', 'Summary', 'Before', 'After'], ...shown.map(r => [r.created_at, emails[r.admin_id] ?? r.admin_id, r.action, r.target_table, r.target_id, r.summary, JSON.stringify(r.before ?? ''), JSON.stringify(r.after ?? '')])].map(l => l.map(csvCell).join(',')).join('\r\n'));
  const sel = 'h-9 w-full rounded border border-border bg-input px-2 text-sm';
  if (!rows) return <div role="status" aria-label="Loading audit log" className="h-40 animate-pulse rounded bg-muted" />;
  return (
    <section className="space-y-5" aria-labelledby="audit-h">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="audit-h" className="font-display text-2xl">Audit log</h2><p className="text-sm text-muted-foreground">Every admin change to orders, costs, AstroComic, newsletters, settings, pages, grants and admin access.</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => void load()}><RefreshCw className="h-4 w-4" />Refresh</Button><Button size="sm" onClick={exportCsv} disabled={!shown.length}><Download className="h-4 w-4" />Export CSV</Button></div></div>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div><Label htmlFor="au-from">From</Label><Input id="au-from" type="date" value={f.from} onChange={e => setF({ ...f, from: e.target.value })} /></div>
        <div><Label htmlFor="au-to">To</Label><Input id="au-to" type="date" value={f.to} onChange={e => setF({ ...f, to: e.target.value })} /></div>
        <div><Label htmlFor="au-action">Action</Label><select id="au-action" className={sel} value={f.action} onChange={e => setF({ ...f, action: e.target.value })}><option value="">All</option>{opts.actions.map(a => <option key={a}>{a}</option>)}</select></div>
        <div><Label htmlFor="au-table">Record type</Label><select id="au-table" className={sel} value={f.table} onChange={e => setF({ ...f, table: e.target.value })}><option value="">All</option>{opts.tables.map(a => <option key={a}>{a}</option>)}</select></div>
        <div><Label htmlFor="au-admin">Admin</Label><select id="au-admin" className={sel} value={f.admin} onChange={e => setF({ ...f, admin: e.target.value })}><option value="">All</option>{opts.admins.map(a => <option key={a} value={a}>{emails[a] ?? a.slice(0, 8)}</option>)}</select></div>
        <div><Label htmlFor="au-text">Contains</Label><Input id="au-text" value={f.text} onChange={e => setF({ ...f, text: e.target.value })} placeholder="Summary or id" /></div>
      </div>
      <p className="text-xs text-muted-foreground">{shown.length} of {rows.length} entries{rows.length === 1000 ? ' (latest 1,000)' : ''}</p>
      {!shown.length ? <p className="text-muted-foreground">{rows.length ? 'No entries match these filters.' : 'No admin changes recorded yet. Changes to orders, costs, AstroComic issues, newsletters, settings, pages, grants and admin access will appear here.'}</p> : (
        <div className="overflow-x-auto rounded-lg border border-border"><table className="w-full min-w-[820px] text-sm">
          <thead><tr className="border-b border-border text-left"><th className="w-8 p-2" /><th className="p-2">When</th><th className="p-2">Admin</th><th className="p-2">Action</th><th className="p-2">Record</th><th className="p-2">Summary</th></tr></thead>
          <tbody>{shown.map(r => { const isOpen = open === r.id; const d = isOpen ? diffRows(r.before as Record<string, unknown> | null, r.after as Record<string, unknown> | null) : []; return (
            <Fragment key={r.id}>
              <tr className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/40" onClick={() => setOpen(isOpen ? null : r.id)}>
                <td className="p-2"><button type="button" aria-expanded={isOpen} aria-label="Show changes" className="grid place-items-center">{isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button></td>
                <td className="p-2 whitespace-nowrap" title={ago(r.created_at)}>{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-2">{emails[r.admin_id] ?? r.admin_id.slice(0, 8)}</td>
                <td className={`p-2 font-medium ${tone(r.action)}`}>{r.action}</td>
                <td className="p-2"><span className="text-muted-foreground">{r.target_table}</span>{r.target_id && <button type="button" className="ml-1 inline-flex items-center gap-1 text-xs underline-offset-2 hover:underline" onClick={e => { e.stopPropagation(); void navigator.clipboard.writeText(r.target_id).then(() => toast.success('Id copied')); }}>{r.target_id.slice(0, 8)}<Copy aria-hidden className="h-3 w-3" /></button>}</td>
                <td className="p-2">{r.summary}</td>
              </tr>
              {isOpen && <tr className="border-b border-border bg-muted/20"><td /><td colSpan={5} className="p-3">{d.length ? <table className="w-full text-xs"><thead><tr className="text-left text-muted-foreground"><th className="py-1 pr-3">Field</th><th className="py-1 pr-3">Before</th><th className="py-1">After</th></tr></thead><tbody>{d.map(x => <tr key={x.key} className="align-top"><td className="py-1 pr-3 font-medium">{x.key}</td><td className="max-w-xs break-words bg-destructive/10 px-2 py-1">{show(x.before)}</td><td className="max-w-xs break-words bg-primary/10 px-2 py-1">{show(x.after)}</td></tr>)}</tbody></table> : <p className="text-xs text-muted-foreground">No field-level changes recorded.</p>}</td></tr>}
            </Fragment>
          ); })}</tbody>
        </table></div>
      )}
      <p className="text-xs text-muted-foreground">Audit entries are permanent: nobody, including admins, can edit or delete them. Long texts (readings, scripts, newsletter bodies) are left out of the snapshot to keep private writing out of the log.</p>
    </section>
  );
}
