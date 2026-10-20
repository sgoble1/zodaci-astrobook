import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { confirmAction } from '@/components/common/ConfirmHost';
import { BOOK_VERSIONS, LULU_PRINT, money, versionOf } from '@/lib/books';

export type LuluJob = Tables<'lulu_print_jobs'>;
export type LuluStatus = {
  configured: boolean; connected: boolean; environment: 'sandbox' | 'production'; shippingLevel: string; contactEmail: string; problem?: string;
  webhook: { url: string; environment: string; registered_at: string; active?: boolean } | null;
};
type Quote = { edition: string; pages: number; shipping_level: string; environment: string; currency: string; print_cents: number | null; shipping_cents: number | null; fulfillment_cents: number; tax_cents: number | null; total_excl_tax_cents: number | null; total_cents: number | null };

const PRINT_VERSIONS = BOOK_VERSIONS.filter(v => v.format === 'print');
const FAILED = ['FAILED', 'REJECTED', 'CANCELED', 'ERROR'];
const CANCELLABLE = ['CREATED', 'UNPAID'];
const STATUS_TEXT: Record<string, string> = {
  SUBMITTING: 'Preparing files', CREATED: 'Received by Lulu', UNPAID: 'Waiting for payment in Lulu', PAYMENT_IN_PROGRESS: 'Payment in progress',
  PRODUCTION_DELAYED: 'Paid · 2-hour hold before printing', PRODUCTION_READY: 'Going to press', IN_PRODUCTION: 'Printing at Lulu', SHIPPED: 'Shipped by Lulu',
  DELIVERED: 'Delivered', REJECTED: 'Rejected by Lulu', CANCELED: 'Cancelled', ERROR: 'Lulu reported an error', FAILED: 'Not sent',
};
export const luluStatusText = (s: string) => STATUS_TEXT[s] ?? s.toLowerCase().replace(/_/g, ' ');

/** Calls the admin-only print function and surfaces its own error message. */
async function callLulu<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('lulu-print', { body });
  if (error || data?.error) {
    let message: string | undefined = data?.error;
    if (!message && error && 'context' in error && error.context instanceof Response) message = (await error.context.json().catch(() => null))?.error;
    throw new Error(message || 'Lulu could not be reached. Please retry.');
  }
  return data as T;
}

/** Lulu connection state plus every recorded print job, newest first. */
export function useLulu() {
  const [status, setStatus] = useState<LuluStatus | null>(null);
  const [statusError, setStatusError] = useState('');
  const [jobs, setJobs] = useState<LuluJob[]>([]);
  const load = useCallback(async () => {
    setStatusError('');
    const [s, j] = await Promise.all([
      callLulu<LuluStatus>({ action: 'status' }).catch((e: Error) => { setStatusError(e.message); return null; }),
      supabase.from('lulu_print_jobs').select('*').order('created_at', { ascending: false }).limit(300),
    ]);
    if (s) setStatus(s);
    if (!j.error) setJobs((j.data ?? []) as LuluJob[]);
  }, []);
  useEffect(() => { void load(); }, [load]);
  return { status, statusError, jobs, reload: load };
}

const envLabel = (env: string) => env === 'production' ? 'Lulu production · real printing' : 'Lulu sandbox · test jobs, nothing is printed';

