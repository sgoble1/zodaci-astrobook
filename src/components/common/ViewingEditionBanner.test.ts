import { describe, expect, it } from 'vitest';
import { editionOwnerOfPath } from './ViewingEditionBanner';

describe('editionOwnerOfPath', () => {
  it('names the founder whose pages are open', () => {
    expect(editionOwnerOfPath('/zac')).toBe('zac');
    expect(editionOwnerOfPath('/zac/workbook')).toBe('zac');
    expect(editionOwnerOfPath('/april/report')).toBe('april');
    expect(editionOwnerOfPath('/official-astrobook/comic/april')).toBe('april');
    expect(editionOwnerOfPath('/official-astrobook/showcase/shane')).toBe('shane');
  });
  it('ignores pages that belong to nobody', () => {
    expect(editionOwnerOfPath('/dashboard')).toBeNull();
    expect(editionOwnerOfPath('/zachary')).toBeNull();
    expect(editionOwnerOfPath('/official-astrobook')).toBeNull();
  });
});
