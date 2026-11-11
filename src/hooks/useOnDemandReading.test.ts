import { describe, it, expect, afterEach } from 'vitest';
import { viewingOtherEdition } from './useOnDemandReading';
import { ADMIN_EDITION_KEY } from './useAprilSpace';

describe('viewingOtherEdition', () => {
  afterEach(() => sessionStorage.clear());
  it('is false in your own account', () => expect(viewingOtherEdition()).toBe(false));
  it("is true while viewing April's or Zac's edition", () => {
    sessionStorage.setItem(ADMIN_EDITION_KEY, 'april'); expect(viewingOtherEdition()).toBe(true);
    sessionStorage.setItem(ADMIN_EDITION_KEY, 'zac'); expect(viewingOtherEdition()).toBe(true);
  });
});
