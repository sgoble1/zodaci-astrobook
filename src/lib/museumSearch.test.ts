import { describe, expect, it } from 'vitest';
import { searchExhibits } from './museum';
const ex = [{ id: 'a', title: 'Moon', glyph: '', sign: 'Cancer', element: 'Water', plaque: 'home', facts: ['3rd house'] }, { id: 'b', title: 'Sun', glyph: '', sign: 'Taurus', element: 'Earth', plaque: 'x', facts: [] }] as never;
describe('searchExhibits', () => {
  it('matches sign case-insensitively', () => { expect(searchExhibits(ex, 'cancer').map(e => e.id)).toEqual(['a']); });
  it('matches facts', () => { expect(searchExhibits(ex, '3rd').map(e => e.id)).toEqual(['a']); });
  it('empty query returns all', () => { expect(searchExhibits(ex, ' ')).toHaveLength(2); });
});
