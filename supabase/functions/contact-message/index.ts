import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import { sendEmail, esc, layout } from '../_shared/resend.ts';

const schema = z.object({
  name: z.string().trim().min(1).max(120), email: z.string().trim().email().max(254),
  topic: z.enum(['general', 'support', 'astrobook', 'astrocomic', 'shop', 'press']),
  message: z.string().trim().min(10).max(4000), source_path: z.string().max(200).optional(), website: z.string().max(200).optional(),
});

Deno.serve(async req => {
  const reply = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return reply({ error: 'Use the contact form.' }, 405);
  try {
    if (Number(req.headers.get('content-length') || 0) > 10000) return reply({ error: 'Message is too large.' }, 413);
    const p = schema.safeParse(await req.json());
    if (!p.success) return reply({ error: 'Check the form fields and try again.' }, 400);
    if (p.data.website) return reply({ ok: true });
    const url = Deno.env.get('SUPABASE_URL')!; const db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    let sender: string | null = null;
    const auth = req.headers.get('Authorization');
    if (auth?.startsWith('Bearer ')) { const { data } = await db.auth.getUser(auth.slice(7)); sender = data.user?.id ?? null; }
    const d = p.data;
    const { error } = await db.from('contact_messages').insert({ name: d.name, email: d.email, topic: d.topic, message: d.message, sender_id: sender, source_path: d.source_path ?? null });
    if (error) { console.error(error); return reply({ error: 'Your message could not be saved. Please try again.' }, 500); }
    const admin = Deno.env.get('ADMIN_NOTIFY_EMAIL');
    if (admin) await sendEmail({ to: admin, replyTo: d.email, subject: `New Zodaci message: ${d.topic}`, html: layout('New contact message', `<p><b>${esc(d.name)}</b> &lt;${esc(d.email)}&gt; · ${esc(d.topic)}</p><p style="white-space:pre-wrap">${esc(d.message)}</p>`) });
    await sendEmail({ to: d.email, subject: 'We received your message — Zodaci', html: layout('Thank you for writing', `<p>Hi ${esc(d.name)},</p><p>Your message reached us and we'll reply to this address soon.</p>`) });
    return reply({ ok: true });
  } catch (e) { console.error(e); return reply({ error: 'Please check your message and try again.' }, 400); }
});
