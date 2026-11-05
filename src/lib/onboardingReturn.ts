import { internalDestination } from './internalDestination';

/** Paths that would loop straight back into sign-in or birth entry. */
const LOOPING = /^\/(start|auth|onboarding)(\/|\?|#|$)/;

/**
 * Where a member lands after saving birth details: the page that sent them (if it is a safe
 * internal path), otherwise My Chart. A device-only save always opens My Chart with the device
 * notice so the member sees why their account did not keep it.
 */
export function onboardingDestination(raw: string | null | undefined, savedOn: 'account' | 'device' = 'account'): string {
  if (savedOn === 'device') return '/my-chart?device=1';
  const dest = internalDestination(raw, '/my-chart');
  return LOOPING.test(dest) ? '/my-chart' : dest;
}

/** Build a /start link that returns to `from` once birth details are saved. */
export function startLinkFrom(from: string): string {
  const dest = internalDestination(from, '');
  return dest && !LOOPING.test(dest) ? `/start?next=${encodeURIComponent(dest)}` : '/start';
}
