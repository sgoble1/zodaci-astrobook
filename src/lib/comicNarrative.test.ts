import { describe, expect, it } from 'vitest';
import { computeChart } from '@/lib/astro';
import { buildComicPreview, buildFounderComic, previewName } from '@/lib/comicNarrative';
import { comicCoverArtwork } from '@/content/comicSceneArt';
import { buildComicIssue, CAST } from '@/lib/comic';
import { upcomingEvents } from '@/lib/transitOverlay';
import { comicIssueLeaves, sampleComicLeaves } from '@/content/sampleBookLeaves';
import { faceText } from '@/lib/bookLeaves';
import { comicPreviewArt } from '@/content/castArt';
import { COMIC_SCENES } from '@/content/comicSceneArt';

const chart = computeChart({ date: '1993-03-25', time: '13:55', lat: 42.96395, lon: -78.73781, tz: 'America/New_York', placeLabel: 'Williamsville, New York', placeSource: 'geocoded', houseSystem: 'placidus' });
const options = { reader: 'Shane', month: new Date(Date.UTC(2026, 11, 1)), issueNumber: 1 };
const issue = buildComicPreview(chart, options);
describe('complete chart-driven comic preview', () => {
  it('isolates mathematical record to ledger pages 22–23, including scene metadata and all dialogue', () => {
    const pages = issue.pages.filter(p => p.section === 'Calculation Ledger');
    expect(pages.map(p => p.n)).toEqual([22, 23]);
    const narrative = issue.pages.filter(p => p.n !== 22 && p.n !== 23).flatMap(p => [p.title, ...(p.body ?? []), ...p.panels.flatMap(x => [x.scene, x.caption ?? '', ...(x.balloons ?? []).map(b => b.text)])]).join(' ');
    expect(narrative).not.toMatch(/\d+°|\borb\b|\bhouse\s*\d|\bretrograde\b|\btransit\b|\b(?:Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)\b/i);
    expect(pages.flatMap(p => p.body ?? []).join(' ')).toMatch(/orb.*°/);
  });
  it('uses distinct explicitly authorized founder covers; matching names never unlock founder art', () => {
    const editions = ['april', 'shane', 'zac'] as const;
    const covers = editions.map(edition => comicCoverArtwork(buildFounderComic(chart, edition, { ...options, reader: edition === 'shane' ? 'Shane' : edition })));
    expect(covers.every(Boolean)).toBe(true);
    expect(new Set(covers).size).toBe(3);
    expect(comicCoverArtwork(issue)).toBeUndefined();
    for (const edition of editions) {
      const own = buildFounderComic(chart, edition, { ...options, reader: edition });
      expect(own.pages).toHaveLength(24);
      expect(own.factors).toEqual(issue.factors);
    }
  });
  it.each([0, 3, 6, 9, 11])('operators manipulate machinery in each sampled month %i', monthIndex => {
    const own = buildComicPreview(chart, { ...options, month: new Date(Date.UTC(2026, monthIndex, 1)) });
    expect(own.influence?.scene).toMatch(/lamp|relay|receiver|conduit|hatch|channel/);
    expect(own.pages[18].panels[0].scene).toBe(own.influence?.scene);
    const heroLines = own.pages.flatMap(p => p.panels).flatMap(p => p.balloons ?? []).filter(b => b.who === own.reader);
    for (const line of heroLines) expect(line.text).not.toMatch(/\b(?:square|trine|house|transit|retrograde|period|Aries|Capricorn)\b|\d{4}-\d{2}/i);
  });
  it('retains the full story and lettering through splash, portrait and four-panel beats', () => {
    expect(issue.pages[1].panels).toHaveLength(1);
    expect(issue.pages[1].panels[0].shape).toBe('bleed');
    expect(issue.pages[20].panels[0].shape).toBe('bleed');
    expect(issue.pages.slice(12, 16).every(p => p.panels.length === 4)).toBe(true);
    expect(issue.pages.some(p => p.panels.some(panel => panel.shape === 'tall'))).toBe(true);
    const art = comicPreviewArt(issue);
    for (const page of issue.pages) for (const [i, panel] of page.panels.entries()) {
      expect(art[`${page.n}-${i}`]).toBeTruthy();
      expect(panel.artSlot).not.toMatch(/^(signal|repair|resolution)-\d$/);
    }
    const characters = issue.pages.flatMap(p => p.panels).filter(p => p.artSlot?.startsWith('cast:'));
    expect(new Set(characters.map(p => p.artSlot)).size).toBe(10);
    expect(art['2-0']).toBe(COMIC_SCENES.terrace);
    expect(art['13-3']).toBe(COMIC_SCENES.detail);
  });
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
  it.each([9, 10, 11])('embeds a measured background influence in issue month %i for both composers', monthIndex => {
    const month = new Date(Date.UTC(2026, monthIndex, 1));
    const opts = { ...options, month };
    const generated = buildComicIssue(chart, opts);
    const preview = buildComicPreview(chart, opts);
    const expected = upcomingEvents(chart, month, new Date(Date.UTC(2026, monthIndex + 1, 0)).getUTCDate()).filter(e => e.kind === 'exact' && e.date.getUTCMonth() === monthIndex).sort((a, b) => b.weight - a.weight)[0];
    expect(expected).toBeDefined();
    expect(preview.influence?.date).toBe(expected.date.toISOString());
    expect(preview.influence).toEqual(generated.influence);
    expect(preview.influence?.key).toBe(expected.planet);
    const operator = CAST.find(c => c.key === preview.influence?.key);
    expect(operator).toBeDefined();
    expect(generated.pages[5].panels[0].scene).toContain(operator?.name);
    const beat = preview.pages[18];
    expect(beat.panels[0].artSlot).toBe(`cast:${operator?.key}`);
    expect(beat.panels[1].balloons?.[0]).toEqual({ who: 'Julian Mercer', text: preview.influence?.response });
    expect(preview.factors.find(f => f.kind === 'transit')).toMatchObject({ page: 19, key: expected.planet });
  });
  it('keeps dates and astrology exposition out of protagonist dialogue in every preview', () => {
    const balloons = issue.pages.flatMap(p => p.panels).flatMap(p => p.balloons ?? []).filter(b => b.who === issue.reader);
    expect(balloons.length).toBeGreaterThan(5);
    for (const b of balloons) expect(b.text).not.toMatch(/retrograde|\btransit\b|\bhouse\b|\bascendant\b|\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b|\d{4}-\d{2}/i);
  });
  it('retains relevant cast artwork in the public sample as well as founder leaves', () => {
    const faces = sampleComicLeaves().flatMap(l => [l.front, l.back]);
    const beat = faces[18];
    if (beat.kind !== 'comic-page') throw new Error('Missing story beat');
    expect(beat.sheet.panels[0].artSlot).toMatch(/^cast:/);
    expect(beat.art?.['19-0']).toBeTruthy();
  });
});