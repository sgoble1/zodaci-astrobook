import { supabase } from '@/integrations/supabase/client';

/**
 * Private editions (April, Shane, Zac) open by account only: the owner, or people the owner shared the whole
 * edition or a single chapter with. The server checks every request; nothing is unlocked on the device.
 */
export type Edition = 'april' | 'shane' | 'zac';
export type Area = 'masterbook' | 'library' | 'shane' | 'zac';
export const AREA_EDITION: Record<Area, Edition> = { masterbook: 'april', library: 'april', shane: 'shane', zac: 'zac' };

// Device unlock tokens from the retired password system are removed on load.
try { ['private-content-token-v1', 'private-content-tokens-v2'].forEach(k => window.localStorage.removeItem(k)); } catch { /* ignore */ }

export const NO_ACCESS_MESSAGE = 'This private edition opens only for its owner and the people they share it with.';
/** Raised when the signed-in account may not open this edition or chapter (or nobody is signed in). */
export class ContentLockedError extends Error {
  constructor(public signedOut = false) {
    super(signedOut ? 'Sign in to open your private edition.' : NO_ACCESS_MESSAGE);
    this.name = 'ContentLockedError';
  }
}

/** Fired when an owner shares or revokes access, so cached chapter lists reload. */
export const ACCESS_CHANGED_EVENT = 'private-content-access-changed';

const cache = new Map<string, Promise<string>>();
supabase.auth.onAuthStateChange((event) => { if (event !== 'TOKEN_REFRESHED') cache.clear(); });
if (typeof window !== 'undefined') window.addEventListener(ACCESS_CHANGED_EVENT, () => cache.clear());

export function loadProtectedText(area: Area, file: string): Promise<string> {
  const key = `${area}/${file}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const p = fetchProtectedText(area, file);
  cache.set(key, p);
  p.catch(() => cache.delete(key));
  return p;
}

async function fetchProtectedText(area: Area, file: string): Promise<string> {
  const { data: s } = await supabase.auth.getSession();
  if (!s.session) throw new ContentLockedError(true);
  const { data, error } = await supabase.functions.invoke('protected-content', { body: { area, file } });
  if (error || !data?.content) {
    const status = (error as { context?: Response } | null)?.context?.status;
    if (status === 401 || status === 403 || data?.code === 'NO_ACCESS' || data?.code === 'SIGNED_OUT') throw new ContentLockedError(status === 401);
    throw new Error(data?.error ?? 'This document could not be opened. Please try again.');
  }
  return data.content as string;
}

export async function loadProtectedJson<T>(area: Area, file: string): Promise<T> {
  return JSON.parse(await loadProtectedText(area, file)) as T;
}

/** A short-lived private link for an edition's PDF (never cached: the link expires after a few minutes). */
export async function loadProtectedFileUrl(area: Area, file: string): Promise<string> {
  const { url } = JSON.parse(await fetchProtectedText(area, file)) as { url?: string };
  if (!url) throw new Error('This document could not be opened.');
  return url;
}
