/** Single source of truth for subscription plans, prices and checkout IDs. */
export type Tier = 'free' | 'full' | 'creator';
type PaidTier = Exclude<Tier, 'free'>;

export const PLAN_NAME: Record<Tier, string> = { free: 'Free', full: 'Pro', creator: 'Cosmic' };

/** Whole-dollar amounts shown to visitors; checkout charges the matching price IDs below. */
export const PLAN_AMOUNT: Record<PaidTier, { month: number; year: number }> = {
  full: { month: 9, year: 89 },
  creator: { month: 19, year: 179 },
};

export const PLAN_PRICE = {
  full: { month: `$${PLAN_AMOUNT.full.month}/month`, year: `$${PLAN_AMOUNT.full.year}/year`, monthId: 'pro_monthly', yearId: 'pro_yearly' },
  creator: { month: `$${PLAN_AMOUNT.creator.month}/month`, year: `$${PLAN_AMOUNT.creator.year}/year`, monthId: 'cosmic_monthly', yearId: 'cosmic_yearly' },
} as const;

/** Dollars saved per year by paying annually instead of twelve monthly payments. */
export const yearlySaving = (tier: PaidTier) => PLAN_AMOUNT[tier].month * 12 - PLAN_AMOUNT[tier].year;
/** Largest annual saving across paid plans, as a whole percent rounded down so the claim is never overstated. */
export const maxYearlySavingPct = () => Math.max(...(Object.keys(PLAN_AMOUNT) as PaidTier[]).map(t => Math.floor((yearlySaving(t) / (PLAN_AMOUNT[t].month * 12)) * 100)));

/** Every price that grants a tier. Legacy Full Access/Creator prices keep working (grandfathered). */
export const PRICE_TIER: Record<string, PaidTier> = {
  pro_monthly: 'full', pro_yearly: 'full', cosmic_monthly: 'creator', cosmic_yearly: 'creator',
  full_access_monthly: 'full', full_access_yearly: 'full', creator_monthly: 'creator', creator_yearly: 'creator',
};
/** Prices new members can buy. Legacy prices are no longer sold. */
export const SELLABLE_PRICES = ['pro_monthly', 'pro_yearly', 'cosmic_monthly', 'cosmic_yearly'];

/** Monthly AI credit allowance per tier (shown to members; enforced server-side). */
export const CREDIT_ALLOWANCE: Record<Tier, number> = { free: 5, full: 60, creator: 150 };
/** One-time welcome credits for new members (granted server-side by claim_signup_bonus). */
export const SIGNUP_BONUS_CREDITS = 10;
/** Days a member can request a full refund after their first subscription payment. */
export const REFUND_WINDOW_DAYS = 7;

/** One-time AI credit packs. Purchased credits never expire and are used only after the monthly allowance. Server mirror: _shared/billing.ts CREDIT_PACKS. */
export const CREDIT_PACKS = [
  { id: 'credits_15', price: 15, credits: 150 }, { id: 'credits_20', price: 20, credits: 210 }, { id: 'credits_25', price: 25, credits: 275 },
  { id: 'credits_30', price: 30, credits: 340 }, { id: 'credits_50', price: 50, credits: 600 }, { id: 'credits_100', price: 100, credits: 1300 },
] as const;
