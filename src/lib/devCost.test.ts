import { describe, it, expect } from 'vitest';
import { creditCost, DOLLARS_PER_BUILD_CREDIT, parseSnapshot, spentToDate } from './devCost';

describe('build credit cost', () => {
  it('charges $0.35 per credit', () => {
    expect(DOLLARS_PER_BUILD_CREDIT).toBe(0.35);
    expect(creditCost(806)).toBe(282.1);
    expect(creditCost(100)).toBe(35);
  });

  it('counts credits spent to date as granted minus remaining', () => {
    expect(spentToDate({ periodLabel: '', usedThisPeriod: 0, remaining: 139.8, grantedToDate: 6758.01, takenOn: '' })).toBe(6618.21);
  });

  it('rejects an admin snapshot with a missing or negative figure', () => {
    expect(parseSnapshot({ usedThisPeriod: 10, remaining: -1, grantedToDate: 20 })).toBeNull();
    expect(parseSnapshot({ usedThisPeriod: 10, grantedToDate: 20 })).toBeNull();
    expect(parseSnapshot({ usedThisPeriod: 10, remaining: 5, grantedToDate: 20, takenOn: 'Nov 7' })?.takenOn).toBe('Nov 7');
  });
});
