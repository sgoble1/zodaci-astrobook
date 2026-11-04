import { describe, expect, it } from 'vitest';
import { universalFounderMenu } from './founderEdition';

type G = { title: string; items: { to: string; label: string }[]; submenus?: { label: string; items: { to: string; label: string }[] }[] };
const g = (title: string, ...to: string[]): G => ({ title, items: to.map(t => ({ to: t, label: t })) });
const base = {
  observatory: g('Observatory', '/dashboard', '/my-chart', '/my-readings'),
  explore: g('Explore', '/explore', '/timeline'),
  shared: g('Shared Spaces', '/shared'),
  relationships: g('Relationships', '/relationships'),
  official: g('Official AstroBook', '/official-astrobook'),
  media: g('Together & Media', '/podcasts', '/store'),
};

describe('universalFounderMenu', () => {
  it('puts every edition in the same section order', () => {
    const april = universalFounderMenu({ ...base, edition: [g('The Natal Chart', '/birth-chart'), g('Timing & Cycles', '/transits')] });
    const shane = universalFounderMenu({ ...base, edition: [g('My Edition', '/shane')], admin: g('Admin', '/admin') });
    expect(april.map(x => x.title)).toEqual(['Observatory', 'The Natal Chart', 'Timing & Cycles', 'Explore', 'Shared Spaces', 'Relationships', 'Official AstroBook', 'Together & Media']);
    expect(shane.map(x => x.title)).toEqual(['Observatory', 'My Edition', 'Explore', 'Shared Spaces', 'Relationships', 'Official AstroBook', 'Together & Media', 'Admin']);
  });

  it('keeps every edition link and chapter submenu untouched', () => {
    const chapters: G = { title: 'Masterbook by Topic', items: [], submenus: [{ label: 'Love · 2', items: [{ to: '/shane/sm-1', label: 'a' }, { to: '/shane/sm-2', label: 'b' }] }] };
    const own = g('Begin', '/', '/my-chart', '/timeline', '/podcasts');
    const out = universalFounderMenu({ ...base, edition: [own, chapters] });
    expect(out.find(x => x.title === 'Begin')).toEqual(own);
    expect(out.find(x => x.title === 'Masterbook by Topic')).toEqual(chapters);
  });

  it('never repeats a link the edition already lists', () => {
    const out = universalFounderMenu({ ...base, edition: [g('Begin', '/my-chart', '/timeline', '/podcasts')] });
    const all = out.flatMap(x => x.items.map(i => i.to));
    expect(all.filter(t => t === '/my-chart')).toHaveLength(1);
    expect(out.find(x => x.title === 'Observatory')!.items.map(i => i.to)).toEqual(['/dashboard', '/my-readings']);
    expect(out.find(x => x.title === 'Explore')!.items.map(i => i.to)).toEqual(['/explore']);
  });

  it('hides a frame section the edition fully covers', () => {
    const out = universalFounderMenu({ ...base, edition: [g('Library', '/podcasts', '/store')] });
    expect(out.map(x => x.title)).not.toContain('Together & Media');
  });
});
