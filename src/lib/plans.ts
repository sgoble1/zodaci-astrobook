/** Single source of truth for subscription plans, prices and checkout IDs. */
export type Tier = 'free' | 'full' | 'creator';

export const PLAN_NAME: Record<Tier, string> = { free: 'Free', full: 'Pro', creator: 'Cosmic' };
export const PLAN_PRICE = {
  full: { month: '$9/month', year: '$89/year', monthId: 'pro_monthly', yearId: 'pro_yearly' },
  creator: { month: '$19/month', year: '$179/year', monthId: 'cosmic_monthly', yearId: 'cosmic_yearly' },
} as const;

/** Every price that grants a tier. Legacy Full Access/Creator prices keep working (grandfathered). */
export const PRICE_TIER: Record<string, Exclude<Tier, 'free'>> = {
  pro_monthly: 'full', pro_yearly: 'full', cosmic_monthly: 'creator', cosmic_yearly: 'creator',
  full_access_monthly: 'full', full_access_yearly: 'full', creator_monthly: 'creator', creator_yearly: 'creator',
};
/** Prices new members can buy. Legacy prices are no longer sold. */
export const SELLABLE_PRICES = ['pro_monthly', 'pro_yearly', 'cosmic_monthly', 'cosmic_yearly'];

/** Monthly AI credit allowance per tier (shown to members; enforced server-side). */
export const CREDIT_ALLOWANCE: Record<Tier, number> = { free: 5, full: 60, creator: 150 };
