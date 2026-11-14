import { describe, it, expect } from 'vitest';
import { skyAt, dualTime } from './skyNow';

describe('skyAt', () => {
  it('puts the Sun in Capricorn at 1 Jan 2026 00:00 UTC, about 10 degrees', () => {
    const sun = skyAt(new Date('2026-01-01T00:00:00Z')).find(b => b.key === 'sun')!;
    expect(sun.sign).toBe('Capricorn');
    expect(Math.abs(sun.deg - 10)).toBeLessThanOrEqual(1);
  });
  it('never gives houses for the general sky', () => {
    expect(skyAt(new Date('2026-06-01T12:00:00Z')).every(b => b.house === null)).toBe(true);
  });
});

describe('dualTime', () => {
  it('labels UTC and the local zone separately', () => {
    const t = dualTime(new Date('2026-11-14T13:41:00Z'), 'America/New_York');
    expect(t.utc).toContain('13:41'); expect(t.utc).toContain('UTC');
    expect(t.local).toContain('08:41');
  });
});

describe('skyAt place-bound points', () => {
  it('leaves out Part of Fortune and Vertex', () => {
    const keys = skyAt(new Date('2026-11-14T06:00:00Z')).map(b => b.key);
    expect(keys).not.toContain('fortune'); expect(keys).not.toContain('vertex');
  });
});
