import { describe, expect, it } from 'vitest';
import { computeChart, type ChartInput } from '@/lib/astro';
import { COVER_SAMPLES } from './coverSamples';
import { SAMPLE_ISSUE, SAMPLE_ISSUE_SCRIPTED } from './sampleComic';

// Every placement, degree and orb printed in the public sample comic must be true for the fictional Collector reader.
const reader = COVER_SAMPLES.find(s => s.id === 'collector')!;
const c = computeChart({ ...reader.birth, placeSource: 'geocoded', houseSystem: 'placidus' } as ChartInput);
const body = (key: string) => c.bodies.find(b => b.key === key)!;
const orb = (a: string, b: string, type: string) => c.aspects.find(x => ((x.a === a && x.b === b) || (x.a === b && x.b === a)) && x.type === type)?.orb ?? Infinity;
const near = (got: number, want: number, tol = 0.06) => expect(Math.abs(got - want)).toBeLessThan(tol);
const text = JSON.stringify([SAMPLE_ISSUE, SAMPLE_ISSUE_SCRIPTED]);

describe('sample AstroComic for the fictional Collector reader', () => {
  it('stars the Collector reader and prints her calculated Sun, Moon and Rising', () => {
    expect(SAMPLE_ISSUE.hero).toBe(reader.name);
    expect(SAMPLE_ISSUE.subject).toEqual({ sunSign: body('sun').sign, moonSign: body('moon').sign, risingSign: 'Taurus' });
    expect(Math.floor(c.asc! / 30)).toBe(1);
  });
  it('Taurus Rising 12°47′ with the Sun 0.3° away on the 12th-house side', () => {
    near(c.asc!, 30 + 12 + 47 / 60, 0.02); near(orb('Sun', 'Ascendant', 'Conjunction'), 0.3, 0.05);
    expect(body('sun').lon).toBeLessThan(c.asc!); expect(body('sun').house).toBe(12);
  });
  it('Sun, Mercury, Venus and Jupiter in the 12th; Venus with Jupiter 1.7°', () => {
    expect(['sun', 'mercury', 'venus', 'jupiter'].map(k => body(k).house)).toEqual([12, 12, 12, 12]);
    near(orb('Venus', 'Jupiter', 'Conjunction'), 1.7);
  });
  it('Moon Cancer 13°28′ in the 3rd, sextile Sun 1.0° and Ascendant 0.7°, square Venus 0.5° and Jupiter 1.2°', () => {
    expect(`${body('moon').sign} ${body('moon').deg}°${body('moon').min}′`).toBe('Cancer 13°28′'); expect(body('moon').house).toBe(3);
    near(orb('Sun', 'Moon', 'Sextile'), 1.0); near(orb('Moon', 'Ascendant', 'Sextile'), 0.7);
    near(orb('Moon', 'Venus', 'Square'), 0.5); near(orb('Moon', 'Jupiter', 'Square'), 1.2);
  });
  it('Mercury trine Neptune within 0.05°; Neptune in Capricorn in the 9th', () => {
    expect(orb('Mercury', 'Neptune', 'Trine')).toBeLessThan(0.05); expect(body('neptune').sign).toBe('Capricorn'); expect(body('neptune').house).toBe(9);
  });
  it('Mars conjunct Chiron 0.3° in Gemini in the 2nd; Saturn in Sagittarius opposite Mars 1.9°', () => {
    near(orb('Mars', 'Chiron', 'Conjunction'), 0.3); expect([body('mars').sign, body('mars').house, body('chiron').sign]).toEqual(['Gemini', 2, 'Gemini']);
    expect(body('saturn').sign).toBe('Sagittarius'); near(orb('Mars', 'Saturn', 'Opposition'), 1.9);
  });
  it('North Node Aries 10° in the 12th, 3° from Venus', () => {
    expect([body('northNode').sign, body('northNode').deg, body('northNode').house]).toEqual(['Aries', 10, 12]); near(orb('Venus', 'North Node (mean)', 'Conjunction'), 3.0);
  });
  it('scripted pages: Saturn and Uranus in the 8th, Pluto Scorpio 8°28′ in the 6th opposite Mercury, MC Capricorn 26°43′, Fortune by the Moon', () => {
    expect([body('saturn').house, body('uranus').house, body('uranus').sign]).toEqual([8, 8, 'Sagittarius']);
    expect([body('pluto').sign, body('pluto').deg, body('pluto').min, body('pluto').house]).toEqual(['Scorpio', 8, 28, 6]);
    near(orb('Pluto', 'Ascendant', 'Opposition'), 4.3); near(orb('Mercury', 'Pluto', 'Opposition'), 0.7);
    near(c.mc!, 270 + 26 + 43 / 60, 0.02);
    expect([body('fortune').sign, body('fortune').deg, body('fortune').min, body('fortune').house]).toEqual(['Cancer', 13, 46, 3]);
    expect(Math.abs(body('fortune').lon - body('moon').lon)).toBeLessThan(0.34);
  });
  it('is not the retired founder-derived issue', () => {
    expect(text).not.toMatch(/Elias|Mill Valley|Williamsville/);
  });
});
