import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BOOK_COSTING, BOOK_VERSIONS, LULU_PRINT, bookBase, editionName, luluListCents, money, versionOf, type AnyEdition, type BookFormat } from '@/lib/books';
import { LuluConnection, LuluOrderActions, useLulu } from '@/components/admin/LuluPrint';
import { downloadText, nextStage, ordersCsv, stageError, statusLabel } from '@/lib/bookFulfillment';

type Order = { id: string; edition: string; format: string; environment: string; status: string; payment_hold: string | null; cover_style: string; manuscript_pages: number | null; payment_total_cents: number | null; payment_tax_cents: number | null; extra_sections: unknown; shipping_address: Record<string, string> | null; created_at: string; tracking_number: string; carrier: string; shipped_at: string | null; lulu_reference: string; gift: boolean; gift_message: string };
type Cost = { edition: AnyEdition; print_cents: number; delivery_cents: number; fees_cents: number; quote_source: string; updated_at?: string };

const EDITIONS: AnyEdition[] = ['digital', 'pocket', 'classic', 'signature', 'linen'];
const LEGACY: AnyEdition[] = ['standard', 'expanded'];
const fallback = (): Record<string, Cost> => Object.fromEntries(BOOK_COSTING.map(r => [r.edition, { edition: r.edition, print_cents: r.print, delivery_cents: r.shipping, fees_cents: r.fees, quote_source: 'estimate' }]));
const totalCost = (c?: Cost) => c ? c.print_cents + c.delivery_cents + c.fees_cents : 0;
const toCents = (v: string) => Math.max(0, Math.round(Number(v || 0) * 100));

