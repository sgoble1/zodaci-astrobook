// The one place server code sends app emails (Lovable's built-in email). Resend is retired.
// Until the project's sender domain is set up in Lovable Cloud and the template system is scaffolded, every send
// resolves { sent: false, reason: 'not_configured' } so callers record the status instead of failing the request.
// When the domain is ready: scaffold the transactional templates, add the three templates named below, and replace the
// body of sendAppEmail with a call to sendTemplateEmail from ./transactional-email-templates/send-email.ts.

export type AppEmailTemplate = 'contact-received' | 'contact-owner-notice' | 'newsletter-confirm' | 'book-shipped';
export type AppEmailResult = { sent: true } | { sent: false; reason: 'not_configured' | 'recipient_suppressed' | 'failed'; error?: string };

export async function sendAppEmail(template: AppEmailTemplate, to: string, opts: { templateData?: Record<string, unknown>; idempotencyKey: string }): Promise<AppEmailResult> {
  void template; void to; void opts;
  return { sent: false, reason: 'not_configured' };
}
