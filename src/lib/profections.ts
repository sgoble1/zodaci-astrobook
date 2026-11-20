import { SIGNS, type ChartResult } from './astro';
import { SIGN_RULER } from './signRulers';

/** Civil birthdays, not elapsed 365.25-day years. Feb 29 advances on March 1 in non-leap years. */
export function birthdayAge(date: string, today = new Date()): number {
  const [y, m, d] = date.split('-').map(Number);
  const passed = today.getMonth() + 1 > m || (today.getMonth() + 1 === m && today.getDate() >= d);
  return Math.max(0, today.getFullYear() - y - (passed ? 0 : 1));
}

export function annualProfection(chart: ChartResult, age: number) {
  if (!Number.isInteger(age) || age < 0 || age > 100) throw new Error('Choose a whole age from 0 to 100.');
  if (!chart.input.time || chart.asc == null) return null;
  const house = age % 12 + 1;
  const signIndex = (Math.floor(chart.asc / 30) + house - 1) % 12;
  const sign = SIGNS[signIndex];
  const lordKey = SIGN_RULER[sign].traditional;
  const occupants = chart.bodies.filter(b => Math.floor(b.lon / 30) === signIndex && !['southNode', 'fortune', 'vertex', 'lilith'].includes(b.key));
  return { age, house, sign, signIndex, lordKey, lord: chart.bodies.find(b => b.key === lordKey), occupants };
}