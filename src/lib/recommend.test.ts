import { describe, expect, it } from 'vitest';
import { recommendFor } from './recommend';

describe('recommended for you', () => {
  it('suggests nothing without a saved chart', () => expect(recommendFor({ hub: '/my-chart', hasChart: false, moonSign: 'Leo' })).toBeNull());
  it('uses the Moon sign on the chart hub', () => expect(recommendFor({ hub: '/my-chart', hasChart: true, moonSign: 'Pisces' })?.title).toBe('Your Moon in Pisces'));
  it('continues the last reading on the readings hub', () => expect(recommendFor({ hub: '/my-readings', hasChart: true, lastVisit: { path: '/my-readings/topic/love', title: 'Love' } })?.to).toBe('/my-readings/topic/love'));
});
