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

/** Constant-time comparison so response timing does not reveal how much of the password matched. */
async function sameSecret(a: string, b: string) {
  const [x, y] = await Promise.all([a, b].map(s => crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))));
  const u = new Uint8Array(x), v = new Uint8Array(y); let diff = 0;
  for (let i = 0; i < u.length; i++) diff |= u[i] ^ v[i];
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ ok: false }, 405);
  if (Number(req.headers.get('content-length') || 0) > 1024) return json({ ok: false }, 413);
  const expected = Deno.env.get("SITE_PASSWORD") ?? "";
  const secret = Deno.env.get('CONTENT_UNLOCK_SECRET') ?? '';
  let ok = false;
  try {
    const { password } = await req.json();
    ok = !!expected && typeof password === "string" && password.length <= 256 && await sameSecret(password, expected);
  } catch { /* ignore */ }
  if (!ok || !secret) {
    await new Promise((r) => setTimeout(r, 600));
    return json({ ok: false }, 401);
  }
  const expires = String(Date.now() + 12 * 60 * 60 * 1000);
  return json({ ok: true, token: `${expires}.${await sign(expires, secret)}` });
});
