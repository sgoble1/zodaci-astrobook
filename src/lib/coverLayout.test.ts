import { describe, expect, it } from 'vitest';
import { COVER_SUBTITLE, COVER_WORDMARK, artPpi, clampCrop, coverName, coverType, placeArt } from './coverLayout';

// Fixed-width stand-in for a font: every character is 0.55 em wide.
const mono = (t: string, size: number) => t.length * size * 0.55;
const W = 1800, H = 2700, PPI = 300; // 6 × 9 in at print resolution

describe('AstroBook cover layout', () => {
  it('uses the reader’s name as the title, with the subtitle and wordmark the owner asked for', () => {
    const t = coverType(W, H, PPI, 'April', mono, mono);
    expect(t.title.lines).toEqual(['April']);
    expect(COVER_SUBTITLE).toBe('Your exact placement in print');
    expect(t.subtitle.lines).toEqual(['YOUR EXACT PLACEMENT IN PRINT']);
    expect(t.wordmark.lines).toEqual([COVER_WORDMARK]);
    expect(COVER_WORDMARK).toBe('AstroBook');
  });
  it('places the subtitle beneath the name and AstroBook at the bottom right inside the half-inch safe zone', () => {
    const t = coverType(W, H, PPI, 'April', mono, mono);
    expect(t.subtitle.y[0]).toBeGreaterThan(t.title.y[t.title.y.length - 1]);
    expect(t.subtitle.size).toBeLessThan(t.title.size);
    expect(t.wordmark.align).toBe('right');
    expect(t.wordmark.x).toBe(W - 150);
    expect(t.wordmark.y[0]).toBe(H - 150);
  });
  it('keeps long names inside the safe width, splitting onto two lines at a space', () => {
    const t = coverType(W, H, PPI, 'Alexandria Montgomery-Whitfield', mono, mono);
    expect(t.title.lines.length).toBe(2);
    for (const l of t.title.lines) expect(mono(l, t.title.size)).toBeLessThanOrEqual(W - 300 + 0.5);
  });
  it('shows a placeholder until a name is entered', () => expect(coverName('  ')).toBe('Your Name'));
  it('prints the reader’s birth line under the name when they choose it', () => {
    const line = coverBirthLine({ date: '1987-05-03', time: '06:42', placeLabel: 'Asheville, North Carolina' });
    expect(line).toBe('Born 3 May 1987 · 6:42 a.m. · Asheville, North Carolina');
    const t = coverType(W, H, PPI, 'Rosalind Vance', mono, mono, line);
    expect(t.subtitle.lines.join(' · ')).toBe(line.toUpperCase());
    for (const l of t.subtitle.lines) expect(mono(l, t.subtitle.size)).toBeLessThanOrEqual(W - 300 + 0.5);
  });
  it('leaves out an unknown birth time instead of guessing, and shortens long place labels', () => {
    expect(coverBirthLine({ date: '1984-06-02', time: null, placeLabel: 'Savannah, Chatham County, Georgia, United States' })).toBe('Born 2 June 1984 · Savannah, Georgia');
    expect(coverBirthLine({ date: '1991-06-09', time: '23:18', placeLabel: '' })).toBe('Born 9 June 1991 · 11:18 p.m.');
    expect(coverBirthLine({ date: '1991-06-09', time: '00:05' })).toBe('Born 9 June 1991 · 12:05 a.m.');
    expect(coverBirthLine(null)).toBe('');
  });
  it('always fills the trim, whatever the zoom or position', () => {
    for (const crop of [{ zoom: 1, x: 0, y: 0 }, { zoom: 2.5, x: 1, y: -1 }, { zoom: 9, x: 5, y: 5 }]) {
      const p = placeArt(1000, 1000, 600, 900, crop);
      expect(p.x).toBeLessThanOrEqual(0.001); expect(p.y).toBeLessThanOrEqual(0.001);
      expect(p.x + p.width).toBeGreaterThanOrEqual(599.999); expect(p.y + p.height).toBeGreaterThanOrEqual(899.999);
    }
    expect(clampCrop({ zoom: 9, x: 5, y: -5 })).toEqual({ zoom: 4, x: 1, y: -1 });
  });
  it('reports print sharpness from the image size and zoom', () => {
    expect(artPpi(1800, 2700, 6, 9, 1)).toBe(300);
    expect(artPpi(1800, 2700, 6, 9, 2)).toBe(150);
  });
});
