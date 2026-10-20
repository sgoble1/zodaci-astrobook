import { supabase } from '@/integrations/supabase/client';
import { getStripeEnvironment } from '@/lib/stripe';
import { toast } from 'sonner';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription, type Tier } from '@/hooks/useSubscription';
import { StripeEmbeddedCheckout } from '@/components/payments/StripeEmbeddedCheckout';
import { CreatorStudio } from '@/components/payments/CreatorStudio';
import { PaymentTestModeBanner } from '@/components/payments/PaymentTestModeBanner';

const plans: { tier: Tier; name: string; price: string; priceId?: string; yearPrice?: string; yearId?: string; blurb: string; items: string[] }[] = [
  { tier: 'free', name: 'Free', price: 'Free', blurb: 'Everything you need to meet your chart.', items: ['Your calculated birth chart wheel', 'Planets, houses and aspects in plain words', 'Two full readings: Your Big Three and Personality & Strengths', 'Explore & Discover and the Chart Guide', 'First-section previews of core themes', 'Save your chart to your account'] },
  { tier: 'full', name: 'Pro', price: '$9/month', priceId: 'pro_monthly', yearPrice: '$89/year', yearId: 'pro_yearly', blurb: 'The complete book written from your chart.', items: ['Every reading at full length', 'Read your own Masterbook, written from your chart', 'Timing & cycles: transits, retrogrades, life phases', 'Seven other systems: Vedic, Ba Zi, Maya and more', 'A monthly allowance of AI credits', 'Shared spaces with people you invite'] },
  { tier: 'creator', name: 'Cosmic', price: '$19/month', priceId: 'cosmic_monthly', yearPrice: '$179/year', yearId: 'cosmic_yearly', blurb: 'Make new things from your chart.', items: ['Everything in Pro', 'Generate personal podcasts about your chart', 'Generate new Masterbook chapters and pages', 'A larger monthly allowance of AI credits', 'Your own Cosmic dashboard'] },
];
const rank: Record<Tier, number> = { free: 0, full: 1, creator: 2 };
const faqs = [
  { q: 'What are AI credits?', a: 'Counselor replies, podcasts and newly written pages are created live by AI. Each one uses a small amount of credit. Paid plans include a monthly allowance.' },
  { q: 'What happens to my chart if I stay on Free?', a: 'Nothing changes. Your chart, birth details and short readings stay in your account for free.' },
  { q: 'How do I unlock full content?', a: 'Create a free account, enter your birth details, then choose a plan. Everything unlocks right away and is written from your own chart.' },
  { q: 'Can I cancel?', a: 'Yes, any time. You keep your plan until the end of the period you paid for, then return to Free.' },
];

