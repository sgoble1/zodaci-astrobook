import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// April's private edition payload lives in the private `private-edition` storage bucket (no client policies).
// This function hands back a short-lived signed URL only to April's own account or to someone she shared
// her whole edition with (checked by can_open_edition('april') with the caller's JWT). No passwords.

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' } });

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anon = Deno.env.get('SUPABASE_ANON_KEY');
    if (!url || !service || !anon) return json({ error: 'Private edition unavailable.' }, 503);

    const authorization = req.headers.get('Authorization') ?? '';
    if (!authorization.startsWith('Bearer ')) return json({ error: 'Sign in first.' }, 401);
    const client = createClient(url, anon, { global: { headers: { Authorization: authorization } } });
    const user = await client.auth.getUser(authorization.slice(7));
    if (user.error || !user.data.user) return json({ error: 'Sign in first.' }, 401);
    const allowed = await client.rpc('can_open_edition', { _edition: 'april' });
    if (allowed.error || allowed.data !== true) return json({ error: 'This edition is private to its owner and the people she shares it with.' }, 403);

    const admin = createClient(url, service);
    const signed = await admin.storage.from('private-edition').createSignedUrl('edition.gz', 60);
    if (signed.error || !signed.data?.signedUrl) return json({ error: 'The private edition could not load. Please try again.' }, 503);
    return json({ url: signed.data.signedUrl });
  } catch { return json({ error: 'The private edition could not load. Please try again.' }, 503); }
});
