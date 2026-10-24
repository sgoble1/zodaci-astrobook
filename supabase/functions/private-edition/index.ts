import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { tokenOpens } from '../_shared/content-token.ts';

// The private edition's encrypted payload lives in the private `private-edition` storage bucket
// (no client policies — it is only reachable through this gated function). This function's job:
// verify the caller is an approved shared-space member, then hand back a short-lived signed URL.
// A second mode serves the shareable April edition page: a valid site-password content token
// (same HMAC scheme as the site-password function) may fetch the payload without an account.

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' } });

async function shareTokenValid(token: string): Promise<boolean> {
  return tokenOpens(token, 'april', Deno.env.get('CONTENT_UNLOCK_SECRET') ?? '');
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !service) return json({ error: 'Private edition unavailable.' }, 503);
    const admin = createClient(url, service);

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    if (body && (body as { share?: unknown }).share === true) {
      // Shareable edition: password-holder access, no account required.
      const token = req.headers.get('X-Content-Token') ?? '';
      if (!(await shareTokenValid(token))) return json({ error: 'This shared edition is locked.' }, 403);
      const signed = await admin.storage.from('private-edition').createSignedUrl('edition.gz', 300);
      if (signed.error || !signed.data?.signedUrl) return json({ error: 'The shared edition could not load. Please try again.' }, 503);
      return json({ url: signed.data.signedUrl });
    }

    const authorization = req.headers.get('Authorization') ?? '';
    if (!authorization.startsWith('Bearer ')) return json({ error: 'Sign in first.' }, 401);
    const anon = Deno.env.get('SUPABASE_ANON_KEY');
    if (!anon) return json({ error: 'Private edition unavailable.' }, 503);
    const client = createClient(url, anon, { global: { headers: { Authorization: authorization } } });
    const user = await client.auth.getUser(authorization.slice(7));
    if (user.error || !user.data.user) return json({ error: 'Sign in first.' }, 401);
    const allowed = await client.rpc('is_shared_space_member');
    if (allowed.error || allowed.data !== true) return json({ error: 'This edition is private.' }, 403);
    const signed = await admin.storage.from('private-edition').createSignedUrl('edition.gz', 60);
    if (signed.error || !signed.data?.signedUrl) return json({ error: 'The private edition could not load. Please try again.' }, 503);
    return json({ url: signed.data.signedUrl });
  } catch { return json({ error: 'The private edition could not load. Please try again.' }, 503); }
});
