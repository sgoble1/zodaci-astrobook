import { describe, expect, it } from 'vitest';
import { attributionNote, unattributedClaims } from '../../supabase/functions/_shared/attribution';

describe('placement attribution check', () => {
  it('flags a "you tend to" claim that names no placement', () => {
    const text = 'You tend to keep feelings to yourself. You tend to plan ahead — this comes from your Saturn in Virgo in the 6th house.';
    expect(unattributedClaims(text)).toEqual(['You tend to keep feelings to yourself.']);
  });
  it('accepts claims that name a sign, house or aspect', () => {
    expect(unattributedClaims('You often lead with warmth because of your Leo Sun. You may feel this most in your 10th house.')).toEqual([]);
  });
  it('ignores reflection questions and practice lists', () => {
    const md = '## Reflection questions\n- Where do you tend to hold back?\nYou may want to write it down.\n## Practices to try\nYou might try a walk.';
    expect(unattributedClaims(md)).toEqual([]);
  });
  it('writes the quality note only when something is missing', () => {
    expect(attributionNote(0)).toBe('');
    expect(attributionNote(2)).toBe('Quality check: 2 sentences may need placement attribution.');
  });
});
