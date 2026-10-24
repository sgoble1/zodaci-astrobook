import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { EDITIONS, PASSWORD_ENV, sameSecret, signToken, type Edition } from '../_shared/content-token.ts';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

// Each founder edition has its own password. The matching password decides which single edition the token opens.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ ok: false }, 405);
  if (Number(req.headers.get('content-length') || 0) > 1024) return json({ ok: false }, 413);
  const secret = Deno.env.get('CONTENT_UNLOCK_SECRET') ?? '';
  let edition: Edition | null = null;
  try {
    const { password, edition: wanted } = await req.json();
    if (typeof password === 'string' && password.length > 0 && password.length <= 256) {
      const candidates = EDITIONS.filter(e => !wanted || e === wanted);
      for (const e of candidates) {
        const expected = Deno.env.get(PASSWORD_ENV[e]) ?? '';
        if (expected && await sameSecret(password, expected)) { edition = e; break; }
      }
    }
  } catch { /* ignore */ }
  if (!edition || !secret) {
    await new Promise((r) => setTimeout(r, 600));
    return json({ ok: false }, 401);
  }
  return json({ ok: true, edition, token: await signToken(edition, secret) });
});
