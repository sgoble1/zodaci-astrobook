import { describe, expect, it } from 'vitest';
import { founderPlace } from './founderEdition';

const groups = [{ title: 'Chart', items: [{ to: '/birth-chart', label: 'Birth Chart' }, { to: '/planets', label: 'Planets' }, { to: '/houses', label: 'Houses' }, { to: '/aspects', label: 'Aspects' }] }];
describe('founder wayfinding', () => {
  it('names the section and the next three pages, wrapping round', () => {
    const p = founderPlace(groups, '/houses');
    expect(p?.section).toBe('Chart');
    expect(p?.next.map(n => n.to)).toEqual(['/aspects', '/birth-chart', '/planets']);
  });
  it('returns nothing for pages outside her menu', () => expect(founderPlace(groups, '/admin')).toBeNull());
});
