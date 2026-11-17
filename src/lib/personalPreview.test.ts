import { describe, expect, it } from 'vitest';
import { computeChart } from '@/lib/astro';
import { bookPreview, PREVIEW_PAGES } from '@/lib/personalPreview';
import { sampleBookLeaves } from '@/content/sampleBookLeaves';

const input = { date: '1993-03-25', time: '13:55', lat: 42.96395, lon: -78.73781, tz: 'America/New_York', placeLabel: 'Williamsville, New York', placeSource: 'geocoded', houseSystem: 'placidus' } as const;
const chart = computeChart(input);
const make = (c = chart) => bookPreview({ name: 'Shane', birthLine: 'Born 25 March 1993 · 1:55 p.m. · Williamsville, New York', chart: c, artFor: () => 'art.jpg' });

describe('expanded AstroBook preview', () => {
  it('has exactly 25 numbered pages without changing the ten-page comic preview', () => {
    expect(make().faces.flatMap(f => 'page' in f && f.page ? [f.page] : [])).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
    expect(PREVIEW_PAGES).toBe(10);
  });
  it('retains the confirmed 1:55 PM EST moment and measured chart facts', () => {
    expect(chart.utc.toISOString()).toBe('1993-03-25T18:55:00.000Z');
    expect(chart.asc).toBeCloseTo(132.417, 1);
    expect(chart.mc).toBeCloseTo(30.361, 1);
    const faces = make().faces;
    const facts = faces.find(f => f.kind === 'facts' && f.heading === 'Birth facts');
    expect(facts?.kind === 'facts' ? facts.rows.find(r => r[0] === 'Midheaven')?.[1] : null).toBe('Taurus 0°22′');
    expect(make().cover.birthLine).toContain('1:55 p.m.');
  });
  it('includes material from all six volumes', () => {
    const faces = make().faces;
    for (const n of ['I', 'II', 'III', 'IV', 'V', 'VI']) expect(faces.some(f => 'eyebrow' in f && f.eyebrow.startsWith(`Volume ${n} ·`))).toBe(true);
  });
  it('keeps public sample pages fictional and separate from Shane', () => {
    const faces = sampleBookLeaves().flatMap(l => [l.front, l.back]);
    expect(JSON.stringify(faces)).not.toContain('Shane');
    expect(faces.flatMap(f => 'page' in f && f.page ? [f.page] : [])).toHaveLength(25);
  });
  it('does not invent houses or angles without a birth time', () => {
    const unknown = make(computeChart({ ...input, time: null }));
    expect(unknown.cover.signs).not.toContain('↑');
    expect(unknown.faces.some(f => f.kind === 'facts' && f.heading === 'House cusps')).toBe(false);
    expect(unknown.faces.flatMap(f => f.kind === 'facts' ? f.rows.map(r => r[0]) : [])).not.toContain('Ascendant');
  });
});