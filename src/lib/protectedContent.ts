import { supabase } from '@/integrations/supabase/client';

export const CONTENT_TOKEN_KEY = 'private-content-token-v1';
export const CONTENT_UNLOCKED_EVENT = 'private-content-unlocked';

export class ContentLockedError extends Error {
  constructor() {
    super('Private content access has expired.');
    this.name = 'ContentLockedError';
  }
}

export const getContentToken = () => window.localStorage.getItem(CONTENT_TOKEN_KEY) ?? '';

const cache = new Map<string, Promise<string>>();
supabase.auth.onAuthStateChange(() => cache.clear());

export function loadProtectedText(area: 'masterbook' | 'library' | 'shane', file: string): Promise<string> {
  const key = `${area}/${file}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const p = fetchProtectedText(area, file);
  cache.set(key, p);
  p.catch(() => cache.delete(key));
  return p;
}

async function fetchProtectedText(area: 'masterbook' | 'library' | 'shane', file: string): Promise<string> {
  const token = getContentToken();
  if (!token) throw new ContentLockedError();
  const { data, error } = await supabase.functions.invoke('protected-content', { body: { token, area, file } });
  if (error || !data?.content) {
    if (data?.code === 'LOCKED' || error?.context?.status === 401) {
      window.localStorage.removeItem(CONTENT_TOKEN_KEY);
      window.dispatchEvent(new Event('private-content-locked'));
      throw new ContentLockedError();
    }
    throw new Error(data?.error ?? error?.message ?? 'This document could not be opened.');
  }
  return data.content as string;
}

export async function loadProtectedJson<T>(area: 'masterbook' | 'library' | 'shane', file: string): Promise<T> {
  return JSON.parse(await loadProtectedText(area, file)) as T;
}