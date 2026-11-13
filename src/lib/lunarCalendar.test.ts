import { describe, expect, it } from 'vitest';
import { lunarCalendar } from './lunarCalendar';
import { computeChart } from './astro';

describe('lunarCalendar', () => {
  it('finds the 2024-04-08 total eclipse New Moon in Aries 19°', () => {
    const days = lunarCalendar(new Date('2024-04-01T00:00:00Z'), 1, null);
    const nm = days.find(d => d.phase === 'New Moon')!;
    expect(nm.date.toISOString().slice(0, 10)).toBe('2024-04-08');
    expect(nm.sign).toBe('Aries');
    expect(nm.deg).toBe(19);
  });
  it('gives about four quarters a month in order', () => {
    const days = lunarCalendar(new Date('2025-01-01T00:00:00Z'), 12, null);
    expect(days.length).toBeGreaterThanOrEqual(48);
    expect(days.length).toBeLessThanOrEqual(50);
  });
  it('leaves houses blank when the birth time is unknown', () => {
    const chart = computeChart({ date: '1990-05-01', time: null, lat: 40.7, lon: -74, tz: 'America/New_York', placeLabel: 'NY', placeSource: 'geocoded', houseSystem: 'placidus' } as never);
    expect(lunarCalendar(new Date('2025-01-01T00:00:00Z'), 1, chart).every(d => d.house === null)).toBe(true);
  });
});
