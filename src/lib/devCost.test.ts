import { describe, it, expect } from 'vitest';
import { creditCost, DOLLARS_PER_BUILD_CREDIT } from './devCost';

describe('build credit cost', () => {
  it('charges $0.35 per credit', () => {
    expect(DOLLARS_PER_BUILD_CREDIT).toBe(0.35);
    expect(creditCost(806)).toBe(282.1);
    expect(creditCost(100)).toBe(35);
  });
});
