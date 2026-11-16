import { describe, it, expect } from 'vitest';
import { summarizeSpend } from './aiSpend';

const row = (feature: string, created_at: string, user_id = 'u1') => ({ feature, created_at, user_id });

describe('summarizeSpend', () => {
  it('counts this month, previous month and projects by pace', () => {
    const now = new Date('2026-11-16T00:00:00Z'); // 15 days elapsed of 30
    const s = summarizeSpend([row('reading', '2026-11-02T10:00:00Z'), row('reading', '2026-11-10T10:00:00Z', 'u2'), row('podcast', '2026-11-15T10:00:00Z'), row('reading', '2026-10-20T10:00:00Z')], now);
    expect(s.total).toBe(3);
    expect(s.previous).toBe(1);
    expect(s.members).toBe(2);
    expect(s.projected).toBe(6);
    expect(s.byFeature[0]).toEqual(['reading', 2]);
  });
});
