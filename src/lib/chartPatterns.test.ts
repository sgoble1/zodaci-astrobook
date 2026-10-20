import { describe, expect, it } from 'vitest';
import { computeChart } from '@/lib/astro';
import { detectPatterns, retroGood } from '@/lib/chartPatterns';
import type { BodyPos } from '@/lib/astro';

const body = (key: string, lon: number, retro = false, house: number | null = null): BodyPos => ({ key, name: key[0].toUpperCase() + key.slice(1), glyph: '', lon, sign: ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][Math.floor(lon / 30) % 12], signGlyph: '', deg: 0, min: 0, house, retro, confidence: 'derived' });
const codes = (bodies: BodyPos[], asc: number | null = null) => detectPatterns({ bodies, asc, cusps: null }).map(p => p.code);

describe('chart patterns', () => {
  it('flags a full-moon birth when Sun and Moon are 172°+ apart', () => {
    expect(codes([body('sun', 10), body('moon', 188)])).toContain('FULL_MOON_BIRTH');
    expect(codes([body('sun', 10), body('moon', 150)])).not.toContain('FULL_MOON_BIRTH');
  });
  it('flags an anaretic (29°) Ascendant', () => {
    expect(codes([], 59.5)).toContain('ANARETIC_ASC');
    expect(codes([], 50)).not.toContain('ANARETIC_ASC');
  });
  it('finds a grand trine within 7°', () => {
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
