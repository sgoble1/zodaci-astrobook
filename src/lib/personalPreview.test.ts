import { describe, expect, it } from 'vitest';
import { computeChart } from '@/lib/astro';
import { bookPreview, chapterForTopic, plainParagraphs, prosePage, PREVIEW_PAGES, type BookPreviewInput } from '@/lib/personalPreview';
import { sampleBookLeaves } from '@/content/sampleBookLeaves';

const input = { date: '1993-03-25', time: '13:55', lat: 42.96395, lon: -78.73781, tz: 'America/New_York', placeLabel: 'Williamsville, New York', placeSource: 'geocoded', houseSystem: 'placidus' } as const;
const chart = computeChart(input);
const untimed = computeChart({ ...input, time: null });
const make = (c = chart, tone?: BookPreviewInput['tone']) => bookPreview({ name: 'Shane', birthLine: `Born 25 March 1993 · ${c.input.time ? '1:55 p.m.' : 'time unknown'} · Williamsville, New York`, chart: c, tone, artFor: () => 'art.jpg' });

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
    const unknown = make(untimed);
    expect(unknown.cover.signs).not.toContain('↑');
    expect(unknown.faces.some(f => f.kind === 'facts' && f.heading === 'House cusps')).toBe(false);
    expect(unknown.faces.flatMap(f => f.kind === 'facts' ? f.rows.map(r => r[0]) : [])).not.toContain('Ascendant');
  });
  it.each(['timed', 'untimed'] as const)('maintains exactly pages 1–25 for %s charts', mode => {
    expect(make(mode === 'timed' ? chart : untimed).faces.flatMap(f => 'page' in f && f.page ? [f.page] : [])).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
  });
  it('places Plate I on page 7', () => {
    for (const c of [chart, untimed]) expect(make(c).faces.find(f => f.kind === 'plate')?.page).toBe(7);
  });
  it.each(['oracle', 'educational', 'professional'] as const)('bounds every timed and untimed prose face to 60–135 words in %s', tone => {
    for (const c of [chart, untimed]) {
      const prose = make(c, tone).faces.filter(f => f.kind === 'text');
      expect(prose.length).toBeGreaterThan(15);
      for (const face of prose) {
        const count = [...face.body, ...(face.reflection ? [face.reflection] : [])].join(' ').split(/\s+/).filter(Boolean).length;
        expect(count, `${face.page}: ${face.title}`).toBeGreaterThanOrEqual(60);
        expect(count, `${face.page}: ${face.title}`).toBeLessThanOrEqual(135);
      }
    }
  });
  it('supplies substantive untimed analysis and a provisional daily-range Moon note without artificial angles', () => {
    // Even stale timed geometry must not enter an untimed preview.
    const preview = make({ ...chart, input: { ...chart.input, time: null } });
    const printed = JSON.stringify(preview.faces);
    expect(printed).toContain('provisional Moon position represents the daily reference range');
    expect(printed).toContain('Among the nine non-lunar planets');
    expect(printed).toContain('closest non-lunar planetary contacts');
    expect(printed).not.toMatch(/Ascendant|Midheaven|House cusps|house [1-9]|\d+(?:st|nd|rd|th) house/i);
    expect(printed).not.toMatch(/This section needs|Houses need a time|An open space|cannot be calculated|additional chart information/i);
  });
  it('accepts all tones, defaults to oracle, and keeps measured placements unchanged', () => {
    expect(make()).toEqual(make(chart, 'oracle'));
    const oracle = make(chart, 'oracle').faces.find(f => f.kind === 'text' && f.page === 8);
    for (const tone of ['educational', 'professional'] as const) {
      const other = make(chart, tone).faces.find(f => f.kind === 'text' && f.page === 8);
      expect(other?.kind === 'text' ? other.placement : null).toBe(oracle?.kind === 'text' ? oracle.placement : null);
      expect(other?.kind === 'text' ? other.body : null).not.toEqual(oracle?.kind === 'text' ? oracle.body : null);
    }
  });
  it.each([
    ['decans', 'Ten-degree divisions and decan rulers'],
    ['profection', 'Annual profections: this birthday’s lord'],
    ['retrograde', 'RetroGOOD and apparent motion'],
    ['traditions', 'World systems side by side'],
    ['points', 'Esoteric points: Chiron and lunar nodes'],
    ['houses', 'The twelve temples and their rulers'],
  ] as const)('finds %s despite chapter title variations', (topic, title) => {
    expect(chapterForTopic([{ title: 'Divider', content: title, draw: 'volume' }, { title, content: 'Measured topic content.' }], topic)).toBe('Measured topic content.');
    expect(chapterForTopic([{ title: 'A different heading', content: `${title}. Measured topic content.` }], topic)).toContain('Measured topic content.');
  });
  it('cleans markdown and paginates whole sentences rather than clipping prose', () => {
    const sentence = 'A measured position is distinct from an interpretation and remains available for careful comparison.';
    const paras = plainParagraphs(`# Heading\n\n**${sentence}**\n\n| a | b |\n\n${Array.from({ length: 9 }, () => sentence).join(' ')}`);
    expect(paras).toHaveLength(2);
    const body = prosePage(paras).join(' ');
    expect(body.endsWith('.')).toBe(true);
    expect(body.split(/\s+/).length).toBeGreaterThanOrEqual(60);
    expect(body.split(/\s+/).length).toBeLessThanOrEqual(135);
    const decimal = prosePage(['A comparison within 0.1 degree retains its measured decimal precision. ' + Array.from({ length: 8 }, () => sentence).join(' ')]).join(' ');
    expect(decimal).toContain('0.1 degree');
    expect(decimal).not.toContain('0. 1');
  });
});