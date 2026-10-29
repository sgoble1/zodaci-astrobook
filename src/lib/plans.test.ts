import { describe, expect, it } from 'vitest';
import { PRICE_TIER, SELLABLE_PRICES, PLAN_NAME, PLAN_PRICE, PLAN_AMOUNT, yearlySaving, maxYearlySavingPct, REFUND_WINDOW_DAYS, SIGNUP_BONUS_CREDITS } from '@/lib/plans';

describe('plans', () => {
  it('Pro is $9/month and Cosmic $19/month', () => {
    expect(PLAN_PRICE.full.month).toBe('$9/month');
    expect(PLAN_PRICE.creator.month).toBe('$19/month');
    expect(PLAN_NAME.full).toBe('Pro'); expect(PLAN_NAME.creator).toBe('Cosmic');
  });
  it('annual plans are Pro $89/year and Cosmic $179/year', () => {
    expect(PLAN_PRICE.full.year).toBe('$89/year');
    expect(PLAN_PRICE.creator.year).toBe('$179/year');
    expect(PLAN_AMOUNT.full).toEqual({ month: 9, year: 89 });
    expect(PLAN_AMOUNT.creator).toEqual({ month: 19, year: 179 });
  });
  it('annual savings are $19 for Pro and $49 for Cosmic, advertised as up to 21%', () => {
    expect(yearlySaving('full')).toBe(19);
    expect(yearlySaving('creator')).toBe(49);
    expect(maxYearlySavingPct()).toBe(21);
  });
  it('first subscription payments can be refunded within 7 days', () => {
    expect(REFUND_WINDOW_DAYS).toBe(7);
  });
  it('new members get a 10-credit welcome bonus', () => {
    expect(SIGNUP_BONUS_CREDITS).toBe(10);
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

describe('checkout price mirror', () => {
  it('server checkout charges exactly the advertised membership prices', async () => {
    const { readFileSync } = await import('node:fs');
    const src = readFileSync('supabase/functions/_shared/billing.ts', 'utf8');
    const ids = [PLAN_PRICE.full.monthId, PLAN_PRICE.full.yearId, PLAN_PRICE.creator.monthId, PLAN_PRICE.creator.yearId];
    const cents = [PLAN_AMOUNT.full.month, PLAN_AMOUNT.full.year, PLAN_AMOUNT.creator.month, PLAN_AMOUNT.creator.year].map(d => d * 100);
    ids.forEach((id, i) => expect(src).toMatch(new RegExp(`${id}: \\{ amount: ${cents[i]}, interval: '${i % 2 ? 'year' : 'month'}', tier: '${i < 2 ? 'full' : 'creator'}' \\}`)));
    expect([...SELLABLE_PRICES].sort()).toEqual([...ids].sort());
  });
});
