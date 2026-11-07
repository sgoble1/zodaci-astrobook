import { describe, expect, it } from 'vitest';
import { clarifyFounderGroups, FLYING_STARS_MENU } from './founderEdition';
import type { NavGroup } from '@/content/navigation';

const routes = (gs: { items: { to: string }[]; submenus?: { items: { to: string }[] }[] }[]) =>
  new Set(gs.flatMap(g => [...g.items, ...(g.submenus ?? []).flatMap(s => s.items)]).map(i => i.to));

describe('clarifyFounderGroups', () => {
  const april: NavGroup[] = [
    { title: 'Begin', items: [{ to: '/', label: 'Home' }, { to: '/retrogood', label: 'RetroGOOD' }] },
    { title: 'Other Systems & Feng Shui', items: [{ to: '/feng-shui', label: 'Feng Shui' }, { to: '/feng-shui/flying-stars', label: 'Flying Stars' }, { to: '/masterbook/bagua-wheel', label: 'Masterbook Bagua Wheel' }],
      submenus: [{ label: 'More feng shui', items: [{ to: '/feng-shui/flying-stars?year=2027', label: 'Stars 2027' }, { to: '/feng-shui/bagua', label: 'Bagua & Home' }] }] },
  ];
  const out = clarifyFounderGroups(april);

  it('never drops a page from the menu', () => {
    const before = routes(april);
    const after = routes(out);
    before.forEach(r => expect(after.has(r)).toBe(true));
  });
  it('renames the Bagua Wheel entry to "Interactive Bagua Map" and explains it', () => {
    const fs = out[1].items.find(i => i.to === '/masterbook/bagua-wheel');
    expect(fs?.label).toBe('Interactive Bagua Map');
    expect(fs?.hint).toBe('Interactive feng shui map of your eight directions');
  });
  it('explains RetroGOOD as "What stands out in your chart" without renaming it', () => {
    const r = out[0].items.find(i => i.to === '/retrogood');
    expect(r?.label).toBe('RetroGOOD');
    expect(r?.hint).toBe('What stands out in your chart');
  });
  it('gathers every Flying Stars link into one submenu in its own section', () => {
    expect(out[1].items.some(i => i.to.startsWith('/feng-shui/flying-stars'))).toBe(false);
    const sub = out[1].submenus?.find(s => s.label === 'Flying Stars');
    expect(sub?.items.map(i => i.to)).toEqual([...FLYING_STARS_MENU.map(i => i.to), '/feng-shui/flying-stars?year=2027']);
    expect(out[0].submenus).toBeUndefined();
  });
});
