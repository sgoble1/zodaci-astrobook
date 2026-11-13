// The one place server code sends app emails (Lovable's built-in email via notify.zodaci.com). Resend is retired.
import { sendTemplateEmail } from './transactional-email-templates/send-email.ts'

export type AppEmailTemplate = 'contact-received' | 'contact-owner-notice' | 'newsletter-confirm' | 'book-shipped';
export type AppEmailResult = { sent: true } | { sent: false; reason: 'not_configured' | 'recipient_suppressed' | 'failed'; error?: string };

/** Never throws: callers record the status instead of failing their request. */
export async function sendAppEmail(template: AppEmailTemplate, to: string, opts: { templateData?: Record<string, unknown>; idempotencyKey: string }): Promise<AppEmailResult> {
  try {
    const r = await sendTemplateEmail(template, to, { templateData: opts.templateData, idempotencyKey: opts.idempotencyKey });
    return r.sent ? { sent: true } : { sent: false, reason: 'recipient_suppressed' };
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code === 'domain_not_verified' || code === 'emails_disabled') return { sent: false, reason: 'not_configured', error: code };
    console.error('app email failed', template, e);
    return { sent: false, reason: 'failed', error: e instanceof Error ? e.message : String(e) };
  }
}
