import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import { sendAppEmail } from '../_shared/app-email.ts';
import { readJsonLimited, underLimit } from '../_shared/public-form.ts';
import { NEWSLETTER_CONSENT_VERSION } from '../_shared/public-form-rules.ts';

const signup = z.object({ email: z.string().trim().email().max(254), consent: z.literal(true), website: z.string().max(200).optional(), source: z.enum(['welcome', 'astrobook-teaser', 'pricing', 'sky-notes', 'astrocomic', 'prelaunch']).optional(), path: z.string().max(200).optional() });
const gate = z.object({ action: z.enum(['prelaunch-status', 'prelaunch-access']), code: z.string().max(100).optional() });
const confirm = z.object({ action: z.literal('confirm'), token: z.string().uuid() });

Deno.serve(async req => {
  const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return reply({ error: 'Use the signup form.' }, 405);
  const body = await readJsonLimited(req, 'newsletter');
  if (!body.ok) return body.reason === 'too_large' ? reply({ error: 'Request is too large.' }, 413) : reply({ error: 'Please check your email and try again.' }, 400);
  const url = Deno.env.get('SUPABASE_URL'); const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return reply({ error: 'Signup is temporarily unavailable. Please try again later.' }, 503);
  const db = createClient(url, key);

  // Pre-launch gate: status is public; the passcode is compared here and never leaves the server.
  const g = gate.safeParse(body.data);
  if (g.success) {
    const { data: row } = await db.from('platform_settings').select('value').eq('key', 'site.prelaunch').maybeSingle();
    const v = (row?.value ?? {}) as { enabled?: boolean; passcode?: string };
    if (g.data.action === 'prelaunch-status') return reply({ enabled: v.enabled === true });
    if (!(await underLimit(db, 'newsletter', 'prelaunch-access', req))) return reply({ error: 'Too many tries. Please wait an hour.' }, 429);
    const ok = typeof v.passcode === 'string' && v.passcode.length > 0 && (g.data.code ?? '').trim() === v.passcode;
    return ok ? reply({ ok: true }) : reply({ error: 'That code is not right.' }, 403);
  }

  // Double opt-in: the link in the confirmation email marks the address confirmed. Campaigns go only to confirmed rows.
  const c = confirm.safeParse(body.data);
  if (c.success) {
    const { data, error } = await db.from('brand_email_subscribers').update({ confirmed_at: new Date().toISOString() }).eq('confirm_token', c.data.token).is('confirmed_at', null).select('id');
    if (error) return reply({ error: 'We could not confirm this address. Please try the link again.' }, 500);
    if (!data?.length) {
      const { data: existing } = await db.from('brand_email_subscribers').select('id').eq('confirm_token', c.data.token).maybeSingle();
      return existing ? reply({ ok: true, already: true }) : reply({ error: 'This confirmation link is not valid any more.' }, 404);
    }
    return reply({ ok: true });
  }

  const parsed = signup.safeParse(body.data);
  if (!parsed.success) return reply({ error: 'Enter a valid email and agree to receive Zodaci updates.' }, 400);
  if (parsed.data.website) return reply({ ok: true });
  const email = parsed.data.email.toLowerCase();
  if (!(await underLimit(db, 'newsletter', email, req))) return reply({ error: 'Too many signups from here. Please try again in an hour.' }, 429);
  // Insert only when new; a repeat signup changes nothing and sends nothing.
  const { data: inserted, error } = await db.from('brand_email_subscribers')
    .upsert({ email, consent_at: new Date().toISOString(), consent_version: NEWSLETTER_CONSENT_VERSION, form_path: parsed.data.path ?? null, ...(parsed.data.source ? { source: parsed.data.source } : {}) }, { onConflict: 'email', ignoreDuplicates: true })
    .select('id, confirm_token');
  if (error) { console.error('newsletter insert failed', error.message); return reply({ error: 'We could not save your signup. Please try again.' }, 500); }
  const row = inserted?.[0];
  if (!row) return reply({ ok: true, existing: true });
  let status = 'failed';
  try {
    const r = await sendAppEmail('newsletter-confirm', email, { idempotencyKey: `newsletter-confirm-${row.id}`, templateData: { confirmUrl: `https://zodaci.com/newsletter/confirm?token=${row.confirm_token}` } });
    status = r.sent ? 'sent' : r.reason;
  } catch (e) { console.error('newsletter confirm email failed', (e as Error).message); }
  const { error: upd } = await db.from('brand_email_subscribers').update({ welcome_status: status }).eq('id', row.id);
  if (upd) console.error('newsletter status update failed', upd.message);
  return reply({ ok: true, confirmation: status === 'sent' ? 'sent' : 'pending' });
});
