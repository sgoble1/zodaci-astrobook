import { supabase } from '@/integrations/supabase/client';
import { getStripeEnvironment } from '@/lib/stripe';

/** What the payment provider says about one AstroBook or AstroComic checkout. */
export type PurchaseSync = 'active' | 'pending' | 'expired' | 'failed' | 'review' | 'past_due' | 'canceled' | 'not_found' | 'error';
export type PurchaseKind = 'book' | 'comic';

const KNOWN = new Set<PurchaseSync>(['active', 'pending', 'expired', 'failed', 'review', 'past_due', 'canceled', 'not_found']);

/** Map the sync-checkout response to a status; anything unexpected is an error, never a success. */
export function normalizePurchaseSync(data: unknown, failed: boolean): PurchaseSync {
  if (failed || !data || typeof data !== 'object') return 'error';
  const d = data as { status?: unknown; error?: unknown };
  if (d.error) return 'error';
  return typeof d.status === 'string' && KNOWN.has(d.status as PurchaseSync) ? d.status as PurchaseSync : 'error';
}

/** Stop re-checking once the outcome is final; pending and errors keep checking. */
export const isFinalPurchaseSync = (s: PurchaseSync) => !['pending', 'error'].includes(s);

/** Plain-language status for the return page. `stop` means the member should act; `wait` means don't pay again. */
export function purchaseSyncMessage(kind: PurchaseKind, s: PurchaseSync): { tone: 'ok' | 'wait' | 'stop'; text: string } {
  const thing = kind === 'book' ? 'AstroBook' : 'AstroComic';
  switch (s) {
    case 'active': return { tone: 'ok', text: `Payment confirmed. Your ${thing} is on its way through the next steps.` };
    case 'expired': return { tone: 'stop', text: 'This checkout timed out before payment, so you weren’t charged. You can start checkout again.' };
    case 'failed': return { tone: 'stop', text: 'Your bank didn’t complete this payment, so you weren’t charged. You can try again with another payment method.' };
    case 'review': return { tone: 'stop', text: 'This payment needs a quick review before we continue. We’ll be in touch — please don’t pay again.' };
    case 'past_due': return { tone: 'stop', text: 'The payment is overdue. Update your payment method from My AstroComic to keep issues coming.' };
    case 'canceled': return { tone: 'stop', text: `This ${thing} plan was canceled, so nothing more will be charged.` };
    case 'not_found': return { tone: 'stop', text: 'We couldn’t find this checkout on your account. If you were charged, contact us and we’ll sort it out.' };
    default: return { tone: 'wait', text: 'Payment submitted. We’re confirming it with the payment provider — please don’t pay again.' };
  }
}

/** Ask the server to confirm this checkout directly with the payment provider (same rules as the webhook). */
export async function syncPurchase(sessionId: string): Promise<PurchaseSync> {
  let environment: 'sandbox' | 'live';
  try { environment = getStripeEnvironment(); } catch { return 'error'; }
  const { data, error } = await supabase.functions.invoke('sync-checkout', { body: { sessionId, environment } });
  return normalizePurchaseSync(data, !!error);
}
