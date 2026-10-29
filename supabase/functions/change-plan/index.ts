// Switches an existing membership to another plan (Pro <-> Cosmic, monthly <-> yearly) on the same
// subscription, with prorated billing, so members never hold two subscriptions or pay twice.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";
import { MEMBERSHIP, isPreviewOrigin, matchesAdvertised, subscriptionFields } from "../_shared/billing.ts";

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
/** Mirrors PRICE_TIER in src/lib/plans.ts, including grandfathered prices. */
const TIER: Record<string, 'full' | 'creator'> = { pro_monthly: 'full', pro_yearly: 'full', cosmic_monthly: 'creator', cosmic_yearly: 'creator', full_access_monthly: 'full', full_access_yearly: 'full', creator_monthly: 'creator', creator_yearly: 'creator' };
const RANK = { full: 1, creator: 2 } as const;

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
    const priceId = typeof body.priceId === 'string' ? body.priceId : '';
    if (!MEMBERSHIP[priceId]) return json({ error: 'Unknown plan' }, 400);
    if (body.environment !== 'sandbox' && body.environment !== 'live') return json({ error: 'Invalid environment' }, 400);
    const env: StripeEnv = body.environment;
    if (env === 'live' && isPreviewOrigin(req.headers.get('Origin') ?? '')) return json({ error: 'Live payments only open on the published site.' }, 400);

    const { data: rows, error } = await admin.from('billing_subscriptions').select('stripe_subscription_id,price_id,status').eq('user_id', user.id).eq('environment', env).in('status', ['active', 'trialing', 'past_due']).order('created_at', { ascending: false });
    if (error) throw error;
    const row = (rows ?? []).find(r => TIER[r.price_id]);
    if (!row) return json({ error: 'No membership to change. Choose a plan to start one.' }, 404);
    if (row.status === 'past_due') return json({ error: 'Your last payment did not go through. Update your card in Manage billing first.' }, 409);
    if (row.price_id === priceId) return json({ error: 'You are already on this plan.' }, 400);

    const stripe = createStripeClient(env);
    const subscription = await stripe.subscriptions.retrieve(row.stripe_subscription_id);
    if (subscription.metadata?.userId !== user.id) return json({ error: 'This membership belongs to another account.' }, 403);
    const item = subscription.items.data[0];
    if (!item) throw new Error('Subscription has no items');
    const prices = await stripe.prices.list({ lookup_keys: [priceId] });
    const price = prices.data[0];
    if (!price) return json({ error: 'That plan is not available right now.' }, 404);
    if (!matchesAdvertised(priceId, price)) { console.error('Plan price mismatch', priceId, price.unit_amount); return json({ error: 'Checkout prices do not match the advertised plan prices. Please contact support.' }, 409); }

    const from = MEMBERSHIP[row.price_id] ?? { tier: TIER[row.price_id], interval: item.price.recurring?.interval ?? 'month' };
    const to = MEMBERSHIP[priceId];
    // Moving up (Cosmic, or monthly to yearly) charges the prorated difference now and only applies once paid.
    const upgrade = RANK[to.tier] > RANK[from.tier] || (to.tier === from.tier && to.interval === 'year' && from.interval === 'month');
    const updated = await stripe.subscriptions.update(subscription.id, upgrade
      ? { items: [{ id: item.id, price: price.id }], proration_behavior: 'always_invoice', payment_behavior: 'pending_if_incomplete' }
      : { items: [{ id: item.id, price: price.id }], proration_behavior: 'create_prorations' });
    if (updated.pending_update) return json({ status: 'payment_needed', error: 'Your bank did not approve the plan change. Update your card in Manage billing and try again.' }, 402);

    const f = subscriptionFields(updated);
    const saved = await admin.from('billing_subscriptions').update(f).eq('stripe_subscription_id', updated.id).eq('environment', env);
    if (saved.error) throw saved.error;
    return json({ status: 'changed', tier: TIER[f.price_id] ?? null, upgrade });
  } catch (e) {
    console.error('change-plan', e);
    return json({ error: 'Could not change your plan right now. Nothing was charged. Please try again.' }, 500);
  }
});
