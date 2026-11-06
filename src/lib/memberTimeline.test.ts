import { describe, expect, it } from 'vitest';
import { computeChart } from '@/lib/astro';
import { COVER_SAMPLES } from '@/content/coverSamples';
import { memberTimeline, openingRow, timelineStatus } from './memberTimeline';

// A member's Timeline Hall is calculated from their own chart: the fictional Collector reader (born 3 May 1987).
const reader = COVER_SAMPLES.find(s => s.id === 'collector')!;
const chart = computeChart({ ...reader.birth, placeSource: 'geocoded', houseSystem: 'placidus' } as never);
const NOW = new Date('2026-11-06T12:00:00Z');
const rows = memberTimeline(chart, NOW);

describe('member timeline', () => {
  it('uses the member’s own birth year: first Saturn return between ages 26 and 31', () => {
    const sr = rows.find(r => r.key === 'saturn-return-1')!;
    expect(sr.age).toBeGreaterThanOrEqual(26);
    expect(sr.age).toBeLessThanOrEqual(31);
    expect(sr.year).toBeGreaterThanOrEqual(1987 + 26);
    expect(sr.year).toBeLessThanOrEqual(1987 + 31);
  });
  it('lists events in date order', () => {
    for (let i = 1; i < rows.length; i++) expect(rows[i].date.getTime()).toBeGreaterThanOrEqual(rows[i - 1].date.getTime());
  });
  it('marks a cycle within a year of today as now, earlier as passed, later as ahead', () => {
    expect(timelineStatus(new Date('2026-03-01T00:00:00Z'), NOW)).toBe('now');
    expect(timelineStatus(new Date('2024-01-01T00:00:00Z'), NOW)).toBe('passed');
    expect(timelineStatus(new Date('2029-01-01T00:00:00Z'), NOW)).toBe('ahead');
  });
  it('opens on a current cycle when there is one, otherwise the next one ahead', () => {
    const first = openingRow(rows)!;
    expect(['now', 'ahead']).toContain(first.status);
  });
});
