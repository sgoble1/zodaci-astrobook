import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  { name: 'Free', price: 'Free', blurb: 'Everything you need to meet your chart.', items: ['Your calculated birth chart wheel', 'Planets, houses and aspects in plain words', 'Short personal readings', 'Explore & Discover and the Chart Guide', 'Save your chart to your account'] },
  { name: 'Full Access', price: '$12.99/month', blurb: 'The complete book written from your chart.', items: ['Every reading at full length', 'Timing & cycles: transits, retrogrades, life phases', 'Seven other systems: Vedic, Ba Zi, Maya and more', 'AI counselors that know your chart', 'Personal podcasts and created pages', 'Shared spaces with people you invite'] },
];
const faqs = [
  { q: 'What are AI credits?', a: 'Counselor replies, podcasts and newly written pages are created live by AI. Each one uses a small amount of credit. Full Access includes a monthly allowance, and you can always see how much you have used.' },
  { q: 'What happens to my chart if I stay on Free?', a: 'Nothing changes. Your chart, birth details and short readings stay in your account for free.' },
  { q: 'How do I unlock full content?', a: 'Create a free account, enter your birth details, then choose Full Access. Locked sections unlock right away and are written from your own chart.' },
  { q: 'Can I cancel?', a: 'Yes, any time. You keep Full Access until the end of the period you paid for, then return to Free.' },
];

export default function Pricing() {
  return (
    <article className="mx-auto max-w-4xl space-y-12">
      <header className="text-center space-y-3">
        <div className="font-smallcaps text-[11px] text-gold">Plans & pricing</div>
        <h1 className="font-display text-4xl">Start free. Unlock the whole book.</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">Your chart is always free. Full Access opens every reading, timing tool and AI counselor, all written from your own birth details.</p>
      </header>
      <div className="grid gap-5 md:grid-cols-2">
        {plans.map((p, i) => (
          <section key={p.name} className={`parchment p-6 space-y-4 ${i ? 'border-gold' : ''}`} aria-labelledby={`plan-${i}`}>
            <h2 id={`plan-${i}`} className="text-2xl">{p.name}</h2>
            <div className="font-display text-3xl">{p.price}</div>
            <p className="text-sm text-muted-foreground">{p.blurb}</p>
            <ul className="space-y-2 text-sm">{p.items.map(x => <li key={x} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-gold" aria-hidden />{x}</li>)}</ul>
            <Button asChild className="w-full" variant={i ? 'default' : 'outline'}><Link to={i ? '/auth' : '/start'}>{i ? 'Create an account to be notified' : 'Get my free chart'}</Link></Button>
          </section>
        ))}
      </div>
      <section className="space-y-4" aria-labelledby="pricing-faq"><h2 id="pricing-faq" className="text-2xl">Questions</h2>
        <dl className="grid gap-4 sm:grid-cols-2">{faqs.map(f => <div key={f.q} className="parchment p-4"><dt className="font-medium">{f.q}</dt><dd className="mt-1 text-sm text-muted-foreground">{f.a}</dd></div>)}</dl>
      </section>
    </article>
  );
}
