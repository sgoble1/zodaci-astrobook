import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { refreshSubscription, useSubscription } from '@/hooks/useSubscription';
import { getStripeEnvironment } from '@/lib/stripe';
import { internalDestination } from '@/lib/internalDestination';
import { usePageMeta } from '@/hooks/usePageMeta';

const RETRY_MS = [0, 2000, 4000, 8000, 15000, 30000];
const envOrNull = () => { try { return getStripeEnvironment(); } catch { return null; } };

/** After checkout: confirms the payment with the provider directly (retrying), so the plan unlocks without waiting on the webhook. */
export default function CheckoutReturn() {
  usePageMeta('Confirming your plan · Zodaci', 'Confirming your Zodaci membership payment.');
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const sub = useSubscription();
  const paid = !sub.loading && sub.tier !== 'free';
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<'checking' | 'pending' | 'failed'>('checking');
  const [message, setMessage] = useState<string | null>(null);
  const done = useRef(false);
  const next = params.get('next');
  const returnTo = internalDestination(next);
  const name = sub.tier === 'creator' ? 'Cosmic' : 'Pro';

  const check = useCallback(async () => {
    const environment = envOrNull();
    if (!sessionId || !environment) return 'failed' as const;
    const { data, error } = await supabase.functions.invoke('sync-checkout', { body: { sessionId, environment } });
    if (error || data?.error) { setMessage(data?.error ?? null); return 'failed' as const; }
    if (data?.status === 'active' || data?.status === 'trialing') { refreshSubscription(); return 'active' as const; }
    return 'pending' as const;
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || paid || done.current) return;
    if (attempt >= RETRY_MS.length) { setState('pending'); return; }
    const t = window.setTimeout(async () => {
      const r = await check();
      if (r === 'active') { done.current = true; return; }
      if (r === 'failed' && attempt >= 2) { setState('failed'); return; }
      setAttempt(a => a + 1);
    }, RETRY_MS[attempt]);
    return () => window.clearTimeout(t);
  }, [attempt, check, paid, sessionId]);

  const retry = () => { done.current = false; setMessage(null); setState('checking'); setAttempt(0); };
  if (!sessionId) return <article className="mx-auto max-w-xl space-y-4 py-12 text-center"><h1 className="font-display text-3xl">No payment found</h1><Button asChild><Link to="/pricing">See plans</Link></Button></article>;
  const stuck = !paid && state !== 'checking';
  return (
    <article className="mx-auto max-w-xl space-y-5 py-12 text-center" aria-live="polite">
      {paid ? <CheckCircle2 className="mx-auto h-12 w-12 text-gold" aria-hidden /> : <Loader2 className={`mx-auto h-12 w-12 text-gold ${stuck ? '' : 'animate-spin motion-reduce:animate-none'}`} aria-hidden />}
      <h1 className="font-display text-3xl">{paid ? `Welcome to ${name}` : stuck ? 'Still confirming your payment' : 'Confirming your payment…'}</h1>
      <p className="text-muted-foreground">{paid
        ? `Your plan is active. Your own Masterbook and full readings are unlocked. Starting readings are created after birth details are saved; other readings are written when opened. Generation is subject to availability and usage limits.${sub.tier ? ' You can now generate podcasts and new chapters from your chart.' : ''}`
        : stuck ? 'Your bank or the payment provider hasn’t confirmed it yet. Please don’t pay again — check again in a minute, or open your account. Some payment methods take longer to settle.' : 'We’re checking with the payment provider. Access changes only after the payment is verified.'}</p>
      {stuck && message && <p role="alert" className="text-sm text-destructive">{message}</p>}
      {stuck && <div className="flex flex-wrap justify-center gap-3"><Button onClick={retry}>Check again</Button><Button asChild variant="outline"><Link to="/dashboard">Open my account</Link></Button></div>}
      {paid && <div className="flex flex-wrap justify-center gap-3">
        <Button asChild><Link to={returnTo}>Continue where I left off</Link></Button>
        <Button asChild variant="outline"><Link to="/my-readings">My readings</Link></Button>
        <Button asChild variant="outline"><Link to="/my-astrobook">My Zodaci</Link></Button>
      </div>}
    </article>
  );
}
