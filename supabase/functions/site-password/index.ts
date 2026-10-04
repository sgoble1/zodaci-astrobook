import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

const encode = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

async function sign(expires: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return encode(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(expires))));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const expected = Deno.env.get("SITE_PASSWORD") ?? "";
  const secret = Deno.env.get('CONTENT_UNLOCK_SECRET') ?? '';
  let ok = false;
  try {
    const { password } = await req.json();
    ok = !!expected && typeof password === "string" && password === expected;
  } catch { /* ignore */ }
  if (!ok || !secret) {
    await new Promise((r) => setTimeout(r, 600));
    return json({ ok: false }, 401);
  }
  const expires = String(Date.now() + 12 * 60 * 60 * 1000);
  return json({ ok: true, token: `${expires}.${await sign(expires, secret)}` });
});
