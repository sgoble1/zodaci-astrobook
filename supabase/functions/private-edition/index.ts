import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// The private edition's encrypted payload lives in the private `private-edition` storage bucket
// (no client policies — it is only reachable through this gated function). This function's job:
// verify the caller is an approved shared-space member, then hand back a short-lived signed URL.

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' } });

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const authorization = req.headers.get('Authorization') ?? '';
    if (!authorization.startsWith('Bearer ')) return json({ error: 'Sign in first.' }, 401);
    const url = Deno.env.get('SUPABASE_URL');
    const anon = Deno.env.get('SUPABASE_ANON_KEY');
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !anon || !service) return json({ error: 'Private edition unavailable.' }, 503);
    const client = createClient(url, anon, { global: { headers: { Authorization: authorization } } });
    const user = await client.auth.getUser(authorization.slice(7));
    if (user.error || !user.data.user) return json({ error: 'Sign in first.' }, 401);
    const allowed = await client.rpc('is_shared_space_member');
    if (allowed.error || allowed.data !== true) return json({ error: 'This edition is private.' }, 403);
    const admin = createClient(url, service);
    const signed = await admin.storage.from('private-edition').createSignedUrl('edition.gz', 60);
    if (signed.error || !signed.data?.signedUrl) return json({ error: 'The private edition could not load. Please try again.' }, 503);
    return json({ url: signed.data.signedUrl });
  } catch { return json({ error: 'The private edition could not load. Please try again.' }, 503); }
});
