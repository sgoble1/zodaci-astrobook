import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';

export default function CheckoutReturn() {
  const [params] = useSearchParams();
  const sub = useSubscription();
  const paid = sub.tier !== 'free';
  const name = sub.tier === 'creator' ? 'Creator' : 'Full Access';
  if (!params.get('session_id')) return <article className="mx-auto max-w-xl py-12 text-center space-y-4"><h1 className="font-display text-3xl">No payment found</h1><Button asChild><Link to="/pricing">See plans</Link></Button></article>;
  return (
    <article className="mx-auto max-w-xl py-12 text-center space-y-5" aria-live="polite">
      {paid ? <CheckCircle2 className="mx-auto h-12 w-12 text-gold" aria-hidden /> : <Loader2 className="mx-auto h-12 w-12 animate-spin text-gold" aria-hidden />}
      <h1 className="font-display text-3xl">{paid ? `Welcome to ${name}` : 'Confirming your payment…'}</h1>
      <p className="text-muted-foreground">{paid
        ? `Your plan is active. Your own Masterbook and full readings are unlocked, and your monthly AI credits are ready to use.${sub.tier === 'creator' ? ' You can now generate podcasts and new chapters from your chart.' : ''}`
        : 'Thanks! This usually takes a few seconds. The page updates by itself.'}</p>
      {paid && <div className="flex flex-wrap justify-center gap-3">
        <Button asChild><Link to="/my-readings">Open my readings</Link></Button>
        <Button asChild variant="outline"><Link to="/my-astrobook">My AstroBook</Link></Button>
      </div>}
    </article>
  );
}
