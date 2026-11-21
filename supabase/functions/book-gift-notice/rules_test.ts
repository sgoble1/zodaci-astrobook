import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';
import { verifiedGiftPurchase } from './rules.ts';

const paid = {
  status: 'paid', gift: true, environment: 'live', payment_hold: null,
  checkout_session_id: 'cs_live_verified', payment_intent_id: 'pi_verified',
  payment_currency: 'usd', payment_total_cents: 2599,
  base_price_cents: 2499, extras_cents: 0, shipping_cents: 0, payment_tax_cents: 100,
};

Deno.test('gift mail requires server-written live payment evidence', () => {
  assertEquals(verifiedGiftPurchase(paid), true);
  for (const patch of [
    { status: 'draft' }, { gift: false }, { environment: 'sandbox' },
    { checkout_session_id: null }, { checkout_session_id: 'cs_test_other' },
    { payment_intent_id: null }, { payment_currency: 'eur' },
    { payment_total_cents: 0 }, { payment_total_cents: 2499 },
    { payment_hold: 'refunded' },
  ]) assertEquals(verifiedGiftPurchase({ ...paid, ...patch }), false);
});

Deno.test('gift mail accepts exactly reconciled extras, shipping and tax', () => {
  const physical = { ...paid, extras_cents: 500, shipping_cents: 800, payment_total_cents: 3899 };
  assertEquals(verifiedGiftPurchase(physical), true);
  assertEquals(verifiedGiftPurchase({ ...physical, payment_total_cents: 3898 }), false);
  assertEquals(verifiedGiftPurchase({ ...physical, shipping_cents: -1 }), false);
});