import { describe, expect, it } from 'vitest';
import { INVESTMENT_AMOUNTS, INVESTMENT_SCENARIOS, investmentOutcome, tierFor } from './investmentScenarios';
const base = INVESTMENT_SCENARIOS.find(s => s.id === 'base')!;
describe('investment scenarios', () => {
  it('offers community amounts from $100 through $50k', () => { expect(INVESTMENT_AMOUNTS).toEqual([100, 250, 500, 1000, 10000, 25000, 50000]); });
  it('ownership is amount over post-money valuation', () => { expect(investmentOutcome(250, 1_000_000, base).ownership).toBeCloseTo(250 / 1_000_250, 12); });
  it('base case: $1,000 at $1M pre-money returns 1.8x after 40% dilution at a 3x exit', () => { expect(investmentOutcome(1000, 1_000_000, base).multiple).toBeCloseTo(1.8, 6); });
  it('return multiple is the same for $100 and $50k at the same terms (proportional)', () => {
    for (const s of INVESTMENT_SCENARIOS) expect(investmentOutcome(100, 1e6, s).multiple).toBeCloseTo(s.exitMultiple * (1 - s.dilution), 6);
  });
  it('conservative case loses money', () => { expect(investmentOutcome(500, 1e6, INVESTMENT_SCENARIOS[0]).gain).toBeLessThan(0); });
  it('tiers: under $10k community, $10k–$49,999 angel, $50k+ institutional', () => { expect([tierFor(1000), tierFor(10000), tierFor(50000)]).toEqual(['Community', 'Angel', 'Institutional']); });
});
