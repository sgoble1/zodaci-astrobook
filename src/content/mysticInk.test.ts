import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MYSTIC_INK_NEGATIVE, MYSTIC_INK_PREFIX, SIGN_STYLE, mysticPrompt } from '@/content/mysticInk';

describe('Mystic Ink style guide', () => {
  it('the server copy of the master prefix and negative prompt matches the client copy exactly', () => {
    const server = readFileSync('supabase/functions/_shared/mystic-ink.ts', 'utf8');
    expect(server).toContain(MYSTIC_INK_PREFIX);
    expect(server).toContain(MYSTIC_INK_NEGATIVE);
  });
  it('covers all twelve signs', () => expect(new Set(SIGN_STYLE.map(s => s.sign)).size).toBe(12));
  it('every prompt starts with the master prefix', () => expect(mysticPrompt('spot', 'a lantern on a hill').startsWith(MYSTIC_INK_PREFIX)).toBe(true));
});
