import { describe, it, expect } from 'vitest';
import { trackingUrl, shippingError } from './tracking';

describe('shipping', () => {
  it('builds a USPS link', () => expect(trackingUrl('USPS', '9400 1')).toBe('https://tools.usps.com/go/TrackConfirmAction?tLabels=9400%201'));
  it('blocks shipping unpaid orders', () => expect(shippingError('awaiting_payment', 'shipped', 'UPS', '1Z')).not.toBeNull());
  it('requires tracking to ship', () => expect(shippingError('paid', 'shipped', 'UPS', '')).not.toBeNull());
  it('allows paid order with tracking', () => expect(shippingError('printing', 'shipped', 'UPS', '1Z')).toBeNull());
});
