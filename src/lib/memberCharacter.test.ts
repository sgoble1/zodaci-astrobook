import { describe, expect, it } from 'vitest';
import { computeChart } from './astro';
import { buildComicIssue } from './comic';
import { guideFor } from './memberCharacter';

const chart = computeChart({ date: '1992-03-14', time: '07:23', lat: 45.5152, lon: -122.6784, tz: 'America/Los_Angeles', placeLabel: 'Portland, OR', placeSource: 'geocoded', houseSystem: 'placidus' });
const month = new Date('2026-12-01T00:00:00Z');

describe('chosen character in the comic', () => {
  it('draws the saved observatory character on the cover as the reader’s stand-in', () => {
    const issue = buildComicIssue(chart, { reader: 'Olivia', month, issueNumber: 1, guide: guideFor('stargazer') });
    expect(issue.pages[0].panels[0].scene).toContain('The Stargazer');
    expect(issue.guide?.name).toBe('The Stargazer');
  });
  it('draws no stand-in when no character is saved', () => {
    const issue = buildComicIssue(chart, { reader: 'Olivia', month, issueNumber: 1 });
    expect(issue.pages[0].panels[0].scene).not.toContain('chosen observatory character');
    expect(issue.guide).toBeUndefined();
  });
  it('ignores unknown character ids', () => {
    expect(guideFor('vault-boy')).toBeNull();
    expect(guideFor(null)).toBeNull();
  });
});
