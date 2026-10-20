import { describe, expect, it } from 'vitest';
import { PRICE_TIER, SELLABLE_PRICES, PLAN_NAME, PLAN_PRICE } from '@/lib/plans';

describe('plans', () => {
  it('Pro is $9/month and Cosmic $19/month', () => {
    expect(PLAN_PRICE.full.month).toBe('$9/month');
    expect(PLAN_PRICE.creator.month).toBe('$19/month');
    expect(PLAN_NAME.full).toBe('Pro'); expect(PLAN_NAME.creator).toBe('Cosmic');
  });
  it('legacy Full Access and Creator subscribers keep their tier', () => {
    expect(PRICE_TIER.full_access_monthly).toBe('full');
    expect(PRICE_TIER.creator_yearly).toBe('creator');
  });
  it('only the new plans are sold', () => {
    expect(SELLABLE_PRICES).not.toContain('full_access_monthly');
    expect(SELLABLE_PRICES).toEqual(['pro_monthly', 'pro_yearly', 'cosmic_monthly', 'cosmic_yearly']);
  });
});
