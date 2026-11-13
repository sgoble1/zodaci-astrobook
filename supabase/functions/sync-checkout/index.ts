// Confirms a finished membership, AstroComic or AstroBook checkout straight from the payment provider,
// so the return page unlocks even if the webhook is slow. Only the member who paid can sync their own session.
// Activation reuses the webhook's verification (_shared/purchase-confirm.ts); clients never mark themselves paid.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";
import { MEMBERSHIP, subscriptionFields } from "../_shared/billing.ts";
import { comicPaid, bookPaid } from "../_shared/purchase-confirm.ts";

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const LEGACY = new Set(['full_access_monthly', 'full_access_yearly', 'creator_monthly', 'creator_yearly']);

// deno-lint-ignore no-explicit-any
type Any = any;

/** A checkout that will never be paid: it timed out, or its delayed payment (e.g. bank debit) failed. */
async function unpaidOutcome(stripe: Any, session: Any): Promise<'expired' | 'failed' | 'pending'> {
  if (session.status === 'expired') return 'expired';
  const intentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
  if (session.status === 'complete' && session.payment_status === 'unpaid' && intentId) {
    const intent = await stripe.paymentIntents.retrieve(intentId);
    if (['requires_payment_method', 'canceled'].includes(intent.status)) return 'failed';
  }
  return 'pending';
}

async function syncComic(admin: Any, stripe: Any, session: Any, env: StripeEnv, userId: string) {
  const comicId = session.metadata?.comicId;
  if (!comicId) return { status: 'not_found' };
  if (session.status === 'complete' && ['paid', 'no_payment_required'].includes(session.payment_status)) await comicPaid(admin, session, env);
  const { data: row, error } = await admin.from('comic_subscriptions').select('status').eq('id', comicId).eq('user_id', userId).eq('environment', env).eq('checkout_session_id', session.id).maybeSingle();
  if (error) throw error;
  if (row && row.status !== 'pending') return { status: row.status === 'active' ? 'active' : row.status, kind: 'comic' };
  return { status: await unpaidOutcome(stripe, session), kind: 'comic' };
}

async function syncBook(admin: Any, stripe: Any, session: Any, env: StripeEnv, userId: string) {
  const orderId = session.metadata?.orderId;
  if (session.status === 'complete' && session.payment_status === 'paid') await bookPaid(admin, session, env);
  const { data: order, error } = await admin.from('book_orders').select('status,payment_hold,checkout_session_id').eq('id', orderId).eq('user_id', userId).eq('environment', env).maybeSingle();
  if (error) throw error;
  if (!order) return { status: 'not_found', kind: 'book' };
  if (order.payment_hold) return { status: 'review', kind: 'book' };
  if (!['draft', 'awaiting_payment'].includes(order.status)) return { status: 'active', kind: 'book' };
  // The order may already be tied to a newer checkout; only report this session's own outcome.
  return { status: await unpaidOutcome(stripe, session), kind: 'book' };
}

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
    if (session.metadata?.kind === 'comic') return json(await syncComic(admin, stripe, session, env, user.id));
    if (session.mode === 'payment' && session.metadata?.orderId) return json(await syncBook(admin, stripe, session, env, user.id));
    if (session.mode !== 'subscription') return json({ status: 'not_membership' });
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
    if (/amount does not match|Non-US/.test(String((e as Error)?.message))) { console.error('sync-checkout verification', e); return json({ status: 'review' }); }
    if ((e as { code?: string })?.code === 'resource_missing') return json({ error: 'That checkout could not be found.' }, 404);
    console.error('sync-checkout', e);
    return json({ error: 'Could not confirm the payment yet. Please try again in a moment.' }, 500);
  }
});
