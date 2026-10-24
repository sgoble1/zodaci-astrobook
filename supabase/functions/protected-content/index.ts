import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { ARCHIVE_GZ_B64 } from './archive.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { AREA_EDITION, describeEntry, tokenOpens } from '../_shared/content-token.ts';

type Archive = { masterbook: Record<string, string>; library: Record<string, string> };
let archivePromise: Promise<Archive> | null = null;
const editionCache = new Map<string, Promise<Record<string, string>>>();
function loadStored(folder: 'shane' | 'zac') {
  let p = editionCache.get(folder);
  if (!p) {
    p = (async () => {
      const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      const { data, error } = await admin.storage.from('private-content').download(`${folder}/edition.json`);
      if (error || !data) throw new Error(`${folder} edition unavailable.`);
      return JSON.parse(await data.text()) as Record<string, string>;
    })().catch(e => { editionCache.delete(folder); throw e; });
    editionCache.set(folder, p);
  }
  return p;
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
});

async function loadArchive() {
  archivePromise ??= (async () => {
    const compressed = Uint8Array.from(atob(ARCHIVE_GZ_B64), (c) => c.charCodeAt(0));
    const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text()) as Archive;
  })();
  return archivePromise;
}

const ACCESS_RPC: Record<string, string> = { masterbook: 'is_shared_space_member', library: 'is_shared_space_member', shane: 'can_read_shane_edition', zac: 'can_read_zac_edition' };

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
    const body = await req.json().catch(() => ({}));
    const area = typeof body?.area === 'string' && ACCESS_RPC[body.area] ? body.area as string : '';
    const file = typeof body?.file === 'string' && /^[a-zA-Z0-9._-]+$/.test(body.file) ? body.file : '';
    if (!area || !file) return json({ error: 'Invalid document request.' }, 400);
    const { data: allowed, error: accessError } = await client.rpc(ACCESS_RPC[area]);
    if (accessError || allowed !== true) return json({ error: 'This document belongs to a private edition.' }, 403);
    // Chapter title lists open for the edition's own account without the password; chapter text needs it.
    const isIndex = file === 'index.json';
    const secret = Deno.env.get('CONTENT_UNLOCK_SECRET') ?? '';
    const token = typeof body?.token === 'string' ? body.token : '';
    if (!isIndex && !(await tokenOpens(token, AREA_EDITION[area], secret))) return json({ error: 'Unlock required.', code: 'LOCKED', edition: AREA_EDITION[area] }, 401);
    let content = area === 'shane' || area === 'zac' ? (await loadStored(area))[file] : (await loadArchive())[area as 'masterbook' | 'library'][file];
    if (typeof content !== 'string') return json({ error: 'Document not found.' }, 404);
    if (isIndex && area !== 'library') {
      const entries = JSON.parse(content) as { title: string; sections?: string[]; excerpt?: string }[];
      content = JSON.stringify(entries.map(e => ({ ...describeEntry(e), excerpt: '' })));
    }
    return json({ content });
  } catch (error) {
    console.error('protected-content failed', error);
    return json({ error: 'Document could not be opened.' }, 500);
  }
});
