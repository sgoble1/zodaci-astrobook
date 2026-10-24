import { describe, expect, it } from 'vitest';
import { computeChart } from '@/lib/astro';
import { detectPatterns, lunarTiming, rankPatterns, retroGood, SIGNIFICANCE_POINTS } from '@/lib/chartPatterns';
import type { BodyPos } from '@/lib/astro';

const body = (key: string, lon: number, retro = false, house: number | null = null): BodyPos => ({ key, name: key[0].toUpperCase() + key.slice(1), glyph: '', lon, sign: ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][Math.floor(lon / 30) % 12], signGlyph: '', deg: 0, min: 0, house, retro, confidence: 'derived' });
const codes = (bodies: BodyPos[], asc: number | null = null) => detectPatterns({ bodies, asc, cusps: null }).map(p => p.code);

describe('chart patterns', () => {
  it('flags a full-moon birth within 12° of exact opposition (spec 2.7)', () => {
    expect(codes([body('sun', 10), body('moon', 188)])).toContain('FULL_MOON_BIRTH');
    expect(codes([body('sun', 10), body('moon', 179)])).toContain('FULL_MOON_BIRTH');
    expect(codes([body('sun', 10), body('moon', 150)])).not.toContain('FULL_MOON_BIRTH');
  });
  it('flags an anaretic (29°) Ascendant', () => {
    expect(codes([], 59.5)).toContain('ANARETIC_ASC');
    expect(codes([], 50)).not.toContain('ANARETIC_ASC');
  });
  it('finds a grand trine within 8° (spec 6.1)', () => {
    expect(codes([body('sun', 0), body('jupiter', 121), body('saturn', 239)])).toContain('GRAND_TRINE');
  });
  it('finds a T-square', () => {
    expect(codes([body('mars', 0), body('saturn', 180), body('moon', 90)])).toContain('T_SQUARE');
  });
  it('rates RetroGOOD tiers, counting personal retrogrades double', () => {
    expect(retroGood({ bodies: [body('saturn', 0, true)] }).tier).toBe('light');
    expect(retroGood({ bodies: [body('venus', 0, true), body('mercury', 0, true), body('saturn', 0, true)] }).tier).toBe('strong');
  });
  it("Shane's verified chart shows retrograde Venus, Jupiter and Pluto", () => {
    const c = computeChart({ date: '1993-03-25', time: '13:55', lat: 42.96395, lon: -78.73781, tz: 'America/New_York', houseSystem: 'placidus' } as never);
    expect(retroGood(c).planets.sort()).toEqual(['Jupiter', 'Pluto', 'Venus']);
  });
});

describe('Unified Master Specification pattern rules', () => {
  const zac = computeChart({ date: '1987-07-10', time: '12:08', lat: 39.9567, lon: -83.0144, tz: 'America/New_York', houseSystem: 'whole', placeLabel: '', placeSource: 'geocoded' });
  const april = computeChart({ date: '1990-09-06', time: '15:38', lat: 42.86896, lon: -76.97774, tz: 'America/New_York', houseSystem: 'placidus', placeLabel: '', placeSource: 'geocoded' });

  it('times a Full Moon birth from the real lunation, not the natal aspect (§2.7)', () => {
    const t = lunarTiming(zac)!;
    expect(t.nearestFull!.toISOString().slice(0, 13)).toBe('1987-07-11T03');
    expect(t.hoursFromFull!).toBeGreaterThan(-12);
    expect(t.hoursFromFull!).toBeLessThan(-11);
    expect(detectPatterns(zac).map(p => p.code)).toContain('FULL_MOON_BIRTH');
  });
  it('places the reference chart (Sun 13° Virgo, Moon 6° Aries) in the Full Moon phase of September 5, 1990', () => {
    const p = detectPatterns(april).find(x => x.code === 'FULL_MOON_PHASE');
    expect(p).toBeDefined();
    expect(p!.detail).toContain('September 5, 1990');
    expect(detectPatterns(april).map(x => x.code)).not.toContain('FULL_MOON_BIRTH');
  });
  it('uses the spec orbs: grand trine 8°, T-square squares 6°, Yod quincunx 3°', () => {
    expect(codes([body('sun', 0), body('jupiter', 128), body('saturn', 240)])).toContain('GRAND_TRINE');
    expect(codes([body('sun', 0), body('jupiter', 129), body('saturn', 240)])).not.toContain('GRAND_TRINE');
    expect(codes([body('mars', 0), body('saturn', 180), body('moon', 96)])).toContain('T_SQUARE');
    expect(codes([body('mars', 0), body('saturn', 180), body('moon', 97)])).not.toContain('T_SQUARE');
    expect(codes([body('venus', 0), body('mars', 60), body('pluto', 210)])).toContain('YOD');
    expect(codes([body('venus', 0), body('mars', 60), body('pluto', 214)])).not.toContain('YOD');
  });
  it('ranks with the spec weights: Big Three +30, anaretic +20, Full Moon +15', () => {
    const ranked = rankPatterns(detectPatterns(april), april);
    const asc = ranked.find(r => r.pattern_id === 'ANARETIC_ASC')!;
    expect(asc.score).toBe(SIGNIFICANCE_POINTS.bigThree + SIGNIFICANCE_POINTS.anaretic);
    const fm = ranked.find(r => r.pattern_id === 'FULL_MOON_PHASE')!;
    expect(fm.score).toBe(SIGNIFICANCE_POINTS.bigThree + SIGNIFICANCE_POINTS.handleOrFullMoon);
    expect(ranked.map(r => r.narrative_priority)).toEqual(ranked.map((_, i) => i + 1));
    expect([...ranked].sort((a, b) => b.score - a.score).map(r => r.score)).toEqual(ranked.map(r => r.score));
  });
  it('drops the Moon phase timing when the birth time is unknown', () => {
    expect(lunarTiming({ ...zac, utc: null })!.nearestFull).toBeNull();
  });
});
