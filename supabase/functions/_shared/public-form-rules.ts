// Pure rules for the open contact form and newsletter signup (no Deno APIs, so src tests import this file directly).

/** Per-bucket limits: count allowed inside the window (seconds), keyed by hashed address and hashed IP separately. */
export const FORM_LIMITS = {
  contact: { perAddress: 5, perIp: 10, windowSeconds: 3600 },
  newsletter: { perAddress: 3, perIp: 20, windowSeconds: 3600 },
} as const;
export type FormBucket = keyof typeof FORM_LIMITS;

/** Largest accepted request bodies, in bytes (checked on the bytes actually read, not the header). */
export const BODY_LIMITS = { contact: 10_000, newsletter: 4_096 } as const;

/** Consent wording version stored with every newsletter signup; bump when the signup text changes. */
export const NEWSLETTER_CONSENT_VERSION = 'zodaci-sky-notes-v2';

/** First forwarded address, else Cloudflare's, else empty (rate limit then uses the address only). */
export function clientIp(headers: { get(name: string): string | null }): string {
  const fwd = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return fwd || headers.get('cf-connecting-ip')?.trim() || '';
}

/** Overall delivery status for a contact message from the two notices it sends. */
export function contactNotifyStatus(owner: 'sent' | 'failed' | 'not_configured' | 'no_admin_address', sender: 'sent' | 'failed' | 'not_configured' | 'suppressed'): string {
  if (owner === 'not_configured' || sender === 'not_configured') return 'not_configured';
  if (owner === 'no_admin_address') return 'no_admin_address';
  if (owner === 'sent' && (sender === 'sent' || sender === 'suppressed')) return 'sent';
  if (owner === 'failed' && sender === 'failed') return 'failed';
  return 'partial';
}

/** Reads at most `max` bytes of a body stream; returns null when the body is larger (never trusts Content-Length). */
export async function readLimited(body: ReadableStream<Uint8Array> | null, max: number): Promise<string | null> {
  if (!body) return '';
  const reader = body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) { await reader.cancel().catch(() => undefined); return null; }
    chunks.push(value);
  }
  const all = new Uint8Array(size); let at = 0;
  for (const c of chunks) { all.set(c, at); at += c.byteLength; }
  return new TextDecoder().decode(all);
}
