import { describe, expect, it } from 'vitest';
import { CREDIT_PACKS } from './plans';

describe('credit packs', () => {
  it('sells exactly $15, $20, $25, $30, $50 and $100 packs', () => {
    expect(CREDIT_PACKS.map(p => p.price)).toEqual([15, 20, 25, 30, 50, 100]);
  });
  it('never gives fewer than 10 credits per dollar', () => {
    for (const p of CREDIT_PACKS) expect(p.credits).toBeGreaterThanOrEqual(p.price * 10);
  });
});
