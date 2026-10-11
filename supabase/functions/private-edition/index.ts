import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' } });

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const authorization = req.headers.get('Authorization') ?? '';
    if (!authorization.startsWith('Bearer ')) return json({ error: 'Sign in first.' }, 401);
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_ANON_KEY');
    if (!url || !key) return json({ error: 'Private edition unavailable.' }, 503);
    const client = createClient(url, key, { global: { headers: { Authorization: authorization } } });
    const user = await client.auth.getUser(authorization.slice(7));
    if (user.error || !user.data.user) return json({ error: 'Sign in first.' }, 401);
    const allowed = await client.rpc('is_shared_space_member');
    if (allowed.error || allowed.data !== true) return json({ error: 'This edition is private.' }, 403);
    return json({ segments: 6 });
  } catch { return json({ error: 'The private edition could not load. Please try again.' }, 503); }
});