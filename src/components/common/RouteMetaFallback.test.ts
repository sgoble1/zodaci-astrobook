import { describe, expect, it } from 'vitest';
import { fallbackMeta } from './RouteMetaFallback';
describe('route title fallback', () => {
  it('names member pages from the navigation registry', () => { expect(fallbackMeta('/planets')?.title).toMatch(/· Zodaci$/); });
  it('uses the closest parent for detail pages', () => { expect(fallbackMeta('/planets/mars')).toEqual(fallbackMeta('/planets')); });
  it('returns null for unknown paths', () => { expect(fallbackMeta('/no-such-page')).toBeNull(); });
});
