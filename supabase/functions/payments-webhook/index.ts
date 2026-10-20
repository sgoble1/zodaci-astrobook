import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, verifyWebhook, createStripeClient } from "../_shared/stripe.ts";
import { verifiedBookAmount } from '../_shared/book-payment-rules.ts';

import { finalizeBookPdf } from '../_shared/book-delivery.ts';

let _supabase: ReturnType<typeof createClient> | null = null;
function db() {
  if (!_supabase) _supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  return _supabase;
}

function fields(subscription: any) {
  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.lookup_key || item?.price?.metadata?.lovable_external_id || item?.price?.id;
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;
  return {
    product_id: typeof item?.price?.product === "string" ? item.price.product : item?.price?.product?.id ?? "",
    price_id: priceId ?? "",
    status: subscription.status,
    current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at_period_end: subscription.cancel_at_period_end || false,
    updated_at: new Date().toISOString(),
  };
}

/** Mirrors PRICE_TIER in src/lib/plans.ts: only these prices are Zodaci plans (and can earn a referral reward). */
const PLAN_PRICES = new Set(['pro_monthly', 'pro_yearly', 'cosmic_monthly', 'cosmic_yearly', 'full_access_monthly', 'full_access_yearly', 'creator_monthly', 'creator_yearly']);
/** Mirrors COMIC_PLANS in src/lib/comic.ts. */
const COMIC_CENTS: Record<string, number> = { monthly: 1499, yearly: 14999, single: 1899 };

async function created(subscription: any, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId) { console.error("No userId in subscription metadata"); return; }
  const f = fields(subscription);
  const result = await db().from("billing_subscriptions").upsert({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer,
    environment: env,
    ...f,
  }, { onConflict: "stripe_subscription_id" });
  if (result.error) throw result.error;
  if (subscription.metadata?.kind === 'comic' || String(f.price_id).startsWith('comic_')) await comicSubscription(subscription, env, f);
  // A referred member's first paid plan rewards the friend who invited them (live payments only).
  if (env === 'live' && PLAN_PRICES.has(f.price_id) && ['active', 'trialing'].includes(f.status)) {
    const reward = await db().rpc('reward_referral', { _referred: userId });
    if (reward.error) console.error('Referral reward failed', reward.error);
  }
}

/** Keep the AstroComic subscription in step with the payment provider. Member pause/skip settings are never overwritten. */
async function comicSubscription(subscription: any, env: StripeEnv, f: ReturnType<typeof fields>) {
  const status = ['active', 'trialing'].includes(f.status) ? 'active' : ['past_due', 'unpaid', 'incomplete'].includes(f.status) ? 'past_due' : ['canceled', 'incomplete_expired'].includes(f.status) ? 'canceled' : null;
  const patch: Record<string, unknown> = { stripe_subscription_id: subscription.id, stripe_customer_id: subscription.customer, current_period_end: f.current_period_end, cancel_at_period_end: f.cancel_at_period_end };
  const comicId = subscription.metadata?.comicId;
  const scoped = (body: Record<string, unknown>) => { const q = db().from('comic_subscriptions').update(body).eq('environment', env); return comicId ? q.eq('id', comicId).eq('user_id', subscription.metadata?.userId ?? '') : q.eq('stripe_subscription_id', subscription.id); };
  const result = await scoped(patch);
  if (result.error) throw result.error;
  // Activation happens only after the verified checkout (comicPaid); later renewals and failures update status here.
  if (status) { const s = status === 'active' ? await scoped({ status }).neq('status', 'pending') : await scoped({ status }); if (s.error) throw s.error; }
}

/** Checkout finished for an AstroComic plan: verify the amount, save the delivery address and activate. */
async function comicPaid(session: any, env: StripeEnv) {
  const comicId = session.metadata?.comicId; const userId = session.metadata?.userId; const plan = session.metadata?.comicPlan;
  if (!comicId || !userId || !COMIC_CENTS[plan]) return;
  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') return;
  if (session.amount_subtotal !== COMIC_CENTS[plan] || session.currency !== 'usd') throw new Error('AstroComic payment amount does not match the plan');
  const ship = session.collected_information?.shipping_details || session.shipping_details;
  const address = ship?.address;
  if (address && address.country !== 'US') throw new Error('Non-US shipping address');
  const patch: Record<string, unknown> = { status: 'active', stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null };
  if (typeof session.subscription === 'string') patch.stripe_subscription_id = session.subscription;
  if (address) patch.shipping_address = { name: ship?.name ?? '', line1: address.line1 ?? '', line2: address.line2 ?? '', city: address.city ?? '', state: address.state ?? '', postal_code: address.postal_code ?? '', country: address.country };
  const result = await db().from('comic_subscriptions').update(patch).eq('id', comicId).eq('user_id', userId).eq('environment', env).eq('checkout_session_id', session.id).in('status', ['pending', 'active']);
  if (result.error) throw result.error;
}

