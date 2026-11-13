import { describe, expect, it } from 'vitest';
import { personalBookLeaves, sampleReaderChart } from '@/content/sampleBookLeaves';
import { comicPreviewArt } from '@/content/castArt';
import { buildComicIssue } from '@/lib/comic';

describe('personal first-ten-page previews', () => {
  const leaves = personalBookLeaves({ name: 'Rosalind Vance', birthLine: 'Born test', chart: sampleReaderChart(), coverSrc: 'cover.jpg' });
  const faces = leaves.flatMap(l => [l.front, l.back]);
  it('numbers exactly ten preview pages', () => {
    const nums = faces.map(f => ('page' in f ? f.page : undefined)).filter(Boolean);
    expect(nums).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
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
