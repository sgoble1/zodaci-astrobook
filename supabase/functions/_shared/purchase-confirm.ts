// Verified activation for AstroComic and AstroBook checkouts. Shared by payments-webhook and
// sync-checkout so a slow webhook and the return-page re-check apply exactly the same rules.
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import type { StripeEnv } from "./stripe.ts";
import { verifiedBookAmount } from './book-payment-rules.ts';
import { isPaidBook } from './book-delivery-rules.ts';
import { finalizeBookPdf } from './book-delivery.ts';

/** Mirrors COMIC_PLANS in src/lib/comic.ts. */
export const COMIC_CENTS: Record<string, number> = { monthly: 1499, yearly: 14999, single: 1899 };

/** Checkout finished for an AstroComic plan: verify the amount, save the delivery address and activate. */
// deno-lint-ignore no-explicit-any
export async function comicPaid(db: SupabaseClient<any, any, any>, session: any, env: StripeEnv) {
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
  // Only a pending row moves to active here, so a later renewal or member pause is never overwritten.
  const result = await db.from('comic_subscriptions').update(patch).eq('id', comicId).eq('user_id', userId).eq('environment', env).eq('checkout_session_id', session.id).eq('status', 'pending');
  if (result.error) throw result.error;
}

/** Checkout finished for an AstroBook: verify the amount against the stored order, mark paid and finalize the PDF. */
// deno-lint-ignore no-explicit-any
export async function bookPaid(db: SupabaseClient<any, any, any>, session: any, env: StripeEnv) {
  const orderId = session.metadata?.orderId; const userId = session.metadata?.userId;
  if (!orderId || !userId || session.payment_status !== 'paid') return;
  const { data: existing, error: existingError } = await db.from('book_orders').select('*').eq('id', orderId).eq('user_id', userId).eq('checkout_session_id', session.id).eq('environment', env).maybeSingle();
  if (existingError) throw existingError;
  if (!existing) return;
  if (!verifiedBookAmount(existing, session)) throw new Error('Book payment amount does not match order');
  if (existing.payment_hold) return;
  const address = session.collected_information?.shipping_details?.address || session.shipping_details?.address;
  if (address && address.country !== 'US') throw new Error('Non-US shipping address');
  const patch = { status:'paid',payment_total_cents:session.amount_total,payment_currency:session.currency,payment_tax_cents:session.total_details?.amount_tax ?? 0,payment_intent_id:typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,updated_at:new Date().toISOString(), ...(address ? { shipping_address: { ...address,name:session.collected_information?.shipping_details?.name || session.shipping_details?.name || '',phone:String(session.customer_details?.phone ?? '').slice(0,25) } } : {}) };
  const result = await db.from('book_orders').update(patch).eq('id',orderId).eq('user_id',userId).eq('checkout_session_id',session.id).eq('environment',env).in('status',['draft','awaiting_payment']);
  if (result.error) throw result.error;
  const {data:order,error}=await db.from('book_orders').select('*').eq('id',orderId).eq('user_id',userId).eq('checkout_session_id',session.id).eq('environment',env).single();
  if(error) throw error;
  if(order && isPaidBook(order)) await finalizeBookPdf(db,order);
}
