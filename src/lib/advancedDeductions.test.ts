import { describe, expect, it } from 'vitest';
import { computeChart } from './astro';
import { advancedDeductions, chartShape, personalYear, TRAD_RULER } from './advancedDeductions';

const shane = computeChart({ date: '1993-03-25', time: '13:55', lat: 42.96395, lon: -78.73781, tz: 'America/New_York', placeLabel: 'Williamsville', placeSource: 'geocoded', houseSystem: 'placidus' });

describe('advanced deductions', () => {
  it('classifies a tight cluster as a Bundle', () => { expect(chartShape([0, 10, 20, 30, 40, 50, 60, 70, 80, 100]).shape).toBe('Bundle'); });
  it('classifies nine planets in half plus one opposite as a Bucket', () => { expect(chartShape([0, 15, 30, 45, 60, 75, 90, 105, 130, 270]).shape).toBe('Bucket'); });
  it('reduces Personal Year for 25 March in 2026 to 2 (3+7+1=11→2)', () => { expect(personalYear('1993-03-25', 2026)).toBe(2); });
  it('uses traditional rulers (Scorpio → Mars, Aquarius → Saturn)', () => { expect(TRAD_RULER[7]).toBe('mars'); expect(TRAD_RULER[10]).toBe('saturn'); });
  it('marks Shane as a day chart (Sun above the horizon at 13:55)', () => {
    const d = advancedDeductions(shane, { date: '1993-03-25', timeKnown: true, today: new Date('2026-10-20') });
    expect(d.find(x => x.id === 'sect')?.title).toBe('Day chart');
  });
  it('profects Shane at 33 to house 10', () => {
    const d = advancedDeductions(shane, { date: '1993-03-25', timeKnown: true, today: new Date('2026-10-20') });
    expect(d.find(x => x.id === 'profection')?.title).toBe('Profection year: house 10');
  });
  it('skips time-dependent findings when birth time is unknown', () => {
    const d = advancedDeductions(shane, { date: '1993-03-25', timeKnown: false });
    expect(d.some(x => ['sect', 'profection', 'fortune', 'interception', 'voc-moon'].includes(x.id))).toBe(false);
  });
});
