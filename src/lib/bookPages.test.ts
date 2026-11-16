import { describe, it, expect } from 'vitest';
import { versionOf } from './books';
// Owner changed targets Nov 16 2026 to match what the chart-built books actually print.
describe('AstroBook page targets', () => {
  it('Digital is 45–70 pages', () => expect(versionOf('digital')?.pages).toEqual([45, 70]));
  it('Pocket is 50–75 pages', () => expect(versionOf('pocket')?.pages).toEqual([50, 75]));
  it('Classic is 75–120 pages', () => expect(versionOf('classic')?.pages).toEqual([75, 120]));
  it('Signature is 90–150 pages', () => expect(versionOf('signature')?.pages).toEqual([90, 150]));
  it('Linen is 100–180 pages', () => expect(versionOf('linen')?.pages).toEqual([100, 180]));
});
