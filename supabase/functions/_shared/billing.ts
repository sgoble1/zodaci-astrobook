// Membership billing helpers shared by checkout, plan changes, checkout sync and the payments webhook.

/** Mirrors SELLABLE_PRICES / PLAN_AMOUNT in src/lib/plans.ts (cents, billing interval). Provider prices that differ are refused. */
export const MEMBERSHIP: Record<string, { amount: number; interval: 'month' | 'year'; tier: 'full' | 'creator' }> = {
  pro_monthly: { amount: 900, interval: 'month', tier: 'full' }, pro_yearly: { amount: 8900, interval: 'year', tier: 'full' },
  cosmic_monthly: { amount: 1900, interval: 'month', tier: 'creator' }, cosmic_yearly: { amount: 17900, interval: 'year', tier: 'creator' },
};

/** True when the provider's price matches what the site advertises for this membership. */
export function matchesAdvertised(lookup: string, price: { currency?: string | null; unit_amount?: number | null; recurring?: { interval?: string } | null }) {
  const want = MEMBERSHIP[lookup];
  return !!want && price.currency === 'usd' && price.unit_amount === want.amount && price.recurring?.interval === want.interval;
}

/** Row fields for billing_subscriptions from a provider subscription object. */
export function subscriptionFields(subscription: any) {
  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.lookup_key || item?.price?.metadata?.lovable_external_id || item?.price?.id;
  // Newer API versions put period fields on the item; older ones on the subscription. Keep both.
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;
  return {
    product_id: typeof item?.price?.product === 'string' ? item.price.product : item?.price?.product?.id ?? '',
    price_id: priceId ?? '',
    status: subscription.status,
    current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at_period_end: subscription.cancel_at_period_end || false,
    updated_at: new Date().toISOString(),
  };
}

/** Preview and local builds may only open test checkouts, so a preview can never take a real payment. */
export function isPreviewOrigin(origin: string) {
  try { const h = new URL(origin).hostname; return h === 'localhost' || h === '127.0.0.1' || h.startsWith('id-preview--') || h.endsWith('.lovableproject.com'); } catch { return true; }
}
