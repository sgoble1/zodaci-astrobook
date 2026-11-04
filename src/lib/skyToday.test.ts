import { describe, expect, it } from 'vitest';
import { skyEvents, skyToday } from './skyToday';

const day = (d: Date) => d.toISOString().slice(0, 10);
const near = (d: Date, iso: string) => Math.abs(d.getTime() - Date.parse(iso)) <= 86_400_000;

describe('skyEvents (general sky calendar)', () => {
  const events = skyEvents(new Date('2025-01-01T00:00:00Z'), 60);

  it('finds the 13 January 2025 Full Moon and 29 January 2025 New Moon', () => {
    expect(events.filter(e => e.kind === 'full-moon').map(e => day(e.date))).toContain('2025-01-13');
    expect(events.filter(e => e.kind === 'new-moon').map(e => day(e.date))).toContain('2025-01-29');
  });

  it('finds Mars stationing direct around 24 February 2025', () => {
    const st = events.find(e => e.title === 'Mars stations direct');
    expect(st).toBeDefined();
    expect(near(st!.date, '2025-02-24T00:00:00Z')).toBe(true);
  });

  it('never lists the Moon changing sign', () => {
    expect(events.some(e => e.title.startsWith('Moon enters'))).toBe(false);
  });
});

describe('skyToday', () => {
  it('reports the Moon as full on 13 January 2025 evening', () => {
    expect(skyToday(new Date('2025-01-13T22:30:00Z')).phase.lit).toBeGreaterThan(95);
  });
});
