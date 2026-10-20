import { isPaidStage } from './bookFulfillment';

/** Carrier tracking links for shipped AstroBook orders. */
export function trackingUrl(carrier: string, number: string): string | null {
  const n = encodeURIComponent(number.trim());
  if (!n) return null;
  switch (carrier) {
    case 'USPS': return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`;
    case 'UPS': return `https://www.ups.com/track?tracknum=${n}`;
    case 'FedEx': return `https://www.fedex.com/fedextrack/?trknbr=${n}`;
    default: return null;
  }
}

/** An order can only be marked shipped once it is paid and has a carrier and tracking number. */
export function shippingError(prevStatus: string, status: string, carrier: string, tracking: string): string | null {
  if (status !== 'shipped' && status !== 'delivered') return null;
  if (!isPaidStage(prevStatus)) return 'Only paid orders can be shipped.';
  if (!carrier || !tracking.trim()) return 'Add the carrier and tracking number before marking this order shipped.';
  return null;
}
