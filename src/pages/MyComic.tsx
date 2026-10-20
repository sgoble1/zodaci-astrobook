import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, PauseCircle, PlayCircle, Truck, BookOpen, Download } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { AuthGate } from '@/components/common/AuthGate';
import { LoadError } from '@/components/common/LoadError';
import { ComicPageView } from '@/components/comic/ComicPageView';
import { getStripeEnvironment } from '@/lib/stripe';
import { useMyBirth, toChartInput } from '@/lib/myBirth';
import { computeChart } from '@/lib/astro';
import { buildComicIssue, COMIC_PLANS, monthKey, monthLabel, nextIssueMonth, shipBy, type ComicIssue, type ComicPlan } from '@/lib/comic';
import { usePageMeta } from '@/hooks/usePageMeta';
import type { Database } from '@/integrations/supabase/types';

type Sub = Database['public']['Tables']['comic_subscriptions']['Row'];
type Issue = Database['public']['Tables']['comic_issues']['Row'];
type Address = { name: string; line1: string; line2: string; city: string; state: string; postal_code: string; country: string };
const EMPTY: Address = { name: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'US' };
const addressSchema = z.object({ name: z.string().trim().min(1, 'Enter the recipient’s name').max(100), line1: z.string().trim().min(1, 'Enter a street address').max(120), line2: z.string().trim().max(120), city: z.string().trim().min(1, 'Enter a city').max(80), state: z.string().trim().regex(/^[A-Za-z]{2}$/, 'Use the two-letter state code'), postal_code: z.string().trim().regex(/^\d{5}(-\d{4})?$/, 'Enter a 5-digit ZIP code'), country: z.literal('US') });
const envOrLive = () => { try { return getStripeEnvironment(); } catch { return 'live' as const; } };
const fmt = (d: string | Date) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const trackingUrl = (carrier: string, n: string) => /usps/i.test(carrier) ? `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(n)}` : /ups/i.test(carrier) ? `https://www.ups.com/track?tracknum=${encodeURIComponent(n)}` : /fedex/i.test(carrier) ? `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(n)}` : null;

/** My AstroComic: subscription, delivery address, pause/skip, issue archive and next-issue preview. */
export default function MyComic() {
  usePageMeta('My AstroComic — Zodaci', 'Manage your AstroComic subscription, delivery address and issues.');
  return <AuthGate what="manage your AstroComic">{() => <MyComicInner />}</AuthGate>;
}

