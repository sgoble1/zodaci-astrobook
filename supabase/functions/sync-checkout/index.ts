// Confirms a finished membership checkout straight from the payment provider, so the plan unlocks
// on the return page even if the webhook is slow. Only the member who paid can sync their own session.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";
import { MEMBERSHIP, subscriptionFields } from "../_shared/billing.ts";

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const LEGACY = new Set(['full_access_monthly', 'full_access_yearly', 'creator_monthly', 'creator_yearly']);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return json({ error: "Please sign in first." }, 401);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user } } = await admin.auth.getUser(token);
    if (!user) return json({ error: "Please sign in first." }, 401);
    const body = await req.json().catch(() => ({}));
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';
    if (body.environment !== 'sandbox' && body.environment !== 'live') return json({ error: 'Invalid environment' }, 400);
    const env: StripeEnv = body.environment;
    if (!/^cs_(test|live)_[A-Za-z0-9]{8,200}$/.test(sessionId)) return json({ error: 'Invalid checkout reference' }, 400);
    if ((env === 'live') !== sessionId.startsWith('cs_live_')) return json({ error: 'Checkout reference does not match this site.' }, 400);

    const stripe = createStripeClient(env);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.userId !== user.id) return json({ error: 'This checkout belongs to another account.' }, 403);
    if (session.mode !== 'subscription' || session.metadata?.kind === 'comic') return json({ status: 'not_membership' });
    if (session.status !== 'complete' || session.payment_status === 'unpaid') return json({ status: 'pending' });
    const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
    if (!subId) return json({ status: 'pending' });
    const subscription = await stripe.subscriptions.retrieve(subId);
    if (subscription.metadata?.userId !== user.id) return json({ error: 'This checkout belongs to another account.' }, 403);
    const f = subscriptionFields(subscription);
    if (!MEMBERSHIP[f.price_id] && !LEGACY.has(f.price_id)) return json({ status: 'not_membership' });
    const saved = await admin.from('billing_subscriptions').upsert({
      user_id: user.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
      environment: env,
      ...f,
    }, { onConflict: 'stripe_subscription_id' });
    if (saved.error) throw saved.error;
    return json({ status: ['active', 'trialing'].includes(f.status) ? 'active' : f.status });
  } catch (e) {
    console.error('sync-checkout', e);
    return json({ error: 'Could not confirm the payment yet. Please try again in a moment.' }, 500);
  }
});
