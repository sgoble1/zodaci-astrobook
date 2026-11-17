import { describe, expect, it } from 'vitest';
import { personalBookLeaves, sampleReaderChart } from '@/content/sampleBookLeaves';
import { comicPreviewArt } from '@/content/castArt';
import { buildComicIssue } from '@/lib/comic';

describe('personal first-ten-page previews', () => {
  const leaves = personalBookLeaves({ name: 'Rosalind Vance', birthLine: 'Born test', chart: sampleReaderChart(), coverSrc: 'cover.jpg' });
  const faces = leaves.flatMap(l => [l.front, l.back]);
  it('numbers exactly 25 book preview pages', () => {
    const nums = faces.map(f => ('page' in f ? f.page : undefined)).filter(Boolean);
    expect(nums).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
  });
  it('opens on the cover and closes on the back cover', () => {
    expect(faces[0].kind).toBe('cover');
    expect(faces[faces.length - 1].kind).toBe('back');
  });
  it('every illustrated comic panel in the first ten pages has a picture', () => {
    const issue = buildComicIssue(sampleReaderChart(), { reader: 'Rosalind', month: new Date(Date.UTC(2026, 11, 1)), issueNumber: 1 });
    const art = comicPreviewArt(issue);
    const keys = issue.pages.filter(p => p.n <= 10 && p.section !== 'Cover').flatMap(p => p.panels.map((_, i) => `${p.n}-${i}`));
    expect(keys.length).toBeGreaterThan(0);
    for (const k of keys) expect(art[k]).toBeTruthy();
  });
});

import { memberComicLeaves as _mcl } from '@/content/sampleBookLeaves';
describe('member comic preview', () => {
  it('builds 24 complete comic pages naming the reader from the saved chart', () => {
    const leaves = _mcl({ name: 'Test Reader', date: '1990-09-06', time: '12:00', lat: 40.7, lon: -74, tz: 'America/New_York', placeLabel: 'New York' } as never);
    expect(leaves[0].front.kind).toBe('comic-page');
    const faces = leaves.flatMap(l => [l.front, l.back]);
    expect(JSON.stringify(faces)).toContain('Test Reader');
    expect(faces.filter(f => f.kind === 'comic-page')).toHaveLength(24);
  });
});
