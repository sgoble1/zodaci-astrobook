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

describe('founder wayfinding across the full sidebar', () => {
  const full = [
    { title: 'Begin', items: [{ to: '/', label: 'Home' }] },
    { title: 'Masterbook', items: [{ to: '/masterbook', label: 'Masterbook' }, { to: '/sources', label: 'Sources' }] },
    { title: 'Themes', items: [{ to: '/my-readings', label: 'Themes' }], submenus: [{ label: 'Topics', items: [{ to: '/my-readings/topic/love', label: 'Love' }] }], footer: [{ to: '/create', label: '+ Create' }] },
    { title: 'Relationships', items: [{ to: '/relationships', label: 'Relationships' }, { to: '/relationships/abc', label: '↳ Shane' }] },
  ];
  it('finds submenu pages', () => expect(founderPlace(full, '/my-readings/topic/love')?.section).toBe('Themes'));
  it('finds injected relationship pages', () => expect(founderPlace(full, '/relationships/abc')?.next.map(n => n.to)).toEqual(['/relationships']));
  it('resolves detail routes to their menu parent', () => {
    const p = founderPlace(full, '/masterbook/chapter-3');
    expect(p?.parent?.to).toBe('/masterbook');
    expect(p?.next[0].to).toBe('/masterbook');
  });
  it('never treats home as a parent of every page', () => expect(founderPlace(full, '/admin/x')).toBeNull());
  it('sends a single-page section on to the next section', () => expect(founderPlace(full, '/')?.next.map(n => n.to)).toEqual(['/masterbook']));
  it('keeps footer actions out of reading suggestions', () => expect(founderPlace(full, '/my-readings')?.next.map(n => n.to)).toEqual(['/my-readings/topic/love']));
});
