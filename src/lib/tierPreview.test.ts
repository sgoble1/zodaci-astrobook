import { describe, it, expect } from 'vitest';
import { displayedPlan } from './tierPreview';

describe('tier preview', () => {
  it('founders previewing Free see Free', () => expect(displayedPlan('creator', true, 'free')).toBe('free'));
  it('is off by default', () => expect(displayedPlan('creator', true, null)).toBe('creator'));
  it('never changes a regular member', () => expect(displayedPlan('free', false, 'creator')).toBe('free'));
});
