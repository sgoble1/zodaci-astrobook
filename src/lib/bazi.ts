import type { ChartResult } from './astro';
export const FIVE_ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'] as const;
/** Visible stems/branches from the canonical solar-term calculator; never imply this count is a full strength model. */
export function baziBalance(chart: ChartResult) {
  const day = chart.bazi.find(p => p.label === 'Day');
  const counts = FIVE_ELEMENTS.map(element => ({ element, count: chart.elements[element] ?? 0 }));
  const total = counts.reduce((sum, e) => sum + e.count, 0);
  const index = FIVE_ELEMENTS.findIndex(e => e === day?.stemElement);
  const resource = index < 0 ? null : FIVE_ELEMENTS[(index + 4) % 5];
  const support = index < 0 ? 0 : (chart.elements[day?.stemElement ?? ''] ?? 0) + (resource ? chart.elements[resource] ?? 0 : 0);
  return { day, counts, total, resource, support, supportPercent: total ? support / total * 100 : 0, hourKnown: chart.bazi.some(p => p.label === 'Hour') };
}