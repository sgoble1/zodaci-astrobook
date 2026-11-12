import { describe, it, expect } from 'vitest';
import { versionOf } from './books';
describe('AstroBook page targets', () => {
  it('Pocket is 60–75 pages', () => expect(versionOf('pocket')?.pages).toEqual([60, 75]));
  it('Signature is 180–300 pages', () => expect(versionOf('signature')?.pages).toEqual([180, 300]));
  it('Linen is around 340 pages', () => { const [a, b] = versionOf('linen')!.pages; expect(a).toBeLessThanOrEqual(340); expect(b).toBeGreaterThanOrEqual(340); });
});
