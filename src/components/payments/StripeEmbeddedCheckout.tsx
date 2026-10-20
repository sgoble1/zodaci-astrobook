import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { getStripe, getStripeEnvironment } from '@/lib/stripe';
import { supabase } from '@/integrations/supabase/client';

/** Embedded checkout for a plan price, or for an AstroComic plan when `comicPlan` is set. */
export function StripeEmbeddedCheckout({ priceId, comicPlan, returnUrl, onError }: { priceId?: string; comicPlan?: string; returnUrl: string; onError?: (message: string) => void }) {
  const fetchClientSecret = async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('create-checkout', { body: { ...(comicPlan ? { comicPlan } : { priceId }), returnUrl, environment: getStripeEnvironment() } });
    if (error || !data?.clientSecret) {
      let message: string | undefined = data?.error;
      if (!message && error && 'context' in error && error.context instanceof Response) message = (await error.context.json().catch(() => null))?.error;
      message = message || error?.message || 'Could not open checkout';
      onError?.(message);
      throw new Error(message);
    }
    return data.clientSecret;
  };
  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
