import { describe, expect, it } from 'vitest';
import { originalAprilView, chaptersForTheme, angularDifference } from './founderEdition';
import { computeChart, fmtLon } from './astro';

describe('founder account isolation', () => {
  it('keeps both Shane accounts on their own edition by default', () => {
    expect(originalAprilView('shanegoble@gmail.com', null)).toBe(false);
    expect(originalAprilView('shanealecompte@gmail.com', null)).toBe(false);
    expect(originalAprilView('babybluepuppet@gmail.com', null)).toBe(true);
    expect(originalAprilView('shanegoble@gmail.com', 'april')).toBe(true);
  });
  it('maps only matching source entries to a theme', () => {
    const entries = ['Venus and Relationships', 'Mercury and Communication'].map((title, i) => ({ id: String(i), title, label: '', part: '', sections: [], excerpt: '', words: 100 }));
    expect(chaptersForTheme(entries, 'love').map(e => e.id)).toEqual(['0']);
  });
});
describe('Shane natal cross-check against independent Swiss ephemeris', () => {
  const chart = computeChart({ date: '1993-03-25', time: '13:55', lat: 42.96395, lon: -78.73781, tz: 'America/New_York', placeLabel: 'Williamsville', placeSource: 'geocoded', houseSystem: 'placidus' });
  it('uses the correct historical UTC time', () => { expect(chart.utc.toISOString()).toBe('1993-03-25T18:55:00.000Z'); });
  it('shows Taurus Moon, not the uploaded Capricorn claim', () => {
    const moon = chart.bodies.find(b => b.key === 'moon');
    expect(moon?.sign).toBe('Taurus');
    expect(angularDifference(moon?.lon ?? 0, 32.48386)).toBeLessThan(0.03);
  });
  it('shows retrograde Aries Venus, not the uploaded Pisces claim', () => {
    const venus = chart.bodies.find(b => b.key === 'venus');
    expect(venus?.sign).toBe('Aries'); expect(venus?.retro).toBe(true);
    expect(angularDifference(venus?.lon ?? 0, 15.8845)).toBeLessThan(0.03);
  });
  it('shows direct Pisces Mercury', () => {
    const mercury = chart.bodies.find(b => b.key === 'mercury');
    expect(mercury?.sign).toBe('Pisces'); expect(mercury?.retro).toBe(false);
    expect(angularDifference(mercury?.lon ?? 0, 340.77645)).toBeLessThan(0.03);
  });
  it('cross-checks the Leo Ascendant', () => {
    expect(fmtLon(chart.asc ?? 0).sign).toBe('Leo');
    expect(angularDifference(chart.asc ?? 0, 132.417037)).toBeLessThan(0.01);
  });
});