import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CREDIT_PACKS } from '@/lib/plans';
import { CreditBalance } from '@/components/common/CreditBalance';
import { StripeEmbeddedCheckout } from '@/components/payments/StripeEmbeddedCheckout';
import { PaymentTestModeBanner } from '@/components/payments/PaymentTestModeBanner';
import { AuthGate } from '@/components/common/AuthGate';
import { usePageMeta } from '@/hooks/usePageMeta';

/** Buy one-time AI credit packs. Credits are added by the verified payment webhook, never by this page. */
export default function Credits() {
  usePageMeta('Buy AI credits · Zodaci', 'Top up AI credits for readings, podcasts, chapters and counselors.');
  const [params] = useSearchParams();
  const [pick, setPick] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const done = params.get('session_id');
  useEffect(() => {
    let n = 0; const load = () => void supabase.rpc('my_credit_balance').then(({ data }) => setBalance(typeof data === 'number' ? data : 0));
    load(); if (!done) return; const t = setInterval(() => { load(); if (++n > 10) clearInterval(t); }, 3000); return () => clearInterval(t);
  }, [done]);
  return (
    <AuthGate what="buy AI credits">{() => (
      <article className="mx-auto max-w-4xl space-y-8">
        <PaymentTestModeBanner />
        <header className="space-y-2"><h1 className="text-4xl">AI credits</h1><p className="text-muted-foreground">Your plan's monthly credits are used first. Purchased credits never expire and only count once.</p></header>
        <CreditBalance />
        <p className="text-sm">Purchased credits remaining: <strong className="text-gold">{balance ?? '…'}</strong></p>
        {done && <p role="status" className="rounded border border-gold/40 bg-card/60 p-3 text-sm">Thank you — your credits appear here as soon as the payment is confirmed (usually within a few seconds).</p>}
        {pick ? (
          <section className="space-y-3"><Button variant="ghost" onClick={() => { setPick(null); setErr(''); }}>← Choose another pack</Button>
            {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
            <StripeEmbeddedCheckout key={pick} priceId={pick} returnUrl={`${window.location.origin}/credits?session_id={CHECKOUT_SESSION_ID}`} onError={setErr} /></section>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{CREDIT_PACKS.map(p => (
            <li key={p.id} className="vellum flex flex-col gap-3 p-5">
              <Sparkles className="h-6 w-6 text-gold" aria-hidden />
              <p className="font-display text-4xl">${p.price}</p>
              <p className="text-lg">{p.credits.toLocaleString()} credits</p>
              {p.credits > p.price * 10 && <p className="text-xs text-gold">{Math.round((p.credits / (p.price * 10) - 1) * 100)}% bonus</p>}
              <p className="text-xs text-muted-foreground">≈ {Math.floor(p.credits / 5)} podcasts or {p.credits} counselor messages</p>
              <Button className="mt-auto" onClick={() => setPick(p.id)}>Buy {p.credits} credits</Button>
            </li>))}</ul>
        )}
      </article>
    )}</AuthGate>
  );
}
