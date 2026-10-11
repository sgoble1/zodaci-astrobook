import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription, type Tier } from '@/hooks/useSubscription';
import { StripeEmbeddedCheckout } from '@/components/payments/StripeEmbeddedCheckout';
import { PaymentTestModeBanner } from '@/components/payments/PaymentTestModeBanner';

const plans: { tier: Tier; name: string; price: string; priceId?: string; blurb: string; items: string[] }[] = [
  { tier: 'free', name: 'Free', price: 'Free', blurb: 'Everything you need to meet your chart.', items: ['Your calculated birth chart wheel', 'Planets, houses and aspects in plain words', 'Short personal readings', 'Explore & Discover and the Chart Guide', 'Save your chart to your account'] },
  { tier: 'full', name: 'Full Access', price: '$12.99/month', priceId: 'full_access_monthly', blurb: 'The complete book written from your chart.', items: ['Every reading at full length', 'Your own Masterbook, written from your chart', 'Timing & cycles: transits, retrogrades, life phases', 'Seven other systems: Vedic, Ba Zi, Maya and more', 'A monthly allowance of AI credits', 'Shared spaces with people you invite'] },
  { tier: 'creator', name: 'Creator', price: '$14.99/month', priceId: 'creator_monthly', blurb: 'Make new things from your chart.', items: ['Everything in Full Access', 'Generate personal podcasts about your chart', 'Generate new Masterbook chapters and pages', 'A larger monthly allowance of AI credits'] },
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
  const [open, setOpen] = useState<string | null>(null);
  const choose = (priceId: string) => { if (!sub.userId) return nav('/auth'); setOpen(priceId); };

  return (
    <article className="mx-auto max-w-5xl space-y-10">
      <PaymentTestModeBanner />
      <header className="text-center space-y-3">
        <div className="font-smallcaps text-[11px] text-gold">Plans & pricing</div>
        <h1 className="font-display text-4xl">Start free. Unlock the whole book.</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">Your chart is always free. Paid plans open every reading, your own Masterbook and AI credits, all written from your own birth details.</p>
      </header>
      {open ? (
        <section className="parchment p-4 space-y-3" aria-label="Checkout">
          <Button variant="outline" size="sm" onClick={() => setOpen(null)}>← Back to plans</Button>
          <StripeEmbeddedCheckout priceId={open} returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`} />
        </section>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((p, i) => {
            const current = !sub.loading && sub.tier === p.tier;
            const below = rank[p.tier] < rank[sub.tier];
            return (
              <section key={p.name} className={`parchment p-6 space-y-4 flex flex-col ${i ? 'border-gold' : ''}`} aria-labelledby={`plan-${i}`}>
                <h2 id={`plan-${i}`} className="text-2xl">{p.name}</h2>
                <div className="font-display text-3xl">{p.price}</div>
                <p className="text-sm text-muted-foreground">{p.blurb}</p>
                <ul className="space-y-2 text-sm flex-1">{p.items.map(x => <li key={x} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-gold" aria-hidden />{x}</li>)}</ul>
                {!p.priceId ? <Button asChild variant="outline" className="w-full"><Link to="/start">Get my free chart</Link></Button>
                  : current ? <Button disabled className="w-full">Your current plan</Button>
                  : below ? <Button disabled variant="outline" className="w-full">Included in your plan</Button>
                  : <Button className="w-full" onClick={() => choose(p.priceId!)}>{sub.userId ? `Subscribe — ${p.price}` : 'Sign in to subscribe'}</Button>}
              </section>
            );
          })}
        </div>
      )}
      <section className="space-y-4" aria-labelledby="pricing-faq"><h2 id="pricing-faq" className="text-2xl">Questions</h2>
        <dl className="grid gap-4 sm:grid-cols-2">{faqs.map(f => <div key={f.q} className="parchment p-4"><dt className="font-medium">{f.q}</dt><dd className="mt-1 text-sm text-muted-foreground">{f.a}</dd></div>)}</dl>
      </section>
    </article>
  );
}
