// Archive unlock tokens. Each founder edition has its own password; a token unlocks only that edition.
// Format: "<edition>.<expires>.<hmac(edition.expires)>".
export type Edition = 'april' | 'shane' | 'zac';
export const EDITIONS: Edition[] = ['april', 'shane', 'zac'];
export const PASSWORD_ENV: Record<Edition, string> = { april: 'ARCHIVE_PASSWORD_APRIL', shane: 'ARCHIVE_PASSWORD_SHANE', zac: 'ARCHIVE_PASSWORD_ZAC' };
/** Which edition's token opens each protected-content area. */
export const AREA_EDITION: Record<string, Edition> = { masterbook: 'april', library: 'april', shane: 'shane', zac: 'zac' };

const encode = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

async function hmac(message: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return encode(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))));
}

export async function signToken(edition: Edition, secret: string, ttlMs = 12 * 60 * 60 * 1000) {
  const expires = String(Date.now() + ttlMs);
  return `${edition}.${expires}.${await hmac(`${edition}.${expires}`, secret)}`;
}

/** True only for an unexpired token minted for exactly this edition. */
export async function tokenOpens(token: string, edition: Edition, secret: string) {
  if (!secret || typeof token !== 'string') return false;
  const [ed, expires, sig] = token.split('.');
  if (ed !== edition || !expires || !sig || Number(expires) < Date.now()) return false;
  const expected = await hmac(`${ed}.${expires}`, secret);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

/** Constant-time password comparison. */
export async function sameSecret(a: string, b: string) {
  const [x, y] = await Promise.all([a, b].map(s => crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))));
  const u = new Uint8Array(x), v = new Uint8Array(y); let diff = 0;
  for (let i = 0; i < u.length; i++) diff |= u[i] ^ v[i];
  return diff === 0;
}

/** Replaces generic chapter names ("Chapter 12", "Part 3") with the first section heading, so menus describe content. */
export function describeEntry<T extends { title: string; sections?: string[] }>(e: T): T {
  const generic = /^(chapter|part|section|volume|book)\s*[\dIVXLC]+\.?$/i.test(e.title.trim()) || /^[\dIVXLC]+\.?$/.test(e.title.trim());
  const first = e.sections?.find(s => s.trim().length > 3);
  return generic && first ? { ...e, title: first.replace(/^[\d.]+\s*/, '') } : e;
}