export function LuluConnection({ status, statusError, onChanged, onUseQuote }: { status: LuluStatus | null; statusError: string; onChanged: () => void; onUseQuote: (edition: string, printCents: number, deliveryCents: number, source: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [edition, setEdition] = useState('classic');
  const [pages, setPages] = useState(() => String(Math.round((versionOf('classic')!.pages[0] + versionOf('classic')!.pages[1]) / 2)));
  const [addr, setAddr] = useState({ line1: '', city: '', state: '', postal_code: '' });
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState('');

  const pickEdition = (id: string) => { setEdition(id); const v = versionOf(id); if (v) setPages(String(Math.round((v.pages[0] + v.pages[1]) / 2))); setQuote(null); };
  const registerHook = async () => {
    setBusy(true);
    try { await callLulu({ action: 'register-webhook' }); toast.success('Lulu will now send status and tracking updates automatically'); onChanged(); }
    catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };
  const getQuote = async () => {
    setBusy(true); setQuoteError(''); setQuote(null);
    try { const r = await callLulu<{ quote: Quote }>({ action: 'quote', edition, pages: Number(pages), address: { ...addr, state: addr.state.toUpperCase(), country: 'US' } }); setQuote(r.quote); }
    catch (e) { setQuoteError((e as Error).message); }
    finally { setBusy(false); }
  };

  if (!status && !statusError) return <div role="status" aria-label="Checking the Lulu connection" className="h-20 animate-pulse rounded-lg bg-muted" />;
  return (
    <div className="rounded-lg border border-border p-4 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl">Lulu printing</h3>
          {statusError && <p role="alert" className="text-sm text-destructive">{statusError}</p>}
          {status && !status.configured && <p className="max-w-2xl text-sm text-muted-foreground">Lulu isn’t connected yet, so paid orders are sent by hand below. To automate printing, add your Lulu client key and secret (from your Lulu developer account). It starts in Lulu’s sandbox, where test jobs are never printed; switch to production when the test order looks right.</p>}
          {status?.configured && <p className="text-sm"><span className={status.environment === 'production' ? 'text-gold' : 'text-muted-foreground'}>{envLabel(status.environment)}</span>{' · '}{status.connected ? <span>Connected</span> : <span className="text-destructive">{status.problem ?? 'Not reachable'}</span>}{' · '}<span className="text-muted-foreground">Shipping: {status.shippingLevel.toLowerCase().replace(/_/g, ' ')}</span></p>}
        </div>
        <Button size="sm" variant="ghost" onClick={onChanged}>Recheck</Button>
      </div>
      {status?.configured && status.connected && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {status.webhook && status.webhook.environment === status.environment
            ? <span className="text-muted-foreground">Automatic status updates on since {new Date(status.webhook.registered_at).toLocaleDateString()}.</span>
            : <><span className="text-muted-foreground">Status and tracking update when you press Refresh on an order.</span><Button size="sm" variant="outline" disabled={busy} onClick={() => void registerHook()}>Turn on automatic updates</Button></>}
        </div>
      )}
      {status?.configured && status.connected && (
        <form className="space-y-3 border-t border-border pt-4" onSubmit={e => { e.preventDefault(); void getQuote(); }}>
          <div><h4 className="font-display text-lg">Live Lulu quote</h4><p className="text-sm text-muted-foreground">Price one copy to a US address, then use it as that version’s print and delivery cost.</p></div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="space-y-1"><Label htmlFor="lq-version">Version</Label><select id="lq-version" className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm" value={edition} onChange={e => pickEdition(e.target.value)}>{PRINT_VERSIONS.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
            <div className="space-y-1"><Label htmlFor="lq-pages">Interior pages</Label><Input id="lq-pages" type="number" min={LULU_PRINT[edition as keyof typeof LULU_PRINT]?.minPages ?? 24} max={800} value={pages} onChange={e => setPages(e.target.value)} required /></div>
            <div className="space-y-1 lg:col-span-2"><Label htmlFor="lq-street">Street</Label><Input id="lq-street" maxLength={30} value={addr.line1} onChange={e => setAddr(a => ({ ...a, line1: e.target.value }))} required /></div>
            <div className="space-y-1"><Label htmlFor="lq-city">City</Label><Input id="lq-city" maxLength={30} value={addr.city} onChange={e => setAddr(a => ({ ...a, city: e.target.value }))} required /></div>
            <div className="grid grid-cols-2 gap-2"><div className="space-y-1"><Label htmlFor="lq-state">State</Label><Input id="lq-state" maxLength={2} value={addr.state} onChange={e => setAddr(a => ({ ...a, state: e.target.value }))} required /></div><div className="space-y-1"><Label htmlFor="lq-zip">ZIP</Label><Input id="lq-zip" inputMode="numeric" maxLength={10} value={addr.postal_code} onChange={e => setAddr(a => ({ ...a, postal_code: e.target.value }))} required /></div></div>
          </div>
          <Button type="submit" size="sm" disabled={busy}>{busy ? 'Asking Lulu…' : 'Get Lulu quote'}</Button>
          {quoteError && <p role="alert" className="text-sm text-destructive">{quoteError}</p>}
          {quote && (
            <div className="rounded-md border border-border p-3 text-sm space-y-2" aria-live="polite">
              <p className="font-medium">{versionOf(quote.edition)?.name} · {quote.pages} pages · {quote.shipping_level.toLowerCase().replace(/_/g, ' ')}{quote.environment === 'sandbox' ? ' · sandbox prices' : ''}</p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-5">
                <div><dt className="text-muted-foreground">Print</dt><dd>{quote.print_cents != null ? money(quote.print_cents) : '—'}</dd></div>
                <div><dt className="text-muted-foreground">Shipping</dt><dd>{quote.shipping_cents != null ? money(quote.shipping_cents) : '—'}</dd></div>
                <div><dt className="text-muted-foreground">Fulfillment fee</dt><dd>{money(quote.fulfillment_cents)}</dd></div>
                <div><dt className="text-muted-foreground">Tax</dt><dd>{quote.tax_cents != null ? money(quote.tax_cents) : '—'}</dd></div>
                <div><dt className="text-muted-foreground">Total</dt><dd className="font-medium">{quote.total_cents != null ? money(quote.total_cents) : '—'}</dd></div>
              </dl>
              {quote.print_cents != null && quote.shipping_cents != null && <Button size="sm" variant="outline" onClick={() => { onUseQuote(quote.edition, quote.print_cents!, quote.shipping_cents! + quote.fulfillment_cents, `Lulu quote ${new Date().toISOString().slice(0, 10)}, ${quote.pages} pp, ${quote.shipping_level.toLowerCase()}`); toast.success('Quote copied into the cost table — press Save costs to keep it'); }}>Use as {versionOf(quote.edition)?.name} cost</Button>}
            </div>
          )}
        </form>
      )}
    </div>
  );
}

type OrderLite = { id: string; edition: string; status: string; payment_hold: string | null; environment?: string };
/** Per-order Lulu actions: preview the print files, send, refresh and cancel. */
export function LuluOrderActions({ order, status, jobs, onChanged }: { order: OrderLite; status: LuluStatus | null; jobs: LuluJob[]; onChanged: () => void }) {
  const [busy, setBusy] = useState('');
  const mine = jobs.filter(j => j.order_id === order.id && (!status || j.environment === status.environment));
  const active = mine.find(j => !FAILED.includes(j.status));
  const lastFailed = !active ? mine.find(j => FAILED.includes(j.status)) : undefined;
  const ready = !!status?.configured && status.connected;
  const printable = order.edition in LULU_PRINT && ['paid', 'print_brief_sent'].includes(order.status) && !order.payment_hold;

  const run = async (label: string, fn: () => Promise<void>) => { setBusy(label); try { await fn(); } catch (e) { toast.error((e as Error).message); } finally { setBusy(''); onChanged(); } };
  const proof = () => run('proof', async () => {
    const r = await callLulu<{ interiorUrl: string; coverUrl: string; pages: number; spinePt: number }>({ action: 'proof', orderId: order.id });
    window.open(r.coverUrl, '_blank', 'noopener'); window.open(r.interiorUrl, '_blank', 'noopener');
    toast.success(`Print files ready: ${r.pages}-page interior and full cover (spine ${(r.spinePt / 72).toFixed(2)} in). If a tab was blocked, allow pop-ups and retry.`);
  });
  const submit = () => run('submit', async () => {
    const real = status?.environment === 'production';
    const ok = await confirmAction(real ? `Send order ${order.id.slice(0, 8)} to Lulu for real printing? Lulu holds it for 2 hours, during which an unpaid job can still be cancelled.` : `Send order ${order.id.slice(0, 8)} to the Lulu sandbox as a test job? Nothing will be printed and the order stage won’t change.`, real ? 'Send to Lulu' : 'Send test job');
    if (!ok) return;
    const r = await callLulu<{ luluJobId: number; note?: string }>({ action: 'submit', orderId: order.id });
    toast.success(`Lulu job ${r.luluJobId} created${r.note ? ` — ${r.note}` : ''}`);
  });
  const sync = (job: LuluJob) => run('sync', async () => { const r = await callLulu<{ status: string; note?: string }>({ action: 'sync', jobId: job.id }); toast.success(`Lulu: ${luluStatusText(r.status)}${r.note ? ` — ${r.note}` : ''}`); });
  const cancel = (job: LuluJob) => run('cancel', async () => {
    if (!(await confirmAction(`Cancel Lulu job ${job.lulu_job_id}? The order goes back to Paid so it can be sent again.`, 'Cancel print job'))) return;
    await callLulu({ action: 'cancel', jobId: job.id }); toast.success('Lulu job cancelled');
  });

  return (
    <div className="space-y-1">
      {active && (
        <div className="text-xs">
          <p><span className="text-gold">{luluStatusText(active.status)}</span>{active.lulu_job_id ? ` · job ${active.lulu_job_id}` : ''}{active.environment === 'sandbox' ? ' · test' : ''}</p>
          {active.status_message && <p className="text-muted-foreground">{active.status_message}</p>}
          {active.arrival_min && active.arrival_max && <p className="text-muted-foreground">Lulu estimate: arrives {new Date(`${active.arrival_min}T12:00:00`).toLocaleDateString()}–{new Date(`${active.arrival_max}T12:00:00`).toLocaleDateString()}</p>}
          {active.tracking_url && <a className="text-primary underline underline-offset-4" href={active.tracking_url} target="_blank" rel="noopener noreferrer">Track {active.carrier_name || 'parcel'}</a>}
        </div>
      )}
      {lastFailed && <p className="text-xs text-destructive">Last attempt: {luluStatusText(lastFailed.status)}{lastFailed.status_message ? ` — ${lastFailed.status_message}` : ''}</p>}
      {ready && (
        <div className="flex flex-wrap gap-1">
          {printable && !active && <Button size="sm" variant="outline" disabled={!!busy} onClick={() => void proof()}>{busy === 'proof' ? 'Preparing…' : 'Preview print files'}</Button>}
          {printable && !active && <Button size="sm" disabled={!!busy} onClick={() => void submit()}>{busy === 'submit' ? 'Sending…' : status?.environment === 'production' ? 'Send to Lulu' : 'Send test job'}</Button>}
          {active?.lulu_job_id && <Button size="sm" variant="ghost" disabled={!!busy} onClick={() => void sync(active)}>{busy === 'sync' ? 'Checking…' : 'Refresh'}</Button>}
          {active && CANCELLABLE.includes(active.status) && <Button size="sm" variant="ghost" disabled={!!busy} onClick={() => void cancel(active)}>Cancel job</Button>}
        </div>
      )}
    </div>
  );
}
