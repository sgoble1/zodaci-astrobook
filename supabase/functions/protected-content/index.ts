import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { ARCHIVE_GZ_B64 } from './archive.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

type Archive = { masterbook: Record<string, string>; library: Record<string, string> };
let archivePromise: Promise<Archive> | null = null;
let shanePromise: Promise<Record<string, string>> | null = null;
function loadShane() {
  shanePromise ??= (async () => {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data, error } = await admin.storage.from('private-content').download('shane/edition.json');
    if (error || !data) throw new Error('Shane edition unavailable.');
    return JSON.parse(await data.text()) as Record<string, string>;
  })().catch(e => { shanePromise = null; throw e; });
  return shanePromise;
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
});

const encode = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

async function validToken(token: string, secret: string) {
  const [expires, signature] = token.split('.');
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = encode(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(expires))));
  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return mismatch === 0;
}

async function loadArchive() {
  archivePromise ??= (async () => {
    const compressed = Uint8Array.from(atob(ARCHIVE_GZ_B64), (c) => c.charCodeAt(0));
    const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text()) as Archive;
  })();
  return archivePromise;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  try {
    const auth = req.headers.get('Authorization') ?? '';
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_ANON_KEY');
    if (!url || !key || !auth.startsWith('Bearer ')) return json({ error: 'Sign in to your private edition.', code: 'LOCKED' }, 401);
    const client = createClient(url, key, { global: { headers: { Authorization: auth } } });
    const { data: user, error: authError } = await client.auth.getUser(auth.slice(7));
    if (authError || !user.user) return json({ error: 'Sign in to your private edition.', code: 'LOCKED' }, 401);
    const peek = await req.clone().json().catch(() => ({}));
    const isShane = peek?.area === 'shane';
    const { data: allowed, error: accessError } = await client.rpc(isShane ? 'can_read_shane_edition' : 'is_shared_space_member');
    if (accessError || allowed !== true) return json({ error: 'This document belongs to the private edition.' }, 403);
    const secret = Deno.env.get('CONTENT_UNLOCK_SECRET') ?? '';
    const body = await req.json();
    const token = typeof body?.token === 'string' ? body.token : '';
    const area = body?.area === 'masterbook' || body?.area === 'library' || body?.area === 'shane' ? body.area : '';
    const file = typeof body?.file === 'string' && /^[a-zA-Z0-9._-]+$/.test(body.file) ? body.file : '';
    if (!secret || !(await validToken(token, secret))) return json({ error: 'Unlock required.', code: 'LOCKED' }, 401);
    if (!area || !file) return json({ error: 'Invalid document request.' }, 400);
    const content = area === 'shane' ? (await loadShane())[file] : (await loadArchive())[area as 'masterbook' | 'library'][file];
    if (typeof content !== 'string') return json({ error: 'Document not found.' }, 404);
    return json({ content });
  } catch (error) {
    console.error('protected-content failed', error);
    return json({ error: 'Document could not be opened.' }, 500);
  }
});