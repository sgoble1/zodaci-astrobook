import { describe, it, expect } from 'vitest';
import { compassFor, compassSegments, withOutcomes } from './readersCompass';

describe("Reader's Compass", () => {
  it('only explains terms the book uses', () => {
    const t = compassFor('Your Sun squares Saturn with a 2° orb.').map(x => x.term);
    expect(t).toEqual(expect.arrayContaining(['Square', 'Orb']));
    expect(t).not.toContain('Midpoint');
  });
  it('adds three plain outcomes to a calculated chapter', () => {
    expect(withOutcomes('Your Big Three', 'body').match(/^- /gm)?.length).toBe(3);
  });
  it('leaves chapters without outcomes untouched', () => expect(withOutcomes('Love & Attraction', 'x')).toBe('x'));
  it('preserves printed text and binds compound glossary terms to one definition', () => {
    const text = 'North Node trines Chiron. Rising sign, house cusp, ruler, retrograde, dignity and profection.';
    const segments = compassSegments(text);
    expect(segments.map(s => s.text).join('')).toBe(text);
    expect(segments.find(s => s.text === 'North Node')?.term).toBe('North Node');
    expect(segments.filter(s => s.term).every(s => !!s.plain)).toBe(true);
    expect(segments.filter(s => s.term).map(s => s.term)).toContain('Profection');
    expect(compassSegments('Household signatory')).toEqual([{ text: 'Household signatory' }]);
  });
});
