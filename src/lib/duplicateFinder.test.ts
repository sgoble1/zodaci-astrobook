import { describe, it, expect } from 'vitest';
import { findRepeats } from './duplicateFinder';

const intro = 'The Sun represents your core identity and the way you shine in the world.';
describe('duplicate finder', () => {
  it('counts a sentence repeated across chapters', () => {
    const r = findRepeats([{ id: 'a', text: `${intro} Unique words about Mars and drive today here.` }, { id: 'b', text: `**${intro}**` }, { id: 'c', text: intro }]);
    expect(r[0].count).toBe(3); expect(r[0].chapters).toEqual(['a', 'b', 'c']);
  });
  it('ignores short sentences and single-chapter text', () => expect(findRepeats([{ id: 'a', text: `Short one. ${intro} ${intro}` }])).toEqual([]));
  it('returns only a short fingerprint, never the full sentence', () => {
    const r = findRepeats([{ id: 'a', text: intro }, { id: 'b', text: intro }]);
    expect(r[0].fingerprint.split(' ').length).toBeLessThanOrEqual(6);
  });
});
