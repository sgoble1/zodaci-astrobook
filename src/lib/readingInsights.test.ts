import { describe, expect, it } from 'vitest';
import { readingFacts, readingMinutes, ordinal } from './readingInsights';

describe('reading insights come only from the reading text', () => {
  it('lists each written placement once, in order, normalising Rising and MC', () => {
    const f = readingFacts('## Heart\nYour Moon in Capricorn steadies you. The **Moon in Capricorn** again.\nVenus is in Pisces. Rising in Leo; MC in Aries.');
    expect(f.placements).toEqual(['Moon in Capricorn', 'Venus in Pisces', 'Ascendant in Leo', 'Midheaven in Aries']);
  });
  it('finds houses written as numbers or words, ignoring numbers outside 1–12', () => {
    expect(readingFacts('The 10th house and the fourth house; a 14th house is not real.').houses).toEqual([4, 10]);
  });
  it('ignores placements inside code fences and counts minutes at 230 words', () => {
    expect(readingFacts('```\nSun in Leo\n```\nplain words').placements).toEqual([]);
    expect(readingMinutes(0)).toBe(0);
    expect(readingMinutes(100)).toBe(1);
    expect(readingMinutes(2300)).toBe(10);
  });
  it('writes ordinals for houses', () => {
    expect([1, 2, 3, 4, 11, 12].map(ordinal)).toEqual(['1st', '2nd', '3rd', '4th', '11th', '12th']);
  });
});
