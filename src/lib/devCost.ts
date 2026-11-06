// Build (Lovable) credit cost snapshot. Update the snapshot when credits are re-read.
export const DOLLARS_PER_BUILD_CREDIT = 0.35;

export const BUILD_CREDIT_SNAPSHOT = {
  periodLabel: 'Oct 29 – Nov 29, 2026',
  usedThisPeriod: 806,
  remaining: 149,
  takenOn: 'Nov 6, 2026',
} as const;

export const creditCost = (credits: number) => Math.round(credits * DOLLARS_PER_BUILD_CREDIT * 100) / 100;

export const formatUsd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function buildCostLine(s = BUILD_CREDIT_SNAPSHOT) {
  return `Build credits: ${s.usedThisPeriod} used this billing period (${s.periodLabel}) = ${formatUsd(creditCost(s.usedThisPeriod))} at ${formatUsd(DOLLARS_PER_BUILD_CREDIT)}/credit; ${s.remaining} remaining (${formatUsd(creditCost(s.remaining))}). Snapshot ${s.takenOn}.`;
}
