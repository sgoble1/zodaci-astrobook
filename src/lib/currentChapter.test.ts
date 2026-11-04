import { describe, it, expect } from 'vitest';
import { chapterFrom, compassFrom } from './currentChapter';
import type { TransitHit } from './transitOverlay';

const hit = (t: string, natal: string, weight: number, orb = 1): TransitHit => ({
  transit: { key: t, name: t, glyph: '', lon: 0, sign: 'Aries', deg: 0, retro: false },
  natalKey: natal, natalName: natal.toUpperCase(), natalRetro: false, type: 'Square', symbol: '□', orb, applying: true, weight, text: `T ${t} ${natal}`,
});

describe('current chapter', () => {
  it('uses the strongest slow-planet transit, ignoring fast planets', () => {
    const c = chapterFrom([hit('moon', 'sun', 9), hit('saturn', 'mc', 6), hit('jupiter', 'venus', 4)]);
    expect(c.hit?.transit.key).toBe('saturn');
    expect(c.title).toContain('Building long-term structure');
  });
  it('reports a quiet stretch when no slow planet is active, never inventing a theme', () => {
    expect(chapterFrom([hit('moon', 'sun', 3)]).hit).toBeNull();
  });
  it('compass signals are capped at 10 and zero without transits', () => {
    expect(compassFrom([]).Career).toBe(0);
    expect(compassFrom([hit('saturn', 'mc', 30)]).Career).toBe(10);
  });
});
