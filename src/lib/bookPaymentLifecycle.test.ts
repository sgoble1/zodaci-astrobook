import { describe, expect, it } from 'vitest';
import { verifiedBookAmount, retryableBookSession } from '../../supabase/functions/_shared/book-payment-rules';
const order = { base_price_cents: 8900, extras_cents: 699, shipping_cents: 0 };
const session = { payment_status: 'paid', currency: 'usd', amount_subtotal: 9599, amount_total: 10367, total_details: { amount_tax: 768, amount_shipping: 0, amount_discount: 0 } };
describe('verified book payment evidence', () => {
  it('accepts $89 plus $6.99 and provider tax', () => expect(verifiedBookAmount(order, session)).toBe(true));
  it('rejects an undercharged expanded book', () => expect(verifiedBookAmount(order, { ...session, amount_subtotal: 5900 })).toBe(false));
  it('rejects a different currency', () => expect(verifiedBookAmount(order, { ...session, currency: 'eur' })).toBe(false));
  it('rejects unpaid checkout completion', () => expect(verifiedBookAmount(order, { ...session, payment_status: 'unpaid' })).toBe(false));
  it('rejects incorrect totals even with correct subtotal', () => expect(verifiedBookAmount(order, { ...session, amount_total: 9599 })).toBe(false));
  it('failure events cannot clear a newer session', () => expect(retryableBookSession('awaiting_payment', 'new', 'old')).toBe(false));
  it('failure events cannot undo a paid order', () => expect(retryableBookSession('paid', 'same', 'same')).toBe(false));
  it('a matching unpaid session can be retried', () => expect(retryableBookSession('awaiting_payment', 'same', 'same')).toBe(true));
});