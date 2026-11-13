import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { viewingOtherEdition } from './useOnDemandReading';
import { ADMIN_EDITION_KEY } from './useAprilSpace';

// Tests run without a browser: give the check a per-tab store like the real sessionStorage.
const store = new Map<string, string>();
const session = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k), clear: () => store.clear() };

describe('viewingOtherEdition', () => {
  beforeEach(() => { vi.stubGlobal('sessionStorage', session); vi.stubGlobal('window', { sessionStorage: session }); });
  afterEach(() => { store.clear(); vi.unstubAllGlobals(); });
  it('is false in your own account', () => expect(viewingOtherEdition()).toBe(false));
  it("is true while viewing April's or Zac's edition", () => {
    sessionStorage.setItem(ADMIN_EDITION_KEY, 'april'); expect(viewingOtherEdition()).toBe(true);
    sessionStorage.setItem(ADMIN_EDITION_KEY, 'zac'); expect(viewingOtherEdition()).toBe(true);
  });
  it('is false for any other stored value', () => {
    sessionStorage.setItem(ADMIN_EDITION_KEY, 'shane'); expect(viewingOtherEdition()).toBe(false);
  });
});

describe('firstLook edition guard', () => {
  beforeEach(() => { vi.stubGlobal('sessionStorage', session); vi.stubGlobal('window', { sessionStorage: session }); });
  afterEach(() => { store.clear(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
  it("never loads the viewer's own readings while another edition is open", async () => {
    const lib = await import('@/lib/topicReadings');
    const spy = vi.spyOn(lib, 'loadMyTopicReadings');
    const { firstLook } = await import('./useOnDemandReading');
    sessionStorage.setItem(ADMIN_EDITION_KEY, 'april');
    const look = await firstLook('love');
    expect(look.edition).toBe(true);
    expect(spy).not.toHaveBeenCalled();
  });
});
