import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import { sendAppEmail } from '../_shared/app-email.ts';
import { readJsonLimited, underLimit } from '../_shared/public-form.ts';
import { contactNotifyStatus } from '../_shared/public-form-rules.ts';

const schema = z.object({
  name: z.string().trim().min(1).max(120), email: z.string().trim().email().max(254),
  topic: z.enum(['general', 'support', 'astrobook', 'astrocomic', 'shop', 'press']),
  message: z.string().trim().min(10).max(4000), source_path: z.string().max(200).optional(), website: z.string().max(200).optional(),
});

Deno.serve(async req => {
  const reply = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return reply({ error: 'Use the contact form.' }, 405);
  const body = await readJsonLimited(req, 'contact');
  if (!body.ok) return body.reason === 'too_large' ? reply({ error: 'Message is too large.' }, 413) : reply({ error: 'Check the form fields and try again.' }, 400);
  const p = schema.safeParse(body.data);
  if (!p.success) return reply({ error: 'Check the form fields and try again.' }, 400);
  if (p.data.website) return reply({ ok: true, saved: true });
  const url = Deno.env.get('SUPABASE_URL'); const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return reply({ error: 'The contact form is temporarily unavailable. Please email help@zodaci.com.' }, 503);
  const db = createClient(url, key);
  const d = p.data;
  if (!(await underLimit(db, 'contact', d.email, req))) return reply({ error: 'Too many messages from here. Please try again in an hour.' }, 429);

  let sender: string | null = null;
  const auth = req.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) { const { data } = await db.auth.getUser(auth.slice(7)); sender = data.user?.id ?? null; }
  const { data: row, error } = await db.from('contact_messages')
    .insert({ name: d.name, email: d.email, topic: d.topic, message: d.message, sender_id: sender, source_path: d.source_path ?? '/welcome' })
    .select('id').single();
  if (error || !row) {
    console.error('contact insert failed', error?.message);
    if (error?.code === '54000') return reply({ error: 'Too many messages from this address. Please try again in an hour.' }, 429);
    return reply({ error: 'Your message could not be saved. Please try again.' }, 500);
  }

  // From here the message is saved: the visitor always hears "saved", and notice problems are recorded for Admin.
  let owner: 'sent' | 'failed' | 'not_configured' | 'no_admin_address' = 'no_admin_address';
  let senderAck: 'sent' | 'failed' | 'not_configured' | 'suppressed' = 'failed';
  const errors: string[] = [];
  try {
    const admin = Deno.env.get('ADMIN_NOTIFY_EMAIL');
    if (admin) {
      const r = await sendAppEmail('contact-owner-notice', admin, { idempotencyKey: `contact-owner-${row.id}`, templateData: { name: d.name, email: d.email, topic: d.topic, message: d.message } });
      owner = r.sent ? 'sent' : r.reason === 'not_configured' ? 'not_configured' : 'failed';
      if (!r.sent && r.error) errors.push(`owner: ${r.error}`);
    }
    const ack = await sendAppEmail('contact-received', d.email, { idempotencyKey: `contact-ack-${row.id}`, templateData: { name: d.name } });
    senderAck = ack.sent ? 'sent' : ack.reason === 'recipient_suppressed' ? 'suppressed' : ack.reason === 'not_configured' ? 'not_configured' : 'failed';
    if (!ack.sent && ack.error) errors.push(`sender: ${ack.error}`);
  } catch (e) { errors.push((e as Error).message); }
  const { error: upd } = await db.from('contact_messages').update({ notify_status: contactNotifyStatus(owner, senderAck), notify_error: errors.join(' · ').slice(0, 500) || null }).eq('id', row.id);
  if (upd) console.error('contact status update failed', upd.message);
  return reply({ ok: true, saved: true });
});
