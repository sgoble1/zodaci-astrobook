import { describe, it, expect } from 'vitest';
import { contactNotifyStatus, clientIp, readLimited, FORM_LIMITS } from '../../supabase/functions/_shared/public-form-rules';

describe('public form rules', () => {
  it('limits contact to 5 per address per hour', () => { expect(FORM_LIMITS.contact.perAddress).toBe(5); expect(FORM_LIMITS.contact.windowSeconds).toBe(3600); });
  it('rejects bodies over the byte limit', async () => {
    const big = new Response('x'.repeat(200)).body!;
    expect(await readLimited(big, 100)).toBeNull();
    expect(await readLimited(new Response('ok').body!, 100)).toBe('ok');
  });
  it('takes first forwarded IP', () => { expect(clientIp(new Headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }))).toBe('1.2.3.4'); });
  it('reports not_configured when email is not set up', () => {
    expect(contactNotifyStatus('not_configured', 'sent')).toBe('not_configured'); expect(contactNotifyStatus('sent', 'suppressed')).toBe('sent'); expect(contactNotifyStatus('sent', 'failed')).toBe('partial');
  });
});