function MyComicInner() {
  const [params, setParams] = useSearchParams();
  const returning = !!params.get('session_id');
  const birth = useMyBirth();
  const [subs, setSubs] = useState<Sub[] | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [failed, setFailed] = useState(false);
  const [waited, setWaited] = useState(0);
  const load = useCallback(async () => {
    const env = envOrLive();
    const [s, i] = await Promise.all([
      supabase.from('comic_subscriptions').select('*').eq('environment', env).neq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('comic_issues').select('*').order('issue_month', { ascending: false }),
    ]);
    if (s.error || i.error) { setFailed(true); return; }
    setFailed(false); setSubs(s.data ?? []); setIssues(i.data ?? []);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const current = subs?.find(s => ['active', 'paused', 'past_due'].includes(s.status)) ?? null;
  // After checkout, wait for the verified payment to activate the subscription.
  useEffect(() => {
    if (!returning || current || waited > 20) return;
    const t = window.setTimeout(() => { setWaited(w => w + 1); void load(); }, 3000);
    return () => clearTimeout(t);
  }, [returning, current, waited, load]);
  useEffect(() => { if (returning && current) { toast.success('Your AstroComic is confirmed.'); const n = new URLSearchParams(params); n.delete('session_id'); setParams(n, { replace: true }); } }, [returning, current?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (failed) return <LoadError what="your AstroComic" onRetry={() => void load()} />;
  if (!subs) return <div role="status" className="h-40 animate-pulse rounded-lg bg-muted" aria-label="Loading your AstroComic" />;
  return (
    <article className="mx-auto max-w-5xl space-y-12">
      <header><p className="font-smallcaps text-xs text-gold">AstroComic</p><h1 className="mt-2 font-display text-4xl sm:text-5xl">My AstroComic</h1></header>
      {returning && !current && <p role="status" className="parchment flex items-center gap-3 p-4">{waited > 20 ? 'Confirmation is taking longer than expected. Please don’t pay again — check back in a few minutes.' : <><Loader2 aria-hidden className="h-4 w-4 animate-spin" />Confirming your payment…</>}</p>}
      {current ? <SubscriptionPanel key={current.id} sub={current} issues={issues} onChange={load} /> : !returning && (
        <section className="vellum p-6 sm:p-8"><h2 className="font-display text-2xl">No AstroComic yet</h2><p className="mt-2 text-muted-foreground">A personalized 24-page comic each month, printed and mailed to you.</p><Button asChild className="mt-5"><Link to="/astrocomic">See plans</Link></Button></section>
      )}
      <Archive issues={issues} />
      {birth && <NextPreview birthName={birth.name} chartInput={toChartInput(birth)} month={current ? nextIssueMonth({ ...current, plan: current.plan as ComicPlan }, issues.filter(i => i.subscription_id === current.id && i.status === 'shipped').map(i => i.issue_month)) : null} />}
      {birth === null && <p className="text-sm text-muted-foreground">Save your birth details on <Link to="/start" className="underline">your chart</Link> so each issue can be drawn from it.</p>}
      {subs.filter(s => !['active', 'paused', 'past_due'].includes(s.status)).length > 0 && <section><h2 className="text-lg">Earlier plans</h2><ul className="mt-3 space-y-1 text-sm text-muted-foreground">{subs.filter(s => !['active', 'paused', 'past_due'].includes(s.status)).map(s => <li key={s.id}>{COMIC_PLANS[s.plan as ComicPlan]?.name ?? s.plan} · {s.status} · since {fmt(s.created_at)}</li>)}</ul></section>}
    </article>
  );
}

function SubscriptionPanel({ sub, issues, onChange }: { sub: Sub; issues: Issue[]; onChange: () => Promise<void> }) {
  const plan = COMIC_PLANS[sub.plan as ComicPlan];
  const shipped = issues.filter(i => i.subscription_id === sub.id && i.status === 'shipped').map(i => i.issue_month);
  const next = nextIssueMonth({ ...sub, plan: sub.plan as ComicPlan }, shipped);
  const [addr, setAddr] = useState<Address>({ ...EMPTY, ...(sub.shipping_address as Partial<Address>) });
  const [addrError, setAddrError] = useState('');
  const [busy, setBusy] = useState('');
  const upcoming = useMemo(() => Array.from({ length: 6 }, (_, i) => { const n = new Date(); return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() + 1 + i, 1)); }), []);
  const [skip, setSkip] = useState<string[]>(sub.skip_months ?? []);
  const save = async (patch: Partial<Sub>, label: string) => {
    setBusy(label);
    const { error } = await supabase.from('comic_subscriptions').update(patch).eq('id', sub.id);
    setBusy('');
    if (error) { toast.error(error.message || 'Could not save that change.'); return false; }
    toast.success(label); await onChange(); return true;
  };
  const saveAddress = async () => {
    const parsed = addressSchema.safeParse({ ...addr, state: addr.state.toUpperCase() });
    if (!parsed.success) { setAddrError(parsed.error.issues[0].message); return; }
    setAddrError('');
    await save({ shipping_address: parsed.data }, 'Delivery address saved');
  };
  const pause = (months: number) => { const d = new Date(); d.setUTCMonth(d.getUTCMonth() + months); const cap = new Date(Date.now() + 91 * 864e5); const until = d > cap ? cap : d; void save({ paused_until: until.toISOString().slice(0, 10) }, `Paused until ${fmt(until)}`); };
  const portal = async () => {
    setBusy('portal');
    const { data, error } = await supabase.functions.invoke('customer-portal', { body: { returnUrl: window.location.href, environment: envOrLive() } });
    setBusy('');
    if (error || !data?.url) { toast.error(data?.error || 'Could not open billing right now.'); return; }
    window.location.href = data.url;
  };
  const paused = sub.paused_until && new Date(sub.paused_until + 'T00:00:00Z') >= new Date();
  return (
    <section aria-labelledby="sub-h" className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="vellum space-y-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="sub-h" className="font-display text-2xl">{plan?.name ?? sub.plan} · {plan?.label}</h2><p className="mt-1 text-sm text-muted-foreground">Since {fmt(sub.created_at)}{sub.environment === 'sandbox' ? ' · Test payment' : ''}</p></div><span className="rounded-full border border-border px-3 py-1 text-xs capitalize">{paused ? 'Paused' : sub.status.replace('_', ' ')}</span></div>
        {sub.status === 'past_due' && <p role="alert" className="text-sm text-destructive">Your last payment didn’t go through. Update your card so the next issue can ship.</p>}
        <div className="parchment p-4"><p className="text-sm text-muted-foreground">Next issue</p><p className="mt-1 font-display text-xl">{next ? `${monthLabel(next)} · ships by ${fmt(shipBy(next))}` : sub.plan === 'single' ? 'Your single issue has shipped' : 'No further issues scheduled'}</p>{sub.current_period_end && sub.plan !== 'single' && <p className="mt-1 text-xs text-muted-foreground">{sub.cancel_at_period_end ? 'Ends' : 'Renews'} {fmt(sub.current_period_end)}</p>}</div>
        {sub.plan !== 'single' && <div className="space-y-3">
          <h3 className="text-lg">Pause or skip</h3>
          {paused ? <div className="flex flex-wrap items-center gap-3"><p className="text-sm">Paused until {fmt(sub.paused_until + 'T00:00:00Z')}.</p><Button size="sm" variant="outline" disabled={!!busy} onClick={() => void save({ paused_until: null }, 'Deliveries resumed')}><PlayCircle className="h-4 w-4" />Resume now</Button></div>
            : <div className="flex flex-wrap gap-2">{[1, 2, 3].map(m => <Button key={m} size="sm" variant="outline" disabled={!!busy} onClick={() => pause(m)}><PauseCircle className="h-4 w-4" />Pause {m} month{m > 1 ? 's' : ''}</Button>)}</div>}
          <fieldset className="grid grid-cols-2 gap-2 sm:grid-cols-3"><legend className="mb-2 text-sm text-muted-foreground">Skip months (up to six)</legend>{upcoming.map(m => { const k = monthKey(m); return <label key={k} className="flex items-center gap-2 text-sm"><Checkbox checked={skip.includes(k)} onCheckedChange={v => setSkip(s => v ? [...s, k].slice(0, 6) : s.filter(x => x !== k))} />{monthLabel(m)}</label>; })}</fieldset>
          <Button size="sm" disabled={!!busy || JSON.stringify([...skip].sort()) === JSON.stringify([...(sub.skip_months ?? [])].sort())} onClick={() => void save({ skip_months: skip }, 'Skipped months saved')}>Save skipped months</Button>
          <p className="text-xs text-muted-foreground">Billing continues during a pause or skipped month; your issue for that month is simply not printed. To stop billing, cancel below.</p>
        </div>}
        <div className="flex flex-wrap gap-2 border-t border-border pt-4"><Button variant="outline" disabled={busy === 'portal'} onClick={() => void portal()}>{busy === 'portal' ? 'Opening…' : 'Manage billing or cancel'}</Button><Button asChild variant="ghost"><Link to="/referrals">Invite a friend</Link></Button></div>
      </div>
      <form className="vellum space-y-3 p-6" onSubmit={e => { e.preventDefault(); void saveAddress(); }} aria-labelledby="addr-h">
        <h2 id="addr-h" className="font-display text-2xl">Delivery address</h2>
        <p className="text-sm text-muted-foreground">US addresses only. Changes apply from the next print run.</p>
        {(['name', 'line1', 'line2', 'city'] as const).map(k => <div key={k}><label htmlFor={`addr-${k}`} className="text-sm">{{ name: 'Recipient name', line1: 'Street address', line2: 'Apartment, suite (optional)', city: 'City' }[k]}</label><Input id={`addr-${k}`} value={addr[k]} maxLength={120} autoComplete={{ name: 'name', line1: 'address-line1', line2: 'address-line2', city: 'address-level2' }[k]} onChange={e => setAddr(a => ({ ...a, [k]: e.target.value }))} /></div>)}
        <div className="grid grid-cols-2 gap-3"><div><label htmlFor="addr-state" className="text-sm">State</label><Input id="addr-state" value={addr.state} maxLength={2} autoComplete="address-level1" onChange={e => setAddr(a => ({ ...a, state: e.target.value.toUpperCase() }))} /></div><div><label htmlFor="addr-zip" className="text-sm">ZIP</label><Input id="addr-zip" value={addr.postal_code} maxLength={10} inputMode="numeric" autoComplete="postal-code" onChange={e => setAddr(a => ({ ...a, postal_code: e.target.value }))} /></div></div>
        {addrError && <p role="alert" className="text-sm text-destructive">{addrError}</p>}
        <Button type="submit" disabled={!!busy}>{busy === 'Delivery address saved' ? 'Saving…' : 'Save address'}</Button>
      </form>
    </section>
  );
}

type IssueArt = { panels: Record<string, string>; pdf: string | null };
const RELEASED = ['approved', 'printing', 'shipped'];

function Archive({ issues }: { issues: Issue[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [art, setArt] = useState<Record<string, IssueArt | 'loading' | 'failed'>>({});
  // Illustrated pages and the PDF come as short-lived private links, only for this member's released issues.
  const fetchArt = async (i: Issue) => {
    setArt(a => ({ ...a, [i.id]: 'loading' }));
    const { data, error } = await supabase.functions.invoke('comic-art', { body: { action: 'reader', issueId: i.id } });
    setArt(a => ({ ...a, [i.id]: error || !data?.panels ? 'failed' : { panels: data.panels, pdf: data.pdf ?? null } }));
  };
  const openIssue = (i: Issue) => {
    if (open === i.id) { setOpen(null); return; }
    setOpen(i.id);
    if (RELEASED.includes(i.status) && (!art[i.id] || art[i.id] === 'failed')) void fetchArt(i);
  };
  if (!issues.length) return <section aria-labelledby="arch-h"><h2 id="arch-h" className="font-display text-2xl">Issue archive</h2><p className="mt-2 text-sm text-muted-foreground">Approved issues and shipment tracking appear here.</p></section>;
  return (
    <section aria-labelledby="arch-h" className="space-y-4">
      <h2 id="arch-h" className="font-display text-2xl">Issue archive</h2>
      <ul className="divide-y divide-border border-y border-border">{issues.map(i => { const url = i.tracking_number ? trackingUrl(i.carrier, i.tracking_number) : null; const script = i.script as unknown as ComicIssue; const a = art[i.id]; const ready = a && typeof a === 'object' ? a : null; const illustrated = ready ? Object.keys(ready.panels).length > 0 : false; return (
        <li key={i.id} className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">Issue {i.issue_number} · {monthLabel(new Date(i.issue_month + 'T00:00:00Z'))}</p><p className="text-sm text-muted-foreground">{i.title || script?.title}</p></div><div className="flex flex-wrap items-center gap-2"><span className="text-xs capitalize text-gold">{i.status}</span>{script?.pages?.length ? <Button size="sm" variant="outline" aria-expanded={open === i.id} onClick={() => openIssue(i)}><BookOpen className="h-4 w-4" />{open === i.id ? 'Close' : 'Read issue'}</Button> : null}{open === i.id && ready?.pdf && <Button size="sm" variant="ghost" asChild><a href={ready.pdf}><Download className="h-4 w-4" />Digital copy (PDF)</a></Button>}</div></div>
          {i.status === 'shipped' && i.tracking_number && <p className="mt-2 flex items-center gap-2 text-sm"><Truck aria-hidden className="h-4 w-4" />{i.carrier || 'Carrier'} · {url ? <a href={url} target="_blank" rel="noopener noreferrer" className="underline">{i.tracking_number}</a> : i.tracking_number}{i.shipped_at && ` · shipped ${fmt(i.shipped_at + 'T12:00:00Z')}`}</p>}
          {open === i.id && <div className="mt-4 space-y-3">
            {a === 'loading' && <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Opening your issue…</p>}
            {a === 'failed' && <p role="alert" className="text-sm text-destructive">The illustrated pages could not be opened. <button type="button" className="underline" onClick={() => void fetchArt(i)}>Try again</button></p>}
            {ready && !illustrated && <p className="text-sm text-muted-foreground">The artwork for this issue is still being drawn — here is its page plan.</p>}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{script.pages.map(p => <ComicPageView key={p.n} page={p} compact art={ready?.panels} />)}</div>
          </div>}
        </li>
      ); })}</ul>
    </section>
  );
}

function NextPreview({ birthName, chartInput, month }: { birthName: string; chartInput: ReturnType<typeof toChartInput>; month: Date | null }) {
  const [all, setAll] = useState(false);
  const target = month ?? (() => { const n = new Date(); return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() + 1, 1)); })();
  const issue = useMemo(() => buildComicIssue(computeChart(chartInput), { reader: birthName || 'Reader', month: target, issueNumber: 1 }), [chartInput.date, chartInput.time, chartInput.lat, chartInput.lon, target.getTime()]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <section aria-labelledby="next-h" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="next-h" className="font-display text-2xl">Preview: {issue.monthLabel}</h2><p className="mt-1 text-sm text-muted-foreground">Planned from your chart and that month’s sky: {issue.mainEvent}.</p></div><Button variant="outline" size="sm" onClick={() => setAll(a => !a)}>{all ? 'Show first pages' : 'See all 24 pages'}</Button></div>
      <div className={`grid gap-3 ${all ? 'grid-cols-2 sm:grid-cols-4' : 'sm:grid-cols-3'}`}>{(all ? issue.pages : issue.pages.slice(0, 3)).map(p => <ComicPageView key={p.n} page={p} compact={all} />)}</div>
    </section>
  );
}
