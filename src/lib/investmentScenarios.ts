/** Illustrative investment math: ownership = amount / post-money valuation; outcomes scale by an assumed exit multiple of today's valuation, diluted by later rounds. Not an offer or forecast. */
export const INVESTMENT_AMOUNTS = [100, 250, 500, 1000, 10000, 25000, 50000] as const;
export const DEFAULT_PRE_MONEY = 1_000_000;
export type ScenarioId = 'conservative' | 'base' | 'growth';
export const INVESTMENT_SCENARIOS: { id: ScenarioId; label: string; exitMultiple: number; dilution: number; reasoning: string }[] = [
  { id: 'conservative', label: 'Conservative', exitMultiple: 0.5, dilution: 0.3, reasoning: 'Growth stalls and the company is sold below today’s valuation after later rounds dilute early holders by 30%. Most small companies end here or lower, including a total loss.' },
  { id: 'base', label: 'Base', exitMultiple: 3, dilution: 0.4, reasoning: 'Memberships and print products grow steadily; a sale at three times today’s valuation after 40% dilution from later rounds.' },
  { id: 'growth', label: 'Growth', exitMultiple: 10, dilution: 0.5, reasoning: 'Strong subscriber growth and repeat print sales; a sale at ten times today’s valuation after 50% dilution. Uncommon.' },
];
export const tierFor = (amount: number) => amount < 10000 ? 'Community' : amount < 50000 ? 'Angel' : 'Institutional';

export function investmentOutcome(amount: number, preMoney: number, s: typeof INVESTMENT_SCENARIOS[number]) {
  if (!(amount > 0) || !(preMoney > 0)) throw new Error('Amount and valuation must be positive');
  const postMoney = preMoney + amount;
  const ownership = amount / postMoney;
  const ownershipAtExit = ownership * (1 - s.dilution);
  const exitValue = postMoney * s.exitMultiple;
  const payout = ownershipAtExit * exitValue;
  return { postMoney, ownership, ownershipAtExit, exitValue, payout, multiple: payout / amount, gain: payout - amount };
}
