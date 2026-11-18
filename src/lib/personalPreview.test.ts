import { describe, expect, it } from 'vitest';
import { computeChart } from '@/lib/astro';
import { bookPreview, chapterForTopic, plainParagraphs, prosePage, PREVIEW_PAGES, BOOK_PREVIEW_PAGES, type BookPreviewInput } from '@/lib/personalPreview';
import { sampleBookLeaves } from '@/content/sampleBookLeaves';
import { risingPreview, untimedPreview, planetPreview } from '@/lib/previewNarrative';

const input = { date: '1993-03-25', time: '13:55', lat: 42.96395, lon: -78.73781, tz: 'America/New_York', placeLabel: 'Williamsville, New York', placeSource: 'geocoded', houseSystem: 'placidus' } as const;
const chart = computeChart(input);
const untimed = computeChart({ ...input, time: null });
const make = (c = chart, tone?: BookPreviewInput['tone']) => bookPreview({ name: 'Shane', birthLine: `Born 25 March 1993 · ${c.input.time ? '1:55 p.m.' : 'time unknown'} · Williamsville, New York`, chart: c, tone, artFor: () => 'art.jpg' });

describe('expanded AstroBook preview', () => {
  it('has exactly 28 numbered pages without changing the ten-page comic preview', () => {
    expect(make().faces.flatMap(f => 'page' in f && f.page ? [f.page] : [])).toEqual(Array.from({ length: 28 }, (_, i) => i + 1));
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
    expect(faces.flatMap(f => 'page' in f && f.page ? [f.page] : [])).toHaveLength(28);
  });
  it('does not invent houses or angles without a birth time', () => {
    const unknown = make(untimed);
    expect(unknown.cover.signs).not.toContain('↑');
    expect(unknown.faces.some(f => f.kind === 'facts' && f.heading === 'House cusps')).toBe(false);
    expect(unknown.faces.flatMap(f => f.kind === 'facts' ? f.rows.map(r => r[0]) : [])).not.toContain('Ascendant');
  });
  it.each(['timed', 'untimed'] as const)('maintains exactly pages 1–28 for %s charts', mode => {
    expect(make(mode === 'timed' ? chart : untimed).faces.flatMap(f => 'page' in f && f.page ? [f.page] : [])).toEqual(Array.from({ length: 28 }, (_, i) => i + 1));
  });
  it('places Plate I on page 6', () => {
    for (const c of [chart, untimed]) expect(make(c).faces.find(f => f.kind === 'plate')?.page).toBe(6);
  });
  it('anchors the contract between Table of Contents and Colophon with unnumbered front and back matter', () => {
    const faces = make().faces;
    expect(BOOK_PREVIEW_PAGES).toBe(28);
    expect(faces.find(f => 'page' in f && f.page === 1)).toMatchObject({ kind: 'list', eyebrow: 'Table of Contents' });
    expect(faces.find(f => 'page' in f && f.page === 28)).toMatchObject({ kind: 'text', eyebrow: 'Colophon' });
    expect(faces.filter(f => f.kind === 'endpaper' || f.kind === 'title' || f.kind === 'back').every(f => !('page' in f))).toBe(true);
  });
  it.each(['oracle', 'educational', 'professional'] as const)('places Plate I on a physical verso facing its ruler narrative in %s', tone => {
    for (const c of [chart, untimed]) {
      const preview = bookPreview({ name: 'Reader', birthLine: 'Recorded facts', chart: c, tone, artFor: key => `${key}.jpg` });
      const plate = preview.faces.find(f => f.kind === 'plate');
      if (plate?.kind !== 'plate') throw new Error('Missing plate');
      expect(plate.page).toBe(6);
      const count = plate.caption.split(/\s+/).filter(Boolean).length;
      expect(count).toBeGreaterThanOrEqual(5);
      expect(count).toBeLessThanOrEqual(15);
      expect(preview.faces.find(f => f.kind === 'text' && f.page === 7)).toMatchObject({ placement: expect.stringContaining(preview.cover.rulerName) });
      // Cover is face zero. Leaf backs are odd indices in the flattened reader.
      expect((preview.faces.indexOf(plate) + 1) % 2).toBe(1);
    }
  });
  it('includes measured Jupiter, outer planets, Chiron, both Nodes, Fortune and distinct system and clock chapters', () => {
    const faces = bookPreview({ name: 'Reader', birthLine: 'Recorded facts', chart, asOf: new Date('2026-11-18T07:40:00Z'), artFor: () => 'art.jpg' }).faces;
    const at = (page: number) => faces.find(f => 'page' in f && f.page === page);
    expect(at(14)).toMatchObject({ placement: expect.stringContaining('Jupiter') });
    expect(at(16)).toMatchObject({ placement: expect.stringMatching(/Uranus.*Neptune/) });
    expect(at(18)).toMatchObject({ body: expect.arrayContaining([expect.stringContaining('Chiron')]) });
    expect(at(19)).toMatchObject({ body: expect.arrayContaining([expect.stringContaining('South Node')]) });
    expect(at(20)).toMatchObject({ title: expect.stringContaining('Part of Fortune') });
    expect(at(22)).toMatchObject({ body: expect.arrayContaining([expect.stringContaining('Yin Water Rooster')]) });
    expect(at(23)).toMatchObject({ body: expect.arrayContaining([expect.stringContaining('Lahiri')]) });
    expect(at(24)).toMatchObject({ body: expect.arrayContaining([expect.stringContaining('age 33: whole-sign house 10')]) });
    expect(at(25)).toMatchObject({ body: expect.arrayContaining([expect.stringContaining('computed forward-pass returns')]) });
    expect(at(26)).toMatchObject({ body: expect.arrayContaining([expect.stringMatching(/stations.*2026-/)]) });
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
  it.each(['oracle', 'educational', 'professional'] as const)('keeps pages 1–28 and Plate I on page 6 in %s for both chart modes', tone => {
    for (const c of [chart, untimed]) {
      const faces = make(c, tone).faces;
      expect(faces.flatMap(f => 'page' in f && f.page ? [f.page] : [])).toEqual(Array.from({ length: 28 }, (_, i) => i + 1));
      expect(faces.find(f => f.kind === 'plate')?.page).toBe(6);
    }
  });
  it('calibrates every numbered prose page, not just planetary introductions', () => {
    for (const c of [chart, untimed]) {
      const variants = ['oracle', 'educational', 'professional'].map(t => make(c, t as BookPreviewInput['tone']).faces.filter(f => f.kind === 'text'));
      for (const [index, oracle] of variants[0].entries()) {
        const educational = variants[1][index];
        const professional = variants[2][index];
        expect(oracle.body.join(' '), `Oracle page ${oracle.page}`).toMatch(/\byou\b|\byour\b/i);
        expect(educational.body.join(' '), `Educational page ${oracle.page}`).toMatch(/method|explains?|function|calculation|interpretive|longitude|mechanics/i);
        expect(professional.body.join(' '), `Professional page ${oracle.page}`).toMatch(/native|chart indicates|technical|delineation|reference/i);
        expect(professional.body.join(' '), `Professional page ${oracle.page}`).not.toMatch(/\byou\b|\byour\b|\byourself\b/i);
        expect(educational.body).not.toEqual(oracle.body);
        expect(professional.body).not.toEqual(oracle.body);
      }
    }
  });
  it('explains the horizon and distinguishes essential from angular dignity without inventing angularity', () => {
    expect(risingPreview(chart, 'educational').body.join(' ')).toMatch(/ecliptic degree.*eastern horizon/);
    expect(risingPreview(chart, 'educational').body.join(' ')).toContain('rulership chain');
    expect(risingPreview(chart, 'professional').body.join(' ')).toContain('essential dignity');
    const ruler = chart.bodies.find(b => b.key === 'sun');
    expect(ruler?.house).toBe(9);
    expect(risingPreview(chart, 'professional').body.join(' ')).toContain('angular dignity is not assigned');
    const angular = { ...chart, bodies: chart.bodies.map(b => b.key === 'sun' ? { ...b, house: 10 } : b) };
    expect(risingPreview(angular, 'professional').body.join(' ')).toContain('accidental angular dignity');
  });
  it('uses the selected register in all untimed generators without introducing geometry', () => {
    for (const topic of ['elements', 'geometry', 'planets', 'cycles'] as const) {
      expect(untimedPreview(untimed, topic)).toEqual(untimedPreview(untimed, topic, 'oracle'));
      const professional = untimedPreview(untimed, topic, 'professional').body.join(' ');
      expect(professional).toContain('native');
      expect(professional).not.toMatch(/\byou\b|\byour\b|Ascendant|house \d/i);
      expect(untimedPreview(untimed, topic, 'educational').body).not.toEqual(untimedPreview(untimed, topic).body);
    }
    expect(risingPreview(untimed, 'professional')).toEqual(untimedPreview(untimed, 'elements', 'professional'));
  });
  it('gives each planet a distinct question and carries actual aspects and retrograde status into compound reasoning', () => {
    const keys = ['sun', 'moon', 'mercury', 'venus', 'mars', 'saturn', 'pluto'];
    const faces = keys.map(key => planetPreview(chart, key));
    expect(new Set(faces.map(f => f.body[0])).size).toBe(7);
    for (const [index, key] of keys.entries()) {
      const b = chart.bodies.find(p => p.key === key);
      const hits = chart.aspects.filter(a => (a.a === b?.name || a.b === b?.name) && chart.bodies.some(p => p.name === a.a && keys.concat(['jupiter', 'uranus', 'neptune']).includes(p.key)) && chart.bodies.some(p => p.name === a.b && keys.concat(['jupiter', 'uranus', 'neptune']).includes(p.key))).sort((a, z) => a.orb - z.orb);
      if (hits[0]) expect(faces[index].body.join(' ')).toContain(`orb ${hits[0].orb.toFixed(2)}°`);
      if (b?.retro) expect(faces[index].body.join(' ')).toContain('Apparent retrograde motion');
    }
    const noRetro = { ...chart, bodies: chart.bodies.map(b => ({ ...b, retro: false })) };
    expect(planetPreview(noRetro, 'venus').body.join(' ')).not.toContain('Apparent retrograde motion');
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