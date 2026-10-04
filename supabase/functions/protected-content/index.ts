import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { ARCHIVE_GZ_B64 } from './archive.ts';

type Archive = { masterbook: Record<string, string>; library: Record<string, string> };
let archivePromise: Promise<Archive> | null = null;

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
    const secret = Deno.env.get('CONTENT_UNLOCK_SECRET') ?? '';
    const body = await req.json();
    const token = typeof body?.token === 'string' ? body.token : '';
    const area = body?.area === 'masterbook' || body?.area === 'library' ? body.area : '';
    const file = typeof body?.file === 'string' && /^[a-zA-Z0-9._-]+$/.test(body.file) ? body.file : '';
    if (!secret || !(await validToken(token, secret))) return json({ error: 'Unlock required.', code: 'LOCKED' }, 401);
    if (!area || !file) return json({ error: 'Invalid document request.' }, 400);
    const archive = await loadArchive();
    const content = archive[area][file];
    if (typeof content !== 'string') return json({ error: 'Document not found.' }, 404);
    return json({ content });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Document could not be opened.' }, 500);
  }
});