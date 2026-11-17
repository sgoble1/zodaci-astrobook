import { describe, expect, it, vi, afterEach } from 'vitest';
import { WORKSPACE_FEED_URL, WORKSPACE_PROJECT_ID, sanitizeFailure, safeRoute } from '../../supabase/functions/_shared/workspace-feed-rules';
import { deliverWorkspaceFailure } from '../../supabase/functions/_shared/workspace-feed';

afterEach(() => { vi.unstubAllGlobals(); });
describe('workspace feed privacy', () => {
  it('pins the requested destination and project', () => {
    expect(WORKSPACE_FEED_URL).toBe('https://compthaus.online/api/public/webhooks/workspace-feed');
    expect(WORKSPACE_PROJECT_ID).toBe('aee2e954-f4db-40c2-b757-ce2ed7d7a9d3');
  });
  it('discards personal content, messages, tokens and URL details', () => {
    const result = sanitizeFailure({ kind: 'route_failure', name: 'Private name', route: '/shared/person@example.com?token=hidden#dream', message: 'Private dream and birth details', email: 'person@example.com', stack: 'Error: Private dream\n at PrivatePerson (https://zodaci.com/assets/App-abc.js:21:7?token=hidden)' });
    expect(result).toEqual({ kind: 'route_failure', name: 'Error', route: '/shared/[detail]', frames: ['App-abc.js:21:7'] });
    expect(JSON.stringify(result)).not.toMatch(/Private|hidden|example.com|birth|dream/);
  });
  it('redacts unrecognized paths and never accepts external URLs', () => {
    expect(safeRoute('/private-person')).toBe('/[route]');
    expect(safeRoute('https://other.example/user')).toBe('/[route]');
    expect(safeRoute('/auth?email=person@example.com')).toBe('/auth');
  });
  it('bounds stack frames and preserves sanitized reports on the server', () => {
    expect(sanitizeFailure({ stack: Array(20).fill('App.js:1:2').join('\n') }).frames).toHaveLength(8);
    const first = sanitizeFailure({ kind: 'runtime_error', name: 'TypeError', route: '/books', stack: 'App.js:1:2' });
    expect(sanitizeFailure({ ...first, stack: first.frames.join('\n') })).toEqual(first);
  });
  it('does not attempt delivery without the server secret', async () => {
    vi.stubGlobal('Deno', { env: { get: () => undefined } });
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    expect(await deliverWorkspaceFailure({})).toBe('not_configured');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('rejects redirects, uses a timeout and sends only sanitized data', async () => {
    vi.stubGlobal('Deno', { env: { get: () => 'test-only-credential' } });
    const fetch = vi.fn().mockResolvedValue(new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } }));
    vi.stubGlobal('fetch', fetch);
    expect(await deliverWorkspaceFailure({ message: 'private', route: '/books?token=private' })).toBe('delivered');
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe(WORKSPACE_FEED_URL);
    expect(options.redirect).toBe('error');
    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(options.body).not.toContain('private');
    const body = JSON.parse(options.body);
    expect(body.workspace_project_id).toBe(WORKSPACE_PROJECT_ID);
    expect(body.external_id).toBeTruthy();
    expect(body.summary).toBeTruthy();
    expect(options.headers['X-Webhook-Secret']).toBe('test-only-credential');
  });
  it('treats a receipt without ok:true as failed', async () => {
    vi.stubGlobal('Deno', { env: { get: () => 'test-only-credential' } });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"ok":false}', { headers: { 'Content-Type': 'application/json' } })));
    expect(await deliverWorkspaceFailure({})).toBe('failed');
  });
  it('contains delivery failures and rejects misleading HTML success', async () => {
    vi.stubGlobal('Deno', { env: { get: () => 'test-only-credential' } });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect(await deliverWorkspaceFailure({})).toBe('failed');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html/>', { headers: { 'Content-Type': 'text/html' } })));
    expect(await deliverWorkspaceFailure({})).toBe('failed');
  });
});