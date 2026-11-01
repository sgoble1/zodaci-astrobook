import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ getSession: vi.fn(), invoke: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: {
  auth: { getSession: mocks.getSession, onAuthStateChange: vi.fn() },
  functions: { invoke: mocks.invoke },
} }));
import { downloadPrivateEdition } from './privateEditionLoader';

describe('private edition denials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: 'owner' }, access_token: 'test-token' } } });
  });
  it('does not request private data when signed out', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } });
    await expect(downloadPrivateEdition()).rejects.toMatchObject({ name: 'ContentLockedError', signedOut: true });
    expect(mocks.invoke).not.toHaveBeenCalled();
  });
  it('turns a 401 SIGNED_OUT response into a sign-in state', async () => {
    mocks.invoke.mockResolvedValue({ data: null, error: { context: new Response(JSON.stringify({ error: 'Sign in to open your private edition.', code: 'SIGNED_OUT' }), { status: 401 }) } });
    await expect(downloadPrivateEdition()).rejects.toMatchObject({ name: 'ContentLockedError', signedOut: true });
    expect(mocks.invoke).toHaveBeenCalledWith('private-edition', { body: {}, headers: { Authorization: 'Bearer test-token' } });
  });
  it('keeps a forbidden edition locked', async () => {
    mocks.invoke.mockResolvedValue({ data: null, error: { context: new Response('{}', { status: 403 }) } });
    await expect(downloadPrivateEdition()).rejects.toMatchObject({ name: 'ContentLockedError', signedOut: false });
  });
});