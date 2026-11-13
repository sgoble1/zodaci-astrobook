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

import { COMPENDIUM_FOR_MEMBERS } from '@/pages/MemberCompendium';
import { domainFor as compendiumDomainFor } from '@/content/memberNav';
describe('member Compendium guide', () => {
  it('only points members at their own chart pages and lessons', () => {
    for (const c of COMPENDIUM_FOR_MEMBERS) expect(compendiumDomainFor(c.to.split('#')[0])).not.toBeNull();
  });
});
