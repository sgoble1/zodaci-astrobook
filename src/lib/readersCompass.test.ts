import { describe, it, expect } from 'vitest';
import { compassFor, withOutcomes } from './readersCompass';

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
});
