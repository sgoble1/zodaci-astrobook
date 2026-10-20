import { describe, expect, it } from 'vitest';
import { computeChart } from './astro';
import { deduce } from './deductions';

describe('deduction engine', () => {
  const c = computeChart({ date: '1993-03-25', time: '13:55', lat: 42.96395, lon: -78.73781, tz: 'America/New_York', placeLabel: 'Williamsville', placeSource: 'geocoded', houseSystem: 'placidus' });
  const d = deduce(c, { date: '1993-03-25', timeKnown: true, sex: 'male' });
  it('computes Life Path 5 (22+3+7=32) for 1993-03-25', () => { expect(d.find(x => x.id === 'life-path')?.title).toBe('Life Path 5'); });
  it('covers all four systems when sex and time are known', () => { expect(new Set(d.map(x => x.system)).size).toBe(4); });
  it('omits chart ruler when birth time is unknown', () => { expect(deduce(c, { date: '1993-03-25', timeKnown: false }).some(x => x.id === 'chart-ruler')).toBe(false); });
});
