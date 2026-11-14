import { describe, it, expect } from 'vitest';
import { computeChart } from '@/lib/astro';
import { buildBookTeaser } from '@/lib/bookTeaser';

const input = { date: '1993-03-25', time: '13:55', lat: 42.9634, lon: -78.7378, tz: 'America/New_York', placeLabel: 'Williamsville', placeSource: 'geocoded', houseSystem: 'placidus' } as const;

describe('AstroBook three-page teaser', () => {
  it('builds Sun, Moon and Rising pages from the calculated chart', () => {
    const pages = buildBookTeaser(computeChart(input as never), true);
    expect(pages.map(p => p.key)).toEqual(['sun', 'moon', 'rising']);
    expect(pages[0].title).toBe('Sun in Aries');
    expect(pages[2].position).not.toBeNull();
  });
  it('never claims a Rising sign without a birth time', () => {
    const pages = buildBookTeaser(computeChart({ ...input, time: null } as never), false);
    expect(pages[2].position).toBeNull();
    expect(pages[1].note).toMatch(/unknown/);
  });
});
