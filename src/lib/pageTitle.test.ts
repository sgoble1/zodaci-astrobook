import { describe, it, expect } from 'vitest';
import { crumbTitleFrom } from './pageTitle';
import { breadcrumbsFor } from '@/content/memberNav';

describe('breadcrumb titles', () => {
  it('takes the first part of a page title', () => {
    expect(crumbTitleFrom('Reading your birth chart | Zodaci')).toBe('Reading your birth chart');
    expect(crumbTitleFrom('Natal Chart Foundation · Shane')).toBe('Natal Chart Foundation');
    expect(crumbTitleFrom('Zodaci')).toBeNull();
    expect(crumbTitleFrom('')).toBeNull();
  });
  it('gives lessons, articles and guides a trail back to Learn', () => {
    expect(breadcrumbsFor('/learn/reading-your-birth-chart', { title: 'Reading your birth chart' })?.map(c => c.label)).toEqual(['Research Library', 'Articles', 'Reading your birth chart']);
    expect(breadcrumbsFor('/reading-room/transits')?.[1]).toEqual({ label: 'Guides', to: '/learn#guides' });
    expect(breadcrumbsFor('/academy/planets', { title: 'The planets' })?.at(-1)?.label).toBe('The planets');
  });
  it('names Shane chapters by their title when known', () => {
    expect(breadcrumbsFor('/shane/sm-01', { title: 'Natal Chart Foundation' })?.at(-1)?.label).toBe('Natal Chart Foundation');
    expect(breadcrumbsFor('/shane/sm-01')?.at(-1)?.label).toBe('Chapter');
  });
});
