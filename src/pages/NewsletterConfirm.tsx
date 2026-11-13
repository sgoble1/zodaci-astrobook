import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { usePageMeta } from '@/hooks/usePageMeta';
import { functionErrorMessage } from '@/lib/functionError';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Double opt-in: the link in the signup confirmation email lands here and confirms the address once. */
export default function NewsletterConfirm() {
  usePageMeta('Confirm your email | Zodaci', 'Confirm your Zodaci update list signup.');
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [state, setState] = useState<{ kind: 'busy' } | { kind: 'done'; already: boolean } | { kind: 'error'; message: string }>({ kind: 'busy' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!UUID.test(token)) { setState({ kind: 'error', message: 'This confirmation link is incomplete. Open it again from the email we sent.' }); return; }
    let on = true; setState({ kind: 'busy' });
    void supabase.functions.invoke('brand-newsletter', { body: { action: 'confirm', token } }).then(async ({ data, error }) => {
      if (!on) return;
      if (error || !data?.ok) setState({ kind: 'error', message: await functionErrorMessage(error, data, 'We could not confirm this address. Please try again.') });
      else setState({ kind: 'done', already: !!data.already });
    });
    return () => { on = false; };
  }, [token, attempt]);
  return (
    <section className="mx-auto max-w-lg space-y-5 px-4 py-16 text-center">
      <h1 className="font-display text-4xl">Zodaci updates</h1>
      {state.kind === 'busy' && <p role="status" className="flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />Confirming your address…</p>}
      {state.kind === 'done' && <p role="status" className="flex items-center justify-center gap-2 text-foreground"><Check className="text-gold" aria-hidden />{state.already ? 'This address was already confirmed. Nothing else to do.' : 'Thank you — your address is confirmed.'}</p>}
      {state.kind === 'error' && <div role="alert" className="space-y-3"><p className="text-destructive">{state.message}</p>{UUID.test(token) && <Button variant="outline" onClick={() => setAttempt(a => a + 1)}>Try again</Button>}</div>}
      <Button asChild variant="ghost"><Link to="/">Back to Zodaci</Link></Button>
    </section>
  );
}
