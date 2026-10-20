import { describe, expect, it } from 'vitest';
import { createBookmarkStore } from './bookmarkStore';

describe('owner-scoped bookmarks', () => {
  it('never reuses April bookmarks for Shane', async () => {
    const store = createBookmarkStore<string>();
    expect(await store.load('april', async () => ['April private chapter'])).toEqual(['April private chapter']);
    expect(await store.load('shane', async () => ['Shane chapter'])).toEqual(['Shane chapter']);
  });
  it('discards a request completed after an account change', async () => {
    const store = createBookmarkStore<string>();
    let finish: ((rows: string[]) => void) | undefined;
    const pending = store.load('april', () => new Promise(resolve => { finish = resolve; }));
    store.clear();
    finish?.(['April private chapter']);
    expect(await pending).toEqual([]);
  });
  it('allows retry after a failed read instead of caching failure', async () => {
    const store = createBookmarkStore<string>();
    await expect(store.load('shane', async () => { throw new Error('offline'); })).rejects.toThrow('offline');
    expect(await store.load('shane', async () => ['Saved section'])).toEqual(['Saved section']);
  });
});