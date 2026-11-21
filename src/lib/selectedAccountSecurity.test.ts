import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { verifiedGiftPurchase } from '../../supabase/functions/book-gift-notice/rules';

const paid = {
  status: 'paid', gift: true, environment: 'live', payment_hold: null,
  checkout_session_id: 'cs_live_verified', payment_intent_id: 'pi_verified',
  payment_currency: 'usd', payment_total_cents: 2599,
  base_price_cents: 2499, extras_cents: 0, shipping_cents: 0, payment_tax_cents: 100,
};

describe('selected account and gift security', () => {
  it('requires reconciled server payment evidence, not just a paid label', () => {
    expect(verifiedGiftPurchase(paid)).toBe(true);
    for (const patch of [
      { status: 'draft' }, { gift: false }, { environment: 'sandbox' },
      { checkout_session_id: null }, { checkout_session_id: 'cs_test_other' },
      { payment_intent_id: null }, { payment_currency: 'eur' },
      { payment_total_cents: 0 }, { payment_total_cents: 2499 },
      { payment_hold: 'refunded' }, { base_price_cents: 0 }, { payment_tax_cents: -100 },
    ]) expect(verifiedGiftPurchase({ ...paid, ...patch })).toBe(false);
  });
  it('authorizes the buyer and purchase before sending one notice per order', () => {
    const handler = readFileSync('supabase/functions/book-gift-notice/index.ts', 'utf8');
    expect(handler).toContain(".eq('user_id', user.id)");
    expect(handler.indexOf('if (!verifiedGiftPurchase(order))')).toBeLessThan(handler.indexOf("sendAppEmail('book-gift'"));
    expect(handler).toContain('idempotencyKey: `book-gift-${order.id}`');
    expect(handler).toContain('.strict().safeParse');
  });
  it('binds protected account probes to self, administrators or services', () => {
    const sql = readFileSync('drizzle/migrations/0097_secure_selected_account_helpers.sql', 'utf8');
    for (const name of ['has_role', 'has_active_subscription', 'has_paid_plan']) {
      const definition = sql.split(`CREATE OR REPLACE FUNCTION public.${name}(`)[1].split('$$;')[0];
      expect(definition).toContain("auth.role() = 'service_role'");
      expect(definition).toContain('= auth.uid()');
      expect(definition).toContain('ELSE false END');
    }
    expect(sql).toContain('FROM auth.users u WHERE u.id = uid');
    expect(sql).toContain('joined > now()');
    expect(sql).not.toContain('FROM public.profiles');
    expect(sql).toContain('ALTER FUNCTION public.get_document_overrides() SECURITY INVOKER');
  });
  it('clears document settings and fences delayed replies on account changes', () => {
    const hook = readFileSync('src/hooks/useDocOverrides.ts', 'utf8');
    expect(hook).toContain('onAccountChange');
    expect(hook).toContain('setMap({})');
    expect(hook).toContain('request === generation.current');
    expect(hook).toContain('active = false');
  });
});