// The "pure" entry adds Stripe's script only when checkout actually opens; the default entry injects it (and its
// fraud-signal iframe) on every page that imports this file, which kept member pages busy for seconds.
import { loadStripe } from "@stripe/stripe-js/pure";
import type { Stripe } from "@stripe/stripe-js";

type StripeEnv = 'sandbox' | 'live';
const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

function paymentsEnvironment(): StripeEnv {
  if (clientToken?.startsWith('pk_test_')) return 'sandbox';
  if (clientToken?.startsWith('pk_live_')) return 'live';
  throw new Error("Payments are not configured for this build yet. Complete go-live in the Payments tab to enable checkout.");
}

let stripePromise: Promise<Stripe | null> | null = null;
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    // Unconfigured builds resolve to null so checkout shows its own error instead of crashing the page.
    try { paymentsEnvironment(); } catch { return Promise.resolve(null); }
    stripePromise = loadStripe(clientToken as string);
  }
  return stripePromise;
}
export function getStripeEnvironment(): StripeEnv { return paymentsEnvironment(); }
