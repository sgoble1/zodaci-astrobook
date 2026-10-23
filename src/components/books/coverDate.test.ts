import { describe, expect, it } from 'vitest';
import { sunFromDate, validBirthDate } from './CoverCustomizer';

describe('cover preview birth date', () => {
  it('rejects impossible calendar days', () => {
    expect(validBirthDate('2025-02-30')).toBe(false);
    expect(validBirthDate('2024-02-29')).toBe(true);
    expect(validBirthDate('1899-12-31')).toBe(false);
  });
  it('gives a plain sign mid-sign', () => expect(sunFromDate('2000-08-10')).toMatchObject({ sign: 'Leo', cusp: false }));
  it('flags the day the Sun changes sign', () => expect(sunFromDate('2000-07-22')?.cusp).toBe(true));
});
