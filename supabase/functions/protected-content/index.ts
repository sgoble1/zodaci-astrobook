import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { ARCHIVE_GZ_B64 } from './archive.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { AREA_EDITION, CHAPTER_SHARE_AREAS, chapterIdOf, describeEntry } from '../_shared/content-token.ts';

// Private Masterbook text opens by account only: the edition's owner, someone the owner shared the whole
// edition with, or (for one chapter) someone the owner shared that chapter with. Checks run in the database
// (can_open_edition / can_open_chapter / my_shared_chapters) with the caller's own JWT.

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
const NO_ACCESS = 'This private edition opens only for its owner and the people they share it with.';

async function loadArchive() {
  archivePromise ??= (async () => {
    const compressed = Uint8Array.from(atob(ARCHIVE_GZ_B64), (c) => c.charCodeAt(0));
    const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text()) as Archive;
  })();
  return archivePromise;
}

/** Files kept as their own objects in private storage (not inside edition.json). Whole-edition access only. */
// Illustrated showcase: a JSON of pages plus four private plates per edition (plates open through short-lived links).
const showcase = (folder: string) => Object.fromEntries([
  ['showcase.json', { path: `${folder}/showcase.json`, kind: 'json' as const }],
  ...[1, 2, 3, 4].map(n => [`showcase-${n}.jpg`, { path: `${folder}/showcase-${n}.jpg`, kind: 'pdf' as const }]),
]);
const STORED_FILES: Record<string, Record<string, { path: string; kind: 'json' | 'pdf' }>> = {
  zac: { 'workbook.json': { path: 'zac/workbook.json', kind: 'json' }, ...showcase('zac') },
  shane: { 'illustrated-october-2026.pdf': { path: 'shane/illustrated-october-2026.pdf', kind: 'pdf' }, ...showcase('shane') },
  masterbook: showcase('april'),
};
const SIGNED_URL_SECONDS = 600;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  try {
    const auth = req.headers.get('Authorization') ?? '';
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_ANON_KEY');
    if (!url || !key || !auth.startsWith('Bearer ')) return json({ error: 'Sign in to open your private edition.', code: 'SIGNED_OUT' }, 401);
    const client = createClient(url, key, { global: { headers: { Authorization: auth } } });
    const { data: user, error: authError } = await client.auth.getUser(auth.slice(7));
    if (authError || !user.user) return json({ error: 'Sign in to open your private edition.', code: 'SIGNED_OUT' }, 401);

    const body = await req.json().catch(() => ({}));
    const area = typeof body?.area === 'string' && AREA_EDITION[body.area] ? body.area as string : '';
    const file = typeof body?.file === 'string' && /^[a-zA-Z0-9._-]{1,140}$/.test(body.file) ? body.file : '';
    if (!area || !file) return json({ error: 'Invalid document request.' }, 400);
    const edition = AREA_EDITION[area];

    const { data: whole, error: accessError } = await client.rpc('can_open_edition', { _edition: edition });
    if (accessError) throw accessError;
    const full = whole === true;
    const shareable = CHAPTER_SHARE_AREAS.includes(area);

    const stored = STORED_FILES[area]?.[file];
    if (stored) {
      if (!full) return json({ error: NO_ACCESS, code: 'NO_ACCESS', edition }, 403);
      const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      if (stored.kind === 'pdf') {
        const { data: signed, error: signError } = await admin.storage.from('private-content').createSignedUrl(stored.path, SIGNED_URL_SECONDS);
        if (signError || !signed?.signedUrl) return json({ error: 'Document not found.' }, 404);
        return json({ content: JSON.stringify({ url: signed.signedUrl, expiresIn: SIGNED_URL_SECONDS }) });
      }
      const { data: blob, error: readError } = await admin.storage.from('private-content').download(stored.path);
      if (readError || !blob) return json({ error: 'Document not found.' }, 404);
      return json({ content: await blob.text() });
    }

    const source = area === 'shane' || area === 'zac' ? await loadStored(area) : (await loadArchive())[area as 'masterbook' | 'library'];

    if (file === 'index.json') {
      // Whole-edition readers get every title; chapter-share readers get only the chapters shared with them.
      let allowedIds: Set<string> | null = null;
      if (!full) {
        if (!shareable) return json({ error: NO_ACCESS, code: 'NO_ACCESS', edition }, 403);
        const { data: shared, error: sharedError } = await client.rpc('my_shared_chapters', { _area: area });
        if (sharedError) throw sharedError;
        allowedIds = new Set(((shared ?? []) as unknown as string[]).map(String));
        if (!allowedIds.size) return json({ error: NO_ACCESS, code: 'NO_ACCESS', edition }, 403);
      }
      const raw = source[file];
      if (typeof raw !== 'string') return json({ error: 'Document not found.' }, 404);
      if (area === 'library') return json({ content: raw, access: 'edition' });
      const entries = JSON.parse(raw) as { id: string; title: string; sections?: string[]; excerpt?: string }[];
      const visible = allowedIds ? entries.filter(e => allowedIds!.has(String(e.id))) : entries;
      return json({ content: JSON.stringify(visible.map(e => describeEntry(e))), access: full ? 'edition' : 'chapters' });
    }

    if (!full) {
      if (!shareable) return json({ error: NO_ACCESS, code: 'NO_ACCESS', edition }, 403);
      const { data: chapter, error: chapterError } = await client.rpc('can_open_chapter', { _area: area, _chapter: chapterIdOf(file) });
      if (chapterError) throw chapterError;
      if (chapter !== true) return json({ error: NO_ACCESS, code: 'NO_ACCESS', edition }, 403);
    }
    const content = source[file];
    if (typeof content !== 'string') return json({ error: 'Document not found.' }, 404);
    return json({ content });
  } catch (error) {
    console.error('protected-content failed', error);
    return json({ error: 'Document could not be opened.' }, 500);
  }
});
