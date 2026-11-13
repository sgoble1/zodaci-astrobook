import type { Plan } from '@/content/navigation';

/**
 * Display-only "View as" tier for founders in classic view. It changes which locks the pages draw on this device;
 * every server check still uses the real account, so it can never unlock anything.
 */
const KEY = 'zodaci-tier-preview';
export const TIER_PREVIEW_EVENT = 'zodaci-tier-preview-changed';
export const TIER_NOTES: Record<Plan, string> = {
  free: 'Free: chart wheel, planets, houses, aspects and two full readings.',
  full: 'Pro: every reading, timing, relationships and the Masterbook.',
  creator: 'Cosmic: everything in Pro, with more monthly credits.',
};
export function getTierPreview(): Plan | null {
  try { const v = localStorage.getItem(KEY); return v === 'free' || v === 'full' || v === 'creator' ? v : null; } catch { return null; }
}
export function setTierPreview(p: Plan | null) {
  try { if (p) localStorage.setItem(KEY, p); else localStorage.removeItem(KEY); } catch { /* ignore */ }
  window.dispatchEvent(new Event(TIER_PREVIEW_EVENT));
}
/** The plan pages should draw: the preview only applies to elevated (founder/admin) accounts. */
export function displayedPlan(real: Plan, elevated: boolean, preview: Plan | null): Plan {
  return elevated && preview ? preview : real;
}
