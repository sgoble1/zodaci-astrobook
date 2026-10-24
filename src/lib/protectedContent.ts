import { supabase } from '@/integrations/supabase/client';

/** Each founder edition (April, Shane, Zac) has its own password; its unlock token opens only that edition. */
export type Edition = 'april' | 'shane' | 'zac';
export type Area = 'masterbook' | 'library' | 'shane' | 'zac';
export const AREA_EDITION: Record<Area, Edition> = { masterbook: 'april', library: 'april', shane: 'shane', zac: 'zac' };

export const CONTENT_TOKENS_KEY = 'private-content-tokens-v2';
export const CONTENT_UNLOCKED_EVENT = 'private-content-unlocked';
// Tokens from the single shared password are no longer accepted.
try { window.localStorage.removeItem('private-content-token-v1'); } catch { /* ignore */ }

export class ContentLockedError extends Error {
  constructor() {
    super('Private content access has expired.');
    this.name = 'ContentLockedError';
  }
}

function readTokens(): Partial<Record<Edition, string>> {
  try { return JSON.parse(window.localStorage.getItem(CONTENT_TOKENS_KEY) ?? '{}') ?? {}; } catch { return {}; }
}
/** The unlock token for one edition, or (without an edition) any unlock held on this device. */
export const getContentToken = (edition?: Edition) => {
  const tokens = readTokens();
  return edition ? tokens[edition] ?? '' : Object.values(tokens).find(Boolean) ?? '';
};
export function setContentToken(edition: Edition, token: string) {
  window.localStorage.setItem(CONTENT_TOKENS_KEY, JSON.stringify({ ...readTokens(), [edition]: token }));
}
export function clearContentToken(edition: Edition) {
  const t = readTokens(); delete t[edition];
  window.localStorage.setItem(CONTENT_TOKENS_KEY, JSON.stringify(t));
}

const cache = new Map<string, Promise<string>>();
supabase.auth.onAuthStateChange(() => cache.clear());
if (typeof window !== 'undefined') window.addEventListener(CONTENT_UNLOCKED_EVENT, () => cache.clear());

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
  const edition = AREA_EDITION[area];
  const token = getContentToken(edition);
  // Chapter lists (index.json) open for the edition's own account without the password.
  if (!token && file !== 'index.json') throw new ContentLockedError();
  const { data, error } = await supabase.functions.invoke('protected-content', { body: { token, area, file } });
  if (error || !data?.content) {
    if (data?.code === 'LOCKED' || error?.context?.status === 401) {
      clearContentToken(edition);
      window.dispatchEvent(new CustomEvent('private-content-locked', { detail: { edition } }));
      throw new ContentLockedError();
    }
    throw new Error(data?.error ?? error?.message ?? 'This document could not be opened.');
  }
  return data.content as string;
}

export async function loadProtectedJson<T>(area: Area, file: string): Promise<T> {
  return JSON.parse(await loadProtectedText(area, file)) as T;
}
