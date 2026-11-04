import { describe, expect, it } from 'vitest';
import { computeChart } from './astro';
import { transitsTo, upcomingEvents } from './transitOverlay';

describe('forecast uncertainty', () => {
  it('omits Moon and angle contacts when the saved birth time is unknown', () => {
    const chart = computeChart({ date: '1987-07-10', time: null, lat: 39.9567, lon: -83.0144, tz: 'America/New_York', houseSystem: 'whole', placeLabel: 'Columbus' });
    const now = new Date('2026-11-04T23:28:00Z');
    const hits = transitsTo(chart, now);
    const events = upcomingEvents(chart, now, 30);
    expect(hits.length).toBeGreaterThan(0);
    expect(events.length).toBeGreaterThan(0);
    expect(hits.some(h => ['moon', 'asc', 'mc'].includes(h.natalKey))).toBe(false);
    expect(events.some(e => e.natalKey && ['moon', 'asc', 'mc'].includes(e.natalKey))).toBe(false);
  });
});