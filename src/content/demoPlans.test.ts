import { describe, expect, it } from 'vitest';
import { DEMO_PLANS } from './demoPlans';

describe('demo plan access', () => {
  it('shows the first section on Free', () => {
    expect(DEMO_PLANS.free.sections).toBe(1);
  });
  it('shows all seven sections for both Pro and Cosmic', () => {
    expect(DEMO_PLANS.full.sections).toBe(7);
    expect(DEMO_PLANS.creator.sections).toBe(7);
  });
  it('gives paid plans the same features, with 60 versus 150 monthly credits', () => {
    expect(DEMO_PLANS.full.points.slice(0, -1)).toEqual(DEMO_PLANS.creator.points.slice(0, -1));
    expect(DEMO_PLANS.full.points.at(-1)).toBe('60 monthly AI credits');
    expect(DEMO_PLANS.creator.points.at(-1)).toBe('150 monthly AI credits');
  });
});