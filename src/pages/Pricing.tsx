import { supabase } from '@/integrations/supabase/client';
import { getStripeEnvironment } from '@/lib/stripe';
import { toast } from 'sonner';
import { Fragment, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { refreshSubscription, useSubscription, type Tier } from '@/hooks/useSubscription';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { StripeEmbeddedCheckout } from '@/components/payments/StripeEmbeddedCheckout';
import { CreatorStudio } from '@/components/payments/CreatorStudio';
import { PaymentTestModeBanner } from '@/components/payments/PaymentTestModeBanner';
import { Faq, PRICING_FAQ } from '@/components/brand/Faq';
import { usePageMeta } from '@/hooks/usePageMeta';
import { CREDIT_ALLOWANCE, PLAN_AMOUNT, PLAN_NAME, PLAN_PRICE, PRICE_TIER, REFUND_WINDOW_DAYS, SELLABLE_PRICES, maxYearlySavingPct, yearlySaving } from '@/lib/plans';
import { BOOK_VERSIONS, money } from '@/lib/books';
import { internalDestination } from '@/lib/internalDestination';
import { logActivity } from '@/components/common/ActivityTracker';

type Card = { tier: Tier; slug: 'free' | 'pro' | 'cosmic'; cta: string; blurb: string; items: string[] };
const CARDS: Card[] = [
  { tier: 'free', slug: 'free', cta: 'Start for free', blurb: 'Everything you need to meet your chart.', items: ['Your calculated birth chart wheel', 'Sun, Moon and Rising with exact degrees', 'Two full readings: Your Big Three and Personality & Strengths', 'A preview section of all 12 core themes', 'RetroGOOD rating and your Blueprint', `${CREDIT_ALLOWANCE.free} AI credits every month`] },
  { tier: 'full', slug: 'pro', cta: 'Get Pro', blurb: 'Every reading, written from your chart.', items: ['All 38 readings at full length', 'Every planet, house explorer and aspect grid', 'Timing: transits, retrogrades and a 90-day timeline', 'Numerology, Ba Zi and Feng Shui in depth', 'Your own Masterbook', `${CREDIT_ALLOWANCE.full} AI credits every month`] },
  { tier: 'creator', slug: 'cosmic', cta: 'Become Cosmic', blurb: 'Make new things from your chart.', items: ['Everything in Pro', 'Personal podcasts voiced from your chart', 'New Masterbook chapters on topics you choose', 'Hermetic lots, profections and bridge numbers', 'Your Cosmic dashboard', `${CREDIT_ALLOWANCE.creator} AI credits every month`] },
];
const rank: Record<Tier, number> = { free: 0, full: 1, creator: 2 };
const Y = true, N = false;
const COMPARE: { group: string; rows: [string, boolean | string, boolean | string, boolean | string][] }[] = [
  { group: 'Your chart', rows: [['Full birth chart wheel, calculated from your exact birth moment', Y, Y, Y], ['Sun, Moon and Rising with degrees', Y, Y, Y], ['Every planet, Chiron and the North Node explained', N, Y, Y], ['House Explorer and aspect grid', N, Y, Y], ['Fixed stars and sensitive points', N, Y, Y], ['Hermetic lots and annual profections', N, N, Y]] },
  { group: 'Readings', rows: [['Full written readings', '2', 'All 38', 'All 38'], ['Core themes', 'First section', 'Full', 'Full'], ['Other systems (Vedic, Ba Zi, Maya and more)', 'Key values', Y, Y], ['Numerology name numbers, pinnacles and challenges', N, Y, Y], ['Feng Shui eight directions', 'Kua number', Y, Y]] },
  { group: 'Timing', rows: [['RetroGOOD rating and top planet', Y, Y, Y], ['Transit overlay and 90-day timeline', N, Y, Y], ['Personal timeline and retrograde calendar', N, Y, Y]] },
  { group: 'Create & keep', rows: [['AI credits each month', String(CREDIT_ALLOWANCE.free), String(CREDIT_ALLOWANCE.full), String(CREDIT_ALLOWANCE.creator)], ['Counselor and SmartChat conversations', 'Uses credits', 'Uses credits', 'Uses credits'], ['Saved relationship charts and compatibility', Y, Y, Y], ['Personal podcasts (audio narration)', N, N, Y], ['New Masterbook chapters', N, N, Y], ['Print or save any chart page', Y, Y, Y]] },
  { group: 'Community & AstroBook', rows: [['Read and reply to community posts', Y, Y, Y], ['Reading Room articles and Academy', Y, Y, Y], ['Order an AstroBook (sold separately)', Y, Y, Y]] },
];
const cell = (v: boolean | string) => typeof v === 'string' ? v : v ? <Check className="mx-auto h-4 w-4 text-gold" aria-label="Included" /> : <Minus className="mx-auto h-4 w-4 text-muted-foreground" aria-label="Not included" />;

/** Public pricing: works signed out; a chosen plan is kept through sign-up and opens checkout on return. */
export default function Pricing() {
  usePageMeta(`Pricing — Free, ${PLAN_NAME.full} ${PLAN_PRICE.full.month} and ${PLAN_NAME.creator} ${PLAN_PRICE.creator.month} | Zodaci`, `Start free with your calculated birth chart. ${PLAN_NAME.full} ${PLAN_PRICE.full.month} or ${PLAN_PRICE.full.year}; ${PLAN_NAME.creator} ${PLAN_PRICE.creator.month} or ${PLAN_PRICE.creator.year}. Cancel anytime, 7-day refund on your first payment.`);
  const sub = useSubscription();
  const [params, setParams] = useSearchParams();
  const next = params.get('next');
  const returnTo = internalDestination(next);
  const [open, setOpen] = useState<string | null>(null);
  const [yearly, setYearly] = useState(params.get('period') === 'year');
  const intent = params.get('plan');
  const priceFor = (tier: Exclude<Tier, 'free'>, y: boolean) => y ? PLAN_PRICE[tier].yearId : PLAN_PRICE[tier].monthId;
  // Records which plan checkout opened for (label only; never payment details).
  const startCheckout = (pid: string) => { logActivity({ kind: 'checkout_started', path: '/pricing', label: pid, detail: { product: pid } }); setOpen(pid); };
  useEffect(() => {
    if (sub.loading || !sub.userId || open) return;
    const tier = intent === 'pro' ? 'full' : intent === 'cosmic' ? 'creator' : null;
    if (tier && rank[tier] > rank[sub.tier]) startCheckout(priceFor(tier, params.get('period') === 'year'));
  }, [sub.loading, sub.userId, sub.tier, intent]); // eslint-disable-line react-hooks/exhaustive-deps
  const manage = async () => {
    const { data, error } = await supabase.functions.invoke('customer-portal', { body: { returnUrl: window.location.href, environment: (() => { try { return getStripeEnvironment(); } catch { return 'live'; } })() } });
    if (error || !data?.url) return toast.error(data?.error || 'Could not open billing right now.');
    window.location.href = data.url;
  };
  // Members who already pay switch plans on the same subscription (prorated), never through a second checkout.
  const billed = !!sub.priceId && !!PRICE_TIER[sub.priceId] && sub.status !== 'granted';
  const legacy = billed && !SELLABLE_PRICES.includes(sub.priceId!);
  const [change, setChange] = useState<{ pid: string; label: string; up: boolean } | null>(null);
  const [changing, setChanging] = useState(false);
  const env = () => { try { return getStripeEnvironment(); } catch { return null; } };
  const confirmChange = async () => {
    if (!change) return; const environment = env();
    if (!environment) { toast.error('Payments are not available on this site yet.'); return; }
    setChanging(true);
    const { data, error } = await supabase.functions.invoke('change-plan', { body: { priceId: change.pid, environment } });
    let msg: string | undefined = data?.error;
    if (!msg && error && 'context' in error && error.context instanceof Response) msg = (await error.context.json().catch(() => null))?.error;
    setChanging(false); setChange(null);
    if (error || msg) { toast.error(msg || 'Could not change your plan right now.'); return; }
    logActivity({ kind: 'plan_changed', path: '/pricing', label: change.pid, detail: { product: change.pid } });
    toast.success(`You’re now on ${change.label}.`);
    refreshSubscription();
  };
  const signupLink = (slug: string) => `/auth?mode=signup&next=${encodeURIComponent(slug === 'free' ? '/start' : `/pricing?plan=${slug}&period=${yearly ? 'year' : 'month'}&next=${encodeURIComponent(returnTo)}`)}`;
  const close = () => { setOpen(null); if (intent) { const n = new URLSearchParams(params); n.delete('plan'); n.delete('period'); setParams(n, { replace: true }); } };
  const prints = BOOK_VERSIONS.filter(v => v.format === 'print').sort((a, b) => a.price - b.price);
  const digital = BOOK_VERSIONS.find(v => v.format === 'digital');
  const firstPrint = prints[0]; const topPrint = prints[prints.length - 1];

  return (
    <article className="mx-auto max-w-5xl space-y-14">
      <PaymentTestModeBanner />
      <header className="space-y-3 text-center">
        <h1 className="font-display text-4xl sm:text-5xl">Simple, honest pricing.</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">Start free. Go deeper when you’re ready. No surprises.</p>
        <p className="text-sm"><Link to="/demo" className="text-primary underline underline-offset-4">Try the interactive demo first</Link></p>
        {sub.tier !== 'free' && <div className="flex flex-col items-center gap-1 pt-2">{billed && <Button variant="outline" onClick={manage}>Manage subscription · cancel, card & invoices</Button>}{sub.periodEnd && <p className="text-xs text-muted-foreground">{sub.status === 'granted' ? `${PLAN_NAME[sub.tier]} access granted until` : sub.cancelAtEnd ? 'Ends' : 'Renews'} {new Date(sub.periodEnd).toLocaleDateString()}</p>}{sub.status === 'past_due' && <p role="alert" className="text-sm text-destructive">Your last payment didn’t go through. Update your card in Manage subscription to keep your plan.</p>}</div>}
        {legacy && <p className="mx-auto max-w-xl rounded-lg border border-gold/40 bg-card/60 p-3 text-sm">You’re on an original {sub.priceId?.startsWith('creator') ? 'Creator' : 'Full Access'} plan, kept at your original price with everything in {PLAN_NAME[sub.tier]}. Switching plans moves you to today’s prices.</p>}
      </header>
      {open ? (
        <section className="parchment space-y-3 p-4" aria-label="Checkout">
          <Button variant="outline" size="sm" onClick={close}>← Back to plans</Button>
          <StripeEmbeddedCheckout priceId={open} onError={m => { toast.error(m); close(); }} returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}&next=${encodeURIComponent(returnTo)}`} />
        </section>
      ) : (<>
        <div role="radiogroup" aria-label="Billing period" className="mx-auto flex w-fit items-center gap-1 rounded-full border border-border p-1">
          {[[false, 'Monthly'], [true, 'Annual']].map(([v, l]) => <Button type="button" variant={yearly === v ? 'default' : 'ghost'} role="radio" key={String(v)} onClick={() => setYearly(v as boolean)} aria-checked={yearly === v} className="rounded-full px-3 sm:px-5">{l as string}{v && <span className="ml-1 rounded-full bg-gold/20 px-2 py-0.5 text-xs text-gold">Save up to {maxYearlySavingPct()}%</span>}</Button>)}
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {CARDS.map((p, i) => {
            const paid = p.tier !== 'free';
            const amount = paid ? PLAN_AMOUNT[p.tier as Exclude<Tier, 'free'>] : null;
            const price = !amount ? '$0' : `$${yearly ? amount.year : amount.month}`;
            const per = !paid ? 'forever' : yearly ? 'per year' : 'per month';
            const saving = paid && yearly ? yearlySaving(p.tier as Exclude<Tier, 'free'>) : 0;
            const pid = paid ? priceFor(p.tier as Exclude<Tier, 'free'>, yearly) : null;
            const current = !sub.loading && sub.userId && sub.tier === p.tier && (!billed || legacy || sub.priceId === pid);
            const below = rank[p.tier] < rank[sub.tier];
            const switchable = billed && paid && !!pid && !current && sub.priceId !== pid;
            const label = `${PLAN_NAME[p.tier]} ${yearly ? 'annual' : 'monthly'} (${price} ${per})`;
            return (
              <section key={p.slug} className={`parchment flex flex-col space-y-4 p-6 ${p.tier === 'full' ? 'border-gold ring-1 ring-gold/40' : ''}`} aria-labelledby={`plan-${i}`}>
                <div className="flex items-center justify-between"><h2 id={`plan-${i}`} className="text-2xl">{PLAN_NAME[p.tier]}</h2>{p.tier === 'full' && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">Recommended</span>}</div>
                <div><span className="font-display text-4xl">{price}</span> <span className="text-sm text-muted-foreground">{per}</span>{saving > 0 && <p className="text-xs text-gold">You save ${saving} a year</p>}</div>
                <p className="text-sm text-muted-foreground">{p.blurb}</p>
                <ul className="flex-1 space-y-2 text-sm">{p.items.map(x => <li key={x} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-gold" aria-hidden />{x}</li>)}</ul>
                {!paid ? (sub.userId ? <Button asChild variant="outline" className="w-full"><Link to="/start">Open my free chart</Link></Button> : <Button asChild variant="outline" className="w-full"><Link to={signupLink('free')}>{p.cta}</Link></Button>)
                  : switchable ? <Button className="w-full" variant={below ? 'outline' : 'default'} onClick={() => setChange({ pid: pid!, label, up: !below && !(sub.tier === p.tier && !yearly) })}>{sub.tier === p.tier ? `Switch to ${yearly ? 'annual' : 'monthly'} — ${price}` : below ? `Switch to ${PLAN_NAME[p.tier]} — ${price}` : `Upgrade to ${PLAN_NAME[p.tier]} — ${price}`}</Button>
                  : current ? <Button disabled className="w-full">Your current plan</Button>
                  : below ? <Button disabled variant="outline" className="w-full">Included in your plan</Button>
                  : sub.userId ? <Button className="w-full" onClick={() => pid && startCheckout(pid)}>{p.cta} — {price}</Button>
                  : <Button asChild className="w-full"><Link to={signupLink(p.slug)}>{p.cta}</Link></Button>}
              </section>
            );
          })}
        </div>
        <p className="mx-auto max-w-2xl text-center text-sm text-muted-foreground">Prices in US dollars; any sales tax is calculated at checkout. Cancel anytime and keep access until the period ends. Changed your mind? Ask within {REFUND_WINDOW_DAYS} days of your first subscription payment for a full refund.</p>
      </>)}
      <AlertDialog open={!!change} onOpenChange={o => { if (!o && !changing) setChange(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch to {change?.label}?</AlertDialogTitle>
            <AlertDialogDescription>{change?.up ? 'You’ll be charged the prorated difference today with your saved card, and the new plan starts right away.' : 'The change starts now. Unused time on your current plan becomes a credit on your next bill.'}{legacy ? ' Your original grandfathered price will no longer apply.' : ''}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={changing}>Keep my plan</AlertDialogCancel>
            <AlertDialogAction disabled={changing} onClick={e => { e.preventDefault(); void confirmChange(); }}>{changing ? 'Switching…' : 'Confirm switch'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {sub.tier === 'creator' && <p className="text-center"><Button asChild><Link to="/creator">Open your Cosmic dashboard</Link></Button></p>}
      {sub.tier === 'creator' && <div className="space-y-2"><CreatorStudio /><p className="text-center text-sm"><Link to="/my-masterbook" className="underline">Open My Masterbook to read and play what you’ve made</Link></p></div>}
      <section className="space-y-4" aria-labelledby="pricing-faq"><h2 id="pricing-faq" className="font-display text-3xl">Questions</h2><Faq items={PRICING_FAQ} id="pricing-faq-schema" /></section>
      <section className="space-y-3" aria-labelledby="compare">
        <h2 id="compare" className="font-display text-3xl">Compare plans</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[560px] text-sm">
            <thead><tr className="border-b border-border text-left"><th scope="col" className="p-3 font-medium">Feature</th>{(['free', 'full', 'creator'] as Tier[]).map(t => <th key={t} scope="col" className="p-3 text-center font-medium">{PLAN_NAME[t]}</th>)}</tr></thead>
            <tbody>{COMPARE.map(g => <Fragment key={g.group}>
              <tr className="bg-muted/40"><th scope="rowgroup" colSpan={4} className="p-3 text-left font-smallcaps text-xs text-gold">{g.group}</th></tr>
              {g.rows.map(r => <tr key={r[0]} className="border-b border-border last:border-0"><th scope="row" className="p-3 text-left font-normal">{r[0]}</th>{r.slice(1).map((c, i) => <td key={i} className="p-3 text-center">{cell(c)}</td>)}</tr>)}
            </Fragment>)}</tbody>
          </table>
        </div>
      </section>
      <section aria-labelledby="astrobook-xsell" className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gold/40 bg-card p-6">
        <div><h2 id="astrobook-xsell" className="font-display text-2xl">Looking for the printed book?</h2><p className="text-sm text-muted-foreground">AstroBook turns your readings into a book, sold separately from plans. {digital && <>{digital.name} {money(digital.price)} · </>}{firstPrint && <>{firstPrint.name} paperback {money(firstPrint.price)}</>}{topPrint && topPrint !== firstPrint && <> up to {topPrint.name} {money(topPrint.price)}</>}. Printed versions ship free in the US.</p></div>
        <Button asChild variant="outline"><Link to="/astrobook">Shop AstroBook →</Link></Button>
      </section>
    </article>
  );
}
