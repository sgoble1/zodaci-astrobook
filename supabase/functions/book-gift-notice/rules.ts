import { isPaidBook } from '../_shared/book-delivery-rules.ts';

type GiftOrderEvidence = {
  status: string; gift: boolean; environment: string; payment_hold: string | null;
  checkout_session_id: string | null; payment_intent_id: string | null;
  payment_currency: string | null; payment_total_cents: number | null;
  base_price_cents: number; extras_cents: number | null; shipping_cents: number | null;
  payment_tax_cents: number | null;
};

/** These evidence fields are writable only by verified server payment flows. */
export function verifiedGiftPurchase(order: GiftOrderEvidence): boolean {
  const subtotal = order.base_price_cents + (order.extras_cents ?? 0);
  const tax = order.payment_tax_cents ?? 0;
  const shipping = order.shipping_cents ?? 0;
  return order.gift && isPaidBook(order) && order.environment === 'live' && !order.payment_hold
    && /^cs_live_[A-Za-z0-9]+$/.test(order.checkout_session_id ?? '')
    && /^pi_[A-Za-z0-9]+$/.test(order.payment_intent_id ?? '')
    && order.payment_currency === 'usd' && Number.isSafeInteger(subtotal) && subtotal > 0
    && Number.isSafeInteger(tax) && tax >= 0 && Number.isSafeInteger(shipping) && shipping >= 0
    && order.payment_total_cents === subtotal + tax + shipping;
}