async function updated(subscription: any, env: StripeEnv) {
  await created(subscription, env);
}

async function bookPaid(session: any, env: StripeEnv) {
  const orderId = session.metadata?.orderId; const userId = session.metadata?.userId;
  if (!orderId || !userId || session.payment_status !== 'paid') return;
  const { data: existing, error: existingError } = await db().from('book_orders').select('*').eq('id', orderId).eq('user_id', userId).eq('checkout_session_id', session.id).eq('environment', env).maybeSingle();
  if (existingError) throw existingError;
  if (!existing) return;
  if (!verifiedBookAmount(existing, session)) throw new Error('Book payment amount does not match order');
  if (existing.payment_hold) return;
  const address = session.collected_information?.shipping_details?.address || session.shipping_details?.address;
  if (address && address.country !== 'US') throw new Error('Non-US shipping address');
  const patch = { status:'paid',payment_total_cents:session.amount_total,payment_currency:session.currency,payment_tax_cents:session.total_details?.amount_tax ?? 0,payment_intent_id:typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,updated_at:new Date().toISOString(), ...(address ? { shipping_address: { ...address,name:session.collected_information?.shipping_details?.name || session.shipping_details?.name || '' } } : {}) };
  const result = await db().from('book_orders').update(patch).eq('id',orderId).eq('user_id',userId).eq('checkout_session_id',session.id).eq('environment',env).in('status',['draft','awaiting_payment']);
  if (result.error) throw result.error;
  const {data:order,error}=await db().from('book_orders').select('*').eq('id',orderId).eq('user_id',userId).eq('checkout_session_id',session.id).eq('environment',env).single();
  if(error) throw error;
  if(order && ['paid','printing','shipped','delivered'].includes(order.status)) await finalizeBookPdf(db(),order);
}

async function deleted(subscription: any, env: StripeEnv) {
  const result = await db().from("billing_subscriptions").update({ status: "canceled", updated_at: new Date().toISOString() }).eq("stripe_subscription_id", subscription.id).eq("environment", env);
  if (result.error) throw result.error;
  const comic = await db().from('comic_subscriptions').update({ status: 'canceled' }).eq('stripe_subscription_id', subscription.id).eq('environment', env);
  if (comic.error) throw comic.error;
}

async function retrySession(session: any, env: StripeEnv) {
  const result = await db().from('book_orders').update({ status: 'draft', checkout_session_id: null, updated_at: new Date().toISOString() }).eq('checkout_session_id', session.id).eq('environment', env).eq('status', 'awaiting_payment').is('payment_total_cents', null);
  if (result.error) throw result.error;
}

/** Record provider exceptions; never issue refunds or invent cancellation policy. */
async function paymentHold(object: any, env: StripeEnv, type: string, created: number) {
  const intent = typeof object.payment_intent === 'string' ? object.payment_intent : object.payment_intent?.id;
  if (!intent) return;
  const stripe = createStripeClient(env);
  const payment = await stripe.paymentIntents.retrieve(intent);
  const orderId = payment.metadata?.orderId;
  if (!orderId) return;
  const timestamp = new Date(created * 1000).toISOString();
  const { data: order, error } = await db().from('book_orders').select('id,payment_event_at,payment_hold').eq('id', orderId).eq('environment', env).maybeSingle();
  if (error) throw error;
  if (!order || (order.payment_event_at && order.payment_event_at > timestamp)) return;
  const hold = type === 'charge.refunded' ? 'Refund recorded — review fulfillment' : type === 'charge.dispute.closed' && object.status === 'won' && order.payment_hold?.startsWith('Dispute') ? null : 'Dispute — fulfillment review required';
  const result = await db().from('book_orders').update({ payment_hold: hold, payment_event_at: timestamp, payment_intent_id: intent }).eq('id', order.id).eq('environment', env);
  if (result.error) throw result.error;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  const env: StripeEnv = rawEnv;
  try {
    const event = await verifyWebhook(req, env);
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': if (event.data.object.metadata?.kind === 'comic') await comicPaid(event.data.object, env); else await bookPaid(event.data.object,env); break;
      case 'checkout.session.async_payment_failed':
      case 'checkout.session.expired': await retrySession(event.data.object, env); break;
      case 'charge.refunded':
      case 'charge.dispute.created':
      case 'charge.dispute.closed': await paymentHold(event.data.object, env, event.type, event.created); break;
      case "customer.subscription.created": await created(event.data.object, env); break;
      case "customer.subscription.updated": await updated(event.data.object, env); break;
      case "customer.subscription.deleted": await deleted(event.data.object, env); break;
      default: console.log("Unhandled event:", event.type);
    }
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Webhook error", { status: 400 });
  }
});
