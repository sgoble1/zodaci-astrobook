import { describe, expect, it } from 'vitest';
import { parseSiteSettings } from './useSiteSettings';

describe('site settings', () => {
  it('reads the maintenance notice and switches', () => {
    const s = parseSiteSettings([{ key: 'site.maintenance', value: { enabled: true, message: 'Back at noon' } }, { key: 'site.flags', value: { astrocomic: false } }]);
    expect(s.maintenance).toEqual({ enabled: true, message: 'Back at noon' });
    expect(s.flags.astrocomic).toBe(false);
    expect(s.flags.academy).toBe(true);
  });
  it('keeps features on and the notice off when values are malformed', () => {
    const s = parseSiteSettings([{ key: 'site.maintenance', value: { enabled: 'yes' } }, { key: 'site.flags', value: 'broken' }]);
    expect(s.maintenance.enabled).toBe(false);
    expect(Object.values(s.flags).every(Boolean)).toBe(true);
  });
});
