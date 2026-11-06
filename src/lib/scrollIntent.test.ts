import { describe, expect, it } from 'vitest';
import { scrollIntent } from './scrollIntent';

const at = (pathname: string, search = '', hash = '') => ({ pathname, search, hash });

describe('where a page opens after a click', () => {
  it('opens a different page at the top', () => {
    expect(scrollIntent(at('/store'), at('/about'), 'PUSH')).toEqual({ kind: 'top' });
  });
  it('opens a different page at the linked section', () => {
    expect(scrollIntent(at('/'), at('/learn', '', '#forecasts'), 'PUSH')).toEqual({ kind: 'section', id: 'forecasts', smooth: false });
  });
  it('keeps the position when only shop filters change', () => {
    expect(scrollIntent(at('/store'), at('/store', '?collection=atomic'), 'REPLACE')).toEqual({ kind: 'none' });
  });
  it('glides to a section on the same page', () => {
    expect(scrollIntent(at('/astrobook'), at('/astrobook', '', '#inside'), 'PUSH')).toEqual({ kind: 'section', id: 'inside', smooth: true });
  });
  it('returns to the previous position on Back', () => {
    expect(scrollIntent(at('/about'), at('/store'), 'POP')).toEqual({ kind: 'restore' });
  });
  it('honours a section in the first address someone opens', () => {
    expect(scrollIntent(null, at('/pricing', '', '#faq'), 'POP')).toEqual({ kind: 'section', id: 'faq', smooth: false });
    expect(scrollIntent(null, at('/pricing'), 'POP')).toEqual({ kind: 'none' });
  });
});
