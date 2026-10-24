import { describe, expect, it } from 'vitest';
import { computeChart } from '@/lib/astro';
import { buildOpeningLetter, FORBIDDEN_PHRASES, LETTER_MIN_WORDS, letterText } from '@/lib/openingLetter';
import { birthFingerprint } from '@/lib/birthFingerprint';

const april = computeChart({ date: '1990-09-06', time: '15:38', lat: 42.86896, lon: -76.97774, tz: 'America/New_York', houseSystem: 'placidus', placeLabel: '', placeSource: 'geocoded' });
const noTime = computeChart({ date: '2000-02-29', time: null, lat: 53.8, lon: -1.55, tz: 'Europe/London', houseSystem: 'placidus', placeLabel: '', placeSource: 'geocoded' });

describe('Opening Letter (§3.4)', () => {
  const letter = buildOpeningLetter({ name: 'April Example', placeLabel: 'Geneva, New York, United States', chart: april, timeKnown: true });
  const text = letterText(letter);
  it('is at least 400 words', () => expect(letter.words).toBeGreaterThanOrEqual(LETTER_MIN_WORDS));
  it('opens with the first name only', () => expect(letter.salutation).toBe('Dear April,'));
  it('names the birth moment and place', () => {
    expect(text).toContain('3:38 in the afternoon on Thursday, September 6, 1990');
    expect(text).toContain('Geneva, New York');
  });
  it('leads with the top-ranked patterns, at most three', () => {
    expect(letter.patterns.length).toBeLessThanOrEqual(3);
    expect(letter.patterns.length).toBeGreaterThan(0);
    for (const p of letter.patterns) expect(text).toContain(p.detail.trim().slice(0, 30));
  });
  it('gives one shadow and its breakthrough', () => {
    expect(letter.shadowItem).not.toBeNull();
    expect(text.toLowerCase()).toContain(letter.shadowItem!.breakthrough.toLowerCase());
  });
  it('closes with one forward-looking line', () => expect(letter.closing.startsWith('April,')).toBe(true));
  it('uses none of the banned phrases', () => expect(FORBIDDEN_PHRASES.filter(f => text.toLowerCase().includes(f))).toEqual([]));
  it('leaves the rising sign out when the birth time is unknown, and still reaches 400 words', () => {
    const l = buildOpeningLetter({ name: 'Jo', placeLabel: 'Leeds, UK', chart: noTime, timeKnown: false });
    expect(letterText(l)).not.toMatch(/rising over/);
    expect(l.words).toBeGreaterThanOrEqual(LETTER_MIN_WORDS);
  });
});

describe('birth fingerprint (§2.8)', () => {
  const base = { date: '1990-09-06', time: '15:38', lat: 42.86896, lon: -76.97774, tz: 'America/New_York', houseSystem: 'placidus' };
  it('ignores tiny coordinate noise below four decimals', () => expect(birthFingerprint({ ...base, lat: 42.868961 })).toBe(birthFingerprint(base)));
  it('changes when the birth time changes', () => expect(birthFingerprint({ ...base, time: '15:39' })).not.toBe(birthFingerprint(base)));
  it('changes when the house system changes', () => expect(birthFingerprint({ ...base, houseSystem: 'whole' })).not.toBe(birthFingerprint(base)));
});