export default function Pricing() {
  const sub = useSubscription();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');
  const returnTo = next?.startsWith('/my-readings/topic/') && !next.includes('://') ? next : '/dashboard';
  const [open, setOpen] = useState<string | null>(null);
  const [yearly, setYearly] = useState(false);
  const manage = async () => {
    const { data, error } = await supabase.functions.invoke('customer-portal', { body: { returnUrl: window.location.href, environment: (() => { try { return getStripeEnvironment(); } catch { return 'live'; } })() } });
    if (error || !data?.url) return toast.error(data?.error || 'Could not open billing right now.');
    window.location.href = data.url;
  };
  const choose = (priceId: string) => { if (!sub.userId) return nav('/auth'); setOpen(priceId); };

  return (
    <article className="mx-auto max-w-5xl space-y-10">
      <PaymentTestModeBanner />
      <header className="text-center space-y-3">
        <div className="font-smallcaps text-[11px] text-gold">Plans & pricing</div>
        <h1 className="font-display text-4xl">Start free. Unlock the whole book.</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">Your chart is always free. Paid plans open every reading, your own Masterbook and AI credits, all written from your own birth details. <Link to="/demo" className="text-primary underline">Try the interactive demo</Link>.</p>
        {sub.tier !== 'free' && <div className="flex flex-col items-center gap-1 pt-2"><Button variant="outline" onClick={manage}>Manage subscription · cancel, card & invoices</Button>{sub.periodEnd && <p className="text-xs text-muted-foreground">{sub.cancelAtEnd ? 'Ends' : 'Renews'} {new Date(sub.periodEnd).toLocaleDateString()}</p>}</div>}
      </header>
      {!open && <div role="group" aria-label="Billing period" className="mx-auto flex w-fit gap-1 rounded-full border border-border p-1">{[[false, 'Monthly'], [true, 'Yearly · save 20%']].map(([v, l]) => <button key={String(v)} onClick={() => setYearly(v as boolean)} aria-pressed={yearly === v} className={`rounded-full px-4 py-1.5 text-sm ${yearly === v ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{l as string}</button>)}</div>}
      {open ? (
        <section className="parchment p-4 space-y-3" aria-label="Checkout">
          <Button variant="outline" size="sm" onClick={() => setOpen(null)}>← Back to plans</Button>
          <StripeEmbeddedCheckout priceId={open} returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}&next=${encodeURIComponent(returnTo)}`} />
        </section>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((p, i) => {
            const price = yearly && p.yearPrice ? p.yearPrice : p.price; const pid = yearly && p.yearId ? p.yearId : p.priceId;
            const current = !sub.loading && sub.tier === p.tier;
            const below = rank[p.tier] < rank[sub.tier];
            return (
              <section key={p.name} className={`parchment p-6 space-y-4 flex flex-col ${i ? 'border-gold' : ''}`} aria-labelledby={`plan-${i}`}>
                <h2 id={`plan-${i}`} className="text-2xl">{p.name}</h2>
                <div className="font-display text-3xl">{price}</div>
                <p className="text-sm text-muted-foreground">{p.blurb}</p>
                <ul className="space-y-2 text-sm flex-1">{p.items.map(x => <li key={x} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-gold" aria-hidden />{x}</li>)}</ul>
                {!p.priceId ? <Button asChild variant="outline" className="w-full"><Link to="/start">Get my free chart</Link></Button>
                  : current ? <Button disabled className="w-full">Your current plan</Button>
                  : below ? <Button disabled variant="outline" className="w-full">Included in your plan</Button>
                  : <Button className="w-full" onClick={() => pid && choose(pid)}>{sub.userId ? `Subscribe — ${price}` : 'Sign in to subscribe'}</Button>}
              </section>
            );
          })}
        </div>
      )}
      {sub.tier === 'creator' && <p className="text-center"><Button asChild><Link to="/creator">Open your Cosmic dashboard</Link></Button></p>}
      <section aria-labelledby="guarantee" className="rounded border border-border bg-card p-5 text-center"><h2 id="guarantee" className="text-xl">7-day refund</h2><p className="text-sm text-muted-foreground mt-2">Not for you? Ask for a refund within 7 days of your first Pro or Cosmic payment and we'll return it in full. Contact us from your account email.</p></section>
      <section aria-labelledby="creator-perks" className="rounded border border-border bg-card p-5"><h2 id="creator-perks" className="text-xl">Cosmic perks</h2><ul className="mt-3 grid sm:grid-cols-2 gap-2 text-sm"><li>Your own Cosmic dashboard</li><li>Personal podcasts written and voiced from your chart</li><li>New Masterbook chapters on any topic you choose</li><li>Every Pro reading, timing page and other system</li></ul></section>
      {sub.tier === 'creator' && <div className="space-y-2"><CreatorStudio /><p className="text-sm text-center"><Link to="/my-masterbook" className="underline">Open My Masterbook to read and play what you've made</Link></p></div>}
      <section className="space-y-3" aria-labelledby="compare">
        <h2 id="compare" className="text-2xl">Compare plans</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[520px] text-sm">
            <thead><tr className="border-b border-border text-left"><th className="p-3 font-medium">Feature</th><th className="p-3 font-medium">Free</th><th className="p-3 font-medium">Pro</th><th className="p-3 font-medium">Cosmic</th></tr></thead>
            <tbody>{([
              ['Birth chart wheel, planets, houses & aspects', '✓', '✓', '✓'],
              ['Full written readings from your chart', '2', 'All 38', 'All 38'],
              ['Other Systems readings (Vedic, Ba Zi, Maya…)', 'Values only', '✓', '✓'],
              ['Timing, transits & retrogrades', 'Basic', '✓', '✓'],
              ['AI counselors & SmartChat', 'Limited', '✓', '✓'],
              ['Personal podcasts & new chapters', '—', '—', '✓'],
            ] as const).map(r => <tr key={r[0]} className="border-b border-border last:border-0">{r.map((c, i) => <td key={i} className={`p-3 ${i ? 'text-center' : ''}`}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </section>
      <section className="space-y-4" aria-labelledby="pricing-faq"><h2 id="pricing-faq" className="text-2xl">Questions</h2>
        <dl className="grid gap-4 sm:grid-cols-2">{faqs.map(f => <div key={f.q} className="parchment p-4"><dt className="font-medium">{f.q}</dt><dd className="mt-1 text-sm text-muted-foreground">{f.a}</dd></div>)}</dl>
      </section>
    </article>
  );
}
