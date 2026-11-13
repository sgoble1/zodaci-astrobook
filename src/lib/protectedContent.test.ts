import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getSession: vi.fn(), invoke: vi.fn(), authChanged: (_event: string) => {} }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: {
  auth: { getSession: mocks.getSession, onAuthStateChange: vi.fn(callback => { mocks.authChanged = callback; }) },
  functions: { invoke: mocks.invoke },
} }));
import { loadProtectedText } from './protectedContent';

describe('protected chapter authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authChanged('SIGNED_OUT');
    mocks.getSession.mockResolvedValue({ data: { session: { access_token: 'current-session-token' } } });
  });
  it('sends the current session JWT for authorized chapter requests', async () => {
    mocks.invoke.mockResolvedValue({ data: { content: 'authorized chapter' }, error: null });
    await expect(loadProtectedText('zac', 'index.json')).resolves.toBe('authorized chapter');
    expect(mocks.invoke).toHaveBeenCalledWith('protected-content', {
      body: { area: 'zac', file: 'index.json' }, headers: { Authorization: 'Bearer current-session-token' },
    });
  });
  it('never requests chapters while signed out', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } });
    await expect(loadProtectedText('zac', 'index.json')).rejects.toMatchObject({ name: 'ContentLockedError', signedOut: true });
    expect(mocks.invoke).not.toHaveBeenCalled();
  });
  it('turns HTTP 401 into a sign-in state without retrying', async () => {
    mocks.invoke.mockResolvedValue({ data: null, error: { context: new Response(JSON.stringify({ code: 'SIGNED_OUT' }), { status: 401 }) } });
    await expect(loadProtectedText('zac', 'index.json')).rejects.toMatchObject({ name: 'ContentLockedError', signedOut: true });
    expect(mocks.invoke).toHaveBeenCalledTimes(1);
  });
  it('preserves forbidden access without retrying', async () => {
    mocks.invoke.mockResolvedValue({ data: null, error: { context: new Response(JSON.stringify({ code: 'NO_ACCESS' }), { status: 403 }) } });
    await expect(loadProtectedText('zac', 'index.json')).rejects.toMatchObject({ name: 'ContentLockedError', signedOut: false });
    expect(mocks.invoke).toHaveBeenCalledTimes(1);
  });
  it('recognizes a signed-out response code even without an HTTP context', async () => {
    mocks.invoke.mockResolvedValue({ data: { code: 'SIGNED_OUT' }, error: null });
    await expect(loadProtectedText('zac', 'index.json')).rejects.toMatchObject({ name: 'ContentLockedError', signedOut: true });
    expect(mocks.invoke).toHaveBeenCalledTimes(1);
  });
});