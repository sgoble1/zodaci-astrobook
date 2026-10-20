import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
const Body = z.object({ style: z.enum(['Celestial atlas', 'Botanical sky', 'Modern orbit']), stream: z.boolean().default(true) });
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL'); const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); const key = Deno.env.get('LOVABLE_API_KEY');
    if (!url || !secret || !key) return json({ error: 'Cover generation is not configured.' }, 500);
    const db = createClient(url, secret);
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return json({ error: 'Please sign in.' }, 401);
    const { data: { user } } = await db.auth.getUser(token);
    if (!user) return json({ error: 'Please sign in.' }, 401);
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: 'Choose a cover style.' }, 400);
    const { data: pause } = await db.from('ai_access_pauses').select('message').eq('scope', 'workspace').maybeSingle();
    if (pause) return json({ error: pause.message }, 402);
    // Personal AI cover previews are a paid feature so free accounts never burn generation credits.
    const [{ data: paid }, { data: isAdminUser }, { data: shared }] = await Promise.all([
      db.rpc('has_paid_plan', { _user_id: user.id }),
      db.rpc('has_role', { _user_id: user.id, _role: 'admin' }),
      db.rpc('is_shared_space_member'),
    ]);
    if (!(paid || isAdminUser || shared)) return json({ error: 'Personal cover previews are part of Pro. Upgrade to create covers from your chart — or pick one of the free cover designs.' }, 403);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: coverCount } = await db.from('ai_usage').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('feature', 'book-cover-request').gte('created_at', since);
    if ((coverCount ?? 0) >= 9) return json({ error: 'Daily cover-preview limit reached. Try again tomorrow.' }, 429);
    const { data: p } = await db.from('profiles').select('chart,birth_date,birth_time').eq('id', user.id).maybeSingle();
    if (!p?.birth_date || !p.chart) return json({ error: 'Save your birth details to your account first.' }, 400);
    const chart = p.chart as { bodies?: { name: string; sign: string }[] };
    const facts = (chart.bodies ?? []).filter(b => ['Sun','Moon','Venus','Mars'].includes(b.name)).map(b => `${b.name} in ${b.sign}`).join('; ');
    const prompt = `A beautiful full-bleed portrait book cover artwork for a personal astrology softcover book, style: ${parsed.data.style}. Purple, yellow and emerald accents. Symbolically depict only these verified personal placements: ${facts}. No chart wheel with invented positions, no numerical degrees, no people, no invented biography, no text or letters. Reserve quiet space at the top for title added separately. Print-ready editorial artwork.`;
    const upstream = await fetch('https://ai.gateway.lovable.dev/v1/images/generations', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'openai/gpt-image-2.5-sunburst', prompt, size: '1024x1536', quality: 'medium', ...(parsed.data.stream ? { stream: true, partial_images: 1 } : {}) }),
    });
    if (!upstream.ok) {
      const body = await upstream.json().catch(() => ({}));
      const message = body.error?.message || body.message || `Cover generation unavailable (${upstream.status}).`;
      if ([402,403].includes(upstream.status)) await db.from('ai_access_pauses').upsert({ scope: 'workspace', message });
      return json({ error: message }, upstream.status);
    }
    await db.from('ai_usage').insert({ user_id: user.id, feature: 'book-cover-request' });
    return new Response(upstream.body, { status: upstream.status, headers: { ...corsHeaders, 'Content-Type': upstream.headers.get('Content-Type') || 'application/json', 'Cache-Control': 'no-store' } });
  } catch { return json({ error: 'The cover request could not finish.' }, 500); }
});