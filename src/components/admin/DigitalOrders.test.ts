import { describe, expect, it } from 'vitest';
import { needsAttention } from './DigitalOrders';

describe('digital order attention', () => {
  it('flags a paid order whose PDF was never prepared', () => expect(needsAttention({ status: 'paid', payment_hold: null, pdf_ready_at: null })).toBe(true));
  it('flags an order held for payment review', () => expect(needsAttention({ status: 'paid', payment_hold: 'amount_mismatch', pdf_ready_at: null })).toBe(true));
  it('does not flag a delivered PDF', () => expect(needsAttention({ status: 'paid', payment_hold: null, pdf_ready_at: '2026-11-01T00:00:00Z' })).toBe(false));
  it('does not flag an unpaid draft', () => expect(needsAttention({ status: 'awaiting_payment', payment_hold: null, pdf_ready_at: null })).toBe(false));
});
