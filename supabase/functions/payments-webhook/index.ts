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

async function created(subscription: any, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId) { console.error("No userId in subscription metadata"); return; }
  const result = await db().from("billing_subscriptions").upsert({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer,
    environment: env,
    ...fields(subscription),
  }, { onConflict: "stripe_subscription_id" });
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
      case 'checkout.session.async_payment_succeeded': await bookPaid(event.data.object,env); break;
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
