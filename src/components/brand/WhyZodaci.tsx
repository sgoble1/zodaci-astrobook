import { Link } from 'react-router-dom';
import { ShieldCheck, Telescope, RotateCcw, LockKeyhole } from 'lucide-react';
import { REFUND_WINDOW_DAYS } from '@/lib/plans';
import { cn } from '@/lib/utils';

/** Short "Why Zodaci exists" line, the same promise as the About section, for Pricing and AstroBook. */
export function WhyZodaciLine({ className }: { className?: string }) {
  return (
    <aside aria-label="Why Zodaci exists" className={cn('obs-paper flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6', className)}>
      <div>
        <p className="font-label text-sm tracking-[0.18em] text-accent">Why Zodaci exists</p>
        <p className="mt-1 font-display text-2xl uppercase leading-tight">Same skies. Brighter answers.</p>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">We calculate your chart precisely, translate every symbol into plain language, and then go deep with chapters written from your own placements.</p>
      </div>
      <Link to="/about" className="shrink-0 font-label tracking-[0.14em] text-accent underline-offset-4 hover:underline">Read our story →</Link>
    </aside>
  );
}

/** What a buyer can rely on. Every line is a fact about how the product works; no testimonials or invented numbers. */
export function TrustStrip({ className }: { className?: string }) {
  const items = [
    { icon: Telescope, title: 'Calculated, then written', text: 'Positions come from an astronomy engine for your birth minute and the time-zone rules your town used that day.' },
    { icon: LockKeyhole, title: 'Your birth data stays yours', text: 'Saved to your account only. Other members never see it, and public shares are off unless you turn them on.' },
    { icon: RotateCcw, title: `${REFUND_WINDOW_DAYS}-day refund`, text: `Ask within ${REFUND_WINDOW_DAYS} days of your first subscription payment for a full refund. Cancel anytime.` },
    { icon: ShieldCheck, title: 'Honest about uncertainty', text: 'No birth time? We say so and leave out the Rising sign and houses instead of guessing.' },
  ];
  return (
    <section aria-labelledby="trust-h" className={cn('space-y-4', className)}>
      <h2 id="trust-h" className="plate-title text-center">What you can count on</h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="obs-paper p-5">
            <Icon aria-hidden className="h-7 w-7 text-accent" />
            <p className="mt-3 font-label text-lg tracking-[0.08em]">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
