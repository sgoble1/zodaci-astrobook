import { describe, expect, it } from 'vitest';
import { spineInches, spineTextFits } from './spine';
describe('spineInches', () => {
  it('uses pages / 444 + 0.06 for paperbacks', () => { expect(spineInches(320)).toEqual({ inches: 0.781, estimate: false }); });
  it('adds boards for hardcovers and marks it an estimate', () => { expect(spineInches(320, true)).toEqual({ inches: 1.031, estimate: true }); });
  it('no spine text under 100 pages', () => { expect(spineTextFits(99)).toBe(false); expect(spineTextFits(100)).toBe(true); });
});
