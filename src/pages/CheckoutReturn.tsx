import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { internalDestination } from '@/lib/internalDestination';

export default function CheckoutReturn() {
  const [params] = useSearchParams();
  const sub = useSubscription();
  const paid = !sub.loading && sub.tier !== 'free';
  const [waiting, setWaiting] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => setWaiting(true), 60000); return () => clearTimeout(timer); }, []);
  const next = params.get('next');
  const returnTo = internalDestination(next);
  const name = sub.tier === 'creator' ? 'Cosmic' : 'Pro';
  if (!params.get('session_id')) return <article className="mx-auto max-w-xl py-12 text-center space-y-4"><h1 className="font-display text-3xl">No payment found</h1><Button asChild><Link to="/pricing">See plans</Link></Button></article>;
  return (
    <article className="mx-auto max-w-xl py-12 text-center space-y-5" aria-live="polite">
      {paid ? <CheckCircle2 className="mx-auto h-12 w-12 text-gold" aria-hidden /> : <Loader2 className="mx-auto h-12 w-12 animate-spin text-gold" aria-hidden />}
      <h1 className="font-display text-3xl">{paid ? `Welcome to ${name}` : 'Confirming your payment…'}</h1>
      <p className="text-muted-foreground">{paid
        ? `Your plan is active. Your own Masterbook and full readings are unlocked. Starting readings are created after birth details are saved; other readings are written when opened. Generation is subject to availability and usage limits.${sub.tier === 'creator' ? ' You can now generate podcasts and new chapters from your chart.' : ''}`
        : waiting ? 'Confirmation is taking longer than expected. Do not pay again. Return to your account to check your plan.' : 'We are waiting for payment confirmation. Access changes only after it is verified.'}</p>
      {!paid && waiting && <Button asChild variant="outline"><Link to="/dashboard">Check my account</Link></Button>}
      {paid && <div className="flex flex-wrap justify-center gap-3">
        <Button asChild><Link to={returnTo}>Continue where I left off</Link></Button>
        <Button asChild variant="outline"><Link to="/my-readings">My readings</Link></Button>
        <Button asChild variant="outline"><Link to="/my-astrobook">My Zodaci</Link></Button>
      </div>}
    </article>
  );
}
