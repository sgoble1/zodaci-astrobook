// The one place server code sends app emails (Lovable's built-in email via notify.zodaci.com). Resend is retired.
import { sendTemplateEmail } from './transactional-email-templates/send-email.ts'
import { createClient } from 'npm:@supabase/supabase-js@2';

export type AppEmailTemplate = 'contact-received' | 'contact-owner-notice' | 'newsletter-confirm' | 'book-shipped' | 'book-gift' | 'order-confirmed' | 'comic-released';
export type AppEmailResult = { sent: true } | { sent: false; reason: 'not_configured' | 'recipient_suppressed' | 'failed'; error?: string };

/** Never throws: callers record the status instead of failing their request. */
export async function sendAppEmail(template: AppEmailTemplate, to: string, opts: { templateData?: Record<string, unknown>; idempotencyKey: string }): Promise<AppEmailResult> {
  try {
  const url = Deno.env.get('SUPABASE_URL'), key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return { sent: false, reason: 'not_configured' };
  const db = createClient(url, key);
  const lease = await db.rpc('claim_app_email', { _key: opts.idempotencyKey, _template: template });
  if (lease.error) return { sent: false, reason: 'failed', error: 'delivery_claim_failed' };
  if (!lease.data) {
    const status = await db.from('app_email_deliveries').select('status').eq('delivery_key', opts.idempotencyKey).maybeSingle();
    return !status.error && status.data?.status === 'sent' ? { sent: true } : { sent: false, reason: 'failed', error: 'delivery_in_progress' };
  }
  try {
    const r = await sendTemplateEmail(template, to, { templateData: opts.templateData, idempotencyKey: opts.idempotencyKey });
    const saved = await db.from('app_email_deliveries').update({ status: r.sent ? 'sent' : 'failed', completed_at: r.sent ? new Date().toISOString() : null, last_code: r.sent ? null : 'recipient_suppressed' }).eq('delivery_key', opts.idempotencyKey).eq('lease_token', lease.data);
    if (saved.error) return { sent: false, reason: 'failed', error: 'delivery_record_failed' };
    return r.sent ? { sent: true } : { sent: false, reason: 'recipient_suppressed' };
  } catch (e) {
    const code = (e as { code?: string })?.code;
    await db.from('app_email_deliveries').update({ status: 'failed', last_code: ['domain_not_verified', 'emails_disabled'].includes(code ?? '') ? code : 'provider_failed' }).eq('delivery_key', opts.idempotencyKey).eq('lease_token', lease.data);
    if (code === 'domain_not_verified' || code === 'emails_disabled') return { sent: false, reason: 'not_configured', error: code };
    console.error('app email failed', template, 'provider_failed');
    return { sent: false, reason: 'failed', error: 'provider_failed' };
  }
  } catch { return { sent: false, reason: 'failed', error: 'delivery_unavailable' }; }
}
