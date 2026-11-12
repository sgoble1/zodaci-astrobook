import { describe, expect, it } from 'vitest';
import { fix } from './PublicWording';

describe('public "you" wording', () => {
  it('turns April-specific wording into you/your', () => {
    expect(fix('A reading written for April.')).toBe('A reading written for you.');
    expect(fix("April's Moon is in Virgo.")).toBe('Your Moon is in Virgo.');
    expect(fix('April & Shane read together.')).toBe('You and the people you invite read together.');
  });
  it('keeps the month in dates', () => {
    expect(fix('born April 16, 1989 at 3:55 PM')).toBe('born April 16, 1989 at 3:55 PM');
    expect(fix('16 April 1989')).toBe('16 April 1989');
    expect(fix('Opens in April 2027')).toBe('Opens in April 2027');
  });
  it('keeps the month in month lists', () => {
    expect(fix('March, April, May')).toBe('March, April, May');
  });
});
