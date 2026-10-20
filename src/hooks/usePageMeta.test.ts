import { describe, expect, it } from 'vitest';
import { isIndexablePage } from './usePageMeta';

describe('public search boundaries', () => {
  it('includes marketing landing pages and community guidelines', () => {
    expect(isIndexablePage('/lp/free-birth-chart')).toBe(true);
    expect(isIndexablePage('/community/guidelines')).toBe(true);
  });
  it('excludes member discussions and account pages', () => {
    for (const path of ['/community/a-discussion', '/auth', '/brand-launch', '/shane', '/april', '/shared', '/my-readings']) {
      expect(isIndexablePage(path)).toBe(false);
    }
  });
});