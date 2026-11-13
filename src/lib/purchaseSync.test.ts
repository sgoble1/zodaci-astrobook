import { describe, expect, it, vi } from 'vitest';
vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));
import { isFinalPurchaseSync, normalizePurchaseSync, purchaseSyncMessage } from './purchaseSync';

describe('purchase sync', () => {
  it('never treats an error or unknown answer as paid', () => {
    expect(normalizePurchaseSync({ status: 'active' }, true)).toBe('error');
    expect(normalizePurchaseSync({ error: 'nope', status: 'active' }, false)).toBe('error');
    expect(normalizePurchaseSync({ status: 'paid_somehow' }, false)).toBe('error');
    expect(normalizePurchaseSync({ status: 'active' }, false)).toBe('active');
  });
  it('keeps checking only while pending or erroring', () => {
    expect(isFinalPurchaseSync('pending')).toBe(false);
    expect(isFinalPurchaseSync('error')).toBe(false);
    expect(isFinalPurchaseSync('failed')).toBe(true);
    expect(isFinalPurchaseSync('expired')).toBe(true);
  });
  it('tells members a failed or expired checkout did not charge them', () => {
    expect(purchaseSyncMessage('comic', 'failed').tone).toBe('stop');
    expect(purchaseSyncMessage('comic', 'failed').text).toMatch(/weren’t charged/);
    expect(purchaseSyncMessage('book', 'expired').text).toMatch(/weren’t charged/);
  });
  it('asks members not to pay again while confirming', () => {
    expect(purchaseSyncMessage('book', 'pending').tone).toBe('wait');
    expect(purchaseSyncMessage('book', 'error').text).toMatch(/don’t pay again/);
  });
});
