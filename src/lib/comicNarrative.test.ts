import { describe, expect, it } from 'vitest';
import { computeChart } from '@/lib/astro';
import { buildComicPreview, previewName } from '@/lib/comicNarrative';
import { comicIssueLeaves, sampleComicLeaves } from '@/content/sampleBookLeaves';
import { faceText } from '@/lib/bookLeaves';

const chart = computeChart({ date: '1993-03-25', time: '13:55', lat: 42.96395, lon: -78.73781, tz: 'America/New_York', placeLabel: 'Williamsville, New York', placeSource: 'geocoded', houseSystem: 'placidus' });
const options = { reader: 'Shane', month: new Date(Date.UTC(2026, 11, 1)), issueNumber: 1 };
const issue = buildComicPreview(chart, options);
describe('complete chart-driven comic preview', () => {
  it('uses Julian Mercer only as the private story name, without changing the 1:55 birth facts', () => {
    expect(issue.reader).toBe('Julian Mercer');
    expect(previewName('April')).toBe('April');
    expect(chart.input.time).toBe('13:55');
    expect(chart.utc.toISOString()).toBe('1993-03-25T18:55:00.000Z');
  });
  it('composes 24 faces including covers and retains every panel in the reader', () => {
    expect(issue.pages.map(p => p.n)).toEqual(Array.from({ length: 24 }, (_, i) => i + 1));
    const faces = comicIssueLeaves(issue).flatMap(l => [l.front, l.back]);
    expect(faces).toHaveLength(24);
    const dialogue = issue.pages[5].panels[1].balloons?.[0].text;
    expect(dialogue).toBeTruthy();
    expect(faceText(faces[5])?.lines.some(l => l.includes(dialogue ?? 'not a line'))).toBe(true);
  });
  it('gives every planet a concrete placement-led role', () => {
    expect(issue.factors.filter(f => f.kind === 'placement').map(f => f.key)).toEqual(['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']);
    expect(issue.factors.find(f => f.key === 'sun')).toMatchObject({ sign: 'Aries', house: 9 });
    expect(issue.factors.find(f => f.key === 'moon')).toMatchObject({ sign: 'Taurus', house: 10 });
    expect(issue.factors.find(f => f.key === 'mars')).toMatchObject({ sign: 'Cancer', house: 12 });
  });
  it('actual retrograde flags change reconsideration actions, not just labels', () => {
    expect(issue.factors.find(f => f.key === 'venus')?.retro).toBe(true);
    expect(issue.factors.find(f => f.key === 'jupiter')?.retro).toBe(true);
    expect(issue.factors.find(f => f.key === 'pluto')?.retro).toBe(true);
    const altered = { ...chart, bodies: chart.bodies.map(b => b.key === 'venus' ? { ...b, retro: false } : b) };
    const changed = buildComicPreview(altered, options);
    expect(changed.pages[5].panels[1].balloons).not.toEqual(issue.pages[5].panels[1].balloons);
  });
  it('uses the tightest measured planet contacts rather than invented pairings', () => {
    const names = new Set(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']);
    const tightest = chart.aspects.filter(a => names.has(a.a) && names.has(a.b)).sort((a, b) => a.orb - b.orb)[0];
    expect(issue.factors.find(f => f.kind === 'aspect')).toMatchObject({ key: `${tightest.a}/${tightest.b}/${tightest.type}`, orb: tightest.orb });
  });
  it('omits all Moon-sign and house claims when the time is unknown', () => {
    const unknown = buildComicPreview(computeChart({ ...chart.input, time: null }), options);
    expect(unknown.signs.moon).toBeNull();
    expect(unknown.factors.some(f => f.key === 'moon' || f.house != null)).toBe(false);
    expect(unknown.signs.rising).toBeNull();
  });
  it('keeps public faces separate from the private Shane chart and identity', () => {
    const faces = sampleComicLeaves().flatMap(l => [l.front, l.back]);
    expect(faces).toHaveLength(24);
    expect(JSON.stringify(faces)).not.toMatch(/Shane|Julian Mercer|Williamsville|1993-03-25/);
  });
});