/** Admin view of printed AstroBook orders with editable Lulu print, delivery and fee costs per version. */
export function PrintOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');
  const [costs, setCosts] = useState<Record<string, Cost>>(fallback);
  const [draft, setDraft] = useState<Record<string, Record<string, string>>>({});
  const [refs, setRefs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showLegacy, setShowLegacy] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const lulu = useLulu();
  const automated = !!lulu.status?.configured && lulu.status.connected;

  const load = async () => {
    setError('');
    const [o, c] = await Promise.all([
      supabase.from('book_orders').select('id,edition,format,environment,status,payment_hold,cover_style,manuscript_pages,payment_total_cents,payment_tax_cents,extra_sections,shipping_address,created_at,tracking_number,carrier,shipped_at,lulu_reference,gift,gift_message').eq('format', 'print').in('environment', showTest ? ['live', 'sandbox'] : ['live']).order('created_at', { ascending: false }).limit(100),
      supabase.from('book_costing').select('*'),
    ]);
    if (o.error) { setError('Print orders could not be loaded.'); setOrders([]); return; }
    setOrders((o.data ?? []) as Order[]);
    if (c.data?.length) { const next = fallback(); for (const row of c.data as Cost[]) next[row.edition] = row; setCosts(next); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [showTest]);

  const field = (ed: string, key: keyof Cost) => draft[ed]?.[key] ?? (typeof costs[ed]?.[key] === 'number' ? ((costs[ed][key] as number) / 100).toFixed(2) : String(costs[ed]?.[key] ?? ''));
  const setField = (ed: string, key: string, v: string) => setDraft(d => ({ ...d, [ed]: { ...d[ed], [key]: v } }));
  const rows = showLegacy ? [...EDITIONS, ...LEGACY] : EDITIONS;

  const useQuote = (edition: string, printCents: number, deliveryCents: number, source: string) => {
    setDraft(d => ({ ...d, [edition]: { ...d[edition], print_cents: (printCents / 100).toFixed(2), delivery_cents: (deliveryCents / 100).toFixed(2), quote_source: source.slice(0, 200) } }));
  };
  const save = async () => {
    setSaving(true);
    const out = rows.map(ed => ({ edition: ed, print_cents: toCents(field(ed, 'print_cents')), delivery_cents: toCents(field(ed, 'delivery_cents')), fees_cents: toCents(field(ed, 'fees_cents')), quote_source: field(ed, 'quote_source').slice(0, 200) || 'estimate', updated_at: new Date().toISOString() }));
    const { error: err } = await supabase.from('book_costing').upsert(out);
    setSaving(false);
    if (err) { toast.error("Couldn't save costs — please try again"); return; }
    setCosts(c => ({ ...c, ...Object.fromEntries(out.map(r => [r.edition, r])) })); setDraft({});
    toast.success('Print costs saved — margins updated');
  };
  const saveRef = async (o: Order) => {
    const value = (refs[o.id] ?? o.lulu_reference).trim().slice(0, 120);
    const { error: err } = await supabase.from('book_orders').update({ lulu_reference: value, updated_at: new Date().toISOString() }).eq('id', o.id);
    if (err) { toast.error("Couldn't save the print job reference"); return; }
    toast.success('Print job reference saved'); void load();
  };

  const advance = async (o: Order, next: string) => {
    const bad = stageError(o.status, next, o.format, { carrier: o.carrier, tracking: o.tracking_number });
    if (bad) { toast.error(bad); return; }
    const { data, error: err } = await supabase.from('book_orders').update({ status: next, updated_at: new Date().toISOString() }).eq('id', o.id).eq('status', o.status).select('id');
    if (err || !data?.length) { toast.error(err?.message || 'This order changed — reload and try again'); return; }
    toast.success(`Order ${o.id.slice(0, 8)} moved to ${statusLabel(next)}`); void load();
  };
  const exportCsv = () => downloadText(`astrobook-print-orders-${new Date().toISOString().slice(0, 10)}.csv`, ordersCsv(orders ?? [], (e, f) => editionName(e, f as BookFormat)));

  if (!orders) return <div role="status" aria-label="Loading print orders" className="h-24 animate-pulse rounded bg-muted" />;
  const counts = orders.reduce<Record<string, number>>((m, o) => { m[o.status] = (m[o.status] ?? 0) + 1; return m; }, {});
  const brief = (o: Order) => {
    const a = o.shipping_address ?? {}; const v = versionOf(o.edition);
    return [`Zodaci AstroBook order ${o.id.slice(0, 8)}`, `Version: ${editionName(o.edition, 'print')}`, `Lulu product: ${v?.lulu ?? 'US Trade 6×9 · Premium Color · Paperback Perfect Bound (earlier edition)'}`, `Pages: ${o.manuscript_pages ?? 'pending'}`, `Cover: ${o.cover_style}`, `Quantity: 1`, ...(o.gift ? [`Gift: yes${o.gift_message ? ` · message card: "${o.gift_message}"` : ''}`] : []), `Ship to: ${[a.name, a.line1, a.line2, a.city, a.state, a.postal_code, a.country].filter(Boolean).join(', ')}`].join('\n');
  };
  const copy = async (o: Order) => { try { await navigator.clipboard.writeText(brief(o)); toast.success('Print brief copied — paste it into your Lulu print job'); } catch { toast.error('Copy failed — select the brief text instead'); } };

  return (
    <section className="space-y-6">
      <LuluConnection status={lulu.status} statusError={lulu.statusError} onChanged={() => void lulu.reload()} onUseQuote={useQuote} />
      <div className="rounded-lg border border-border p-4 space-y-3">
        <div><h3 className="font-display text-xl">Print costs & margin</h3><p className="text-sm text-muted-foreground">Enter the real Lulu print cost, shipping and payment fees per copy{automated ? ', or fill them from a live Lulu quote above' : ''}. Margins here and on every order use these numbers. Target margin is about 40%. “Lulu list print” is Lulu’s published price sheet for comparison only.</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-sm">
          <thead><tr className="text-left border-b border-border"><th className="p-2">Version</th><th className="p-2">Price</th><th className="p-2">Print ($)</th><th className="p-2">Delivery ($)</th><th className="p-2">Payment fees ($)</th><th className="p-2">Quote source</th><th className="p-2">Total cost</th><th className="p-2">Margin</th><th className="p-2" title="Lulu's published list print price at this version's typical page count, before shipping, fulfillment fee and tax">Lulu list print</th></tr></thead>
          <tbody>{rows.map(ed => {
            const price = bookBase(ed, ed === 'digital' ? 'digital' : 'print');
            const live: Cost = { edition: ed, print_cents: toCents(field(ed, 'print_cents')), delivery_cents: toCents(field(ed, 'delivery_cents')), fees_cents: toCents(field(ed, 'fees_cents')), quote_source: '' };
            const cost = totalCost(live); const margin = price - cost; const pct = price ? Math.round((margin / price) * 100) : 0;
            return <tr key={ed} className="border-b border-border last:border-0">
              <td className="p-2">{editionName(ed, 'print')}</td><td className="p-2">{money(price)}</td>
              {(['print_cents', 'delivery_cents', 'fees_cents'] as const).map(k => <td key={k} className="p-2"><Input aria-label={`${ed} ${k.replace('_cents', '')} cost`} type="number" min={0} step="0.01" className="w-24" value={field(ed, k)} onChange={e => setField(ed, k, e.target.value)} /></td>)}
              <td className="p-2"><Input aria-label={`${ed} quote source`} className="w-48" value={field(ed, 'quote_source')} onChange={e => setField(ed, 'quote_source', e.target.value)} /></td>
              <td className="p-2">{money(cost)}</td>
              <td className={`p-2 font-medium ${margin < 0 ? 'text-destructive' : pct < 35 ? 'text-gold' : ''}`}>{money(margin)} ({pct}%)</td>
              <td className="p-2 text-muted-foreground">{(() => { const v = versionOf(ed); const pages = v ? Math.round((v.pages[0] + v.pages[1]) / 2) : 0; const list = v ? luluListCents(ed, pages) : null; return list != null ? `${money(list)} · ${pages} pp` : '—'; })()}</td>
            </tr>;
          })}</tbody>
        </table></div>
        <div className="flex flex-wrap gap-3"><Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save costs'}</Button><Button variant="ghost" onClick={() => setShowLegacy(x => !x)}>{showLegacy ? 'Hide earlier editions' : 'Show earlier Standard/Expanded editions'}</Button><a href="https://www.lulu.com/pricing" target="_blank" rel="noreferrer" className="self-center text-sm text-primary underline underline-offset-4">Open the Lulu price calculator</a></div>
      </div>

      <div className="rounded-lg border border-border p-4"><h3 className="font-display text-xl">Lulu specification per version</h3><ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">{BOOK_VERSIONS.filter(v => v.lulu).map(v => <li key={v.id}><span className="text-gold">{v.name}:</span> {v.lulu}{LULU_PRINT[v.id as keyof typeof LULU_PRINT] && <span className="block font-mono text-xs text-muted-foreground">{LULU_PRINT[v.id as keyof typeof LULU_PRINT].sku}</span>}</li>)}</ul></div>

      <div className="flex flex-wrap gap-2">{Object.entries(counts).map(([s, n]) => <span key={s} className="rounded-full border border-border px-3 py-1 text-sm">{statusLabel(s)}: {n}</span>)}{orders.length > 0 && <Button size="sm" variant="outline" onClick={exportCsv}>Export CSV</Button>}{automated && lulu.status?.environment === 'sandbox' && <Button size="sm" variant="ghost" onClick={() => setShowTest(x => !x)}>{showTest ? 'Hide test-payment orders' : 'Include test-payment orders'}</Button>}{!orders.length && <p className="text-muted-foreground">No live printed book orders yet.</p>}</div>
      {error && <p role="alert" className="text-destructive text-sm">{error} <Button variant="link" className="h-auto p-0" onClick={() => void load()}>Retry</Button></p>}
      {automated
        ? <p className="text-sm text-muted-foreground">Preview the print files, then send each paid order to Lulu. Lulu holds new jobs for 2 hours before printing; an unpaid job can be cancelled in that time. {lulu.status?.environment === 'production' ? 'Printing, shipping and tracking then update the order automatically (carriers other than USPS, UPS or FedEx are added on the Dispatch desk).' : 'Sandbox jobs are tests: they are never printed and never change the order stage.'} The printed brief stays available for sending by hand.</p>
        : <p className="text-sm text-muted-foreground">Until Lulu account keys are connected, each paid order is sent by hand: download the final PDF from <Link to="/orders?all=1" className="underline">order management</Link>, copy the brief into a Lulu print job, then save Lulu’s job reference and mark it sent to the printer. Move it through printing and quality check here, then add tracking on the Dispatch desk. Every stage change is recorded in the order’s history.</p>}
      <div className="overflow-x-auto rounded-lg border border-border"><table className="w-full min-w-[900px] text-sm">
        <thead><tr className="border-b border-border text-left"><th className="p-3">Date</th><th className="p-3">Version</th><th className="p-3">Pages</th><th className="p-3">Paid</th><th className="p-3">Cost</th><th className="p-3">Margin</th><th className="p-3">Status</th><th className="p-3">Lulu job</th><th className="p-3">Tracking</th><th className="p-3" /></tr></thead>
        <tbody>{orders.map(o => { const cost = totalCost(costs[o.edition] ?? costs.standard); const paid = o.payment_total_cents; return <tr key={o.id} className="border-b border-border last:border-0">
          <td className="p-3">{new Date(o.created_at).toLocaleDateString()}</td><td className="p-3">{editionName(o.edition, 'print')}{o.gift ? ' · gift' : ''}{o.environment === 'sandbox' ? <span className="block text-xs text-muted-foreground">Test payment</span> : null}</td><td className="p-3">{o.manuscript_pages ?? '—'}</td><td className="p-3">{paid != null ? money(paid) : '—'}</td><td className="p-3">{money(cost)}</td><td className="p-3">{paid != null ? money(paid - cost) : '—'}</td>
          <td className="p-3">{o.payment_hold ? <span className="text-destructive">Payment review</span> : statusLabel(o.status)}</td>
          <td className="p-3"><div className="flex gap-1"><Input aria-label={`Lulu job reference for order ${o.id.slice(0, 8)}`} className="h-8 w-28" maxLength={120} value={refs[o.id] ?? o.lulu_reference} onChange={e => setRefs(r => ({ ...r, [o.id]: e.target.value }))} /><Button size="sm" variant="ghost" onClick={() => void saveRef(o)} disabled={(refs[o.id] ?? o.lulu_reference) === o.lulu_reference}>Save</Button></div></td>
          <td className="p-3">{o.tracking_number || '—'}</td>
          <td className="p-3"><div className="flex flex-col gap-1"><LuluOrderActions order={o} status={lulu.status} jobs={lulu.jobs} onChanged={() => { void lulu.reload(); void load(); }} /><Button size="sm" variant="outline" onClick={() => void copy(o)} disabled={!!o.payment_hold}>Copy print brief</Button>{(() => { const next = nextStage(o.status, o.format); return next && next !== 'shipped' && !o.payment_hold ? <Button size="sm" variant="ghost" onClick={() => void advance(o, next)}>Mark {statusLabel(next).toLowerCase()}</Button> : next === 'shipped' ? <Button asChild size="sm" variant="ghost"><Link to="/dispatch">Ship</Link></Button> : null; })()}</div></td>
        </tr>; })}</tbody>
      </table></div>
    </section>
  );
}
