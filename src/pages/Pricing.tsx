import { supabase } from '@/integrations/supabase/client';
import { getStripeEnvironment } from '@/lib/stripe';
import { toast } from 'sonner';
import { Fragment, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription, type Tier } from '@/hooks/useSubscription';
import { StripeEmbeddedCheckout } from '@/components/payments/StripeEmbeddedCheckout';
import { CreatorStudio } from '@/components/payments/CreatorStudio';
import { PaymentTestModeBanner } from '@/components/payments/PaymentTestModeBanner';
import { Faq, PRICING_FAQ } from '@/components/brand/Faq';
import { usePageMeta } from '@/hooks/usePageMeta';
import { CREDIT_ALLOWANCE, PLAN_NAME, PLAN_PRICE } from '@/lib/plans';
import { BOOK_VERSIONS, money } from '@/lib/books';

type Card = { tier: Tier; slug: 'free' | 'pro' | 'cosmic'; cta: string; blurb: string; items: string[] };
const CARDS: Card[] = [
  { tier: 'free', slug: 'free', cta: 'Start for free', blurb: 'Everything you need to meet your chart.', items: ['Your calculated birth chart wheel', 'Sun, Moon and Rising with exact degrees', 'Two full readings: Your Big Three and Personality & Strengths', 'A preview section of all 12 core themes', 'RetroGOOD rating and your Blueprint', `${CREDIT_ALLOWANCE.free} AI credits every month`] },
  { tier: 'full', slug: 'pro', cta: 'Get Pro', blurb: 'Every reading, written from your chart.', items: ['All 38 readings at full length', 'Every planet, house explorer and aspect grid', 'Timing: transits, retrogrades and a 90-day timeline', 'Numerology, Ba Zi and Feng Shui in depth', 'Your own Masterbook', `${CREDIT_ALLOWANCE.full} AI credits every month`] },
  { tier: 'creator', slug: 'cosmic', cta: 'Become Cosmic', blurb: 'Make new things from your chart.', items: ['Everything in Pro', 'Personal podcasts voiced from your chart', 'New Masterbook chapters on topics you choose', 'Hermetic lots, profections and bridge numbers', 'Your Cosmic dashboard', `${CREDIT_ALLOWANCE.creator} AI credits every month`] },
];
const MONTHLY = { full: 9, creator: 19 } as const;
const YEARLY = { full: 89, creator: 179 } as const;
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
  usePageMeta('Pricing — Zodaci', 'Simple, honest pricing. Start free with your calculated chart. Pro $9/month or Cosmic $19/month, with annual savings.');
  const sub = useSubscription();
  const [params, setParams] = useSearchParams();
  const next = params.get('next');
  const returnTo = next?.startsWith('/my-readings/topic/') && !next.includes('://') ? next : '/dashboard';
  const [open, setOpen] = useState<string | null>(null);
  const [yearly, setYearly] = useState(params.get('period') === 'year');
  const intent = params.get('plan');
  const priceFor = (tier: Exclude<Tier, 'free'>, y: boolean) => y ? PLAN_PRICE[tier].yearId : PLAN_PRICE[tier].monthId;
  useEffect(() => {
    if (sub.loading || !sub.userId || open) return;
    const tier = intent === 'pro' ? 'full' : intent === 'cosmic' ? 'creator' : null;
    if (tier && rank[tier] > rank[sub.tier]) setOpen(priceFor(tier, params.get('period') === 'year'));
  }, [sub.loading, sub.userId, sub.tier, intent]); // eslint-disable-line react-hooks/exhaustive-deps
  const manage = async () => {
    const { data, error } = await supabase.functions.invoke('customer-portal', { body: { returnUrl: window.location.href, environment: (() => { try { return getStripeEnvironment(); } catch { return 'live'; } })() } });
    if (error || !data?.url) return toast.error(data?.error || 'Could not open billing right now.');
    window.location.href = data.url;
  };
  const signupLink = (slug: string) => `/auth?mode=signup&next=${encodeURIComponent(slug === 'free' ? '/start' : `/pricing?plan=${slug}&period=${yearly ? 'year' : 'month'}`)}`;
  const close = () => { setOpen(null); if (intent) { const n = new URLSearchParams(params); n.delete('plan'); n.delete('period'); setParams(n, { replace: true }); } };
  const cheapestPrint = Math.min(...BOOK_VERSIONS.filter(v => v.format === 'print').map(v => v.price));
  const cheapest = Math.min(...BOOK_VERSIONS.map(v => v.price));

  return (
    <article className="mx-auto max-w-5xl space-y-14">
      <PaymentTestModeBanner />
      <header className="space-y-3 text-center">
        <h1 className="font-display text-4xl sm:text-5xl">Simple, honest pricing.</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">Start free. Go deeper when you’re ready. No surprises.</p>
        <p className="text-sm"><Link to="/demo" className="text-primary underline underline-offset-4">Try the interactive demo first</Link></p>
        {sub.tier !== 'free' && <div className="flex flex-col items-center gap-1 pt-2"><Button variant="outline" onClick={manage}>Manage subscription · cancel, card & invoices</Button>{sub.periodEnd && <p className="text-xs text-muted-foreground">{sub.status === 'granted' ? `${PLAN_NAME[sub.tier]} access granted until` : sub.cancelAtEnd ? 'Ends' : 'Renews'} {new Date(sub.periodEnd).toLocaleDateString()}</p>}</div>}
      </header>
      {open ? (
        <section className="parchment space-y-3 p-4" aria-label="Checkout">
          <Button variant="outline" size="sm" onClick={close}>← Back to plans</Button>
          <StripeEmbeddedCheckout priceId={open} returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}&next=${encodeURIComponent(returnTo)}`} />
        </section>
      ) : (<>
        <div role="radiogroup" aria-label="Billing period" className="mx-auto flex w-fit items-center gap-1 rounded-full border border-border p-1">
          {[[false, 'Monthly'], [true, 'Annual']].map(([v, l]) => <button type="button" role="radio" key={String(v)} onClick={() => setYearly(v as boolean)} aria-checked={yearly === v} className={`rounded-full px-5 py-2 text-sm transition-colors duration-500 ${yearly === v ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{l as string}{v && <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-xs text-gold">Save up to 21%</span>}</button>)}
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {CARDS.map((p, i) => {
            const paid = p.tier !== 'free';
            const price = !paid ? '$0' : yearly ? `$${YEARLY[p.tier as 'full']}` : `$${MONTHLY[p.tier as 'full']}`;
            const per = !paid ? 'forever' : yearly ? 'per year' : 'per month';
            const saving = paid && yearly ? MONTHLY[p.tier as 'full'] * 12 - YEARLY[p.tier as 'full'] : 0;
            const pid = paid ? priceFor(p.tier as Exclude<Tier, 'free'>, yearly) : null;
            const current = !sub.loading && sub.userId && sub.tier === p.tier;
            const below = rank[p.tier] < rank[sub.tier];
            return (
              <section key={p.slug} className={`parchment flex flex-col space-y-4 p-6 ${p.tier === 'full' ? 'border-gold ring-1 ring-gold/40' : ''}`} aria-labelledby={`plan-${i}`}>
                <div className="flex items-center justify-between"><h2 id={`plan-${i}`} className="text-2xl">{PLAN_NAME[p.tier]}</h2>{p.tier === 'full' && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">Recommended</span>}</div>
                <div><span className="font-display text-4xl">{price}</span> <span className="text-sm text-muted-foreground">{per}</span>{saving > 0 && <p className="text-xs text-gold">You save ${saving} a year</p>}</div>
                <p className="text-sm text-muted-foreground">{p.blurb}</p>
                <ul className="flex-1 space-y-2 text-sm">{p.items.map(x => <li key={x} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-gold" aria-hidden />{x}</li>)}</ul>
                {!paid ? (sub.userId ? <Button asChild variant="outline" className="w-full"><Link to="/start">Open my free chart</Link></Button> : <Button asChild variant="outline" className="w-full"><Link to={signupLink('free')}>{p.cta}</Link></Button>)
                  : current ? <Button disabled className="w-full">Your current plan</Button>
                  : below ? <Button disabled variant="outline" className="w-full">Included in your plan</Button>
                  : sub.userId ? <Button className="w-full" onClick={() => pid && setOpen(pid)}>{p.cta} — {price}</Button>
                  : <Button asChild className="w-full"><Link to={signupLink(p.slug)}>{p.cta}</Link></Button>}
              </section>
            );
          })}
        </div>
      </>)}
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
        <div><h2 id="astrobook-xsell" className="font-display text-2xl">Looking for the printed book?</h2><p className="text-sm text-muted-foreground">AstroBook turns your readings into a book: Digital PDF from {money(cheapest)}, printed from {money(cheapestPrint)}.</p></div>
        <Button asChild variant="outline"><Link to="/astrobook">Shop AstroBook →</Link></Button>
      </section>
    </article>
  );
}
