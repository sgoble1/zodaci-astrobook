import { describe, expect, it } from 'vitest';
import { computeChart } from '@/lib/astro';
import { buildComicPreview, buildFounderComic } from '@/lib/comicNarrative';
import { influenceMotion, refineFounderStory } from '@/lib/founderComicStory';
import { comicIssueLeaves } from '@/content/sampleBookLeaves';
import { faceText } from '@/lib/bookLeaves';

// Known Shane calculation baseline; other edition identities below exercise fictional
// settings with this test chart, not substituted April/Zac birth records in the app.
const chart = computeChart({ date: '1993-03-25', time: '13:55', lat: 42.96395, lon: -78.73781, tz: 'America/New_York', placeLabel: 'Williamsville, New York', placeSource: 'geocoded', houseSystem: 'placidus' });
const opts = { reader: 'Test reader', month: new Date(Date.UTC(2026, 10, 1)), issueNumber: 2 };
const editions = ['april', 'shane', 'zac'] as const;
const narrativeText = (issue: ReturnType<typeof buildFounderComic>) => issue.pages.filter(p => p.n < 22 || p.n === 24).flatMap(p => [p.title, ...(p.body ?? []), ...p.panels.flatMap(x => [x.scene, x.caption ?? '', ...(x.balloons ?? []).map(b => b.text)])]).join(' ');

describe('founder comic missions and chart-driven motion', () => {
  it('gives the three editions distinct openings and earned resolutions, without changing measurements', () => {
    const base = buildComicPreview(chart, opts);
    const issues = editions.map(edition => buildFounderComic(chart, edition, opts));
    expect(issues.map(i => i.title)).toEqual(['The Relay Room', 'The Midnight Signal', 'The Far-Bank Receiver']);
    expect(new Set(issues.map(i => i.pages[1].panels[0].caption)).size).toBe(3);
    expect(new Set(issues.map(i => i.pages[19].panels[0].caption)).size).toBe(3);
    for (const issue of issues) {
      expect(issue.factors).toEqual(base.factors);
      expect(issue.influence).toEqual(base.influence);
      expect(issue.pages[23].body?.[0]).toBe(`Zodaci AstroComic · ${issue.title}`);
    }
  });
  it.each(editions)('%s retains exactly 24 numbered pages and provenance only on 22–23', edition => {
    const issue = buildFounderComic(chart, edition, opts);
    expect(issue.pages.map(p => p.n)).toEqual(Array.from({ length: 24 }, (_, i) => i + 1));
    expect(issue.pages.filter(p => p.section === 'Calculation Ledger').map(p => p.n)).toEqual([22, 23]);
    expect(narrativeText(issue)).not.toMatch(/\d+°|\borb\b|\bhouse\s*\d|\bretrograde\b|\btransit\b|\b(?:Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)\b/i);
    const ledger = issue.pages.slice(21, 23).flatMap(p => p.body ?? []).join(' ');
    for (const factor of issue.factors) expect(ledger).toContain(factor.measured);
  });
  it.each(editions)('%s keeps operators behind circumstances and protagonist language grounded', edition => {
    const issue = buildFounderComic(chart, edition, opts);
    const lines = issue.pages.flatMap(p => p.panels).flatMap(p => p.balloons ?? []);
    expect(lines.length).toBeGreaterThan(15);
    expect(lines.every(b => b.who === issue.reader)).toBe(true);
    for (const line of lines) expect(line.text).not.toMatch(/\b(?:retrograde|transit|ascendant|square|trine|period|horoscope)\b|\d{4}-\d{2}|\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b/i);
    for (const f of issue.factors.filter(f => f.kind === 'placement')) {
      const page = issue.pages[f.page - 1];
      expect(page.panels[0].scene).toContain('behind the controls');
      expect(page.panels[2].caption).toContain('rather than letting the operator choose');
      expect(page.panels[0].motion).toBe(f.retro ? 'reconsider' : 'signal');
    }
  });
  it('changes actual story actions when a calculated placement or retrograde flag changes', () => {
    const own = buildFounderComic(chart, 'shane', opts);
    const changed = buildFounderComic({ ...chart, bodies: chart.bodies.map(b => b.key === 'venus' ? { ...b, sign: 'Virgo', house: 6, retro: false } : b) }, 'shane', opts);
    expect(own.pages[5].panels[0].scene).not.toBe(changed.pages[5].panels[0].scene);
    expect(own.pages[5].panels[1].balloons).not.toEqual(changed.pages[5].panels[1].balloons);
    expect(own.pages[5].panels[0].motion).toBe('reconsider');
    expect(changed.pages[5].panels[0].motion).toBe('signal');
    expect(own.factors.find(f => f.key === 'moon')).toMatchObject({ sign: 'Taurus', house: 10 });
  });
  it.each(editions)('%s makes the selected measured monthly contact the opening difficulty and late test', edition => {
    const issue = buildFounderComic(chart, edition, opts);
    expect(issue.influence?.date).toBeTruthy();
    expect(issue.pages[1].panels[0].scene).toContain(issue.influence?.action);
    expect(issue.pages[18].panels[0].scene).toBe(issue.influence?.scene);
    expect(issue.pages[18].panels[1].balloons?.[0].text).toBe(issue.influence?.response);
    expect(issue.pages[1].panels[0].motion).toBe(influenceMotion(issue.influence));
    expect(issue.pages[18].panels[0].motion).toBe(influenceMotion(issue.influence));
  });
  it('maps real contact kinds to motion without pretending an unmeasured motif is a transit', () => {
    const influence = buildComicPreview(chart, opts).influence;
    if (!influence) throw new Error('Expected influence');
    expect(influenceMotion({ ...influence, date: null })).toBeUndefined();
    expect(influenceMotion({ ...influence, retro: true })).toBe('reconsider');
    expect(influenceMotion({ ...influence, retro: false, aspect: 'Square' })).toBe('crosscurrent');
    expect(influenceMotion({ ...influence, retro: false, aspect: 'Opposition' })).toBe('crosscurrent');
    expect(influenceMotion({ ...influence, retro: false, aspect: 'Trine' })).toBe('signal');
    const base = buildComicPreview(chart, opts);
    const unknown = refineFounderStory({ ...base, influence: { ...influence, date: null } }, 'zac');
    expect(unknown.pages[1].panels[0].motion).toBeUndefined();
    expect(unknown.pages[18].panels[0].motion).toBeUndefined();
  });
  it.each(editions)('%s stays substantive with unknown time and carries the same story into reader/PDF faces', edition => {
    const issue = buildFounderComic(computeChart({ ...chart.input, time: null }), edition, opts);
    expect(issue.factors.some(f => f.house != null || f.key === 'moon')).toBe(false);
    expect(issue.signs.rising).toBeNull();
    expect(issue.pages).toHaveLength(24);
    const faces = comicIssueLeaves(issue).flatMap(l => [l.front, l.back]);
    expect(faces).toHaveLength(24);
    expect(faceText(faces[1])?.lines.join(' ')).toContain(issue.pages[1].panels[0].caption);
    expect(faceText(faces[19])?.lines.join(' ')).toContain(issue.pages[19].panels[0].caption);
  });
});