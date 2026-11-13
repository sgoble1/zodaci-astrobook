// Server helpers for public (signed-out) forms: byte-limited JSON, hashed rate-limit keys and the limit check.
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { BODY_LIMITS, FORM_LIMITS, clientIp, readLimited, type FormBucket } from './public-form-rules.ts';

export { clientIp };

export async function hashKey(value: string): Promise<string> {
  if (!value) return '';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`zodaci-form:${value.toLowerCase()}`));
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** JSON body read with a hard byte cap; 'too_large' / 'invalid' instead of throwing. */
export async function readJsonLimited(req: Request, bucket: FormBucket): Promise<{ ok: true; data: unknown } | { ok: false; reason: 'too_large' | 'invalid' }> {
  const text = await readLimited(req.body, BODY_LIMITS[bucket]);
  if (text === null) return { ok: false, reason: 'too_large' };
  try { return { ok: true, data: JSON.parse(text) }; } catch { return { ok: false, reason: 'invalid' }; }
}

/** True while both the address and the caller's IP are under the bucket's hourly limit (each check records one hit). */
export async function underLimit(db: SupabaseClient, bucket: FormBucket, email: string, req: Request): Promise<boolean> {
  const l = FORM_LIMITS[bucket];
  const [addr, ip] = await Promise.all([hashKey(email), hashKey(clientIp(req.headers))]);
  const a = await db.rpc('form_rate_ok', { _bucket: `${bucket}:addr`, _key: addr, _limit: l.perAddress, _window_seconds: l.windowSeconds });
  if (a.error) { console.error('rate limit check failed', a.error.message); return true; }
  if (!a.data) return false;
  const i = await db.rpc('form_rate_ok', { _bucket: `${bucket}:ip`, _key: ip, _limit: l.perIp, _window_seconds: l.windowSeconds });
  if (i.error) { console.error('rate limit check failed', i.error.message); return true; }
  return !!i.data;
}
