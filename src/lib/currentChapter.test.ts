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

import { broadcastChannels } from './currentChapter';
import type { TransitEvent } from './transitOverlay';

const ev = (daysFromNow: number, weight: number, title = `e${daysFromNow}`): TransitEvent => ({ date: new Date(Date.UTC(2026, 10, 4) + daysFromNow * 864e5), kind: 'exact', title, detail: title, retro: false, doubleRx: false, weight });
const NOW = new Date(Date.UTC(2026, 10, 4));

describe('broadcast channels', () => {
  it('has channels 01–05 in order', () => {
    expect(broadcastChannels([], [], NOW).map(c => `${c.number} ${c.name}`)).toEqual(['01 Current Chapter', '02 Career', '03 Relationship', '04 Forecast Window', '05 Growth']);
  });
  it('career shows only contacts to Midheaven, Sun, Saturn or Mars; relationship only Venus, Moon or Ascendant', () => {
    const ch = broadcastChannels([hit('pluto', 'venus', 9), hit('mars', 'mc', 4)], [], NOW);
    expect(ch[1].hit?.natalKey).toBe('mc');
    expect(ch[2].hit?.natalKey).toBe('venus');
  });
  it('growth comes only from transiting Jupiter or Saturn', () => {
    expect(broadcastChannels([hit('pluto', 'sun', 9)], [], NOW)[4].hit).toBeNull();
    expect(broadcastChannels([hit('jupiter', 'sun', 3)], [], NOW)[4].hit?.transit.key).toBe('jupiter');
  });
  it('a quiet channel says so instead of inventing a theme', () => {
    const ch = broadcastChannels([], [], NOW);
    expect(ch[1].title).toBe('Career channel is quiet');
    expect(ch[3].events).toHaveLength(0);
  });
  it('forecast window keeps the three biggest events within 30 days, in date order', () => {
    const ch = broadcastChannels([], [ev(2, 3), ev(5, 9), ev(10, 7), ev(20, 8), ev(45, 20)], NOW)[3];
    expect(ch.events.map(e => e.title)).toEqual(['e5', 'e10', 'e20']);
  });
});
