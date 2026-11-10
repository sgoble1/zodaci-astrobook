import { describe, expect, it } from 'vitest';
import { computeChart, type ChartInput } from '@/lib/astro';
import { birthFactRows, birthLineOf, bookInterior, toLeaves, type BookFace } from './bookLeaves';
import { LEAD_COVER } from '@/content/coverSamples';
import { SAMPLE_EDITION } from '@/content/sampleEdition';
import { sampleBookLeaves, sampleComicLeaves } from '@/content/sampleBookLeaves';

const chart = computeChart({ ...LEAD_COVER.birth, placeSource: 'geocoded', houseSystem: 'placidus' } as ChartInput);
const untimed = computeChart({ ...LEAD_COVER.birth, time: null, placeSource: 'geocoded', houseSystem: 'placidus' } as ChartInput);
const kinds = (fs: BookFace[]) => fs.map(f => f.kind);

describe('openable AstroBook pages', () => {
  it('prints the birth line exactly as the sample cover does', () => {
    expect(birthLineOf(LEAD_COVER.birth.date, LEAD_COVER.birth.time, LEAD_COVER.birth.placeLabel)).toBe(LEAD_COVER.printed.born);
    expect(birthLineOf('1990-12-01', '15:05', 'Leeds')).toBe('Born 1 December 1990 · 3:05 p.m. · Leeds');
    expect(birthLineOf('1990-12-01', null, 'Leeds')).toBe('Born 1 December 1990 · time unknown · Leeds');
  });
  it('birth facts match the sample edition’s printed Ascendant and chart ruler', () => {
    const rows = Object.fromEntries(birthFactRows(chart, true));
    expect(rows.Ascendant).toBe('Taurus 12°47′');
    expect(rows['Chart ruler']).toBe('Venus in Aries 13°00′ · 12th house');
    expect(SAMPLE_EDITION.pages[0].facts.find(f => f.label === 'Ascendant')!.value).toBe(rows.Ascendant);
  });
  it('an unknown birth time drops angles, houses and the house-cusp page instead of guessing', () => {
    const rows = birthFactRows(untimed, false);
    expect(rows.map(r => r[0])).toEqual(['Sun', 'Moon']);
    expect(rows.some(r => r[1].includes('house'))).toBe(false);
    const faces = bookInterior({ name: 'X', birthLine: 'b', chart: untimed, timed: false, edition: 'e', owner: 'member' });
    expect(faces.some(f => f.kind === 'facts' && f.heading === 'House cusps')).toBe(false);
  });
  it('every illustrated plate sits on a left page facing its own text', () => {
    const leaves = sampleBookLeaves();
    const plates = leaves.flatMap((l, i) => (l.back.kind === 'plate' ? [i] : []));
    expect(plates).toHaveLength(SAMPLE_EDITION.pages.length);
    for (const i of plates) {
      const plate = leaves[i].back, text = leaves[i + 1].front;
      expect(text.kind).toBe('text');
      if (plate.kind === 'plate' && text.kind === 'text') expect(plate.caption).toContain(text.placement);
    }
    expect(leaves.some(l => l.front.kind === 'plate')).toBe(false);
  });
  it('the cover opens the book and the back cover closes it, for the book and the comic', () => {
    for (const leaves of [sampleBookLeaves(), sampleComicLeaves()]) {
      expect(leaves[0].front.kind).toBe('cover');
      expect(leaves[leaves.length - 1].back.kind).toBe('back');
      expect(kinds(leaves.flatMap(l => [l.front, l.back])).filter(k => k === 'cover' || k === 'back')).toEqual(['cover', 'back']);
    }
    const odd = toLeaves({ kind: 'blank' }, [{ kind: 'blank' }], { kind: 'back', lines: [] });
    expect(odd).toHaveLength(2); expect(odd[1].back.kind).toBe('back');
  });
  it('the comic digest binds every drawn page in order', () => {
    const pages = sampleComicLeaves().flatMap(l => [l.front, l.back]).filter(f => f.kind === 'comic');
    expect(pages.map(p => (p.kind === 'comic' ? p.page : 0))).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
