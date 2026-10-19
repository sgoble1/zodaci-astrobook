import { describe, expect, it } from 'vitest';
import { claimChunkReload, isChunkError } from './chunkRecovery';
describe('failed module recovery', () => {
  it('recognizes browser module failures but not unrelated failures', () => {
    expect(isChunkError(new TypeError('Importing a module script failed.'))).toBe(true);
    expect(isChunkError(new Error('Failed to fetch dynamically imported module: /page.js'))).toBe(true);
    expect(isChunkError(new Error('Payment declined'))).toBe(false);
  });
  it('permits only one automatic reload within the retry window', () => {
    const entries = new Map<string, string>();
    const storage = { getItem: (key: string) => entries.get(key) ?? null, setItem: (key: string, value: string) => { entries.set(key, value); } };
    expect(claimChunkReload(storage, 100_000)).toBe(true);
    expect(claimChunkReload(storage, 100_001)).toBe(false);
    expect(claimChunkReload(storage, 159_999)).toBe(false);
    expect(claimChunkReload(storage, 160_000)).toBe(true);
  });
  it('does not crash or reload when browser storage is unavailable', () => {
    const storage = { getItem: () => { throw new Error('Storage blocked'); }, setItem: () => {} };
    expect(claimChunkReload(storage, 100_000)).toBe(false);
  });
});
