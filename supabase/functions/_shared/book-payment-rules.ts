export function verifiedBookAmount(order: { base_price_cents: number; extras_cents: number | null; shipping_cents: number | null }, session: { payment_status?: string; currency?: string | null; amount_subtotal?: number | null; amount_total?: number | null; total_details?: { amount_tax?: number | null; amount_discount?: number | null; amount_shipping?: number | null } | null }) {
  const base = order.base_price_cents + (order.extras_cents ?? 0);
  const tax = session.total_details?.amount_tax ?? 0;
  const shipping = session.total_details?.amount_shipping ?? 0;
  return session.payment_status === 'paid' && session.currency === 'usd' && session.amount_subtotal === base && tax >= 0 && shipping === (order.shipping_cents ?? 0) && (session.total_details?.amount_discount ?? 0) === 0 && session.amount_total === base + tax + shipping;
}
export const retryableBookSession = (status: string, expectedSession: string | null, receivedSession: string) => status === 'awaiting_payment' && expectedSession === receivedSession;