import { describe, expect, it } from 'vitest';
import { annualCenter, monthlyCenter, yearBranch } from './fengshui';

describe('monthly flying stars', () => {
  it('2026 is a Horse year whose first solar month (from ~Feb 4) has star 8 at the centre', () => {
    expect(yearBranch(2026)).toBe('Horse');
    expect(monthlyCenter(2026, 0)).toBe(8);
  });
  it('the monthly centre descends by one each solar month and wraps 1 → 9', () => {
    expect([0, 1, 2, 7, 8].map(m => monthlyCenter(2026, m))).toEqual([8, 7, 6, 1, 9]);
  });
  it('Dragon years start at 5 and Snake years start at 2', () => {
    expect(yearBranch(2024)).toBe('Dragon');
    expect(monthlyCenter(2024, 0)).toBe(5);
    expect(yearBranch(2025)).toBe('Snake');
    expect(monthlyCenter(2025, 0)).toBe(2);
  });
  it('annual centre star stays 1 for 2026 and 9 for 2027', () => {
    expect(annualCenter(2026)).toBe(1);
    expect(annualCenter(2027)).toBe(9);
  });
});
