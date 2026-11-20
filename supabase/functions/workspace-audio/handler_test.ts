// Exercise the actual handler with a stubbed storage service; never sign real files.
const owner = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const itemId = '33333333-3333-4333-8333-333333333333';
let handler: (req: Request) => Promise<Response>;
const originalServe = Deno.serve;
Object.defineProperty(Deno, 'serve', { value: (fn: typeof handler) => { handler = fn; }, configurable: true });
await import('./index.ts');
Object.defineProperty(Deno, 'serve', { value: originalServe, configurable: true });

Deno.test('workspace audio blocks edited file paths before storage signing and preserves sharing', async () => {
  const originalFetch = globalThis.fetch;
  const originalUrl = Deno.env.get('SUPABASE_URL'); const originalKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  Deno.env.set('SUPABASE_URL', 'http://localhost:9999'); Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'test-only-not-a-credential');
  let viewer = owner; let path = `${owner}/podcast/episode.wav`; let member = true; let signed = 0;
  globalThis.fetch = async (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    let value: unknown;
    if (url.pathname === '/auth/v1/user') value = { id: viewer, aud: 'authenticated', role: 'authenticated' };
    else if (url.pathname === '/rest/v1/library_items') value = { owner_id: owner, workspace_id: itemId, file_path: path, kind: 'podcast' };
    else if (url.pathname === '/rest/v1/space_members') value = member ? { user_id: viewer } : null;
    else if (url.pathname.startsWith('/storage/v1/object/sign/library/')) { signed++; value = { signedURL: '/object/sign/library/test?token=mock' }; }
    else throw new Error('Unexpected service request');
    // maybeSingle expects an object for these requests, matching the real service.
    void init;
    return new Response(JSON.stringify(value), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  const call = () => handler(new Request('http://localhost/workspace-audio', { method: 'POST', headers: { Authorization: 'Bearer test-only', 'Content-Type': 'application/json' }, body: JSON.stringify({ itemId }) }));
  try {
    path = `${other}/podcast/private.wav`;
    if ((await call()).status !== 404 || signed !== 0) throw new Error('Cross-owner signing allowed');
    path = `${owner}/../${other}/private.wav`;
    if ((await call()).status !== 404 || signed !== 0) throw new Error('Traversal signing allowed');
    path = `${owner}/podcast/episode.wav`;
    if ((await call()).status !== 200 || Number(signed) !== 1) throw new Error('Owner playback broken');
    viewer = other;
    if ((await call()).status !== 200 || Number(signed) !== 2) throw new Error('Authorized workspace playback broken');
    member = false;
    if ((await call()).status !== 404 || Number(signed) !== 2) throw new Error('Nonmember playback allowed');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) Deno.env.delete('SUPABASE_URL'); else Deno.env.set('SUPABASE_URL', originalUrl);
    if (originalKey === undefined) Deno.env.delete('SUPABASE_SERVICE_ROLE_KEY'); else Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', originalKey);
  }
});