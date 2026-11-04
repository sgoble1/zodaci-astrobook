import { describe, it, expect } from 'vitest';
import { broadcastChannels, chapterFrom, compassFrom, moonPhase } from './currentChapter';
import type { TransitEvent, TransitHit } from './transitOverlay';

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

const pos = (key: string, lon: number, retro = false) => ({ key, name: key[0].toUpperCase() + key.slice(1), glyph: '', lon, sign: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][Math.floor(lon / 30)], deg: lon % 30, retro });
const tagged = (days: number, planet: string, natalKey?: string, kind: TransitEvent['kind'] = 'exact'): TransitEvent => ({ ...ev(days, 5, `${planet}-${natalKey ?? kind}`), kind, planet, natalKey });

describe('channel sky data', () => {
  it('moon phase comes from the Sun–Moon angle', () => {
    expect(moonPhase(10, 10)).toMatchObject({ name: 'New Moon', lit: 0 });
    expect(moonPhase(10, 190)).toMatchObject({ name: 'Full Moon', lit: 100 });
    expect(moonPhase(0, 90)).toMatchObject({ name: 'First Quarter', waxing: true });
    expect(moonPhase(0, 270)).toMatchObject({ name: 'Last Quarter', waxing: false });
  });
  it('each channel reads the bodies its specialist watches, with retrograde marks', () => {
    const sky = [pos('sun', 222), pos('moon', 44), pos('venus', 250), pos('mars', 260), pos('jupiter', 110, true), pos('saturn', 355, true)];
    const ch = broadcastChannels([], [], NOW, sky);
    expect(ch[1].sky.map(r => r.label)).toEqual(['Saturn', 'Mars', 'Sun']);
    expect(ch[1].sky[0].value).toBe('25° Pisces ℞');
    expect(ch[2].sky[0]).toEqual({ label: 'Venus', value: '10° Sagittarius' });
    expect(ch[3].sky[0]).toEqual({ label: 'Retrograde now', value: 'Jupiter, Saturn' });
    expect(ch[4].sky.map(r => r.label)).toEqual(['Jupiter', 'Saturn']);
  });
  it('channels only list their own upcoming events', () => {
    const events = [tagged(3, 'saturn', 'mc'), tagged(4, 'pluto', 'venus'), tagged(6, 'venus', undefined, 'ingress'), tagged(8, 'jupiter', 'mercury'), tagged(9, 'neptune', 'mercury')];
    const ch = broadcastChannels([], events, NOW);
    expect(ch[1].events.map(e => e.title)).toEqual(['saturn-mc']);
    expect(ch[2].events.map(e => e.title)).toEqual(['pluto-venus', 'venus-ingress']);
    expect(ch[4].events.map(e => e.title)).toEqual(['saturn-mc', 'jupiter-mercury']);
  });
  it('a quiet channel names its next real event', () => {
    const ch = broadcastChannels([], [tagged(3, 'saturn', 'mc')], NOW);
    expect(ch[1].summary).toContain('Next on this channel: saturn-mc on Nov 7.');
  });
  it('contacts list up to three, strongest first', () => {
    const ch = broadcastChannels([hit('saturn', 'sun', 5, 2), hit('mars', 'mc', 3), hit('jupiter', 'saturn', 4), hit('pluto', 'mars', 5, 1)], [], NOW);
    expect(ch[1].contacts.map(c => c.transit.key)).toEqual(['pluto', 'saturn', 'jupiter']);
  });
});
