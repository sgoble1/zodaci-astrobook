import { describe, expect, it } from 'vitest';
import { founderPlace, onlyInFullEdition } from './founderEdition';

const groups = [{ title: 'Chart', items: [{ to: '/birth-chart', label: 'Birth Chart' }, { to: '/planets', label: 'Planets' }, { to: '/houses', label: 'Houses' }, { to: '/aspects', label: 'Aspects' }] }];
describe('founder wayfinding', () => {
  it('names the section and the next three pages, wrapping round', () => {
    const p = founderPlace(groups, '/houses');
    expect(p?.section).toBe('Chart');
    expect(p?.next.map(n => n.to)).toEqual(['/aspects', '/birth-chart', '/planets']);
  });
  it('returns nothing for pages outside her menu', () => expect(founderPlace(groups, '/admin')).toBeNull());
});

describe('classic view notice', () => {
  const groups = [{ title: 'Story', items: [{ to: '/timeline', label: 'Timeline' }, { to: '/my-chart', label: 'Chart' }] }];
  it('flags an April-only page the member menu does not list', () => expect(onlyInFullEdition(groups, '/timeline', false)).toBe(true));
  it('stays quiet on pages the member menu also has', () => expect(onlyInFullEdition(groups, '/my-chart', true)).toBe(false));
  it('stays quiet on pages outside her menu', () => expect(onlyInFullEdition(groups, '/pricing', false)).toBe(false));
});
