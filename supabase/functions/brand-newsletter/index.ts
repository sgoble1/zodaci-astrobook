import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';

const schema = z.object({ email: z.string().trim().email().max(254), consent: z.literal(true), website: z.string().max(200).optional(), source: z.enum(['welcome', 'astrobook-teaser', 'pricing', 'sky-notes', 'astrocomic']).optional() });
Deno.serve(async req => {
  const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return reply({ error: 'Use the signup form.' }, 405);
  try {
    if (Number(req.headers.get('content-length') || 0) > 4096) return reply({ error: 'Request is too large.' }, 413);
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return reply({ error: 'Enter a valid email and agree to receive Zodaci updates.' }, 400);
    if (parsed.data.website) return reply({ ok: true });
    const url = Deno.env.get('SUPABASE_URL'); const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return reply({ error: 'Signup is temporarily unavailable. Please try again later.' }, 503);
    const db = createClient(url, key);
    const { error } = await db.from('brand_email_subscribers').upsert({ email: parsed.data.email.toLowerCase(), ...(parsed.data.source ? { source: parsed.data.source } : {}) }, { onConflict: 'email', ignoreDuplicates: true });
    if (error) return reply({ error: 'We could not save your signup. Please try again.' }, 500);
    return reply({ ok: true });
  } catch { return reply({ error: 'Please check your email and try again.' }, 400); }
});