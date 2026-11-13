import { describe, it, expect, vi } from 'vitest';
vi.mock('@/integrations/supabase/client', () => ({ supabase: { auth: { onAuthStateChange: () => ({}) } } }));
import { retryOnce } from './retryOnce';
import { ContentLockedError } from './protectedContent';

describe('retryOnce', () => {
  it('retries a network failure exactly once', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('net')).mockResolvedValueOnce('ok');
    await expect(retryOnce(load, 0)).resolves.toBe('ok');
    expect(load).toHaveBeenCalledTimes(2);
  });
  it('gives up after the second failure', async () => {
    const load = vi.fn().mockRejectedValue(new Error('net'));
    await expect(retryOnce(load, 0)).rejects.toThrow('net');
    expect(load).toHaveBeenCalledTimes(2);
  });
  it('never retries an access denial', async () => {
    const load = vi.fn().mockRejectedValue(new ContentLockedError());
    await expect(retryOnce(load, 0)).rejects.toBeInstanceOf(ContentLockedError);
    expect(load).toHaveBeenCalledTimes(1);
  });
});
