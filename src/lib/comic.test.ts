import { describe, expect, it } from 'vitest';
import { computeChart } from './astro';
import { buildComicIssue, COMIC_PLANS, firstIssueMonth, lunarCalendar, manifestCsv, monthKey, nextIssueMonth, shipBy } from './comic';

const olivia = computeChart({ date: '1992-03-14', time: '07:23', lat: 45.5152, lon: -122.6784, tz: 'America/Los_Angeles', placeLabel: 'Portland, OR', placeSource: 'geocoded', houseSystem: 'placidus' });
const sub = (over: Partial<Parameters<typeof nextIssueMonth>[0]> = {}) => ({ plan: 'monthly' as const, status: 'active', created_at: '2026-10-15T10:00:00Z', paused_until: null, skip_months: [], ...over });

describe('AstroComic plans', () => {
  it('sells monthly $14.99, yearly $149.99 and a single issue $18.99', () => {
    expect(COMIC_PLANS.monthly.cents).toBe(1499);
    expect(COMIC_PLANS.yearly.cents).toBe(14999);
    expect(COMIC_PLANS.single.cents).toBe(1899);
  });
});

describe('issue schedule', () => {
  it('ships by the 8th; joining during a month starts with the next month', () => {
    expect(monthKey(firstIssueMonth(new Date('2026-10-15T00:00:00Z')))).toBe('2026-11-01');
    expect(monthKey(firstIssueMonth(new Date('2026-10-01T09:00:00Z')))).toBe('2026-11-01');
    expect(shipBy(new Date('2026-11-01T00:00:00Z')).getUTCDate()).toBe(8);
  });
  it('skips months the member chose to skip', () => {
    const m = nextIssueMonth(sub({ skip_months: ['2026-11-01'] }), [], new Date('2026-10-20T00:00:00Z'));
    expect(monthKey(m!)).toBe('2026-12-01');
  });
  it('honors a pause date', () => {
    const m = nextIssueMonth(sub({ paused_until: '2027-01-10' }), [], new Date('2026-10-20T00:00:00Z'));
    expect(monthKey(m!)).toBe('2027-02-01');
  });
  it('a single issue ships once, then nothing more', () => {
    expect(monthKey(nextIssueMonth(sub({ plan: 'single' }), [], new Date('2026-10-20T00:00:00Z'))!)).toBe('2026-11-01');
    expect(nextIssueMonth(sub({ plan: 'single' }), ['2026-11-01'], new Date('2026-12-02T00:00:00Z'))).toBeNull();
  });
  it('canceled subscriptions get no next issue', () => {
    expect(nextIssueMonth(sub({ status: 'canceled' }), [], new Date('2026-10-20T00:00:00Z'))).toBeNull();
  });
});

describe('24-page issue plan', () => {
  const month = new Date(Date.UTC(2026, 10, 1));
  const issue = buildComicIssue(olivia, { reader: 'Olivia Chen', month, issueNumber: 1 });
  it('has exactly 24 pages in the documented order', () => {
    expect(issue.pages).toHaveLength(24);
    expect(issue.pages[0].section).toBe('Cover');
    expect(issue.pages[2].section).toBe('Letter from the Stars');
    expect(issue.pages.slice(3, 7).every(p => p.section === 'Main Story')).toBe(true);
    expect(issue.pages[17].section).toBe('Reflection Prompts');
    expect(issue.pages[23].section).toBe('Back Cover');
  });
  it('uses the reader’s calculated signs and 6–8 reflection questions', () => {
    expect(issue.signs.sun).toBe('Pisces');
    const prompts = issue.pages.filter(p => p.section === 'Reflection Prompts').flatMap(p => p.body ?? []);
    expect(prompts.length).toBeGreaterThanOrEqual(6);
    expect(prompts.length).toBeLessThanOrEqual(8);
  });
  it('is deterministic for the same chart and month', () => {
    expect(JSON.stringify(buildComicIssue(olivia, { reader: 'Olivia Chen', month, issueNumber: 1 }))).toBe(JSON.stringify(issue));
  });
  it('leaves the Moon out when the birth time is unknown', () => {
    const noTime = computeChart({ ...olivia.input, time: null });
    expect(buildComicIssue(noTime, { reader: 'Olivia', month, issueNumber: 1 }).signs.moon).toBeNull();
  });
  it('finds four lunar quarters in November 2026', () => {
    expect(lunarCalendar(month).length).toBeGreaterThanOrEqual(4);
  });
  it('escapes manifest CSV fields', () => {
    const csv = manifestCsv([{ name: 'Lee, "J"', email: 'a@b.c', sun: 'Leo', plan: 'monthly', status: 'active', address: { line1: '1 Main' }, issue: '2026-11-01', issueStatus: 'approved' }]);
    expect(csv.split('\n')[1].startsWith('"Lee, ""J"""')).toBe(true);
  });
});
