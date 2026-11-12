import { describe, expect, it } from 'vitest';
import { isPublicPath } from './memberRoutes';

describe('member pages open as themselves instead of the readings fallback', () => {
  it.each(['/content-center', '/observation-log', '/reading-history', '/reset-password', '/my-readings/topic/big-three', '/dashboard', '/april'])('%s opens for every account', path => {
    expect(isPublicPath(path)).toBe(true);
  });
  it.each(['/masterbook', '/masterbook/12', '/feng-shui/flying-stars', '/volume-2'])('%s stays an April-edition page', path => {
    expect(isPublicPath(path)).toBe(false);
  });
});
